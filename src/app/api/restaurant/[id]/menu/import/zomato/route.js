import fs from "fs";
import axios from "axios";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import MenuItem from "@/models/Item";
import Category from "@/models/Category";
import ImageAsset from "@/models/Image";
import AddonGroup from "@/models/AddonGroup";
import Restaurant from "@/models/Restaurant";
import { uploadToS3 } from "@/services/backend/s3";
import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { withErrorHandler, successResponse, BadRequestError } from "@/lib/api/response-handler";
import { invalidateCategoryCache, invalidateItemCache, invalidateAddonGroupCache } from "@/lib/api/helpers/cacheKeys";

const parseVariantGroups = (itemData) => {
  if (!itemData || !Array.isArray(itemData.groups)) {
    return [];
  }

  return itemData.groups
    .map((groupWrapper) => {
      const group = groupWrapper?.group;
      if (!group) return null;

      return {
        property_name: group?.name || group?.label || "",
        options: Array.isArray(group?.items)
          ? group.items.map((itemWrapper) => {
              const option = itemWrapper?.item || {};
              return {
                name: option?.name || "",
                price: option?.price || option?.default_price || option?.display_price || option?.min_price || 0,
              };
            })
          : [],
      };
    })
    .filter(Boolean);
};

const getNormalizedUrl = (url) => {
  let cleanedUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanedUrl)) {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  const parsed = new URL(cleanedUrl);
  const domain = `${parsed.protocol}//${parsed.host}`;
  const parts = parsed.pathname.split("/").filter(Boolean);

  if (parts.length < 2) {
    throw new BadRequestError("Invalid URL: city and outlet_name are required");
  }

  const city = parts[0];
  const outletName = parts[1];
  return `${domain}/${city}/${outletName}/order`;
};

