import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import Restaurant from "@/models/Restaurant";
import InstagramPostMapping from "@/models/InstagramPostMapping";
import MenuItem from "@/models/Item";
import dbConnect from "@/lib/db";

export const GET = async (req, { params }) => {
    try {
        const { id } = await params;
        const user = await getUser();

        if (!user?.id) {
            return JsonResponse.error("Please log in first", 401);
        }

        await dbConnect();

        const restaurant = await Restaurant.findOne({ _id: id, createdBy: user.id });
        if (!restaurant) {
            return JsonResponse.error("Restaurant not found or unauthorized", 404);
        }

        const instagram = restaurant.instagram;

        if (!instagram || !instagram.accessToken) {
            return JsonResponse.error("Instagram account not connected", 404);
        }

        if (instagram.tokenExpiresAt && new Date(instagram.tokenExpiresAt) < new Date()) {
            return JsonResponse.error("Instagram access token has expired", 401);
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
            return JsonResponse.error("Failed to fetch Instagram posts from Meta API", 502);
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

        return JsonResponse.success(postsWithMappings, "Instagram posts fetched successfully");
    } catch (err) {
        console.error("Instagram Mapped Posts Error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error", 500);
    }
};
