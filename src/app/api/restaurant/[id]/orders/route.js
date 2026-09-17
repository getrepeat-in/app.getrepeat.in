import dbConnect from "@/lib/db";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { OrderService } from "@/services/backend/order";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { 
  withErrorHandler, 
  successResponse, 
  BadRequestError 
} from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const orderType = url.searchParams.get("orderType");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const summary = url.searchParams.get("summary") === "true";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const cacheKey = `restaurant:${id}:orders:page:${page}:limit:${limit}:status:${status || "all"}:type:${orderType || "all"}:search:${search || "none"}:start:${startDate || "all"}:end:${endDate || "all"}:summary:${summary}`;
  const cachedResult = await getCache(cacheKey);

  if (cachedResult) {
    return successResponse(cachedResult, "Orders fetched successfully (cached)");
  }

  const result = await OrderService.listOrders({
    restaurantId: id,
    status,
    orderType,
    search,
    startDate,
    endDate,
    page,
    limit,
    summary,
  });

  await setCache(cacheKey, result, 60 * 2);

  return successResponse(result, "Orders fetched successfully");
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  const { user } = await getRestaurant({ restaurantId: id });
  await dbConnect();

  const data = await req.json();

  const order = await OrderService.createOrder({
    restaurantId: id,
    orderType: data.orderType,
    table: data.table,
    customer: data.customer,
    customerInfo: data.customerInfo,
    items: data.items,
    subtotal: data.subtotal,
    tax: data.tax,
    discount: data.discount,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod || "cash",
    paymentStatus: data.paymentStatus || "pending",
    specialInstructions: data.specialInstructions || "",
    initialStatus: data.status || null,
    updatedBy: user.id,
  });

  return successResponse(order, "Order created successfully", 201);
});
