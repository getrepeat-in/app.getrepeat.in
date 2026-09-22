import axios from "axios";

class InstagramService {
    constructor() {
        this.clientId = process.env.INSTAGRAM_CLIENT_ID;
        this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    }

    async exchangeCodeForToken(code, redirectUri) {
        try {
            const tokenFormData = new URLSearchParams();
            tokenFormData.append("client_id", this.clientId);
            tokenFormData.append("client_secret", this.clientSecret);
            tokenFormData.append("grant_type", "authorization_code");
            tokenFormData.append("redirect_uri", redirectUri);
            tokenFormData.append("code", code);

            const shortLivedRes = await axios.post("https://api.instagram.com/oauth/access_token", tokenFormData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            const shortLivedToken = shortLivedRes.data.access_token;
            const igUserId = shortLivedRes.data.user_id;

            const longLivedRes = await axios.get("https://graph.instagram.com/access_token", {
                params: {
                    grant_type: "ig_exchange_token",
                    client_secret: this.clientSecret,
                    access_token: shortLivedToken
                }
            });

            const longLivedToken = longLivedRes.data.access_token;
            const expiresInSeconds = longLivedRes.data.expires_in;
            const expiryDate = new Date(Date.now() + (expiresInSeconds * 1000));
            const profileRes = await axios.get("https://graph.instagram.com/me", {
                params: {
                    fields: "id,username",
                    access_token: longLivedToken
                }
            });

            return {
                userId: profileRes.data.id || igUserId,
                accessToken: longLivedToken,
                username: profileRes.data.username,
                tokenExpiresAt: expiryDate
            };
        } catch (error) {
            console.error("[InstagramService] Error exchanging code for token:", error?.response?.data || error.message);
            throw new Error("Failed to exchange Instagram code for tokens");
        }
    }
}

export const instagramService = new InstagramService();
