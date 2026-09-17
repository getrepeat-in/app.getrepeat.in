import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import Restaurant from "@/models/Restaurant";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const cacheKey = `restaurant:slug:${slug}:promotions:active`;
    const cachedPromotions = await getCache(cacheKey);

    if (cachedPromotions) {
        return successResponse(cachedPromotions, "Active promotions fetched successfully (cached)");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    
    if (!restaurant) {
        throw new RestaurantNotFoundError();
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
    .populate({
        path: "items",
        select: "name base_price description dietaryType isAvailable image",
        populate: {
            path: "image",
            select: "variants original blurHash status"
        }
    })
    .select("name type discount_type discount_value min_order_value items starts_at ends_at usage_limit per_user_limit times_used")
    .lean();
    
    await setCache(cacheKey, promotions, 300);
    return successResponse(promotions, "Active promotions fetched successfully");
});
