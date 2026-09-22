import dbConnect from "@/lib/db";
import Integration from "@/models/Integration";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { razorpayService } from "@/services/backend/payments/razorpay";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const DELETE = withErrorHandler(async (req, { params }) => {
    await dbConnect();
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    const integration = await Integration.findOne({ restaurantId: id });

    if (!integration || !integration.razorpay) {
        throw new BadRequestError("Razorpay is not connected.");
    }

    if (integration.razorpay.accessToken) {
        try {
            await razorpayService.revokeToken(integration.razorpay.accessToken, "access_token");
        } catch (error) {
            console.error("Failed to revoke Razorpay token, proceeding with disconnection anyway:", error);
        }
    }

    await Integration.findOneAndUpdate(
        { restaurantId: id },
        {
            $set: {
                "razorpay.accountId": null,
                "razorpay.accessToken": null,
                "razorpay.refreshToken": null,
                "razorpay.publicToken": null,
                "razorpay.isActive": false,
                "razorpay.isLinked": false
            }
        },
        { upsert: true }
    );

    await invalidateRestaurantCache({
        userId: restaurant.createdBy,
        restaurantId: restaurant._id,
        slugs: restaurant.slug
    });

    return successResponse(null, "Razorpay account disconnected successfully");
});
