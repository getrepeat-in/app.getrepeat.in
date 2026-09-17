import "@/models/Image";
import "@/models/Promotion";
import "@/models/AddonGroup";
import mongoose from "mongoose";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";
import { applyPromotionsToItems } from "./promotion.helper";
import { ImageService } from "@/services/backend/images";

const formatItem = (item) => {
  const formatted = {
    _id: item._id,
    name: item.name,
    base_price: item.base_price,
    dietaryType: item.dietaryType,
  };

  if (item.description) formatted.description = item.description;
  if (item.discounted_price !== undefined) formatted.discounted_price = item.discounted_price;
  if (item.applied_promotion) formatted.applied_promotion = item.applied_promotion;

  const formattedImage = ImageService.formatImage(item.image);
  if (formattedImage) formatted.image = formattedImage;

  if (Array.isArray(item.variants) && item.variants.length > 0) {
    formatted.variants = item.variants.map((v) => ({
      _id: v._id,
      name: v.name,
      options: Array.isArray(v.options)
        ? v.options.map((opt) => ({
            _id: opt._id,
            name: opt.name,
            price: opt.price,
            ...(opt.isDefault ? { isDefault: true } : {}),
          }))
        : [],
    }));
  }

  if (Array.isArray(item.addonGroups) && item.addonGroups.length > 0) {
    formatted.addonGroups = item.addonGroups
      .map((id) => (id && id._id ? id._id.toString() : id?.toString()))
      .filter(Boolean);
  }

  return formatted;
};

const fetchCategories = async (restaurantId) => {
  const allCategories = await Category.find({ restaurant: restaurantId })
    .select("name displayOrder image parentCategory")
    .populate({
      path: "image",
      select: "original variants key",
    })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  const parentCategories = [];
  const childCategories = [];

  for (const cat of allCategories) {
    if (cat.parentCategory) {
      childCategories.push(cat);
    } else {
      parentCategories.push(cat);
    }
  }

  return { parentCategories, childCategories };
};

const fetchMenuItems = async (restaurantId, { isAvailableOnly = false } = {}) => {
  const filter = { restaurant: restaurantId };
  if (isAvailableOnly) {
    filter.isAvailable = true;
  }

  return MenuItem.find(filter)
    .select("name description base_price image variants dietaryType isAvailable displayOrder addonGroups category subCategory")
    .populate({
      path: "image",
      select: "original variants key",
    })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();
};

const fetchAddonGroups = async (restaurantId) => {
  try {
    const groups = await mongoose.models.AddonGroup.find({ restaurant: restaurantId })
      .select("name selectionType minSelection maxSelection items")
      .populate({
        path: "items.item",
        select: "name base_price image variants dietaryType",
        populate: {
          path: "image",
          select: "original variants key",
        },
      })
      .lean();

    return groups.map((group) => {
      const formattedGroup = {
        _id: group._id,
        name: group.name,
        selectionType: group.selectionType || "multiple",
        minSelection: group.minSelection ?? 0,
        items: group.items
          ? group.items
              .filter((i) => i && i.item)
              .map((mapped) => {
                const itemObj = {
                  _id: mapped.item._id,
                  name: mapped.item.name,
                  base_price: mapped.item.base_price,
                  dietaryType: mapped.item.dietaryType,
                };
                const img = ImageService.formatImage(mapped.item.image);
                if (img) itemObj.image = img;
                if (Array.isArray(mapped.item.variants) && mapped.item.variants.length > 0) {
                  itemObj.variants = mapped.item.variants;
                }
                return {
                  item: itemObj,
                  priceOverride: mapped.priceOverride ?? null,
                };
              })
          : [],
      };

      if (group.maxSelection !== null && group.maxSelection !== undefined) {
        formattedGroup.maxSelection = group.maxSelection;
      }

      return formattedGroup;
    });
  } catch (err) {
    console.warn("Failed to fetch addon groups in MenuService:", err?.message);
    return [];
  }
};

const fetchActivePromotions = async (restaurantId) => {
  try {
    const now = new Date();
    return await mongoose.models.Promotion.find({
      restaurant: restaurantId,
      status: "ACTIVE",
      application_type: "AUTO_APPLY",
      type: { $in: ["FLAT_DISCOUNT", "PERCENTAGE_DISCOUNT"] },
      $and: [
        { $or: [{ starts_at: null }, { starts_at: { $lte: now } }] },
        { $or: [{ ends_at: null }, { ends_at: { $gte: now } }] },
      ],
    })
      .select("name type discount_type discount_value items")
      .sort({ priority: -1 })
      .lean();
  } catch (err) {
    console.warn("Failed to fetch active promotions in MenuService:", err?.message);
    return [];
  }
};

