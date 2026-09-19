import MenuItem from "@/models/Item";
import { invalidateItemCache } from "@/lib/api/helpers/cacheKeys";

export const PriceService = {
  bulkUpdatePrices: async (restaurantId, items) => {
    const bulkOps = items.map((item) => {
      const updateFields = {};
      if (item.base_price !== undefined) {
        updateFields.base_price = Number(item.base_price);
      }

      if (item.variants !== undefined) {
        updateFields.variants = item.variants;
        if (Array.isArray(item.variants) && item.variants.length > 0) {
          let minPrice = Infinity;
          item.variants.forEach((variant) => {
            if (Array.isArray(variant.options)) {
              variant.options.forEach((opt) => {
                const price = Number(opt.price);
                if (!isNaN(price) && price < minPrice) {
                  minPrice = price;
                }
              });
            }
          });

          if (minPrice !== Infinity) {
            updateFields.base_price = minPrice;
          }
        }
      }

      return {
        updateOne: {
          filter: { _id: item.id, restaurant: restaurantId },
          update: { $set: updateFields },
        },
      };
    });

    if (bulkOps.length === 0) {
      throw new Error("No valid update operations provided.");
    }

    const result = await MenuItem.bulkWrite(bulkOps);
    await invalidateItemCache(restaurantId);
    
    return result;
  }
};
