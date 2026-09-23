import api from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/services/api-endpoints";

class IntegrationService {
  async getIntegrations(restaurantId) {
    if (!restaurantId) return null;
    try {
      const response = await api.get(API_ENDPOINTS.INTEGRATIONS.GET(restaurantId));
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
      throw error;
    }
  }

  async updateIntegration(restaurantId, platform, isActive) {
    if (!restaurantId || !platform) return null;
    try {
      const response = await api.patch(API_ENDPOINTS.INTEGRATIONS.UPDATE(restaurantId), {
        platform,
        isActive
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update ${platform} integration:`, error);
      throw error;
    }
  }

  async connectRazorpay(restaurantId, returnTo = "integrations") {
    if (!restaurantId) return null;
    try {
      const response = await api.get(`${API_ENDPOINTS.PAYMENTS.RAZORPAY.CONNECT(restaurantId)}?returnTo=${returnTo}`);
      return response.data;
    } catch (error) {
      console.error("Failed to connect Razorpay:", error);
      throw error;
    }
  }

  async disconnectRazorpay(restaurantId) {
    if (!restaurantId) return null;
    try {
      const response = await api.delete(API_ENDPOINTS.PAYMENTS.RAZORPAY.DISCONNECT(restaurantId));
      return response.data;
    } catch (error) {
      console.error("Failed to disconnect Razorpay:", error);
      throw error;
    }
  }

  async connectInstagram(restaurantId, returnTo = "integrations") {
    if (!restaurantId) return null;
    try {
      const response = await api.get(`${API_ENDPOINTS.INTEGRATIONS.INSTAGRAM_CONNECT(restaurantId)}?returnTo=${returnTo}`);
      return response.data;
    } catch (error) {
      console.error("Failed to connect Instagram:", error);
      throw error;
    }
  }

  async disconnectInstagram(restaurantId) {
    if (!restaurantId) return null;
    try {
      const response = await api.delete(API_ENDPOINTS.INTEGRATIONS.INSTAGRAM_DISCONNECT(restaurantId));
      return response.data;
    } catch (error) {
      console.error("Failed to disconnect Instagram:", error);
      throw error;
    }
  }

  async getInstagramMappedPosts(restaurantId) {
    if (!restaurantId) return { isConnected: false, posts: [] };
    try {
      const response = await api.get(API_ENDPOINTS.INTEGRATIONS.INSTAGRAM_POSTS_MAPPED(restaurantId));
      return response.data?.data || { isConnected: false, posts: [] };
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 401) {
        return { isConnected: false, posts: [] };
      }
      console.error("Failed to fetch Instagram mapped posts:", error);
      throw error;
    }
  }
}

export const integrationService = new IntegrationService();
