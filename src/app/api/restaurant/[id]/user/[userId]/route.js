import { UserService } from "@/services/backend/user";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId, userId } = await params;
  if (!restaurantId || !userId) {
    throw new BadRequestError("Restaurant ID and Customer ID are required");
  }

  await getRestaurant({ restaurantId });
  const user = await UserService.getUserById(userId, restaurantId);
  return successResponse(user, "Customer fetched successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId, userId } = await params;
  if (!restaurantId || !userId) {
    throw new BadRequestError("Restaurant ID and Customer ID are required");
  }

  await getRestaurant({ restaurantId });

  const body = await req.json();
  const updatedUser = await UserService.updateUser(userId, restaurantId, body);
  return successResponse(updatedUser, "Customer updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId, userId } = await params;
  if (!restaurantId || !userId) {
    throw new BadRequestError("Restaurant ID and Customer ID are required");
  }

  await getRestaurant({ restaurantId });
  await UserService.deleteUser(userId, restaurantId);
  return successResponse(null, "Customer deleted successfully");
});
