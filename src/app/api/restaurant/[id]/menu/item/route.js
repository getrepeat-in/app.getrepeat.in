import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";
import { captureServerEvent } from "@/lib/posthog-server";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId: id });

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const subCategoryId = searchParams.get("subCategoryId");
  const { data, isCached } = await MenuService.getItems(id, { categoryId, subCategoryId });
  return successResponse(
    data,
    `Items fetched successfully${isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const { user } = await getRestaurant({ restaurantId: id });
  const data = await req.json();
  const newItem = await MenuService.createItem(id, data);
  await captureServerEvent({
    distinctId: user.id,
    event: "menu_item_created",
    properties: { restaurant_id: id },
  });
  return successResponse(newItem, "Item created successfully", 201);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    throw new BadRequestError("Item ID is required for update.");
  }

  const { user } = await getRestaurant({ restaurantId: id });
  const data = await req.json();
  const updatedItem = await MenuService.updateItem(id, itemId, data);
  await captureServerEvent({
    distinctId: user.id,
    event: "menu_item_updated",
    properties: { restaurant_id: id },
  });
  return successResponse(updatedItem, "Item updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) {
    throw new BadRequestError("Item ID is required for deletion");
  }

  const { user } = await getRestaurant({ restaurantId: id });
  const deletedItem = await MenuService.deleteItem(id, itemId);
  await captureServerEvent({
    distinctId: user.id,
    event: "menu_item_deleted",
    properties: { restaurant_id: id },
  });
  return successResponse(deletedItem, "Item deleted successfully");
});
