import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { getCategoriesCacheKey, invalidateCategoryCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";
import { ImageService } from "@/services/backend/images";

const MENU_CATEGORY_POST_REQUIRED_FIELDS = ["name"];

export const GET = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const cacheKey = getCategoriesCacheKey(id);
        const cachedCategories = await getCache(cacheKey);
        if (cachedCategories) {
            return JsonResponse.success(cachedCategories, "Categories fetched successfully (cached)", 200);
        }

        const categories = await Category.find({ restaurant: id }).populate("image").sort({ displayOrder: 1, createdAt: -1 });
        const formattedCategories = categories.map(c => {
            const obj = c.toObject ? c.toObject() : { ...c };
            return { ...obj, image: ImageService.formatImage(obj.image) };
        });

        await setCache(cacheKey, formattedCategories, 3600);
        return JsonResponse.success(formattedCategories, "Categories fetched successfully", 200);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};

export const POST = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const data = await req.json();
        const { isValid, message } = validateRequiredFields(data, MENU_CATEGORY_POST_REQUIRED_FIELDS);
        
        if (!isValid) {
            return JsonResponse.error(message, 400);
        }

        const { name, displayOrder, image, parentCategory } = data;

        const newCategory = await Category.create({
            restaurant: id,
            name,
            displayOrder: displayOrder || 0,
            image: image || null,
            parentCategory: parentCategory || null,
        });

        const createdCategory = await Category.findById(newCategory._id).populate("image");
        const formatted = {
            ...createdCategory.toObject(),
            image: ImageService.formatImage(createdCategory.image),
        };

        await invalidateCategoryCache(id);
        return JsonResponse.success(formatted, "Category created successfully", 201);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};

export const PUT = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        const url = new URL(req.url);
        const categoryId = url.searchParams.get("categoryId");

        if (!categoryId) {
            return JsonResponse.error("Category ID is required in search params!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const data = await req.json();
        
        const category = await Category.findOne({ _id: categoryId, restaurant: id });
        if (!category) {
            return JsonResponse.error("Category not found!", 404);
        }

        if (data.name !== undefined) category.name = data.name;
        if (data.displayOrder !== undefined) category.displayOrder = data.displayOrder;
        if (data.image !== undefined) category.image = data.image;
        if (data.parentCategory !== undefined) category.parentCategory = data.parentCategory;

        await category.save();
        const updatedCategory = await Category.findById(category._id).populate("image");
        const formatted = {
            ...updatedCategory.toObject(),
            image: ImageService.formatImage(updatedCategory.image),
        };

        await invalidateCategoryCache(id);

        return JsonResponse.success(formatted, "Category updated successfully", 200);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        const url = new URL(req.url);
        const categoryId = url.searchParams.get("categoryId");

        if (!categoryId) {
            return JsonResponse.error("Category ID is required in search params!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const category = await Category.findOne({ _id: categoryId, restaurant: id });
        if (!category) {
            return JsonResponse.error("Category not found!", 404);
        }

        // Recursively find all subcategories under this category
        const findDescendantCategoryIds = async (parentIds) => {
            const children = await Category.find({ parentCategory: { $in: parentIds }, restaurant: id }).select('_id');
            if (!children || children.length === 0) return [];
            const childIds = children.map(c => c._id);
            const descendantIds = await findDescendantCategoryIds(childIds);
            return [...childIds, ...descendantIds];
        };

        const subCategoryIds = await findDescendantCategoryIds([categoryId]);
        const allCategoryIdsToDelete = [categoryId, ...subCategoryIds];

        // Delete all items belonging to this category or any of its subcategories
        await MenuItem.deleteMany({
            restaurant: id,
            $or: [
                { category: { $in: allCategoryIdsToDelete } },
                { subCategory: { $in: allCategoryIdsToDelete } }
            ]
        });

        // Delete the category and all its descendant subcategories
        await Category.deleteMany({
            _id: { $in: allCategoryIdsToDelete },
            restaurant: id
        });

        await invalidateCategoryCache(id);
        await invalidateItemCache(id);
        return JsonResponse.success(null, "Category and all associated subcategories and items deleted successfully", 200);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};