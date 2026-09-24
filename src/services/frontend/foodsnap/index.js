import axios from "axios";
import { UploadService } from "../upload";

export const FoodsnapService = {
  searchImages: async ({ query, page = 1, limit = 12 }) => {
    try {
      const response = await axios.get("/api/images/search", {
        params: {
          q: query,
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error("Foodsnap API search failed:", error);
      throw error;
    }
  },
  
  downloadImageAsFile: async (imageUrl, filename) => {
    try {
      const response = await axios.get("/api/images/proxy", {
        params: { url: imageUrl },
        responseType: "blob",
      });
      const blob = response.data;
      return new File([blob], filename || "foodsnap-image.jpeg", { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.error("Failed to download image from proxy:", error);
      throw error;
    }
  },

  autoApplyImage: async ({ item, restaurantId }) => {
    if (!item?.name) {
      throw new Error("Item name is required for auto-applying image");
    }
    if (!restaurantId) {
      throw new Error("Restaurant context is required");
    }

    const searchRes = await FoodsnapService.searchImages({
      query: item.name,
      page: 1,
      limit: 1,
    });

    const images = Array.isArray(searchRes?.data)
      ? searchRes.data
      : (searchRes?.data?.data || []);

    if (!images || images.length === 0) {
      throw new Error(`No matching image found for "${item.name}"`);
    }

    const firstImage = images[0];
    const imageUrl = firstImage.image_url || firstImage.optimised_image_url;

    if (!imageUrl) {
      throw new Error(`Image URL not available for "${item.name}"`);
    }

    const sanitizedName = (item.name || "dish").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const file = await FoodsnapService.downloadImageAsFile(
      imageUrl,
      `${sanitizedName}-image.jpeg`
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "menu/items");

    const uploadRes = await UploadService.uploadFile(formData, restaurantId);
    const imageId = uploadRes?.imageId || uploadRes?.data?.imageId;

    if (!imageId) {
      throw new Error("Failed to get image ID from upload response");
    }

    return {
      success: true,
      imageId,
      imageName: firstImage.name || firstImage.title || item.name,
      imageUrl,
    };
  }
};

