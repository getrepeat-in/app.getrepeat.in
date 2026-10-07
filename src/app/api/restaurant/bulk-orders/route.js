import { OrderService } from "@/services/backend/order";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req) => {
  const url = new URL(req.url);
  const restaurantIds = url.searchParams.get("restaurantIds");
  
  if (!restaurantIds) {
    throw new BadRequestError("restaurantIds parameter is required (comma-separated)!");
  }

  const status = url.searchParams.get("status");
  const orderType = url.searchParams.get("orderType");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const summary = url.searchParams.get("summary") === "true";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const { isCached, ...result } = await OrderService.listOrders({
    restaurantIds,
    status,
    orderType,
    search,
    startDate,
    endDate,
    page,
    limit,
    summary,
  });

  return successResponse(result, `Bulk orders fetched successfully${isCached ? " (cached)" : ""}`);
});
