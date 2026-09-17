import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, NotFoundError, UnauthorizedError, AppError } from "@/lib/api/response-handler";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import MenuItem from "@/models/Item";

export const GET = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    const instagram = restaurant.instagram;

    if (!instagram || !instagram.accessToken) {
        throw new NotFoundError("Instagram account not connected");
    }

    if (instagram.tokenExpiresAt && new Date(instagram.tokenExpiresAt) < new Date()) {
        throw new UnauthorizedError("Instagram access token has expired");
    }

    // Fetch posts from Meta
    const url = new URL("https://graph.instagram.com/me/media");
    url.searchParams.append("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username");
    url.searchParams.append("access_token", instagram.accessToken);
    url.searchParams.append("limit", "20");

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
        console.error("Instagram Graph API Error:", data);
        throw new AppError(data?.error?.message || "Failed to fetch Instagram posts from Meta API", 502, "UPSTREAM_ERROR");
    }

    const posts = data.data || [];

    const postIds = posts.map(post => post.id);
    const mappings = await InstagramPostMapping.find({
        restaurant: id,
        postId: { $in: postIds }
    }).populate({
        path: "mappedItems",
        select: "name base_price image isAvailable",
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

    return successResponse(postsWithMappings, "Instagram posts fetched successfully");
});
