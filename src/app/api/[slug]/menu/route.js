import dbConnect from "@/lib/db";
import { MenuService } from "@/services/backend/menu";
import { getMenuCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getRestaurantIdFromSlug } from "@/lib/api/hooks/getRestaurant";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const restaurantId = await getRestaurantIdFromSlug(slug);
    const cacheKey = getMenuCacheKey(restaurantId);
    
    const cachedMenu = await getCache(cacheKey);
    if (cachedMenu) {
        return successResponse(cachedMenu, "Menu fetched successfully (cached)");
    }

    await dbConnect();
    const menuData = await MenuService.getMenu(restaurantId);
    await setCache(cacheKey, menuData, 300);

    return successResponse(menuData, "Menu fetched successfully");
});
