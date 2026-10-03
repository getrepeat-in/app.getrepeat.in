import Restaurant from "@/models/Restaurant";
import Integration from "@/models/Integration";
import { NotFoundError } from "@/lib/api/response-handler";

class BackendIntegrationService {
  async getIntegrations(restaurantId, includeSecrets = false) {
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
        ...(includeSecrets && {
          accessToken: integration?.razorpay?.accessToken || null,
          publicToken: integration?.razorpay?.publicToken || null,
          refreshToken: integration?.razorpay?.refreshToken || null,
        }),
      },
      instagram: {
        isLinked: !!integration?.instagram?.userId,
        username: integration?.instagram?.username || null,
        connectedAt: integration?.instagram?.connectedAt || null,
        isActive: integration?.instagram?.isActive ?? true,
        ...(includeSecrets && {
          accessToken: integration?.instagram?.accessToken || null,
        }),
      },
      metaPixel: {
        isLinked: !!integration?.metaPixel?.pixelId,
        pixelId: integration?.metaPixel?.pixelId || null,
        connectedAt: integration?.metaPixel?.connectedAt || null,
        isActive: integration?.metaPixel?.isActive ?? true,
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
  async connectMetaPixel(restaurantId, pixelId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    let integration = await Integration.findOne({ restaurantId });
    if (!integration) {
      integration = new Integration({ restaurantId });
    }

    integration.metaPixel = {
      pixelId,
      connectedAt: new Date(),
      isActive: true,
    };
    await integration.save();
    return integration;
  }

  async disconnectMetaPixel(restaurantId) {
    const integration = await Integration.findOne({ restaurantId });
    if (!integration) {
      throw new NotFoundError("Integrations not found");
    }
    
    integration.metaPixel = {
      pixelId: null,
      connectedAt: null,
      isActive: false,
    };
    await integration.save();
    return integration;
  }
}

export const backendIntegrationService = new BackendIntegrationService();
