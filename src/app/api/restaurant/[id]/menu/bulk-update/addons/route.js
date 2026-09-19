import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });

  const data = await req.json();
  const { itemIds, addonGroupIds, action } = data;

  if (!Array.isArray(itemIds) || !Array.isArray(addonGroupIds)) {
    throw new BadRequestError("itemIds and addonGroupIds must be arrays.");
  }

  const resultData = await MenuService.bulkUpdateAddons(restaurantId, itemIds, addonGroupIds, action);
  return successResponse(resultData, "Addons updated successfully");
});
