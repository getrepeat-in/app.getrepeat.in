import "@/models/AddonGroup";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import "@/models/Image";
import Category from "@/models/Category";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getItemsCacheKey, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";
import { ImageService } from "@/services/backend/images";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  NotFoundError 
} from "@/lib/api/response-handler";

const formatMenuItem = (item) => {
  if (!item) return item;
  const obj = item.toObject ? item.toObject() : { ...item };
  return {
    ...obj,
    image: ImageService.formatImage(obj.image),
    addonGroups: Array.isArray(obj.addonGroups)
      ? obj.addonGroups.map((ag) => {
          if (!ag || typeof ag !== "object" || !Array.isArray(ag.items)) return ag;
          return {
            ...ag,
            items: ag.items.map((mapped) => ({
              ...mapped,
              item:
                mapped && mapped.item && typeof mapped.item === "object"
                  ? {
                      ...mapped.item,
                      image: ImageService.formatImage(mapped.item.image),
                    }
                  : mapped?.item,
            })),
          };
        })
      : [],
  };
};

const MENU_ITEM_POST_REQUIRED_FIELDS = ["category", "name", "base_price", "dietaryType"];

const calculateMinVariantPrice = (variants, currentBasePrice) => {
  if (!Array.isArray(variants) || variants.length === 0) return currentBasePrice;
  let minPrice = Infinity;
  variants.forEach((variant) => {
    if (Array.isArray(variant.options)) {
      variant.options.forEach((opt) => {
        const price = Number(opt.price);
        if (!isNaN(price) && price < minPrice) {
          minPrice = price;
        }
      });
    }
  });
  return minPrice !== Infinity ? minPrice : currentBasePrice;
};

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const subCategoryId = searchParams.get("subCategoryId");

  const cacheKey = getItemsCacheKey(id);
  const { data: items, isCached } = await getOrSetCache(
    cacheKey,
    () => MenuItem.find({ restaurant: id })
      .populate("image")
      .populate({
        path: "addonGroups",
        populate: {
          path: "items.item",
          select: "name base_price image variants dietaryType isAvailable",
        },
      })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean(),
    3600
  );

  let filteredItems = items || [];
  if (categoryId) {
    filteredItems = filteredItems.filter(
      (i) => i.category?.toString() === categoryId || i.category?._id?.toString() === categoryId
    );
  }
  if (subCategoryId) {
    filteredItems = filteredItems.filter(
      (i) => i.subCategory?.toString() === subCategoryId || i.subCategory?._id?.toString() === subCategoryId
    );
  }

  const formattedItems = filteredItems.map(formatMenuItem);
  return successResponse(
    formattedItems,
    `Items fetched successfully${isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();

  if (data.image === "") {
    data.image = null;
  }
  const { isValid, message } = validateRequiredFields(data, MENU_ITEM_POST_REQUIRED_FIELDS);
  if (!isValid) {
    throw new BadRequestError(message);
  }

  const categoryExists = await Category.exists({ _id: data.category, restaurant: id });
  if (!categoryExists) {
    throw new BadRequestError("Invalid category specified.");
  }

  if (data.subCategory) {
    const subCategoryExists = await Category.exists({
      _id: data.subCategory,
      restaurant: id,
      parentCategory: data.category,
    });
    if (!subCategoryExists) {
      throw new BadRequestError("Invalid subCategory specified for this category.");
    }
  }

  const highestOrder = await MenuItem.findOne({
    restaurant: id,
    category: data.category,
    subCategory: data.subCategory || null,
  })
    .sort("-displayOrder")
    .select("displayOrder")
    .lean();

  const newItemData = {
    restaurant: id,
    category: data.category,
    subCategory: data.subCategory || null,
    name: data.name.trim(),
    description: data.description || "",
    image: data.image || null,
    base_price: calculateMinVariantPrice(data.variants, data.base_price),
    variants: data.variants || [],
    dietaryType: data.dietaryType,
    isAvailable: data.isAvailable ?? true,
    preparationTime: data.preparationTime ?? 15,
    displayOrder: highestOrder ? highestOrder.displayOrder + 1 : 1,
  };

  const newItem = await MenuItem.create(newItemData);
  const populatedItem = await MenuItem.findById(newItem._id)
    .populate("image")
    .populate({
      path: "addonGroups",
      populate: {
        path: "items.item",
        select: "name base_price image variants dietaryType isAvailable",
      },
    })
    .lean();

  await invalidateItemCache(id);
  return successResponse(formatMenuItem(populatedItem), "Item created successfully", 201);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    throw new BadRequestError("Item ID is required for update.");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();
  if (data.image === "") {
    data.image = null;
  }

  if (data.category) {
    const categoryExists = await Category.exists({ _id: data.category, restaurant: id });
    if (!categoryExists) {
      throw new BadRequestError("Invalid category specified.");
    }
  }

  if (data.subCategory) {
    const subCategoryExists = await Category.exists({ _id: data.subCategory, restaurant: id });
    if (!subCategoryExists) {
      throw new BadRequestError("Invalid subCategory specified.");
    }
  }

  if (data.variants !== undefined) {
    data.base_price = calculateMinVariantPrice(data.variants, data.base_price);
  }

  const updatedItem = await MenuItem.findOneAndUpdate(
    { _id: itemId, restaurant: id },
    { $set: data },
    { new: true, runValidators: true }
  )
    .populate("image")
    .populate({
      path: "addonGroups",
      populate: {
        path: "items.item",
        select: "name base_price image variants dietaryType isAvailable",
      },
    })
    .lean();

  if (!updatedItem) {
    throw new NotFoundError("Item not found");
  }

  await invalidateItemCache(id);
  return successResponse(formatMenuItem(updatedItem), "Item updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    throw new BadRequestError("Item ID is required for deletion");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const deletedItem = await MenuItem.findOneAndDelete({ _id: itemId, restaurant: id });
  if (!deletedItem) {
    throw new NotFoundError("Item not found");
  }

  await invalidateItemCache(id);
  return successResponse(deletedItem, "Item deleted successfully");
});
