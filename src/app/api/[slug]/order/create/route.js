import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError } from "@/lib/api/response-handler";
import { getAuthUser } from "@/lib/api/helpers/auth";

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

    return successResponse(order, "Order placed successfully", 201);
});
