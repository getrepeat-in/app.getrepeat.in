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
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });
  await dbConnect();

  const data = await req.json();
  const { itemIds, addonGroupIds, action } = data;

  if (!Array.isArray(itemIds) || !Array.isArray(addonGroupIds)) {
    throw new BadRequestError("itemIds and addonGroupIds must be arrays.");
  }

  let resultData = null;

  if (action === "add") {
    const updateResult = await MenuItem.updateMany(
      { _id: { $in: itemIds }, restaurant: restaurantId },
      { $addToSet: { addonGroups: { $each: addonGroupIds } } }
    );
    resultData = { matched: updateResult.matchedCount, modified: updateResult.modifiedCount };
  } else if (action === "remove") {
    const updateResult = await MenuItem.updateMany(
      { _id: { $in: itemIds }, restaurant: restaurantId },
      { $pullAll: { addonGroups: addonGroupIds } }
    );
    resultData = { matched: updateResult.matchedCount, modified: updateResult.modifiedCount };
  } else if (action === "set") {
    const updateResult = await MenuItem.updateMany(
      { _id: { $in: itemIds }, restaurant: restaurantId },
      { $set: { addonGroups: addonGroupIds } }
    );
    resultData = { matched: updateResult.matchedCount, modified: updateResult.modifiedCount };
  } else {
    throw new BadRequestError("Invalid action. Must be add, remove, or set.");
  }

  await invalidateItemCache(restaurantId);

  return successResponse(resultData, "Addons updated successfully");
});
