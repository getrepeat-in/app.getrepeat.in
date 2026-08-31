import "@/models/Promotion";
import "@/models/AddonGroup";
import mongoose from "mongoose";
import MenuItem from "@/models/Item";
import ImageAsset from "@/models/Image";
import Category from "@/models/Category";
import { applyPromotionsToItems } from "./promotion.helper";

export const MenuService = {
  getAllCategories: async (resId) => {
    const categories = await Category.find({
      restaurant: resId,
      parentCategory: null,
    }).populate("image").lean();

    const categoriesWithImages = await Promise.all(
      categories.map(async (category) => {
        if (!category.image) {
          const itemWithImage = await MenuItem.findOne({
            category: category._id,
            image: { $ne: null },
          }).populate("image").lean();

          if (itemWithImage) {
            category.image = itemWithImage.image;
          }
        }
        return category;
      })
    );

    return { categories: categoriesWithImages };
  },

  getAllItemsByCategory: async (resId, categoryId) => {
    const items = await MenuItem.find({
      restaurant: resId,
      category: categoryId,
    })
      .populate("subCategory", "name")
      .populate("image")
      .lean();

    const activePromotions = await mongoose.models.Promotion.find({
      restaurant: resId,
      status: "ACTIVE",
      application_type: "AUTO_APPLY",
      type: { $in: ["FLAT_DISCOUNT", "PERCENTAGE_DISCOUNT"] }
    })
    .sort({ priority: -1 })
    .lean();
    
    const processedItems = applyPromotionsToItems(items, activePromotions);

    const groupedItems = processedItems.reduce((acc, item) => {
      const subCatName = item.subCategory?.name || "Others";
      if (!acc[subCatName]) {
        acc[subCatName] = [];
      }
      acc[subCatName].push(item);
      return acc;
    }, {});

    const addonGroupIds = [...new Set(items.flatMap(item => item.addonGroups || []).map(id => id.toString()))];
    const addonGroups = await mongoose.models.AddonGroup.find({ _id: { $in: addonGroupIds } })
        .populate({
            path: 'items.item',
            select: 'name base_price image variants dietaryType isAvailable'
        })
        .lean();

    return { items: groupedItems, addonGroups };
  }
};