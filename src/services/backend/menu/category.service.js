import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { ImageService } from "@/services/backend/images";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getCategoriesCacheKey, invalidateCategoryCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

const MENU_CATEGORY_POST_REQUIRED_FIELDS = ["name"];

export const CategoryService = {
  getCategories: async (restaurantId) => {
    await dbConnect();

    const cacheKey = getCategoriesCacheKey(restaurantId);
    const { data: formattedCategories, isCached } = await getOrSetCache(
      cacheKey,
      async () => {
        const categories = await Category.find({ restaurant: restaurantId })
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

    return { data: formattedCategories || [], isCached };
  },

  createCategory: async (restaurantId, data) => {
    await dbConnect();

    const { isValid, message } = validateRequiredFields(data, MENU_CATEGORY_POST_REQUIRED_FIELDS);
    if (!isValid) {
      throw new Error(message);
    }

    const { name, displayOrder, image, parentCategory } = data;

    const newCategory = await Category.create({
      restaurant: restaurantId,
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

    await invalidateCategoryCache(restaurantId);
    return formatted;
  },

  updateCategory: async (restaurantId, categoryId, data) => {
    await dbConnect();

    const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
    if (!category) {
      throw new Error("Category not found!");
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

    await invalidateCategoryCache(restaurantId);
    return formatted;
  },

  deleteCategory: async (restaurantId, categoryId) => {
    await dbConnect();

    const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
    if (!category) {
      throw new Error("Category not found!");
    }

    const findDescendantCategoryIds = async (parentIds) => {
      const children = await Category.find({ parentCategory: { $in: parentIds }, restaurant: restaurantId }).select("_id").lean();
      if (!children || children.length === 0) return [];
      const childIds = children.map((c) => c._id);
      const descendantIds = await findDescendantCategoryIds(childIds);
      return [...childIds, ...descendantIds];
    };

    const subCategoryIds = await findDescendantCategoryIds([categoryId]);
    const allCategoryIdsToDelete = [categoryId, ...subCategoryIds];

    await MenuItem.deleteMany({
      restaurant: restaurantId,
      $or: [
        { category: { $in: allCategoryIdsToDelete } },
        { subCategory: { $in: allCategoryIdsToDelete } },
      ],
    });

    await Category.deleteMany({
      _id: { $in: allCategoryIdsToDelete },
      restaurant: restaurantId,
    });

    await invalidateCategoryCache(restaurantId);
    await invalidateItemCache(restaurantId);

    return true;
  }
};
