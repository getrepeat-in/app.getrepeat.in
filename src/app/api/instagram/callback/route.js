import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import Restaurant from "@/models/Restaurant";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";

export const GET = async (req) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let returnTo = "social";
    let restaurantId = null;

    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const rawState = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const error_description = url.searchParams.get("error_description");

        if (rawState) {
            try {
                if (rawState.startsWith("{")) {
                    const parsed = JSON.parse(rawState);
                    restaurantId = parsed.restaurantId || null;
                    returnTo = parsed.returnTo || "social";
                } else if (rawState.includes(":")) {
                    const parts = rawState.split(":");
                    restaurantId = parts[0];
                    returnTo = parts[1] || "social";
                } else {
                    restaurantId = rawState;
                }
            } catch {
                restaurantId = rawState;
            }
        }

        const buildRedirect = (queryParam) => {
            const basePath = returnTo === "integrations"
                ? "/restaurant/profile?tab=integrations"
                : `/restaurant/${returnTo || "social"}`;
            const separator = basePath.includes("?") ? "&" : "?";
            return NextResponse.redirect(`${appUrl}${basePath}${separator}${queryParam}`);
        };

        if (error) {
            console.error("Instagram OAuth Error:", error, error_description);
            return buildRedirect(`ig_error=${encodeURIComponent(error_description || error)}`);
        }

        if (!code || !restaurantId) {
            return buildRedirect("ig_error=missing_params");
        }

        await dbConnect();
        
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return NextResponse.redirect(`${appUrl}/dashboard`);
        }

        const clientId = process.env.INSTAGRAM_CLIENT_ID;
        const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        const redirectUri = `${appUrl}/api/instagram/callback`;
        const tokenFormData = new URLSearchParams();
        tokenFormData.append("client_id", clientId);
        tokenFormData.append("client_secret", clientSecret);
        tokenFormData.append("grant_type", "authorization_code");
        tokenFormData.append("redirect_uri", redirectUri);
        tokenFormData.append("code", code);

        const shortLivedRes = await fetch("https://api.instagram.com/oauth/access_token", {
            method: "POST",
            body: tokenFormData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const shortLivedData = await shortLivedRes.json();
        
        if (!shortLivedRes.ok) {
            console.error("Failed to get short-lived token:", shortLivedData);
            return buildRedirect("ig_error=token_exchange_failed");
        }

        const shortLivedToken = shortLivedData.access_token;
        const igUserId = shortLivedData.user_id;
        const longLivedUrl = new URL("https://graph.instagram.com/access_token");
        longLivedUrl.searchParams.append("grant_type", "ig_exchange_token");
        longLivedUrl.searchParams.append("client_secret", clientSecret);
        longLivedUrl.searchParams.append("access_token", shortLivedToken);

        const longLivedRes = await fetch(longLivedUrl.toString());
        const longLivedData = await longLivedRes.json();

        if (!longLivedRes.ok) {
            console.error("Failed to get long-lived token:", longLivedData);
            return buildRedirect("ig_error=long_lived_token_failed");
        }

        const longLivedToken = longLivedData.access_token;
        const expiresInSeconds = longLivedData.expires_in;
        const expiryDate = new Date(Date.now() + (expiresInSeconds * 1000));
        const profileUrl = new URL("https://graph.instagram.com/me");
        profileUrl.searchParams.append("fields", "id,username");
        profileUrl.searchParams.append("access_token", longLivedToken);

        const profileRes = await fetch(profileUrl.toString());
        const profileData = await profileRes.json();

        if (!profileRes.ok) {
            console.error("Failed to get profile data:", profileData);
            return buildRedirect("ig_error=profile_fetch_failed");
        }
        
        restaurant.instagram = {
            userId: profileData.id || igUserId,
            accessToken: longLivedToken,
            tokenExpiresAt: expiryDate,
            username: profileData.username,
            connectedAt: new Date()
        };
        
        await restaurant.save();

        await invalidateRestaurantCache({
            userId: restaurant.createdBy,
            restaurantId: restaurant._id,
            slugs: restaurant.slug
        });

        return buildRedirect("ig_success=true");        
    } catch (err) {
        console.error("Instagram Callback Exception:", err);
        const basePath = returnTo === "integrations" ? "/restaurant/profile?tab=integrations" : `/restaurant/${returnTo || "social"}`;
        const separator = basePath.includes("?") ? "&" : "?";
        return NextResponse.redirect(`${appUrl}${basePath}${separator}ig_error=internal_error`);
    }
};
