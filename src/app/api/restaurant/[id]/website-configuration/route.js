import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import WebsiteConfig from "@/models/WebsiteConfig";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { getCache, setCache, deleteCache } from "@/services/backend/redis/cache.service";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError 
} from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const cacheKey = `restaurant:website-config:${id}`;
  const cachedConfig = await getCache(cacheKey);

  if (cachedConfig) {
    return successResponse(
      cachedConfig,
      "Website configuration fetched successfully (cached)"
    );
  }

  const config = await WebsiteConfig.findOne({ restaurant: id })
    .populate("homepage.banners.items.image")
    .lean();

  if (!config) {
    return successResponse(
      null,
      "No website configuration found for this restaurant."
    );
  }

  await setCache(cacheKey, config, 3600);
  return successResponse(config, "Website configuration fetched successfully");
});

export const PUT = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();

  const updatedConfig = await WebsiteConfig.findOneAndUpdate(
    { restaurant: id },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  ).populate("homepage.banners.items.image");

  const cacheKey = `restaurant:website-config:${id}`;
  await deleteCache(cacheKey);

  const actualRestaurant = await Restaurant.findById(id).select("slug").lean();
  if (actualRestaurant?.slug) {
    await deleteCache(`restaurant:website-config:slug:${actualRestaurant.slug}`);
  }

  return successResponse(
    updatedConfig,
    "Website configuration saved successfully"
  );
});
