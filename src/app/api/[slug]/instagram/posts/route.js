import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { withErrorHandler, successResponse, BadRequestError, RestaurantNotFoundError, NotFoundError, UnauthorizedError, AppError } from "@/lib/api/response-handler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import MenuItem from "@/models/Item";

export const GET = withErrorHandler(async (req, { params }) => {
    const { slug } = await params;

    if (!slug) {
        throw new BadRequestError("Restaurant slug is required");
    }

    const cacheKey = `restaurant:slug:${slug}:instagram:posts`;
    const cachedPosts = await getCache(cacheKey);

    if (cachedPosts) {
        return successResponse(cachedPosts, "Instagram posts fetched successfully (cached)");
    }

    await dbConnect();
    const restaurant = await Restaurant.findOne({ slug }).select("instagram").lean();
    
    if (!restaurant) {
        throw new RestaurantNotFoundError();
    }

    const instagram = restaurant.instagram;

    if (!instagram || !instagram.accessToken) {
        throw new NotFoundError("Instagram account not connected");
    }

    // Check if token is expired
    if (instagram.tokenExpiresAt && new Date(instagram.tokenExpiresAt) < new Date()) {
        throw new UnauthorizedError("Instagram access token has expired");
    }

    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.append("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username");
    url.searchParams.append("access_token", instagram.accessToken);
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
        restaurant: restaurant._id,
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

    // Cache for 10 minutes (600 seconds)
    await setCache(cacheKey, postsWithMappings, 600);
    return successResponse(postsWithMappings, "Instagram posts fetched successfully");
});
