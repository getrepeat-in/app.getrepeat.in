import dbConnect from "@/lib/db";
import Promotion from "@/models/Promotion";
import Restaurant from "@/models/Restaurant";
import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import { invalidatePromotionCache } from "@/lib/api/helpers/cacheKeys";

export const PUT = async (req, { params }) => {
    try {
        const { id, promotionId } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        if (!promotionId) {
            return JsonResponse.error("Promotion ID is required in URL!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const data = await req.json();
        const promotion = await Promotion.findOne({ _id: promotionId, restaurant: id });
        
        if (!promotion) {
            return JsonResponse.error("Promotion not found!", 404);
        }

        if (data.code && data.code.toUpperCase() !== promotion.code) {
            const existingCode = await Promotion.findOne({ 
                restaurant: id, 
                code: data.code.toUpperCase(),
                _id: { $ne: promotionId }
            });
            if (existingCode) {
                return JsonResponse.error("A promotion with this code already exists.", 400);
            }
            data.code = data.code.toUpperCase();
        }

        Object.assign(promotion, data);
        await promotion.save();
        await invalidatePromotionCache(id);

        return JsonResponse.success(promotion, "Promotion updated successfully", 200);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};

export const DELETE = async (req, { params }) => {
    try {
        const { id, promotionId } = await params;
        if (!id) {
            return JsonResponse.error("Restaurant ID is required!", 400);
        }

        if (!promotionId) {
            return JsonResponse.error("Promotion ID is required in URL!", 400);
        }

        await dbConnect();
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first to continue!", 401);
        }

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const promotion = await Promotion.findOne({ _id: promotionId, restaurant: id });
        if (!promotion) {
            return JsonResponse.error("Promotion not found!", 404);
        }

        await Promotion.deleteOne({ _id: promotionId });
        await invalidatePromotionCache(id);
        
        return JsonResponse.success(null, "Promotion deleted successfully", 200);
    } catch (err) {
        return JsonResponse.error(err?.message || "Internal Server Error!", 500);
    }
};
