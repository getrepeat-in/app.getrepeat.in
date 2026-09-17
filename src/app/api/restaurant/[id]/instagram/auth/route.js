import { getUser } from "@/lib/api/hooks/getUser";
import { JsonResponse } from "@/lib/api/responseHandler";
import Restaurant from "@/models/Restaurant";
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

        const clientId = process.env.INSTAGRAM_CLIENT_ID;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUri = `${appUrl}/api/instagram/callback`;
        
        const state = id;

        const authUrl = new URL("https://www.instagram.com/oauth/authorize");
        authUrl.searchParams.append("client_id", clientId);
        authUrl.searchParams.append("redirect_uri", redirectUri);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish");
        authUrl.searchParams.append("state", state);

        return JsonResponse.success({ url: authUrl.toString() }, "OAuth URL generated");
    } catch (err) {
        console.error("Instagram Auth Error:", err);
        return JsonResponse.error(err?.message || "Internal Server Error", 500);
    }
};
