import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { invalidatePromotionCache } from "@/lib/api/helpers/cacheKeys";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  NotFoundError, 
  ConflictError 
} from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id, promotionId } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");
  if (!promotionId) throw new BadRequestError("Promotion ID is required in URL!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();
  const promotion = await Promotion.findOne({ _id: promotionId, restaurant: id });
  if (!promotion) {
    throw new NotFoundError("Promotion not found!");
  }

  if (data.code && data.code.toUpperCase() !== promotion.code) {
    const existingCode = await Promotion.exists({
      restaurant: id,
      code: data.code.toUpperCase(),
      _id: { $ne: promotionId },
    });
    if (existingCode) {
      throw new ConflictError("A promotion with this code already exists.");
    }
    data.code = data.code.toUpperCase();
  }

  Object.assign(promotion, data);
  await promotion.save();
  await invalidatePromotionCache(id);

  return successResponse(promotion, "Promotion updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id, promotionId } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");
  if (!promotionId) throw new BadRequestError("Promotion ID is required in URL!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const promotion = await Promotion.findOne({ _id: promotionId, restaurant: id });
  if (!promotion) {
    throw new NotFoundError("Promotion not found!");
  }

  await Promotion.deleteOne({ _id: promotionId });
  await invalidatePromotionCache(id);

  return successResponse(null, "Promotion deleted successfully");
});
