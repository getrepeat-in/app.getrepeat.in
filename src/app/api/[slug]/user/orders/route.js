import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { OrderService } from "@/services/backend/order";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getAuthUser } from "@/lib/api/helpers/auth";

export const GET = async (req, { params }) => {
    try {
        const { slug } = await params;
        if (!slug) {
            return JsonResponse.error("Restaurant slug is required", 400);
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("_id name").lean();
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
        }

        const url = new URL(req.url);
        const authUser = getAuthUser(req);
        const queryPhone = url.searchParams.get("phone");
        const queryUserId = url.searchParams.get("userId");

        const customerId = authUser?.userId || queryUserId || null;
        const phone = authUser?.phone || queryPhone || null;

        if (!customerId && !phone) {
            return JsonResponse.error("Authentication required or phone parameter needed to fetch orders", 401);
        }

        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const limit = parseInt(url.searchParams.get("limit") || "20", 10);
        const status = url.searchParams.get("status");

        const result = await OrderService.getCustomerOrders({
            restaurantId: restaurant._id,
            customerId,
            phone,
            status,
            page,
            limit,
        });

        return JsonResponse.success(result, "User orders fetched successfully", 200);
    } catch (error) {
        console.error("GET user orders error:", error);
        return JsonResponse.error(error.message || "Failed to fetch user orders", 500);
    }
};
