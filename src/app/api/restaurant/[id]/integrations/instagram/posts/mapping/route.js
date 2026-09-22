import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import { deleteCache } from "@/services/backend/redis/cache.service";

export const POST = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    const body = await req.json();
    const { postId, mappedItems } = body;

    if (!postId) {
        throw new BadRequestError("postId is required");
    }

    if (!Array.isArray(mappedItems)) {
        throw new BadRequestError("mappedItems must be an array");
    }

    if (mappedItems.length > 3) {
        throw new BadRequestError("You can only map up to 3 items per post");
    }
    
    const mapping = await InstagramPostMapping.findOneAndUpdate(
        { restaurant: id, postId },
        { $set: { mappedItems } },
        { returnDocument: 'after', upsert: true }
    );

    if (restaurant.slug) {
        await deleteCache(`restaurant:slug:${restaurant.slug}:instagram:posts`);
    }

    return successResponse(mapping, "Items mapped successfully", 200);
});
