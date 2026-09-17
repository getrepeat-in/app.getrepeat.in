import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { Staff } from "@/models/Staff";
import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { OrderService } from "@/services/backend/order";

export const GET = async (req, { params }) => {
    try {
        const { id, orderId } = await params;
        if (!id || !orderId) {
            return JsonResponse.error("Restaurant ID and Order ID are required!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id }).select("_id").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const order = await OrderService.getOrderById(orderId, { restaurantId: id });
        return JsonResponse.success(order, "Order fetched successfully", 200);
    } catch (err) {
        console.error("GET order error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error!", 404);
    }
};

export const PATCH = async (req, { params }) => {
    try {
        const { id, orderId } = await params;
        if (!id || !orderId) {
            return JsonResponse.error("Restaurant ID and Order ID are required!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id }).select("_id").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const staff = await Staff.findOne({ clerkUserId: user.id, restaurant: id }).select("_id").lean();
        const updatedBy = staff ? staff._id : user.id;

        const data = await req.json();
        let updatedOrder;

        if (data.status) {
            updatedOrder = await OrderService.updateOrderStatus(orderId, {
                status: data.status,
                updatedBy,
                restaurantId: id,
            });
        }

        if (data.paymentStatus || data.paymentMethod) {
            updatedOrder = await OrderService.updateOrderPayment(orderId, {
                paymentStatus: data.paymentStatus,
                paymentMethod: data.paymentMethod,
                updatedBy,
                restaurantId: id,
            });
        }

        if (!updatedOrder) {
            return JsonResponse.error("No valid update fields provided", 400);
        }

        return JsonResponse.success(updatedOrder, "Order updated successfully", 200);
    } catch (err) {
        console.error("PATCH order error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error!", 400);
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const { id, orderId } = await params;
        if (!id || !orderId) {
            return JsonResponse.error("Restaurant ID and Order ID are required!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id }).select("_id").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        await OrderService.deleteOrder(orderId, { restaurantId: id });
        return JsonResponse.success(null, "Order deleted successfully", 200);
    } catch (err) {
        console.error("DELETE order error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error!", 400);
    }
};
