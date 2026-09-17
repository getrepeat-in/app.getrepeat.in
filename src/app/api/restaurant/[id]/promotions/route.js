import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { getPromotionCacheKey, invalidatePromotionCache } from "@/lib/api/helpers/cacheKeys";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  ConflictError 
} from "@/lib/api/response-handler";

const PROMOTION_TYPE_REQUIREMENTS = {
  ITEM_DISCOUNT: ["name", "discount_type", "discount_value"],
  BESTSELLER: ["name", "discount_type", "discount_value"],
  CART_DISCOUNT: ["name", "discount_type", "discount_value"],
  BOGO: ["name"],
  FREEBIE: ["name", "min_order_value"],
  FLAT_PRICE: ["name", "discount_value", "min_order_value"],
};

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const cacheKey = status ? `${getPromotionCacheKey(id)}:status:${status}` : getPromotionCacheKey(id);
  const cachedPromotions = await getCache(cacheKey);

  if (cachedPromotions) {
    return successResponse(cachedPromotions, "Promotions fetched successfully (cached)");
  }

  const query = { restaurant: id };
  if (status) query.status = status;

  const promotions = await Promotion.find(query)
    .populate("items", "name base_price")
    .sort({ priority: -1, created_at: -1 })
    .lean();

  await setCache(cacheKey, promotions, 3600);
  return successResponse(promotions, "Promotions fetched successfully");
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();
  const type = data.type || "ITEM_DISCOUNT";
  const requiredFields = PROMOTION_TYPE_REQUIREMENTS[type];

  if (!requiredFields) {
    throw new BadRequestError(`Invalid promotion type: ${type}`);
  }

  const { isValid, message } = validateRequiredFields(data, requiredFields);
  if (!isValid) {
    throw new BadRequestError(message);
  }

  if (data.code) {
    const existingCode = await Promotion.exists({
      restaurant: id,
      code: data.code.toUpperCase(),
      status: { $ne: "EXPIRED" },
    });
    if (existingCode) {
      throw new ConflictError("A promotion with this code already exists for this restaurant.");
    }
  }

  if (["ITEM_DISCOUNT", "BESTSELLER", "FREEBIE", "FLAT_PRICE"].includes(type)) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError("At least one item must be selected for this promotion type.");
    }
  }

  if (type === "FREEBIE") {
    if (data.items && data.items.length > 5) {
      throw new BadRequestError("You can only select up to 5 free items.");
    }

    const existingFreebie = await Promotion.exists({ restaurant: id, type: "FREEBIE" });
    if (existingFreebie) {
      throw new BadRequestError("You already have an active Freebie promotion. Please delete it before creating a new one.");
    }
  }

  if (type === "FLAT_PRICE") {
    if (data.items && data.items.length > 5) {
      throw new BadRequestError("You can only select up to 5 items for a flat price promotion.");
    }

    const existingFlatPrice = await Promotion.exists({ restaurant: id, type: "FLAT_PRICE" });
    if (existingFlatPrice) {
      throw new BadRequestError("You already have an active Flat Price promotion. Please delete it before creating a new one.");
    }

    data.per_user_limit = data.per_user_limit || 1;
  }

  const newPromotion = await Promotion.create({
    restaurant: id,
    ...data,
    code: data.code ? data.code.toUpperCase() : undefined,
  });

  await invalidatePromotionCache(id);
  return successResponse(newPromotion, "Promotion created successfully", 201);
});