const groupItemsByCategory = (items) => {
  const itemsByParentCat = new Map();
  const itemsBySubCat = new Map();

  for (const item of items) {
    const parentId = item.category?.toString() || item.category?._id?.toString();
    if (parentId) {
      if (!itemsByParentCat.has(parentId)) {
        itemsByParentCat.set(parentId, []);
      }
      itemsByParentCat.get(parentId).push(item);
    }

    const subId = item.subCategory?.toString() || item.subCategory?._id?.toString();
    if (subId) {
      if (!itemsBySubCat.has(subId)) {
        itemsBySubCat.set(subId, []);
      }
      itemsBySubCat.get(subId).push(item);
    }
  }

  return { itemsByParentCat, itemsBySubCat };
};

const buildSubCategories = (parentCat, directSubCats, itemsForCat, itemsBySubCat) => {
  if (!directSubCats || directSubCats.length === 0) {
    if (!itemsForCat || itemsForCat.length === 0) {
      return [];
    }
    return [
      {
        _id: null,
        name: "General",
        displayOrder: 0,
        items: itemsForCat.map(formatItem),
      },
    ];
  }

  const subCategoryList = directSubCats.map((subCat) => {
    const subIdStr = subCat._id.toString();
    const itemsForSubCat = itemsBySubCat.get(subIdStr) || [];
    const subCatImage = ImageService.formatImage(subCat.image);

    const formattedSub = {
      _id: subCat._id,
      name: subCat.name,
      displayOrder: subCat.displayOrder ?? 0,
      items: itemsForSubCat.map(formatItem),
    };
    if (subCatImage) formattedSub.image = subCatImage;

    return formattedSub;
  });

  const unassignedItems = itemsForCat.filter((item) => !item.subCategory);
  if (unassignedItems.length > 0) {
    subCategoryList.unshift({
      _id: null,
      name: "General",
      displayOrder: -1,
      items: unassignedItems.map(formatItem),
    });
  }

  return subCategoryList;
};

const buildCategoryTree = (parentCategories, childCategories, processedItems) => {
  const { itemsByParentCat, itemsBySubCat } = groupItemsByCategory(processedItems);

  const childCategoriesByParentId = new Map();
  for (const child of childCategories) {
    const parentIdStr =
      child.parentCategory?.toString() || child.parentCategory?._id?.toString();
    if (parentIdStr) {
      if (!childCategoriesByParentId.has(parentIdStr)) {
        childCategoriesByParentId.set(parentIdStr, []);
      }
      childCategoriesByParentId.get(parentIdStr).push(child);
    }
  }

  return parentCategories.map((parentCat) => {
    const parentIdStr = parentCat._id.toString();
    const itemsForCat = itemsByParentCat.get(parentIdStr) || [];
    const directSubCats = childCategoriesByParentId.get(parentIdStr) || [];

    const categoryImage = ImageService.formatImage(parentCat.image);

    const subCategoryList = buildSubCategories(
      parentCat,
      directSubCats,
      itemsForCat,
      itemsBySubCat
    );

    const formattedCat = {
      _id: parentCat._id,
      name: parentCat.name,
      displayOrder: parentCat.displayOrder ?? 0,
      sub_category: subCategoryList,
    };
    if (categoryImage) formattedCat.image = categoryImage;

    return formattedCat;
  });
};

export const MenuService = {
  getMenu: async (resId, options = {}) => {
    const [categoriesData, items, activePromotions, addonGroups] = await Promise.all([
      fetchCategories(resId),
      fetchMenuItems(resId, options),
      fetchActivePromotions(resId),
      fetchAddonGroups(resId),
    ]);

    const { parentCategories, childCategories } = categoriesData;
    const processedItems =
      activePromotions && activePromotions.length > 0
        ? applyPromotionsToItems(items, activePromotions)
        : items;

    const categoryTree = buildCategoryTree(
      parentCategories,
      childCategories,
      processedItems
    );

    return {
      category: categoryTree,
      addonGroups,
    };
  },

  getMenuBySlug: async (slug, options = {}) => {
    const restaurant = await Restaurant.findOne({ slug }).select("_id").lean();
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    return MenuService.getMenu(restaurant._id, options);
  },
};