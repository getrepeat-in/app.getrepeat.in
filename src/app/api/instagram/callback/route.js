import dbConnect from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { NextResponse } from "next/server";
import Restaurant from "@/models/Restaurant";
import { invalidateRestaurantCache } from "@/lib/api/helpers/cacheKeys";
import { instagramService } from "@/services/backend/social/instagram.service";

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

        const redirectUri = `${appUrl}/api/instagram/callback`;
        
        let instagramData;
        try {
            instagramData = await instagramService.exchangeCodeForToken(code, redirectUri);
        } catch (error) {
            return buildRedirect("ig_error=token_exchange_failed");
        }
        
        restaurant.instagram = {
            userId: instagramData.userId,
            accessToken: encrypt(instagramData.accessToken),
            tokenExpiresAt: instagramData.tokenExpiresAt,
            username: instagramData.username,
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
