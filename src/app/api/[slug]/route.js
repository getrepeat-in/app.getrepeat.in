import "@/models/Image";
import { RestaurantService } from "@/services/backend/restaurant";
import { backendIntegrationService } from "@/services/backend/integration";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    const { restaurant, isCached } = await RestaurantService.getRestaurantBySlug(slug);

    if (restaurant) {
        const integrations = await backendIntegrationService.getIntegrations(restaurant._id);
        restaurant.integrations = {
            metaPixel: integrations.metaPixel,
        };
    }

    return successResponse(
        restaurant,
        `Restaurant details fetched successfully${isCached ? " (cached)" : ""}`
    );
});
