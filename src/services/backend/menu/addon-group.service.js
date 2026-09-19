import "@/models/Image";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import AddonGroup from "@/models/AddonGroup";
import { ImageService } from "@/services/backend/images";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getAddonGroupsCacheKey, invalidateAddonGroupCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

const formatAddonGroup = (group) => {
  if (!group) return group;
  const obj = group.toObject ? group.toObject() : { ...group };
  return {
    ...obj,
    items: Array.isArray(obj.items)
      ? obj.items.map((mapped) => ({
          ...mapped,
          item:
            mapped && mapped.item && typeof mapped.item === "object"
              ? {
                  ...mapped.item,
                  image: ImageService.formatImage(mapped.item.image),
                }
              : mapped?.item,
        }))
      : [],
  };
};

export const AddonGroupService = {
  getAddonGroups: async (restaurantId) => {
    await dbConnect();

    const cacheKey = getAddonGroupsCacheKey(restaurantId);
    const { data: groups, isCached } = await getOrSetCache(
      cacheKey,
      async () => {
        const rawGroups = await AddonGroup.find({ restaurant: restaurantId })
          .populate({ path: "items.item", populate: { path: "image" } })
          .sort({ createdAt: -1 })
          .lean();
        return rawGroups.map(formatAddonGroup);
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
      items: data.items || [],
    });

    const populatedGroup = await AddonGroup.findById(newGroup._id)
      .populate({ path: "items.item", populate: { path: "image" } })
      .lean();

    await invalidateAddonGroupCache(restaurantId);

    return formatAddonGroup(populatedGroup);
  },

  updateAddonGroup: async (restaurantId, groupId, data) => {
    await dbConnect();

    const updatedGroup = await AddonGroup.findOneAndUpdate(
      { _id: groupId, restaurant: restaurantId },
      { $set: data },
      { new: true }
    )
      .populate({ path: "items.item", populate: { path: "image" } })
      .lean();

    if (!updatedGroup) throw new Error("Addon group not found");

    await invalidateAddonGroupCache(restaurantId);
    await invalidateItemCache(restaurantId);

    return formatAddonGroup(updatedGroup);
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
