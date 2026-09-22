import dbConnect from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { NextResponse } from "next/server";
import Restaurant from "@/models/Restaurant";
import { razorpayService } from "@/services/backend/payments/razorpay";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    
    if (error) {
      console.error("[Razorpay Callback] OAuth error:", error);
      return NextResponse.redirect(new URL("/restaurant/website?razorpay_error=access_denied", req.url));
    }

    if (!code || !state) {
      return NextResponse.json({ message: "Missing required query parameters" }, { status: 400 });
    }

    let restaurantId;
    try {
      const decodedState = Buffer.from(state, "base64").toString("utf-8");
      const stateObj = JSON.parse(decodedState);
      restaurantId = stateObj.restaurantId;
    } catch (e) {
      console.error("[Razorpay Callback] Failed to decode state", e);
      return NextResponse.json({ message: "Invalid state parameter" }, { status: 400 });
    }

    if (!restaurantId) {
      return NextResponse.json({ message: "Restaurant ID missing from state" }, { status: 400 });
    }

    const tokenData = await razorpayService.exchangeCodeForTokens(code);
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    await dbConnect();
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      {
        $set: {
          "razorpay.accountId": tokenData.razorpay_account_id,
          "razorpay.accessToken": encryptedAccessToken,
          "razorpay.refreshToken": encryptedRefreshToken,
          "razorpay.connectedAt": new Date()
        }
      },
      { new: true, runValidators: false }
    );

    if (!updatedRestaurant) {
      return NextResponse.json({ message: "Restaurant not found" }, { status: 404 });
    }
    
    const redirectUrl = new URL("/restaurant/website?razorpay_success=true", req.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("[Razorpay Callback] Critical error:", error);
    return NextResponse.redirect(new URL("/restaurant/website?razorpay_error=internal_error", req.url));
  }
}
