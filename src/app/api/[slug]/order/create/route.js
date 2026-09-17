import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const POST = async (req, { params }) => {
    try {
        const { slug } = await params;
        if (!slug) {
            return JsonResponse.error("Restaurant slug is required", 400);
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
        }

        const data = await req.json();
        const authUser = getAuthUser(req);
        const customerId = authUser?.userId || data.customer || null;

        const order = await OrderService.createOrder({
            restaurantId: restaurant._id,
            orderType: data.orderType,
            table: data.table,
            customer: customerId,
            customerInfo: data.customerInfo,
            items: data.items,
            subtotal: data.subtotal,
            tax: data.tax,
            discount: data.discount,
            totalAmount: data.totalAmount,
            paymentMethod: data.paymentMethod || "cash",
            paymentStatus: data.paymentStatus || "pending",
            specialInstructions: data.specialInstructions || "",
            initialStatus: data.status || null,
        });

        return JsonResponse.success(order, "Order placed successfully", 201);
    } catch (error) {
        console.error("Order creation error:", error);
        return JsonResponse.error(error.message || "Failed to create order", 400);
    }
};
