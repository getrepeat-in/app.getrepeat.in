import axios from "axios";

class RazorpayService {
  constructor() {
    this.clientId = process.env.RAZORPAY_CLIENT_ID;
    this.clientSecret = process.env.RAZORPAY_CLIENT_SECRET;
    this.redirectUri = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/razorpay/callback` 
      : "http://localhost:3000/api/payments/razorpay/callback";
  }

  getAuthUrl(restaurantId) {
    if (!this.clientId) {
      throw new Error("RAZORPAY_CLIENT_ID is not configured");
    }

    const authUrl = new URL("https://auth.razorpay.com/authorize");
    authUrl.searchParams.append("client_id", this.clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", this.redirectUri);
    authUrl.searchParams.append("scope", "read_write"); 
    const statePayload = Buffer.from(JSON.stringify({ restaurantId })).toString("base64");
    authUrl.searchParams.append("state", statePayload);

    return authUrl.toString();
  }

  async exchangeCodeForTokens(code) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Razorpay credentials are not fully configured");
    }

    try {
      const response = await axios.post("https://auth.razorpay.com/token", {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
        code: decodeURIComponent(code), 
        mode: process.env.NODE_ENV === "production" ? "live" : "test"
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      return response.data;
    } catch (error) {
      console.error("[RazorpayService] Error exchanging code for tokens:", error?.response?.data || error.message);
      throw new Error("Failed to authenticate with Razorpay");
    }
  }

  async refreshTokens(refreshToken) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Razorpay credentials are not fully configured");
    }

    try {
      const response = await axios.post("https://auth.razorpay.com/token", {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      return response.data;
    } catch (error) {
      console.error("[RazorpayService] Error refreshing tokens:", error?.response?.data || error.message);
      throw new Error("Failed to refresh Razorpay tokens");
    }
  }
}

export const razorpayService = new RazorpayService();
