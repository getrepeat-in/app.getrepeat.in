import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });

  const data = await req.json();
  const { action, payload } = data;

  if (!action || !payload) {
    throw new BadRequestError("Action and payload are required.");
  }

  const resultData = await MenuService.bulkUpdateStructure(restaurantId, action, payload);
  return successResponse(resultData, "Structure updated successfully");
});
