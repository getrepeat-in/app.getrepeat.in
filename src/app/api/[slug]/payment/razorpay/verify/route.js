import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import Integration from "@/models/Integration";
import { OrderService } from "@/services/backend/order";;
import { successResponse, errorResponse } from "@/lib/api/response-handler";

export const POST = async (req, { params }) => {
    try {
        const body = await req.json();
        const resolvedParams = params ? await params : {};
        const domain = resolvedParams.slug || body.domain;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body;

        if (!domain) {
            return errorResponse("Restaurant slug is required!", 400);
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return errorResponse(
                "Missing Razorpay payment verification details!",
                400
            );
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

        let isValid = false;
        try {
            const crypto = require("crypto");
            const clientSecret = process.env.RAZORPAY_CLIENT_SECRET;
            const generatedSignature = crypto
                .createHmac("sha256", clientSecret)
                .update(razorpay_order_id + "|" + razorpay_payment_id)
                .digest("hex");

            if (generatedSignature === razorpay_signature) {
                isValid = true;
            }
        } catch (error) {
            console.error("Error verifying Razorpay signature:", error.message);
        }

        if (!isValid) {
            return errorResponse(
                "Payment verification failed: Invalid payment or order mismatch",
                400
            );
        }

        let merchantOrderResult = null;
        try {
            if (orderData) {
                const order = await OrderService.createOrder({
                    restaurantId: restaurant._id,
                    orderType: orderData.orderType,
                    table: orderData.table,
                    customer: orderData.customer || null,
                    customerInfo: orderData.customerInfo,
                    deliveryAddress: orderData.deliveryAddress,
                    items: orderData.items,
                    subtotal: orderData.subtotal,
                    tax: orderData.tax,
                    discount: orderData.discount,
                    totalAmount: orderData.totalAmount,
                    paymentMethod: "ONLINE",
                    paymentStatus: "PAID",
                    specialInstructions: orderData.specialInstructions || "",
                    initialStatus: orderData.status || null,
                });
                merchantOrderResult = order;
            }
        } catch (merchantErr) {
            console.error(
                "Payment verified, but failed to sync order to merchant API:",
                merchantErr.message
            );
            return errorResponse(
                "Payment received, but order creation failed. Please contact support.",
                500
            );
        }

        return successResponse(
            {
                verified: true,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                order: merchantOrderResult,
            },
            "Payment verified successfully",
            200
        );
    } catch (err) {
        console.error("Razorpay verification error:", err);
        return errorResponse(
            err.message || "Failed to verify payment",
            500
        );
    }
};
