import { UserService } from "@/services/backend/user";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required");

  await getRestaurant({ restaurantId });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";
  const search = url.searchParams.get("search") || "";
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  const result = await UserService.getUsers(restaurantId, {
    status,
    search,
    page,
    limit,
  });

  const isPaginated = Boolean(page && limit);
  const responseData = isPaginated ? result : (result.users || []);

  return successResponse(
    responseData,
    `Customers fetched successfully${result.isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required");

  await getRestaurant({ restaurantId });

  const body = await req.json();
  const newUser = await UserService.createUser(restaurantId, body);
  return successResponse(newUser, "Customer added successfully", 201);
});