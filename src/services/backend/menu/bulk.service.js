import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import { invalidateItemCache, invalidateCategoryCache } from "@/lib/api/helpers/cacheKeys";

export const BulkService = {
  bulkUpdateDescriptions: async (restaurantId, items) => {
    await dbConnect();

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
      throw new Error("No valid description updates provided.");
    }

    const result = await MenuItem.bulkWrite(bulkOps);
    await invalidateItemCache(restaurantId);

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  },

  bulkUpdateAddons: async (restaurantId, itemIds, addonGroupIds, action) => {
    await dbConnect();
    
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
      throw new Error("Invalid action. Must be add, remove, or set.");
    }

    await invalidateItemCache(restaurantId);
    return resultData;
  },

  bulkUpdateStructure: async (restaurantId, action, payload) => {
    await dbConnect();
    let resultData = null;

    if (action === "move_items") {
      const { itemIds, targetCategoryId, targetSubCategoryId } = payload;
      if (!Array.isArray(itemIds) || !targetCategoryId) {
        throw new Error("itemIds and targetCategoryId are required for moving items.");
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
        throw new Error("subCategoryIds is required.");
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
        throw new Error("sourceIds, targetId, and type are required for merging.");
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
        if (!targetSub) throw new Error("Target subcategory not found");
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
      throw new Error("Invalid action.");
    }

    await invalidateItemCache(restaurantId);
    await invalidateCategoryCache(restaurantId);
    return resultData;
  }
};
