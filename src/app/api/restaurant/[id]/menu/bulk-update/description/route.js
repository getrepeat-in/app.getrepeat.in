import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId });

  const data = await req.json();
  const { items } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("An array of items with updated descriptions is required.");
  }

  const result = await MenuService.bulkUpdateDescriptions(restaurantId, items);

  return successResponse(
    {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
    "Successfully updated descriptions in bulk"
  );
});
