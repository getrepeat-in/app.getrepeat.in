import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import AddonGroup from "@/models/AddonGroup";
import "@/models/Image";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { getAddonGroupsCacheKey, invalidateAddonGroupCache, invalidateItemCache } from "@/lib/api/helpers/cacheKeys";
import { ImageService } from "@/services/backend/images";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  NotFoundError 
} from "@/lib/api/response-handler";

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

export const GET = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });
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

  return successResponse(
    groups || [],
    `Addon groups fetched successfully${isCached ? " (cached)" : ""}`
  );
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  if (!restaurantId) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId });
  await dbConnect();

  const data = await req.json();

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

  return successResponse(formatAddonGroup(populatedGroup), "Addon group created successfully", 201);
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");

  if (!restaurantId || !groupId) throw new BadRequestError("Restaurant ID and Group ID are required!");

  await getRestaurant({ restaurantId });
  await dbConnect();

  const data = await req.json();

  const updatedGroup = await AddonGroup.findOneAndUpdate(
    { _id: groupId, restaurant: restaurantId },
    { $set: data },
    { new: true }
  )
    .populate({ path: "items.item", populate: { path: "image" } })
    .lean();

  if (!updatedGroup) throw new NotFoundError("Addon group not found");

  await invalidateAddonGroupCache(restaurantId);
  await invalidateItemCache(restaurantId);

  return successResponse(formatAddonGroup(updatedGroup), "Addon group updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id: restaurantId } = await params;
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");

  if (!restaurantId || !groupId) throw new BadRequestError("Restaurant ID and Group ID are required!");

  await getRestaurant({ restaurantId });
  await dbConnect();

  const deleted = await AddonGroup.findOneAndDelete({ _id: groupId, restaurant: restaurantId });
  if (!deleted) throw new NotFoundError("Addon group not found");

  await MenuItem.updateMany(
    { restaurant: restaurantId, addonGroups: groupId },
    { $pull: { addonGroups: groupId } }
  );

  await invalidateAddonGroupCache(restaurantId);
  await invalidateItemCache(restaurantId);

  return successResponse({ success: true }, "Addon group deleted successfully");
});
