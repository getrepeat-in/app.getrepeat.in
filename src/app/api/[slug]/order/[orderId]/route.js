import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug, orderId } = await params;
    if (!slug || !orderId) {
        throw new BadRequestError("Slug and Order ID are required");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    // Support lookup by either MongoDB _id or human-readable orderNumber
    let order;
    if (orderId.startsWith("ORD-")) {
        order = await OrderService.getOrderByNumber(orderId, {
            restaurantId: restaurant._id,
        });
    } else {
        order = await OrderService.getOrderById(orderId, {
            restaurantId: restaurant._id,
        });
    }

    return successResponse(order, "Order details fetched successfully", 200);
});

export const PATCH = withErrorHandler(async (req, { params }) => {
    const { slug, orderId } = await params;
    if (!slug || !orderId) {
        throw new BadRequestError("Slug and Order ID are required");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    const data = await req.json();
    const authUser = getAuthUser(req);

    // Action: Customer cancelling order
    if (data.action === "cancel" || data.status === "CANCELLED") {
        const updatedOrder = await OrderService.cancelOrder(orderId, {
            reason: data.reason || "Customer requested cancellation",
            cancelledBy: authUser?.userId || null,
            restaurantId: restaurant._id,
        });
        return successResponse(updatedOrder, "Order cancelled successfully", 200);
    }

    throw new BadRequestError("Invalid action requested");
});
