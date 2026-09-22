import dbConnect from "@/lib/db";
import Integration from "@/models/Integration";
import { successResponse, errorResponse } from "@/lib/api/response-handler";
import crypto from "crypto";

export const POST = async (req) => {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        // Verify Webhook Signature if secret is configured
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (signature && webhookSecret) {
            const generatedSignature = crypto
                .createHmac("sha256", webhookSecret)
                .update(bodyText)
                .digest("hex");
                
            if (generatedSignature !== signature) {
                return errorResponse("Invalid webhook signature", 400);
            }
        }

        const body = JSON.parse(bodyText);

        if (body.event === "account.app.authorization_revoked") {
            const accountId = body.account_id;
            
            if (accountId) {
                await dbConnect();
                
                // Find all integrations with this account ID and deactivate them
                await Integration.updateMany(
                    { "razorpay.accountId": accountId },
                    {
                        $set: {
                            "razorpay.isActive": false,
                            "razorpay.accessToken": null,
                            "razorpay.refreshToken": null
                        }
                    }
                );
                console.log(`[Webhook] Razorpay integration revoked for account ID: ${accountId}`);
            }
        }

        return successResponse({ received: true }, "Webhook processed", 200);
    } catch (error) {
        console.error("Razorpay webhook error:", error);
        return errorResponse("Failed to process webhook", 500);
    }
};
