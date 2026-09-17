import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { NextResponse } from "next/server";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { deleteCache } from "@/services/backend/redis/cache.service";

export const GET = async (req) => {
    try {
        const url = new URL(req.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state"); // This is the restaurant ID
        const error = url.searchParams.get("error");
        const error_description = url.searchParams.get("error_description");

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        // If the user cancelled or there was an error
        if (error) {
            console.error("Instagram OAuth Error:", error, error_description);
            // Redirect back with an error query param
            return NextResponse.redirect(`${appUrl}/restaurant/profile?tab=integrations&ig_error=${error}`);
        }

        if (!code || !state) {
            return NextResponse.redirect(`${appUrl}/restaurant/profile?tab=integrations&ig_error=missing_params`);
        }

        await dbConnect();
        
        const restaurant = await Restaurant.findById(state);
        if (!restaurant) {
            return NextResponse.redirect(`${appUrl}/dashboard`);
        }

        const clientId = process.env.INSTAGRAM_CLIENT_ID;
        const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        const redirectUri = `${appUrl}/api/instagram/callback`;

        // 1. Exchange Code for Short-Lived Token
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
            return NextResponse.redirect(`${appUrl}/restaurant/profile?tab=integrations&ig_error=token_exchange_failed`);
        }

        const shortLivedToken = shortLivedData.access_token;
        const igUserId = shortLivedData.user_id;

        // 2. Exchange Short-Lived Token for Long-Lived Token
        const longLivedUrl = new URL("https://graph.instagram.com/access_token");
        longLivedUrl.searchParams.append("grant_type", "ig_exchange_token");
        longLivedUrl.searchParams.append("client_secret", clientSecret);
        longLivedUrl.searchParams.append("access_token", shortLivedToken);

        const longLivedRes = await fetch(longLivedUrl.toString());
        const longLivedData = await longLivedRes.json();

        if (!longLivedRes.ok) {
            console.error("Failed to get long-lived token:", longLivedData);
            return NextResponse.redirect(`${appUrl}/restaurant/profile?tab=integrations&ig_error=long_lived_token_failed`);
        }

        const longLivedToken = longLivedData.access_token;
        // expires_in is in seconds, typically ~60 days
        const expiresInSeconds = longLivedData.expires_in;
        const expiryDate = new Date(Date.now() + (expiresInSeconds * 1000));

        // 3. Fetch user profile to get the username
        const profileUrl = new URL("https://graph.instagram.com/me");
        profileUrl.searchParams.append("fields", "id,username");
        profileUrl.searchParams.append("access_token", longLivedToken);

        const profileRes = await fetch(profileUrl.toString());
        const profileData = await profileRes.json();

        if (!profileRes.ok) {
            console.error("Failed to get profile data:", profileData);
            return NextResponse.redirect(`${appUrl}/restaurant/profile?tab=integrations&ig_error=profile_fetch_failed`);
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

        return NextResponse.redirect(`${appUrl}/restaurant/profile?tab=integrations&ig_success=true`);        
    } catch (err) {
        console.error("Instagram Callback Exception:", err);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        return NextResponse.redirect(`${appUrl}/dashboard?ig_error=internal_error`);
    }
};
