import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import Restaurant from "@/models/Restaurant";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import dbConnect from "@/lib/db";
import { deleteCache } from "@/services/backend/redis/cache.service";

export const POST = async (req, { params }) => {
    try {
        const { id } = await params;
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first", 401);
        }

        const body = await req.json();
        const { postId, mappedItems } = body;

        if (!postId) {
            return JsonResponse.error("postId is required", 400);
        }

        if (!Array.isArray(mappedItems)) {
            return JsonResponse.error("mappedItems must be an array", 400);
        }

        if (mappedItems.length > 3) {
            return JsonResponse.error("You can only map up to 3 items per post", 400);
        }

        await dbConnect();

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        // Upsert the mapping
        const mapping = await InstagramPostMapping.findOneAndUpdate(
            { restaurant: id, postId },
            { $set: { mappedItems } },
            { new: true, upsert: true }
        );

        // Invalidate customer app cache for Instagram posts!
        if (restaurant.slug) {
            await deleteCache(`restaurant:slug:${restaurant.slug}:instagram:posts`);
        }

        return JsonResponse.success(mapping, "Items mapped successfully", 200);
    } catch (err) {
        console.error("Instagram Mapping POST Error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error", 500);
    }
};
