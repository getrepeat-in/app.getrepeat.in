import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import Restaurant from "@/models/Restaurant";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = async (req, { params }) => {
    try {
        const { slug } = await params;
        
        if (!slug) {
            return JsonResponse.error("Restaurant slug is required", 400);
        }

        const cacheKey = `restaurant:slug:${slug}:promotions:active`;
        const cachedPromotions = await getCache(cacheKey);

        if (cachedPromotions) {
            return JsonResponse.success(cachedPromotions, "Active promotions fetched successfully (cached)");
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
        
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
        }

        const currentDate = new Date();
        const promotions = await Promotion.find({
            restaurant: restaurant._id,
            status: "ACTIVE",
            $and: [
                { $or: [{ starts_at: null }, { starts_at: { $lte: currentDate } }] },
                { $or: [{ ends_at: null }, { ends_at: { $gte: currentDate } }] }
            ]
        })
        .select("name type discount_type discount_value items starts_at ends_at usage_limit per_user_limit times_used")
        .lean();
        
        await setCache(cacheKey, promotions, 300);
        return JsonResponse.success(promotions, "Active promotions fetched successfully");
    } catch (error) {
        console.error("GET promotions error:", error);
        return JsonResponse.error(error.message || "Failed to fetch active promotions", 500);
    }
};
