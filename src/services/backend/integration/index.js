import Restaurant from "@/models/Restaurant";
import Integration from "@/models/Integration";
import { NotFoundError } from "@/lib/api/response-handler";

class BackendIntegrationService {
  async getIntegrations(restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const integration = await Integration.findOne({ restaurantId });
    return {
      razorpay: {
        isLinked: !!integration?.razorpay?.accountId,
        accountId: integration?.razorpay?.accountId || null,
        connectedAt: integration?.razorpay?.connectedAt || null,
        isActive: integration?.razorpay?.isActive ?? true,
      },
      instagram: {
        isLinked: !!integration?.instagram?.userId,
        username: integration?.instagram?.username || null,
        connectedAt: integration?.instagram?.connectedAt || null,
        isActive: integration?.instagram?.isActive ?? true,
      },
    };
  }

  async updateIntegration(restaurantId, platform, isActive) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const integration = await Integration.findOne({ restaurantId });
    if (!integration) {
      throw new NotFoundError("Integrations not found");
    }

    integration[platform].isActive = Boolean(isActive);
    await integration.save();
    return integration;
  }
}

export const backendIntegrationService = new BackendIntegrationService();
