import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import Restaurant from "@/models/Restaurant";
import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { getPromotionCacheKey, invalidatePromotionCache } from "@/lib/api/helpers/cacheKeys";

const PROMOTION_TYPE_REQUIREMENTS = {
    ITEM_DISCOUNT: ["name", "discount_type", "discount_value"],
    BESTSELLER: ["name", "discount_type", "discount_value"],
    CART_DISCOUNT: ["name", "discount_type", "discount_value"],
    BOGO: ["name"] 
};

export const GET = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        const url = new URL(req.url);
        const status = url.searchParams.get("status");
        
        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const cacheKey = status ? `${getPromotionCacheKey(id)}:status:${status}` : getPromotionCacheKey(id);
        const cachedPromotions = await getCache(cacheKey);
        
        if (cachedPromotions) {
            return JsonResponse.success(cachedPromotions, "Promotions fetched successfully (cached)", 200);
        }

        const query = { restaurant: id };
        if (status) {
            query.status = status;
        }

        const promotions = await Promotion.find(query)
            .populate("items", "name base_price")
            .sort({ priority: -1, created_at: -1 });

        await setCache(cacheKey, promotions, 3600);
        return JsonResponse.success(promotions, "Promotions fetched successfully", 200);
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
        
        const type = data.type || "ITEM_DISCOUNT";
        const requiredFields = PROMOTION_TYPE_REQUIREMENTS[type];
        
        if (!requiredFields) {
            return JsonResponse.error(`Invalid promotion type: ${type}`, 400);
        }
            
        const { isValid, message } = validateRequiredFields(data, requiredFields);
        
        if (!isValid) {
            return JsonResponse.error(message, 400);
        }

        if (data.code) {
            const existingCode = await Promotion.findOne({ 
                restaurant: id, 
                code: data.code.toUpperCase(),
                status: { $ne: "EXPIRED" }
            });
            if (existingCode) {
                return JsonResponse.error("A promotion with this code already exists for this restaurant.", 400);
            }
        }

        const newPromotion = await Promotion.create({
            restaurant: id,
            ...data,
            code: data.code ? data.code.toUpperCase() : undefined
        });

        await invalidatePromotionCache(id);
        
        return JsonResponse.success(newPromotion, "Promotion created successfully", 201);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};


