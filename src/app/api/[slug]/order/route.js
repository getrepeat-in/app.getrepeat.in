import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const GET = async (req, { params }) => {
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

        const url = new URL(req.url);
        const orderNumber = url.searchParams.get("orderNumber");
        const orderId = url.searchParams.get("orderId");

        // 1. Direct order lookup by orderNumber
        if (orderNumber) {
            const order = await OrderService.getOrderByNumber(orderNumber, {
                restaurantId: restaurant._id,
            });
            return JsonResponse.success(order, "Order fetched successfully", 200);
        }

        // 2. Direct order lookup by orderId
        if (orderId) {
            const order = await OrderService.getOrderById(orderId, {
                restaurantId: restaurant._id,
            });
            return JsonResponse.success(order, "Order fetched successfully", 200);
        }

        // 3. Authenticated customer order history
        const authUser = getAuthUser(req);
        const queryPhone = url.searchParams.get("phone");
        const queryUserId = url.searchParams.get("userId");

        const customerId = authUser?.userId || queryUserId || null;
        const phone = authUser?.phone || queryPhone || null;

        if (!customerId && !phone) {
            return JsonResponse.error("Authentication required to list customer orders, or specify ?orderNumber=... / ?phone=...", 401);
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

        return JsonResponse.success(result, "Orders fetched successfully", 200);
    } catch (error) {
        console.error("GET customer orders error:", error);
        return JsonResponse.error(error.message || "Failed to fetch orders", 400);
    }
};

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
