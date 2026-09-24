import axios from "axios";

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
  }
};