export const GET = withErrorHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) {
    throw new BadRequestError("Restaurant ID is required");
  }

  await getRestaurant({ restaurantId: id });
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const pageUrlParam = searchParams.get("pageUrl");
  if (!pageUrlParam) {
    throw new BadRequestError("pageUrl query parameter is required");
  }

  const importItems = searchParams.get("items") !== "false";
  const importMedia = searchParams.get("media") !== "false";
  const importAddons = searchParams.get("addons") !== "false";
  const importAddress = searchParams.get("address") !== "false";

  const pageUrl = getNormalizedUrl(pageUrlParam);

  const response = await axios.get(
    "https://www.zomato.com/webroutes/getPage",
    {
      params: {
        page_url: pageUrl,
        location: "",
        isMobile: 0,
      },
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        cookie: process.env.ZOMATO_COOKIES || "",
      },
    }
  );

  const menus = response?.data?.page_data?.order?.menuList?.menus || [];
  const modifierGroups = response?.data?.page_data?.order?.menuList?.modifierGroups || {};
  const resContactInfo = response?.data?.page_data?.sections?.SECTION_RES_CONTACT || {};

  if (importAddress && (resContactInfo.city_name || resContactInfo.address)) {
    const lat = parseFloat(resContactInfo.latitude);
    const lng = parseFloat(resContactInfo.longitude);
    
    const updateData = {
      "address.city": resContactInfo.city_name || "",
      "address.street": resContactInfo.address || "",
      "address.country": "IN"
    };

    if (!isNaN(lng) && !isNaN(lat)) {
      updateData["address.location.type"] = "Point";
      updateData["address.location.coordinates"] = [lng, lat];
    }

    await Restaurant.findByIdAndUpdate(id, { $set: updateData });
  }

  let categoriesImported = 0;
  let itemsImported = 0;
  let addonGroupsImported = 0;

  const itemNameToId = {};
  const menusToProcess = importItems ? menus : [];
  for (const [menuIndex, menuWrapper] of menusToProcess.entries()) {
    const menu = menuWrapper?.menu || {};
    if (!menu.name) continue;

    const categoryPayload = {
      restaurant: id,
      name: menu.name,
      displayOrder: menuIndex,
      parentCategory: null,
    };
    const mainCategory = await Category.create(categoryPayload);
    categoriesImported++;

    const subCategories = menu.categories || [];
    for (const [subIndex, subWrapper] of subCategories.entries()) {
      const subCategoryData = subWrapper?.category || {};
      const subCategoryName = subCategoryData.name?.trim() || menu.name;

      const subCategoryPayload = {
        restaurant: id,
        name: subCategoryName,
        displayOrder: subIndex,
        parentCategory: mainCategory._id,
      };
      const subCategory = await Category.create(subCategoryPayload);
      categoriesImported++;

      const items = subCategoryData.items || [];
      for (const [itemIndex, itemWrapper] of items.entries()) {
        const itemData = itemWrapper?.item || {};
        if (!itemData.name) continue;

        const variants = parseVariantGroups(itemData);
        let dietaryType = "non-veg";
        if (itemData.dietary_slugs?.includes("veg") || itemData.dietary_slugs?.includes("vegan")) {
          dietaryType = "veg";
        }

        let image = null;
        let zomatoImageUrl = null;
        if (itemData.item_image_url) {
          zomatoImageUrl = itemData.item_image_url;
        } else if (Array.isArray(itemData.media) && itemData.media[0]?.image?.url) {
          zomatoImageUrl = itemData.media[0].image.url;
        } else if (itemData.media?.url) {
          zomatoImageUrl = itemData.media.url;
        }

        if (zomatoImageUrl && importMedia) {
          try {
            const imgResp = await axios.get(zomatoImageUrl, { responseType: "arraybuffer" });
            const buffer = Buffer.from(imgResp.data, "binary");
            const extMatch = zomatoImageUrl.match(/\.(jpg|jpeg|png|webp|gif)/i);
            const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";
            const s3Result = await uploadToS3({
              file: buffer,
              folder: `restaurant/${id}/menu/items`,
              fileName: `item-${Date.now()}-${crypto.randomUUID()}${ext}`,
            });

            const imageAsset = await ImageAsset.create({
              restaurant: id,
              original: s3Result.key,
            });
            image = imageAsset._id;
          } catch (err) {
            console.error("Failed to upload Zomato image to S3", err);
            image = null;
          }
        }

        const basePrice = itemData.price || itemData.default_price || itemData.display_price || itemData.min_price || 0;

        const itemPayload = {
          restaurant: id,
          category: mainCategory._id,
          subCategory: subCategory._id,
          name: itemData.name,
          description: itemData.desc || "",
          image: image,
          media: zomatoImageUrl
            ? [{ url: zomatoImageUrl, fileDirectory: "", image_id: zomatoImageUrl.split("?")[0].split("/").pop() || "" }]
            : [],
          base_price: basePrice,
          dietaryType: dietaryType,
          variants: variants,
          displayOrder: itemIndex,
          isAvailable: true,
        };
        const savedItem = await MenuItem.create(itemPayload);
        itemsImported++;

        itemNameToId[itemData.name.trim().toLowerCase()] = savedItem._id;
      }
    }
  }

  const modifierGroupEntries = importAddons ? Object.values(modifierGroups) : [];

  for (const groupWrapper of modifierGroupEntries) {
    const group = groupWrapper?.group;
    if (!group?.name) continue;

    const zItems = Array.isArray(group.items) ? group.items : [];
    const resolvedItems = [];
    for (const itemWrapper of zItems) {
      const zItem = itemWrapper?.item;
      if (!zItem?.name) continue;
      const matchedId = itemNameToId[zItem.name.trim().toLowerCase()];
      const price = zItem.price || zItem.default_price || zItem.display_price || zItem.min_price || 0;

      let dietaryType = "non-veg";
      if (
        zItem.dietary_slugs?.includes("veg") || 
        zItem.dietary_slugs?.includes("vegan") ||
        zItem.tag_slugs?.includes("veg") ||
        zItem.tag_slugs?.includes("vegan")
      ) {
        dietaryType = "veg";
      } else if (
        zItem.dietary_slugs?.includes("egg") ||
        zItem.tag_slugs?.includes("egg")
      ) {
        dietaryType = "egg";
      }

      resolvedItems.push({
        item: matchedId || null,     
        name: zItem.name,
        description: zItem.desc || "",
        price,
        isFree: price === 0,
        dietaryType, 
        displayOrder: resolvedItems.length,
      });
    }

    const selectionType = group.max === 1 ? "single" : "multiple";

    const newAddonGroup = await AddonGroup.create({
      restaurant: id,
      name: group.name,
      selectionType,
      minSelection: group.min ?? 0,
      maxSelection: group.max ?? null,
      items: resolvedItems,
    });
    addonGroupsImported++;

    const linkedItemIds = resolvedItems.filter(r => r.item).map(r => r.item);
    if (linkedItemIds.length > 0) {
      await MenuItem.updateMany(
        { _id: { $in: linkedItemIds }, restaurant: id },
        { $addToSet: { addonGroups: newAddonGroup._id } }
      );
    }
  }

  await invalidateCategoryCache(id);
  await invalidateItemCache(id);
  await invalidateAddonGroupCache(id);

  return successResponse(
    {
      total_items: itemsImported,
      stats: {
        categoriesImported,
        itemsImported,
        addonGroupsImported,
      },
    },
    "Menu imported successfully"
  );
});