import { StaffService } from "@/services/backend/staff";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId, staffId } = await params;
  await getRestaurant({ restaurantId });

  const staff = await StaffService.getStaffById(staffId, restaurantId);
  return successResponse(staff, "Staff member fetched successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId, staffId } = await params;
  await getRestaurant({ restaurantId });

  const body = await req.json();
  const updatedStaff = await StaffService.updateStaff(staffId, restaurantId, body);

  return successResponse(updatedStaff, "Staff member updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId, staffId } = await params;
  await getRestaurant({ restaurantId });

  await StaffService.deleteStaff(staffId, restaurantId);
  return successResponse(null, "Staff member deleted successfully");
});