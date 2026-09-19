import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { getAuthUser } from "@/lib/api/helpers/auth";
import { OrderService } from "@/services/backend/order";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";

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

    let order;
    if (orderId.startsWith("ORD-")) {
        order = await OrderService.getOrderByNumber(orderId, {
            restaurantId: restaurant._id,
        });
    } else if (orderId.startsWith("order_")) {
        order = await OrderService.getOrderByRazorpayId(orderId, {
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
