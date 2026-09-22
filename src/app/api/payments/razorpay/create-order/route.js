import Razorpay from "razorpay";
import merchantApi from "@/lib/api/merchantInstance";
import { JsonResponse } from "@/lib/api/responseHandler";

export const POST = async (req, { params }) => {
    try {
        const { domain } = await params;
        const body = await req.json();
        const { amount, currency = "INR", notes = {} } = body;

        if (!domain) {
            return JsonResponse.error("Restaurant slug is required!", 400);
        }

        if (!amount || amount <= 0) {
            return JsonResponse.error("Valid order amount is required!", 400);
        }

        const key_id = process.env.RAZORPAY_API_KEY;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            return JsonResponse.error(
                "Razorpay API credentials not configured on server.",
                500
            );
        }

        const restaurantRes = await merchantApi.get(`/api/${domain}`);
        const restaurant = restaurantRes.data?.data || restaurantRes.data;
        
        if (!restaurant?._id) {
            return JsonResponse.error("Restaurant not found", 404);
        }

        // Fetch integrations using the new API
        const integrationsRes = await merchantApi.get(`/api/restaurant/${restaurant._id}/integrations`);
        const integrations = integrationsRes.data?.data || integrationsRes.data;
        const accountId = integrations?.razorpay?.accountId;

        if (!accountId || !integrations?.razorpay?.isLinked) {
            return JsonResponse.error(
                "This restaurant has not connected a Razorpay account.",
                400
            );
        }

        const razorpayInstance = new Razorpay({
            key_id,
            key_secret,
            headers: {
                "X-Razorpay-Account": accountId,
            }
        });

        // Amount must be in the smallest currency sub-unit (paise for INR)
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

        const order = await razorpayInstance.orders.create(options);

        return JsonResponse.success(
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: key_id,
            },
            "Razorpay order created successfully",
            201
        );
    } catch (err) {
        console.error("Razorpay create order error:", err);
        return JsonResponse.error(
            err.message || "Failed to create Razorpay order",
            500
        );
    }
};
