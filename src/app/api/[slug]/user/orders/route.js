import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError, UnauthorizedError } from "@/lib/api/response-handler";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    const url = new URL(req.url);
    const authUser = getAuthUser(req);
    const queryPhone = url.searchParams.get("phone");
    const queryUserId = url.searchParams.get("userId");

    const customerId = authUser?.userId || queryUserId || null;
    const phone = authUser?.phone || queryPhone || null;

    if (!customerId && !phone) {
        throw new UnauthorizedError("Authentication required or phone parameter needed to fetch orders");
    }

    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const status = url.searchParams.get("status");

    const result = await OrderService.getCustomerOrders({
        restaurantId: restaurant._id,
        customerId,
        phone,
        status,
        page,
        limit,
    });

    return successResponse(result, "User orders fetched successfully", 200);
});
