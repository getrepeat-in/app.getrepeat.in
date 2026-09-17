import "@/models/Image";
import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import WebsiteConfig from "@/models/WebsiteConfig";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const cacheKey = `restaurant:website-config:slug:${slug}`;
    const cachedConfig = await getCache(cacheKey);
    if (cachedConfig) {
        return successResponse(cachedConfig, "Website configuration fetched successfully (cached)");
    }

    await dbConnect();
    
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    const config = await WebsiteConfig.findOne({ restaurant: restaurant._id })
        .populate("homepage.banners.items.image")
        .lean();

    if (!config) {
        return successResponse(null, "No website configuration found", 200);
    }

    await setCache(cacheKey, config, 600);
    return successResponse(config, "Website configuration fetched successfully");
});
