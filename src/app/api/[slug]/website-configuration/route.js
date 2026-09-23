import "@/models/Image";
import dbConnect from "@/lib/db";
import Integration from "@/models/Integration";
import WebsiteConfig from "@/models/WebsiteConfig";
import { getWebsiteConfigCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getRestaurantIdFromSlug } from "@/lib/api/hooks/getRestaurant";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const restaurantId = await getRestaurantIdFromSlug(slug);
    const cacheKey = getWebsiteConfigCacheKey(restaurantId);
    
    let config = await getCache(cacheKey);

    if (!config) {
        await dbConnect();
        
        config = await WebsiteConfig.findOne({ restaurant: restaurantId })
            .populate("homepage.banners.items.image")
            .lean();

        if (!config) {
            return successResponse(null, "No website configuration found", 200);
        }

        await setCache(cacheKey, config, 600);
    }

    const integration = await Integration.findOne({ restaurantId }).lean();
    const isRazorpayConnected = integration?.razorpay?.accountId && integration?.razorpay?.isActive;

    if (!isRazorpayConnected && config?.ordering?.paymentMethods?.includes("ONLINE")) {
        config = JSON.parse(JSON.stringify(config));
        config.ordering.paymentMethods = config.ordering.paymentMethods.filter(m => m !== "ONLINE");
        if (config.ordering.defaultPaymentMethod === "ONLINE") {
            config.ordering.defaultPaymentMethod = config.ordering.paymentMethods.length > 0 ? config.ordering.paymentMethods[0] : null;
        }
    }

    return successResponse(config, "Website configuration fetched successfully");
});
