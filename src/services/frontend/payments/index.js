import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const PaymentService = {
  getRazorpayConnectUrl: async (restaurantId) => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.RAZORPAY_CONNECT(restaurantId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
