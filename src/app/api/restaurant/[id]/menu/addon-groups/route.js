import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });
  const { data, isCached } = await MenuService.getAddonGroups(restaurantId);
  return successResponse(
    data,
    `Addon groups fetched successfully${isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });
  const data = await req.json();
  const newGroup = await MenuService.createAddonGroup(restaurantId, data);
  return successResponse(newGroup, "Addon group created successfully", 201);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");

  if (!restaurantId || !groupId) throw new BadRequestError("Restaurant ID and Group ID are required!");
  await getRestaurant({ restaurantId });
  const data = await req.json();
  const updatedGroup = await MenuService.updateAddonGroup(restaurantId, groupId, data);
  return successResponse(updatedGroup, "Addon group updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");

  if (!restaurantId || !groupId) throw new BadRequestError("Restaurant ID and Group ID are required!");
  await getRestaurant({ restaurantId });
  await MenuService.deleteAddonGroup(restaurantId, groupId);
  return successResponse({ success: true }, "Addon group deleted successfully");
});
