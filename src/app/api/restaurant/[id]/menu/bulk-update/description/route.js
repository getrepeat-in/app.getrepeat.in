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
    throw new BadRequestError("An array of items with updated descriptions is required.");
  }

  const bulkOps = items.map((item) => {
    const updateFields = {};
    if (item.description !== undefined) {
      updateFields.description = String(item.description);
    }

    return {
      updateOne: {
        filter: { _id: item.id, restaurant: restaurantId },
        update: { $set: updateFields },
      },
    };
  });

  if (bulkOps.length === 0) {
    throw new BadRequestError("No valid description updates provided.");
  }

  const result = await MenuItem.bulkWrite(bulkOps);
  await invalidateItemCache(restaurantId);

  return successResponse(
    {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
    "Successfully updated descriptions in bulk"
  );
});
