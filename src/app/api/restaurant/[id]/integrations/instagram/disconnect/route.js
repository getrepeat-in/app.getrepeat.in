import Integration from "@/models/Integration";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const DELETE = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    await Integration.findOneAndUpdate(
        { restaurantId: id },
        {
            $set: {
                "instagram.userId": null,
                "instagram.accessToken": null,
                "instagram.tokenExpiresAt": null,
                "instagram.username": null,
                "instagram.connectedAt": null
            }
        },
        { upsert: true }
    );

    await invalidateRestaurantCache({
        userId: restaurant.createdBy,
        restaurantId: restaurant._id,
        slugs: restaurant.slug
    });

    return successResponse(null, "Instagram account disconnected successfully");
});
