import dbConnect from "@/lib/db";
import Table from "@/models/Table";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { getTablesCacheKey, invalidateTableCache } from "@/lib/api/helpers/cacheKeys";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  ConflictError 
} from "@/lib/api/response-handler";

const TABLE_POST_REQUIRED_FIELDS = ["tableNumber", "capacity"];

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const isActive = url.searchParams.get("isActive");

  const hasFilters = status || isActive !== null;
  if (!hasFilters) {
    const cacheKey = getTablesCacheKey(id);
    const cached = await getCache(cacheKey);
    if (cached) return successResponse(cached, "Tables fetched successfully (cached)");
  }

  const query = { restaurant: id };
  if (status) query.status = status;
  if (isActive !== null && isActive !== undefined) query.isActive = isActive === "true";

  const tables = await Table.find(query).sort({ tableNumber: 1 }).lean();

  if (!hasFilters) {
    await setCache(getTablesCacheKey(id), tables, 3600);
  }

  return successResponse(tables, "Tables fetched successfully");
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();
  const { isValid, message } = validateRequiredFields(data, TABLE_POST_REQUIRED_FIELDS);
  if (!isValid) throw new BadRequestError(message);

  const { tableNumber, label, capacity, zone } = data;
  const resolvedZone = zone?.trim() || "General";

  const existing = await Table.exists({ restaurant: id, zone: resolvedZone, tableNumber });
  if (existing) throw new ConflictError(`Table #${tableNumber} already exists in zone "${resolvedZone}"`);

  const newTable = await Table.create({
    restaurant: id,
    zone: resolvedZone,
    tableNumber,
    label: label || null,
    capacity,
  });

  await invalidateTableCache(id);
  return successResponse(newTable, "Table created successfully", 201);
});
