import dbConnect from "@/lib/db";
import { Staff } from "@/models/Staff";
import { OrderService } from "@/services/backend/order";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

async function resolveUpdatedBy(user, restaurantId) {
  const staff = await Staff.findOne({
    restaurant: restaurantId,
    $or: [
      { clerkUserId: user.id },
      { email: user.emailAddresses?.[0]?.emailAddress },
    ],
  }).select("_id").lean();

  return staff?._id || null;
}

export const GET = withErrorHandler(async (req, { params }) => {
  const { id, orderId } = await params;
  if (!id || !orderId) throw new BadRequestError("Restaurant ID and Order ID are required");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const order = await OrderService.getOrderById(orderId, { restaurantId: id });
  return successResponse(order, "Order fetched successfully");
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const { id, orderId } = await params;
  if (!id || !orderId) throw new BadRequestError("Restaurant ID and Order ID are required");

  const { user } = await getRestaurant({ restaurantId: id });
  await dbConnect();

  const [data, updatedByStaff] = await Promise.all([
    req.json(),
    resolveUpdatedBy(user, id),
  ]);

  const updatedOrder = await OrderService.processOrderUpdate(orderId, {
    action:        data.action,
    reason:        data.reason,
    paymentStatus: data.paymentStatus,
    paymentMethod: data.paymentMethod,
    restaurantId:  id,
    updatedByStaff,
  });

  return successResponse(updatedOrder, "Order updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id, orderId } = await params;
  if (!id || !orderId) throw new BadRequestError("Restaurant ID and Order ID are required");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  await OrderService.deleteOrder(orderId, { restaurantId: id });
  return successResponse(null, "Order deleted successfully");
});
