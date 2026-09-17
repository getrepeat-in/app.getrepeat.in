import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";

export const GET = withErrorHandler(async (req, { params }) => {
    const { id } = await params;
    const { restaurant } = await getRestaurant({ restaurantId: id });

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    if (!clientId) {
        throw new BadRequestError("Instagram Client ID is not configured");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/instagram/callback`;
    const state = id;

    const authUrl = new URL("https://www.instagram.com/oauth/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish");
    authUrl.searchParams.append("state", state);

    return successResponse({ url: authUrl.toString() }, "OAuth URL generated");
});
