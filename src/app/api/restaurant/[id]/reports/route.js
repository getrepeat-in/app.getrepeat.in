import { ReportsService } from "@/services/backend/reports";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });

  const url = new URL(req.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const preset = url.searchParams.get("preset") || "today";

  const analytics = await ReportsService.getAnalytics({
    restaurantId: id,
    startDate,
    endDate,
    preset,
  });

  return successResponse(analytics, "Reports and sales metrics fetched successfully");
});
