import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { RestaurantService } from "@/services/backend/restaurant";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const data = await req.json();

    const { user } = await getRestaurant({ restaurantId: id });
    const updatedRestaurant = await RestaurantService.updateRestaurant(id, user.id, data);

    return successResponse(
        { restaurant: updatedRestaurant }, 
        "Restaurant updated successfully", 
        200
    );
});

export const GET = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    await getRestaurant({ restaurantId: id });

    const { restaurant: details, isCached } = await RestaurantService.getRestaurantById(id);

    return successResponse(
        details, 
        `Restaurant details fetched successfully${isCached ? " (cached)" : ""}`, 
        200
    );
});