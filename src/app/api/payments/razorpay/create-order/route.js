import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { razorpayService } from "@/services/backend/payments/razorpay";
import { backendIntegrationService } from "@/services/backend/integration";
import { successResponse, errorResponse } from "@/lib/api/response-handler";

export const POST = async (req, { params }) => {
    try {
        const body = await req.json();
        const domain = (await params).domain || body.domain;
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

        const integrations = await backendIntegrationService.getIntegrations(restaurant._id);
        const accessToken = integrations?.razorpay?.accessToken;

        if (!accessToken || !integrations?.razorpay?.isLinked) {
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

        return successResponse(
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_CLIENT_ID || process.env.NEXT_PUBLIC_RAZORPAY_CLIENT_ID,
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
