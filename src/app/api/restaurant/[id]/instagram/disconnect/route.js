import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";

export const DELETE = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    restaurant.instagram = {
        userId: null,
        accessToken: null,
        tokenExpiresAt: null,
        username: null,
        connectedAt: null
    };

    await restaurant.save();

    await invalidateRestaurantCache({
        userId: restaurant.createdBy,
        restaurantId: restaurant._id,
        slugs: restaurant.slug
    });

    return successResponse(null, "Instagram account disconnected successfully");
});
