import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { invalidateItemCache, invalidateCategoryCache } from "@/lib/api/helpers/cacheKeys";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  NotFoundError 
} from "@/lib/api/response-handler";

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });
  await dbConnect();

  const data = await req.json();
  const { action, payload } = data;

  if (!action || !payload) {
    throw new BadRequestError("Action and payload are required.");
  }

  let resultData = null;

  if (action === "move_items") {
    const { itemIds, targetCategoryId, targetSubCategoryId } = payload;
    if (!Array.isArray(itemIds) || !targetCategoryId) {
      throw new BadRequestError("itemIds and targetCategoryId are required for moving items.");
    }

    const updateResult = await MenuItem.updateMany(
      { _id: { $in: itemIds }, restaurant: restaurantId },
      {
        $set: {
          category: targetCategoryId,
          subCategory: targetSubCategoryId || null,
        },
      }
    );
    resultData = { matched: updateResult.matchedCount, modified: updateResult.modifiedCount };
  } else if (action === "move_subcategories") {
    const { subCategoryIds, targetCategoryId } = payload;
    if (!Array.isArray(subCategoryIds)) {
      throw new BadRequestError("subCategoryIds is required.");
    }

    await Category.updateMany(
      { _id: { $in: subCategoryIds }, restaurant: restaurantId },
      { $set: { parentCategory: targetCategoryId || null } }
    );

    if (targetCategoryId) {
      await MenuItem.updateMany(
        { subCategory: { $in: subCategoryIds }, restaurant: restaurantId },
        { $set: { category: targetCategoryId } }
      );
    } else {
      for (const subId of subCategoryIds) {
        const promotedCategory = await Category.findOne({ _id: subId, restaurant: restaurantId });
        if (!promotedCategory) continue;

        const newSubCategory = await Category.create({
          restaurant: restaurantId,
          name: promotedCategory.name,
          image: promotedCategory.image,
          displayOrder: 0,
          parentCategory: subId,
        });

        await MenuItem.updateMany(
          { subCategory: subId, restaurant: restaurantId },
          { $set: { category: subId, subCategory: newSubCategory._id } }
        );
      }
    }
    resultData = { success: true };
  } else if (action === "merge") {
    const { sourceIds, targetId, type } = payload;
    if (!Array.isArray(sourceIds) || !targetId || !type) {
      throw new BadRequestError("sourceIds, targetId, and type are required for merging.");
    }

    if (type === "category") {
      await Category.updateMany(
        { parentCategory: { $in: sourceIds }, restaurant: restaurantId },
        { $set: { parentCategory: targetId } }
      );

      await MenuItem.updateMany(
        { category: { $in: sourceIds }, restaurant: restaurantId },
        { $set: { category: targetId } }
      );
      await Category.deleteMany({ _id: { $in: sourceIds }, restaurant: restaurantId });
    } else if (type === "subcategory") {
      const targetSub = await Category.findOne({ _id: targetId, restaurant: restaurantId });
      if (!targetSub) throw new NotFoundError("Target subcategory not found");
      await MenuItem.updateMany(
        { subCategory: { $in: sourceIds }, restaurant: restaurantId },
        {
          $set: {
            subCategory: targetId,
            category: targetSub.parentCategory,
          },
        }
      );
      await Category.deleteMany({ _id: { $in: sourceIds }, restaurant: restaurantId });
    }
    resultData = { success: true };
  } else {
    throw new BadRequestError("Invalid action.");
  }

  await invalidateItemCache(restaurantId);
  await invalidateCategoryCache(restaurantId);
  return successResponse(resultData, "Structure updated successfully");
});
