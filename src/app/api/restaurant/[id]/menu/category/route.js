import { MenuService } from "@/services/backend/menu";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId: id });
  const { data, isCached } = await MenuService.getCategories(id);
  return successResponse(
    data,
    `Categories fetched successfully${isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId: id });
  const data = await req.json();
  const formatted = await MenuService.createCategory(id, data);
  return successResponse(formatted, "Category created successfully", 201);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  if (!categoryId) {
    throw new BadRequestError("Category ID is required in search params!");
  }

  await getRestaurant({ restaurantId: id });
  const data = await req.json();
  const formatted = await MenuService.updateCategory(id, categoryId, data);
  return successResponse(formatted, "Category updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");
  if (!categoryId) {
    throw new BadRequestError("Category ID is required in search params!");
  }

  await getRestaurant({ restaurantId: id });
  await MenuService.deleteCategory(id, categoryId);
  return successResponse(null, "Category and all associated subcategories and items deleted successfully");
});