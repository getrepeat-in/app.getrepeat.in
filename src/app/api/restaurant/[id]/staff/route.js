import { StaffService } from "@/services/backend/staff";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  await getRestaurant({ restaurantId });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";
  const search = url.searchParams.get("search") || "";
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  const result = await StaffService.getStaffList(restaurantId, {
    status,
    search,
    page,
    limit,
  });

  const isPaginated = Boolean(page && limit);
  const responseData = isPaginated ? result : (result.staffList || []);

  return successResponse(
    responseData,
    `Staff list fetched successfully${result.isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  await getRestaurant({ restaurantId });

  const body = await req.json();
  const newStaff = await StaffService.createStaff(restaurantId, body);

  return successResponse(newStaff, "Staff member added successfully", 201);
});
