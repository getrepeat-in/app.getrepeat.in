import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { MenuService } from "@/services/backend/menu";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const cacheKey = `restaurant:slug:${slug}:menu`;
    const cachedMenu = await getCache(cacheKey);
    if (cachedMenu) {
        return successResponse(cachedMenu, "Menu fetched successfully (cached)");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    const menuData = await MenuService.getMenu(restaurant._id);
    await setCache(cacheKey, menuData, 300);

    return successResponse(menuData, "Menu fetched successfully");
});
