import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import { decrypt } from "@/lib/crypto";
import Integration from "@/models/Integration";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import { getRestaurantIdFromSlug } from "@/lib/api/hooks/getRestaurant";
import { getInstagramPostsCacheKey } from "@/lib/api/helpers/cacheKeys";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import { withErrorHandler, successResponse, BadRequestError, NotFoundError, UnauthorizedError, AppError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;

    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const restaurantId = await getRestaurantIdFromSlug(slug);
    const cacheKey = getInstagramPostsCacheKey(restaurantId);
    const cachedPosts = await getCache(cacheKey);

    if (cachedPosts) {
        return successResponse(cachedPosts, "Instagram posts fetched successfully (cached)");
    }

    await dbConnect();

    const integration = await Integration.findOne({ restaurantId }).lean();
    const instagram = integration?.instagram;

    if (!instagram || !instagram.accessToken) {
        throw new NotFoundError("Instagram account not connected");
    }

    if (instagram.tokenExpiresAt && new Date(instagram.tokenExpiresAt) < new Date()) {
        throw new UnauthorizedError("Instagram access token has expired");
    }

    const decryptedToken = decrypt(instagram.accessToken);

    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.append("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username");
    url.searchParams.append("access_token", decryptedToken);
    url.searchParams.append("limit", "10");

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
        console.error("Instagram Graph API Error:", data);
        throw new AppError("Failed to fetch Instagram posts from Meta API", 502, "UPSTREAM_ERROR");
    }

    const posts = data.data || [];
    const postIds = posts.map(post => post.id);
    const mappings = await InstagramPostMapping.find({
        restaurant: restaurantId,
        postId: { $in: postIds }
    }).populate({
        path: "mappedItems",
        select: "name base_price image isAvailable variants",
        populate: {
            path: "image"
        }
    });

    const mappingsByPostId = mappings.reduce((acc, mapping) => {
        acc[mapping.postId] = mapping.mappedItems;
        return acc;
    }, {});

    const postsWithMappings = posts.map(post => ({
        ...post,
        mappedItems: mappingsByPostId[post.id] || []
    }));

    await setCache(cacheKey, postsWithMappings, 600);
    return successResponse(postsWithMappings, "Instagram posts fetched successfully");
});
