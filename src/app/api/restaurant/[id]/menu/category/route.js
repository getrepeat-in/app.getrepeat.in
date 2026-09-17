import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { ImageService } from "@/services/backend/images";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError, NotFoundError } from "@/lib/api/response-handler";
import { getCategoriesCacheKey, invalidateCategoryCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

const MENU_CATEGORY_POST_REQUIRED_FIELDS = ["name"];

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const cacheKey = getCategoriesCacheKey(id);
  const { data: formattedCategories, isCached } = await getOrSetCache(
    cacheKey,
    async () => {
      const categories = await Category.find({ restaurant: id })
        .populate("image")
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      return categories.map((c) => ({
        ...c,
        image: ImageService.formatImage(c.image),
      }));
    },
    3600
  );

  return successResponse(
    formattedCategories || [],
    `Categories fetched successfully${isCached ? " (cached)" : ""}`
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
  const { isValid, message } = validateRequiredFields(data, MENU_CATEGORY_POST_REQUIRED_FIELDS);
  if (!isValid) {
    throw new BadRequestError(message);
  }

  const { name, displayOrder, image, parentCategory } = data;

  const newCategory = await Category.create({
    restaurant: id,
    name: name.trim(),
    displayOrder: displayOrder || 0,
    image: image || null,
    parentCategory: parentCategory || null,
  });

  const createdCategory = await Category.findById(newCategory._id).populate("image").lean();
  const formatted = {
    ...createdCategory,
    image: ImageService.formatImage(createdCategory.image),
  };

  await invalidateCategoryCache(id);
  return successResponse(formatted, "Category created successfully", 201);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  if (!categoryId) {
    throw new BadRequestError("Category ID is required in search params!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();
  const category = await Category.findOne({ _id: categoryId, restaurant: id });
  if (!category) {
    throw new NotFoundError("Category not found!");
  }

  if (data.name !== undefined) category.name = data.name.trim();
  if (data.displayOrder !== undefined) category.displayOrder = data.displayOrder;
  if (data.image !== undefined) category.image = data.image;
  if (data.parentCategory !== undefined) category.parentCategory = data.parentCategory;

  await category.save();

  const updatedCategory = await Category.findById(category._id).populate("image").lean();
  const formatted = {
    ...updatedCategory,
    image: ImageService.formatImage(updatedCategory.image),
  };

  await invalidateCategoryCache(id);
  return successResponse(formatted, "Category updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  if (!categoryId) {
    throw new BadRequestError("Category ID is required in search params!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const category = await Category.findOne({ _id: categoryId, restaurant: id });
  if (!category) {
    throw new NotFoundError("Category not found!");
  }

  // Recursively find all subcategories under this category
  const findDescendantCategoryIds = async (parentIds) => {
    const children = await Category.find({ parentCategory: { $in: parentIds }, restaurant: id }).select("_id").lean();
    if (!children || children.length === 0) return [];
    const childIds = children.map((c) => c._id);
    const descendantIds = await findDescendantCategoryIds(childIds);
    return [...childIds, ...descendantIds];
  };

  const subCategoryIds = await findDescendantCategoryIds([categoryId]);
  const allCategoryIdsToDelete = [categoryId, ...subCategoryIds];

  // Delete all items belonging to this category or subcategories
  await MenuItem.deleteMany({
    restaurant: id,
    $or: [
      { category: { $in: allCategoryIdsToDelete } },
      { subCategory: { $in: allCategoryIdsToDelete } },
    ],
  });

  // Delete the category and all descendant subcategories
  await Category.deleteMany({
    _id: { $in: allCategoryIdsToDelete },
    restaurant: id,
  });

  await invalidateCategoryCache(id);
  await invalidateItemCache(id);

  return successResponse(null, "Category and all associated subcategories and items deleted successfully");
});