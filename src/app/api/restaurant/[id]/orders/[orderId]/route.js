import dbConnect from "@/lib/db";
import { Staff } from "@/models/Staff";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { OrderService } from "@/services/backend/order";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError 
} from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id, orderId } = await params;
  if (!id || !orderId) {
    throw new BadRequestError("Restaurant ID and Order ID are required!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const order = await OrderService.getOrderById(orderId, { restaurantId: id });
  return successResponse(order, "Order fetched successfully");
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const { id, orderId } = await params;
  if (!id || !orderId) {
    throw new BadRequestError("Restaurant ID and Order ID are required!");
  }

  const { user } = await getRestaurant({ restaurantId: id });
  await dbConnect();

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
    throw new BadRequestError("No valid update fields provided");
  }

  return successResponse(updatedOrder, "Order updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id, orderId } = await params;
  if (!id || !orderId) {
    throw new BadRequestError("Restaurant ID and Order ID are required!");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  await OrderService.deleteOrder(orderId, { restaurantId: id });
  return successResponse(null, "Order deleted successfully");
});
