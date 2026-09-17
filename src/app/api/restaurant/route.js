import { getUser } from "@/lib/api/hooks/getUser";
import { RestaurantService } from "@/services/backend/restaurant";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

const RESTAURANT_POST_REQUIRED_FIELDS = ["name", "phone", "email", "slug"];

export const POST = withErrorHandler(async (req) => {
    const data = await req.json();
    const { isValid, message } = validateRequiredFields(data, RESTAURANT_POST_REQUIRED_FIELDS);
    
    if (!isValid) {
        throw new BadRequestError(message);
    }

    const user = await getUser();
    const newRestaurant = await RestaurantService.createRestaurant(user, data);

    return successResponse(
        { restaurantId: newRestaurant._id },
        "Restaurant created successfully",
        200
    );
});

export const GET = withErrorHandler(async () => {
    const user = await getUser();
    const { restaurants, isCached } = await RestaurantService.getRestaurantsByUser(user.id);

    return successResponse(
        { restaurants },
        restaurants.length
            ? `Restaurants fetched successfully${isCached ? " (cached)" : ""}`
            : `No restaurants found${isCached ? " (cached)" : ""}`,
        200
    );
});
