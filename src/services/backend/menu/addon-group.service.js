import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import AddonGroup from "@/models/AddonGroup";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getAddonGroupsCacheKey, invalidateAddonGroupCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

const mapItem = (it, idx) => ({
  name:        it.name        || "",
  description: it.description || "",
  price:       it.price       ?? 0,
  isFree:      it.isFree      ?? false,
  dietaryType: it.dietaryType || "veg",
  displayOrder: it.displayOrder ?? idx,
});

export const AddonGroupService = {
  getAddonGroups: async (restaurantId) => {
    await dbConnect();

    const cacheKey = getAddonGroupsCacheKey(restaurantId);
    const { data: groups, isCached } = await getOrSetCache(
      cacheKey,
      async () => {
        return await AddonGroup.find({ restaurant: restaurantId })
          .sort({ createdAt: -1 })
          .lean();
      },
      3600
    );

    return { data: groups || [], isCached };
  },

  createAddonGroup: async (restaurantId, data) => {
    await dbConnect();

    const newGroup = await AddonGroup.create({
      restaurant: restaurantId,
      name: data.name,
      selectionType: data.selectionType || "multiple",
      minSelection: data.minSelection || 0,
      maxSelection: data.maxSelection || null,
      items: (data.items || []).map(mapItem),
    });

    await invalidateAddonGroupCache(restaurantId);
    return newGroup.toObject();
  },

  updateAddonGroup: async (restaurantId, groupId, data) => {
    await dbConnect();

    const updatePayload = { ...data };
    if (Array.isArray(data.items)) {
      updatePayload.items = data.items.map(mapItem);
    }

    const updatedGroup = await AddonGroup.findOneAndUpdate(
      { _id: groupId, restaurant: restaurantId },
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updatedGroup) throw new Error("Addon group not found");

    await invalidateAddonGroupCache(restaurantId);
    await invalidateItemCache(restaurantId);

    return updatedGroup;
  },

  deleteAddonGroup: async (restaurantId, groupId) => {
    await dbConnect();

    const deleted = await AddonGroup.findOneAndDelete({ _id: groupId, restaurant: restaurantId });
    if (!deleted) throw new Error("Addon group not found");

    await MenuItem.updateMany(
      { restaurant: restaurantId, addonGroups: groupId },
      { $pull: { addonGroups: groupId } }
    );

    await invalidateAddonGroupCache(restaurantId);
    await invalidateItemCache(restaurantId);

    return deleted;
  }
};


