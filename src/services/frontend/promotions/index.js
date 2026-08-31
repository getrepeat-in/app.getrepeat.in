import axios from "axios";
import { API_ENDPOINTS } from "@/services/api-endpoints";

export const PromotionsService = {
  getAll: async (restaurantId, status = "") => {
    try {
      const url = new URL(API_ENDPOINTS.PROMOTION.GET_ALL(restaurantId), window.location.origin);
      if (status) url.searchParams.append("status", status);
      
      const response = await axios.get(url.pathname + url.search);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  create: async (restaurantId, data) => {
    try {
      const response = await axios.post(API_ENDPOINTS.PROMOTION.CREATE(restaurantId), data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  update: async (restaurantId, promotionId, data) => {
    try {
      const response = await axios.put(API_ENDPOINTS.PROMOTION.UPDATE(restaurantId, promotionId), data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  delete: async (restaurantId, promotionId) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.PROMOTION.DELETE(restaurantId, promotionId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
