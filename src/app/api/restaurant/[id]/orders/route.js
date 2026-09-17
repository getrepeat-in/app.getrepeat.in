import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { OrderService } from "@/services/backend/order";
import { getCache, setCache } from "@/services/backend/redis/cache.service";

export const GET = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id }).select("_id").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

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
            return JsonResponse.success(cachedResult, "Orders fetched successfully (cached)", 200);
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

        return JsonResponse.success(result, "Orders fetched successfully", 200);
    } catch (err) {
        console.error("API GET ORDERS ERROR:", err);
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};

export const POST = async (req, { params }) => {
    try {
        const { id } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        await dbConnect();
        const user = await getUser();
        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id }).select("_id").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

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

        return JsonResponse.success(order, "Order created successfully", 201);
    } catch (err) {
        console.error("API POST ORDER ERROR:", err);
        return JsonResponse.error(err?.message || "Internal Server Error!", 400);
    }
};
