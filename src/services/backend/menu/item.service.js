import "@/models/Image";
import "@/models/AddonGroup";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { ImageService } from "@/services/backend/images";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getItemsCacheKey, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

const formatMenuItem = (item) => {
  if (!item) return item;
  const obj = item.toObject ? item.toObject() : { ...item };
  return {
    ...obj,
    id: obj._id,
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

export const ItemService = {
  getItems: async (restaurantId, query = {}) => {
    await dbConnect();
    const { categoryId, subCategoryId } = query;

    const cacheKey = getItemsCacheKey(restaurantId);
    const { data: items, isCached } = await getOrSetCache(
      cacheKey,
      () => MenuItem.find({ restaurant: restaurantId })
        .populate("image")
        .populate("addonGroups")
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
    return { data: formattedItems, isCached };
  },

  createItem: async (restaurantId, data) => {
    await dbConnect();

    if (data.image === "") {
      data.image = null;
    }
    
    const { isValid, message } = validateRequiredFields(data, MENU_ITEM_POST_REQUIRED_FIELDS);
    if (!isValid) {
      throw new Error(message);
    }

    const categoryExists = await Category.exists({ _id: data.category, restaurant: restaurantId });
    if (!categoryExists) {
      throw new Error("Invalid category specified.");
    }

    if (data.subCategory) {
      const subCategoryExists = await Category.exists({
        _id: data.subCategory,
        restaurant: restaurantId,
        parentCategory: data.category,
      });
      if (!subCategoryExists) {
        throw new Error("Invalid subCategory specified for this category.");
      }
    }

    const highestOrder = await MenuItem.findOne({
      restaurant: restaurantId,
      category: data.category,
      subCategory: data.subCategory || null,
    })
      .sort("-displayOrder")
      .select("displayOrder")
      .lean();

    const newItemData = {
      restaurant: restaurantId,
      category: data.category,
      subCategory: data.subCategory || null,
      name: data.name.trim(),
      description: data.description || "",
      image: (data.image && typeof data.image === 'object') ? (data.image._id || data.image.id || null) : (data.image || null),
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
      .populate("addonGroups")
      .lean();

    await invalidateItemCache(restaurantId);
    return formatMenuItem(populatedItem);
  },

  updateItem: async (restaurantId, itemId, data) => {
    await dbConnect();


    if (data.image === "") {
      data.image = null;
    } else if (data.image && typeof data.image === "object") {
      const imageId = data.image._id || data.image.id;
      if (imageId) data.image = imageId;
      else delete data.image;
    }
    if (data.category) {
      const categoryExists = await Category.exists({ _id: data.category, restaurant: restaurantId });
      if (!categoryExists) {
        throw new Error("Invalid category specified.");
      }
    }

    if (data.subCategory) {
      const subCategoryExists = await Category.exists({ _id: data.subCategory, restaurant: restaurantId });
      if (!subCategoryExists) {
        throw new Error("Invalid subCategory specified.");
      }
    }

    if (data.variants !== undefined) {
      data.base_price = calculateMinVariantPrice(data.variants, data.base_price);
    }

    const updatePayload = { ...data };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;
    delete updatePayload.__v;
    delete updatePayload.restaurant;

    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurant: restaurantId },
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    )
      .populate("image")
      .populate("addonGroups")
      .lean();

    if (!updatedItem) {
      throw new Error("Item not found");
    }

    await invalidateItemCache(restaurantId);
    return formatMenuItem(updatedItem);
  },

  deleteItem: async (restaurantId, itemId) => {
    await dbConnect();

    const deletedItem = await MenuItem.findOneAndDelete({ _id: itemId, restaurant: restaurantId });
    if (!deletedItem) {
      throw new Error("Item not found");
    }

    await invalidateItemCache(restaurantId);
    return deletedItem;
  },
};
