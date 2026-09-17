import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { MenuService } from "@/services/backend/menu";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = async (req, { params }) => {
    try {
        const { slug } = await params;
        if (!slug) {
            return JsonResponse.error("Restaurant slug is required", 400);
        }

        const cacheKey = `restaurant:slug:${slug}:menu`;
        const cachedMenu = await getCache(cacheKey);
        if (cachedMenu) {
            return JsonResponse.success(cachedMenu, "Menu fetched successfully (cached)");
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
        }

        const menuData = await MenuService.getMenu(restaurant._id);
        await setCache(cacheKey, menuData, 300);

        return JsonResponse.success(menuData, "Menu fetched successfully");
    } catch (error) {
        console.error("GET menu error:", error);
        return JsonResponse.error(error.message || "Failed to fetch menu", 500);
    }
};
