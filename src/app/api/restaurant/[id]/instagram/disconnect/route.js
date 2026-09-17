import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import Restaurant from "@/models/Restaurant";
import dbConnect from "@/lib/db";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { deleteCache } from "@/services/backend/redis/cache.service";

export const DELETE = async (req, { params }) => {
    try {
        const { id } = await params;
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first", 401);
        }

        await dbConnect();

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        restaurant.instagram = {
            userId: null,
            accessToken: null,
            tokenExpiresAt: null,
            username: null,
            connectedAt: null
        };

        await restaurant.save();

        await invalidateRestaurantCache(restaurant.createdBy, restaurant._id);
        if (restaurant.slug) {
            await deleteCache(`restaurant:slug:${restaurant.slug}`);
        }

        return JsonResponse.success(null, "Instagram account disconnected successfully");
    } catch (err) {
        console.error("Instagram Disconnect Error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error", 500);
    }
};
