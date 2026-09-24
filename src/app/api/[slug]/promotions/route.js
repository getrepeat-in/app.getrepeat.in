import "@/models/Item";
import "@/models/Image";
import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import { ImageService } from "@/services/backend/images";
import { getPromotionCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getRestaurantIdFromSlug } from "@/lib/api/hooks/getRestaurant";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const restaurantId = await getRestaurantIdFromSlug(slug);
    const cacheKey = `${getPromotionCacheKey(restaurantId)}:status:ACTIVE`;
    const cachedPromotions = await getCache(cacheKey);

    if (cachedPromotions) {
        return successResponse(cachedPromotions, "Active promotions fetched successfully (cached)");
    }

    await dbConnect();

    const currentDate = new Date();
    const promotions = await Promotion.find({
        restaurant: restaurantId,
        status: "ACTIVE",
        $and: [
            { $or: [{ starts_at: { $eq: null } }, { starts_at: { $exists: false } }, { starts_at: { $lte: currentDate } }] },
            { $or: [{ ends_at: { $eq: null } }, { ends_at: { $exists: false } }, { ends_at: { $gte: currentDate } }] }
        ]
    })
    .populate({
        path: "items",
        select: "name base_price description dietaryType isAvailable image",
        populate: {
            path: "image",
            select: "original thumbnail card detail"
        }
    })
    .select("name type discount_type discount_value min_order_value items starts_at ends_at usage_limit per_user_limit times_used")
    .lean();
    
    const formattedPromotions = promotions.map(promo => {
        if (promo.items && Array.isArray(promo.items)) {
            promo.items = promo.items.map(item => {
                if (item.image) {
                    item.image = ImageService.formatImage(item.image);
                }
                return item;
            });
        }
        return promo;
    });

    await setCache(cacheKey, formattedPromotions, 300);
    return successResponse(formattedPromotions, "Active promotions fetched successfully");
});