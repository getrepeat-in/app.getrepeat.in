import dbConnect from "@/lib/db";
import Table from "@/models/Table";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { invalidateTableCache } from "@/lib/api/helpers/cacheKeys";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError, 
  NotFoundError 
} from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id, tableId } = await params;
  if (!id || !tableId) throw new BadRequestError("Restaurant ID and Table ID are required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const table = await Table.findOne({ _id: tableId, restaurant: id }).lean();
  if (!table) throw new NotFoundError("Table not found");

  return successResponse(table, "Table fetched successfully");
});

export const PATCH = withErrorHandler(async (req, { params }) => {
  const { id, tableId } = await params;
  if (!id || !tableId) throw new BadRequestError("Restaurant ID and Table ID are required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const table = await Table.findOne({ _id: tableId, restaurant: id });
  if (!table) throw new NotFoundError("Table not found");

  const data = await req.json();
  const ALLOWED_FIELDS = ["label", "capacity", "status", "isActive"];

  ALLOWED_FIELDS.forEach((field) => {
    if (data[field] !== undefined) {
      table[field] = data[field];
    }
  });

  const VALID_STATUSES = ["available", "occupied", "reserved", "unavailable"];
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new BadRequestError(`Invalid table status: "${data.status}"`);
  }

  await table.save();
  await invalidateTableCache(id);

  return successResponse(table, "Table updated successfully");
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  const { id, tableId } = await params;
  if (!id || !tableId) throw new BadRequestError("Restaurant ID and Table ID are required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const table = await Table.findOneAndDelete({ _id: tableId, restaurant: id });
  if (!table) throw new NotFoundError("Table not found");

  await invalidateTableCache(id);
  return successResponse(null, "Table deleted successfully");
});
