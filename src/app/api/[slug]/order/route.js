import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { getAuthUser } from "@/lib/api/helpers/auth";
import { OrderService } from "@/services/backend/order";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError, UnauthorizedError } from "@/lib/api/response-handler";

const ORDER_CREATE_REQUIRED_FIELDS = ["orderType", "items", "subtotal", "totalAmount"];

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
    const orderNumber = url.searchParams.get("orderNumber");
    const orderId = url.searchParams.get("orderId");

    if (orderNumber) {
        const order = await OrderService.getOrderByNumber(orderNumber, {
            restaurantId: restaurant._id,
        });
        return successResponse(order, "Order fetched successfully", 200);
    }

    if (orderId) {
        const order = await OrderService.getOrderById(orderId, {
            restaurantId: restaurant._id,
        });
        return successResponse(order, "Order fetched successfully", 200);
    }

    const authUser = getAuthUser(req);
    const queryPhone = url.searchParams.get("phone");
    const queryUserId = url.searchParams.get("userId");

    const customerId = authUser?.userId || queryUserId || null;
    const phone = authUser?.phone || queryPhone || null;

    if (!customerId && !phone) {
        throw new UnauthorizedError("Authentication required to list customer orders, or specify ?orderNumber=... / ?phone=...");
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

    return successResponse(result, "Orders fetched successfully", 200);
});

export const POST = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;
    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    const data = await req.json();
    const { isValid, message } = validateRequiredFields(data, ORDER_CREATE_REQUIRED_FIELDS);
    if (!isValid) throw new BadRequestError(message);

    const authUser = getAuthUser(req);
    const customerId = authUser?.userId || data.customer || null;

    const order = await OrderService.createOrder({
        restaurantId: restaurant._id,
        orderType: data.orderType,
        table: data.table,
        customer: customerId,
        customerInfo: data.customerInfo,
        deliveryAddress: data.deliveryAddress,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod || "CASH",
        paymentStatus: data.paymentStatus || "PENDING",
        specialInstructions: data.specialInstructions || "",
        initialStatus: data.status || null,
    });

    return successResponse(order, "Order placed successfully", 201);
});