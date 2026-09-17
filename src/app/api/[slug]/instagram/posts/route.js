import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { JsonResponse } from "@/lib/api/responseHandler";
import { getCache, setCache } from "@/services/backend/redis/cache.service";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import MenuItem from "@/models/Item";

export const GET = async (req, { params }) => {
    try {
        const { slug } = await params;

        if (!slug) {
            return JsonResponse.error("Restaurant slug is required", 400);
        }

        const cacheKey = `restaurant:slug:${slug}:instagram:posts`;
        const cachedPosts = await getCache(cacheKey);

        if (cachedPosts) {
            return JsonResponse.success(cachedPosts, "Instagram posts fetched successfully (cached)");
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug }).select("instagram").lean();
        
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found", 404);
        }

        const instagram = restaurant.instagram;

        if (!instagram || !instagram.accessToken) {
            return JsonResponse.error("Instagram account not connected", 404);
        }

        // Check if token is expired
        if (instagram.tokenExpiresAt && new Date(instagram.tokenExpiresAt) < new Date()) {
            return JsonResponse.error("Instagram access token has expired", 401);
        }

        const url = new URL("https://graph.instagram.com/me/media");
        // We request standard fields. 'thumbnail_url' is available for video media types.
        url.searchParams.append("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username");
        url.searchParams.append("access_token", instagram.accessToken);
        // Limit to 10 posts to keep payload small
        url.searchParams.append("limit", "10");

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok) {
            console.error("Instagram Graph API Error:", data);
            return JsonResponse.error("Failed to fetch Instagram posts from Meta API", 502);
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

        // Cache for 10 minutes (600 seconds) to avoid rate limits and improve speed
        await setCache(cacheKey, postsWithMappings, 600);
        return JsonResponse.success(postsWithMappings, "Instagram posts fetched successfully");
    } catch (error) {
        console.error("GET instagram posts error:", error);
        return JsonResponse.error(error.message || "Failed to fetch Instagram posts", 500);
    }
};
