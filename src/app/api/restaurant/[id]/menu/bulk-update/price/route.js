import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { invalidateItemCache } from "@/lib/api/helpers/cacheKeys";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError 
} from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) {
    throw new BadRequestError("Restaurant ID is required!");
  }

  await getRestaurant({ restaurantId });
  await dbConnect();

  const data = await req.json();
  const { items } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("An array of items with updated prices is required.");
  }

  const bulkOps = items.map((item) => {
    const updateFields = {};
    if (item.base_price !== undefined) {
      updateFields.base_price = Number(item.base_price);
    }

    if (item.variants !== undefined) {
      updateFields.variants = item.variants;
      if (Array.isArray(item.variants) && item.variants.length > 0) {
        let minPrice = Infinity;
        item.variants.forEach((variant) => {
          if (Array.isArray(variant.options)) {
            variant.options.forEach((opt) => {
              const price = Number(opt.price);
              if (!isNaN(price) && price < minPrice) {
                minPrice = price;
              }
            });
          }
        });

        if (minPrice !== Infinity) {
          updateFields.base_price = minPrice;
        }
      }
    }

    return {
      updateOne: {
        filter: { _id: item.id, restaurant: restaurantId },
        update: { $set: updateFields },
      },
    };
  });

  if (bulkOps.length === 0) {
    throw new BadRequestError("No valid update operations provided.");
  }

  const result = await MenuItem.bulkWrite(bulkOps);
  await invalidateItemCache(restaurantId);

  return successResponse(
    {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
    "Successfully updated prices and variants in bulk"
  );
});
