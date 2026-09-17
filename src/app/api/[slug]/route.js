import "@/models/Image";
import { RestaurantService } from "@/services/backend/restaurant";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    const { restaurant, isCached } = await RestaurantService.getRestaurantBySlug(slug);

    return successResponse(
        restaurant,
        `Restaurant details fetched successfully${isCached ? " (cached)" : ""}`
    );
});
