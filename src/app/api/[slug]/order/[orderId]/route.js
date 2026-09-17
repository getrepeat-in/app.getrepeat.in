import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const GET = async (req, { params }) => {
    try {
        const { slug, orderId } = await params;
        if (!slug || !orderId) {
            return JsonResponse.error("Slug and Order ID are required", 400);
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
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

        return JsonResponse.success(order, "Order details fetched successfully", 200);
    } catch (error) {
        console.error("GET order detail error:", error);
        return JsonResponse.error(error.message || "Failed to fetch order", 404);
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const { slug, orderId } = await params;
        if (!slug || !orderId) {
            return JsonResponse.error("Slug and Order ID are required", 400);
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
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
            return JsonResponse.success(updatedOrder, "Order cancelled successfully", 200);
        }

        return JsonResponse.error("Invalid action requested", 400);
    } catch (error) {
        console.error("PATCH customer order error:", error);
        return JsonResponse.error(error.message || "Failed to update order", 400);
    }
};
