import "@/models/AddonGroup";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import ImageAsset from "@/models/Image";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { getItemsCacheKey, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";
import { ImageService } from "@/services/backend/images";

const formatMenuItem = (item) => {
    if (!item) return item;
    const obj = item.toObject ? item.toObject() : { ...item };
    return {
        ...obj,
        image: ImageService.formatImage(obj.image),
        addonGroups: Array.isArray(obj.addonGroups) ? obj.addonGroups.map(ag => {
            if (!ag || typeof ag !== 'object' || !Array.isArray(ag.items)) return ag;
            return {
                ...ag,
                items: ag.items.map(mapped => ({
                    ...mapped,
                    item: mapped && mapped.item && typeof mapped.item === 'object' ? {
                        ...mapped.item,
                        image: ImageService.formatImage(mapped.item.image)
                    } : mapped?.item
                }))
            };
        }) : []
    };
};

const MENU_ITEM_POST_REQUIRED_FIELDS = ["category", "name", "base_price", "dietaryType"];

const calculateMinVariantPrice = (variants, currentBasePrice) => {
    if (!Array.isArray(variants) || variants.length === 0) return currentBasePrice;
    let minPrice = Infinity;
    variants.forEach(variant => {
        if (Array.isArray(variant.options)) {
            variant.options.forEach(opt => {
                const price = Number(opt.price);
                if (!isNaN(price) && price < minPrice) {
                    minPrice = price;
                }
            });
        }
    });
    return minPrice !== Infinity ? minPrice : currentBasePrice;
};

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

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');
        const subCategoryId = searchParams.get('subCategoryId');

        const cacheKey = getItemsCacheKey(id);
        let items = await getCache(cacheKey);

        if (!items) {
            items = await MenuItem.find({ restaurant: id })
                .populate("image")
                .populate({
                    path: 'addonGroups',
                    populate: {
                        path: 'items.item',
                        select: 'name base_price image variants dietaryType isAvailable'
                    }
                })
                .sort({ displayOrder: 1, createdAt: -1 });
            await setCache(cacheKey, items);
        }

        let filteredItems = items;
        if (categoryId) filteredItems = filteredItems.filter(i => i.category?.toString() === categoryId || i.category?._id?.toString() === categoryId);
        if (subCategoryId) filteredItems = filteredItems.filter(i => i.subCategory?.toString() === subCategoryId || i.subCategory?._id?.toString() === subCategoryId);

        const formattedItems = (filteredItems || []).map(formatMenuItem);
        return JsonResponse.success(formattedItems, "Items fetched successfully", 200);
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

        if (data.image === "") {
            data.image = null;
        }
        const { isValid, message } = validateRequiredFields(data, MENU_ITEM_POST_REQUIRED_FIELDS);
        
        if (!isValid) {
            console.error("Validation failed:", message);
            return JsonResponse.error(message, 400);
        }

        const category = await Category.findOne({ _id: data.category, restaurant: id });
        if (!category) {
            console.error("Invalid category:", data.category);
            return JsonResponse.error("Invalid category", 400);
        }

        if (data.subCategory) {
            const subCategory = await Category.findOne({ _id: data.subCategory, restaurant: id, parentCategory: data.category });
            if (!subCategory) {
                console.error("Invalid subCategory:", data.subCategory, "with parent:", data.category);
                return JsonResponse.error("Invalid subCategory", 400);
            }
        }

        const highestOrder = await MenuItem.findOne({ restaurant: id, category: data.category, subCategory: data.subCategory || null })
            .sort("-displayOrder")
            .select("displayOrder")
            .lean();

        const newItemData = {
            restaurant: id,
            category: data.category,
            subCategory: data.subCategory || null,
            name: data.name,
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
                path: 'addonGroups',
                populate: {
                    path: 'items.item',
                    select: 'name base_price image variants dietaryType isAvailable'
                }
            });
        
        await invalidateItemCache(id);
        return JsonResponse.success(formatMenuItem(populatedItem), "Item created successfully", 201);
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

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return JsonResponse.error("Item ID is required for update", 400);
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

        if (data.image === "") {
            data.image = null;
        }

        if (data.category && data.category !== undefined) {
            const category = await Category.findOne({ _id: data.category, restaurant: id });
            if (!category) {
                return JsonResponse.error("Invalid category", 400);
            }
        }

        if (data.subCategory && data.subCategory !== undefined) {
            const subCategory = await Category.findOne({ _id: data.subCategory, restaurant: id });
            if (!subCategory) {
                return JsonResponse.error("Invalid subCategory", 400);
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
            path: 'addonGroups',
            populate: {
                path: 'items.item',
                select: 'name base_price image variants dietaryType isAvailable'
            }
        });

        if (!updatedItem) {
            return JsonResponse.error("Item not found", 404);
        }

        await invalidateItemCache(id);
        return JsonResponse.success(formatMenuItem(updatedItem), "Item updated successfully", 200);
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

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return JsonResponse.error("Item ID is required for deletion", 400);
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

        const deletedItem = await MenuItem.findOneAndDelete({ _id: itemId, restaurant: id });
        if (!deletedItem) {
            return JsonResponse.error("Item not found", 404);
        }

        await invalidateItemCache(id);
        return JsonResponse.success(deletedItem, "Item deleted successfully", 200);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};
