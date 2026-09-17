import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { RestaurantService } from "@/services/backend/restaurant";

const RESTAURANT_POST_REQUIRED_FIELDS = ["name", "phone", "email", "slug"];

export const POST = async (req) => {
    try {
        const data = await req.json();
        const { isValid, message } = validateRequiredFields(data, RESTAURANT_POST_REQUIRED_FIELDS);
        
        if (!isValid) {
            return JsonResponse.error(message, 400);
        }

        const user = await getUser();
        if (!user || !user.id) {
            return JsonResponse.error("Please login first to continue !", 401);
        }

        const newRestaurant = await RestaurantService.createRestaurant(user, data);

        return JsonResponse.success(
            { restaurantId: newRestaurant._id },
            "Restaurant created successfully",
            200
        );
    } catch (err) {
        return JsonResponse.error(
            err?.message || "Internal Server Error !",
            err?.statusCode || 500
        );
    }
};

export const GET = async () => {
    try {
        const user = await getUser();
        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const { restaurants, isCached } = await RestaurantService.getRestaurantsByUser(user.id);

        return JsonResponse.success(
            { restaurants },
            restaurants.length
                ? `Restaurants fetched successfully${isCached ? " (cached)" : ""}`
                : `No restaurants found${isCached ? " (cached)" : ""}`,
            200
        );
    } catch (err) {
        return JsonResponse.error(
            err?.message || "Internal Server Error!",
            err?.statusCode || 500
        );
    }
};
