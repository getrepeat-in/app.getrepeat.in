import { OrderService } from "@/services/backend/order";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { validateRequiredFields } from "@/lib/api/helpers/validator";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

const ORDER_POST_REQUIRED_FIELDS = ["orderType", "items", "subtotal", "totalAmount"];

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  await getRestaurant({ restaurantId: id });

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const orderType = url.searchParams.get("orderType");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const summary = url.searchParams.get("summary") === "true";
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const { isCached, ...result } = await OrderService.listOrders({
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

  return successResponse(result, `Orders fetched successfully${isCached ? " (cached)" : ""}`);
});

export const POST = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new BadRequestError("Restaurant ID is required!");

  const { user } = await getRestaurant({ restaurantId: id });
  const data = await req.json();

  const { isValid, message } = validateRequiredFields(data, ORDER_POST_REQUIRED_FIELDS);
  if (!isValid) throw new BadRequestError(message);

  const staff = await dbConnect().then(() => import("@/models/Staff").then(m => m.Staff.findOne({
    restaurant: id,
    $or: [
      { clerkUserId: user.id },
      { email: user.emailAddresses?.[0]?.emailAddress },
    ],
  }).select("_id").lean()));
  
  const updatedByStaff = staff?._id || null;

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
    paymentMethod: data.paymentMethod || "CASH",
    paymentStatus: data.paymentStatus || "PENDING",
    specialInstructions: data.specialInstructions || "",
    initialStatus: data.status || null,
    updatedByStaff,
  });

  return successResponse(order, "Order created successfully", 201);
});
