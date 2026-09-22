import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { razorpayService } from "@/services/backend/payments/razorpay";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  
  if (!restaurantId) {
    throw new BadRequestError("Restaurant ID is required");
  }

  await getRestaurant({ restaurantId });
  const authUrl = razorpayService.getAuthUrl(restaurantId);

  return successResponse(
    { url: authUrl },
    "Razorpay authorization URL generated successfully"
  );
});
