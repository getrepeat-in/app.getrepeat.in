import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Integration from "@/models/Integration";
import { razorpayService } from "@/services/backend/payments/razorpay";
import { backendIntegrationService } from "@/services/backend/integration";
import { successResponse, errorResponse } from "@/lib/api/response-handler";
import { decrypt } from "@/lib/crypto";

export const POST = async (req, { params }) => {
    try {
        const body = await req.json();
        // Safely access params if it exists
        const resolvedParams = params ? await params : {};
        const domain = resolvedParams.slug || body.domain;
        const { amount, currency = "INR", notes = {} } = body;

        if (!domain) {
            return errorResponse("Restaurant slug is required!", 400);
        }

        if (!amount || amount <= 0) {
            return errorResponse("Valid order amount is required!", 400);
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ slug: domain }).lean();
        
        if (!restaurant?._id) {
            return errorResponse("Restaurant not found", 404);
        }

        const integration = await Integration.findOne({ restaurantId: restaurant._id }).lean();
        const accessToken = integration?.razorpay?.accessToken;
        const accountId = integration?.razorpay?.accountId;

        if (!accessToken || !accountId) {
            return errorResponse(
                "This restaurant has not connected a Razorpay account.",
                400
            );
        }

        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `rcpt_${domain}_${Date.now()}`,
            notes: {
                domain,
                ...notes,
            },
        };

        let order;
        try {
            order = await razorpayService.createOrder(accessToken, options);
        } catch (err) {
            console.error("Razorpay API error:", err.message);
            return errorResponse(err.message, 500);
        }

        const publicToken = integration?.razorpay?.publicToken;

        return successResponse(
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: publicToken || process.env.RAZORPAY_API_KEY || process.env.NEXT_PUBLIC_RAZORPAY_API_KEY,
            },
            "Razorpay order created successfully",
            201
        );
    } catch (err) {
        console.error("Razorpay create order error:", err);
        return errorResponse(
            err.message || "Failed to create Razorpay order",
            500
        );
    }
};
