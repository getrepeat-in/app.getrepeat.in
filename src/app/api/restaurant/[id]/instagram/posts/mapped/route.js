import MenuItem from "@/models/Item";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import { withErrorHandler, successResponse } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    const instagram = restaurant?.instagram;

    if (!instagram || !instagram.accessToken) {
        return successResponse({
            isConnected: false,
            isExpired: false,
            username: null,
            connectedAt: null,
            posts: []
        }, "Instagram account not connected");
    }

    const isExpired = Boolean(instagram.tokenExpiresAt && new Date(instagram.tokenExpiresAt) < new Date());
    if (isExpired) {
        return successResponse({
            isConnected: false,
            isExpired: true,
            username: instagram.username,
            connectedAt: instagram.connectedAt,
            posts: []
        }, "Instagram access token has expired");
    }

    try {
        const url = new URL("https://graph.instagram.com/me/media");
        url.searchParams.append("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username");
        url.searchParams.append("access_token", instagram.accessToken);
        url.searchParams.append("limit", "50");

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok) {
            console.error("Instagram Graph API Error:", data);
            const isAuthError = data?.error?.code === 190 || data?.error?.type === "OAuthException";
            return successResponse({
                isConnected: !isAuthError,
                isExpired: isAuthError,
                error: data?.error?.message || "Failed to fetch Instagram posts from Meta API",
                username: instagram.username,
                connectedAt: instagram.connectedAt,
                posts: []
            }, "Unable to load Instagram media");
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

        return successResponse({
            isConnected: true,
            isExpired: false,
            username: instagram.username,
            connectedAt: instagram.connectedAt,
            posts: postsWithMappings
        }, "Instagram posts fetched successfully");
    } catch (err) {
        console.error("Instagram Posts Fetch Error:", err);
        return successResponse({
            isConnected: true,
            isExpired: false,
            error: err.message || "Failed to load posts",
            username: instagram.username,
            connectedAt: instagram.connectedAt,
            posts: []
        }, "Error fetching Instagram posts");
    }
});
