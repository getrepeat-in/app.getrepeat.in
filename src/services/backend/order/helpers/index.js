import mongoose from "mongoose";
import Table from "@/models/Table";
import MenuItem from "@/models/Item";
import { User } from "@/models/User";

export const resolveTable = async (restaurantId, orderType, tableInput) => {
  if (orderType !== "dine-in") return null;
  if (!tableInput) {
    throw new Error("Table is required for dine-in orders");
  }

  let tableDoc = null;
  if (mongoose.Types.ObjectId.isValid(tableInput)) {
    tableDoc = await Table.findOne({ _id: tableInput, restaurant: restaurantId });
  }
  if (!tableDoc && typeof tableInput === "string") {
    tableDoc = await Table.findOne({ qrToken: tableInput, restaurant: restaurantId });
  }
  if (!tableDoc && !isNaN(Number(tableInput))) {
    tableDoc = await Table.findOne({ tableNumber: Number(tableInput), restaurant: restaurantId });
  }

  if (!tableDoc) {
    throw new Error("Specified table not found for this restaurant");
  }

  return tableDoc._id;
};

export const validateAndCalculateItems = async (restaurantId, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const itemIds = items.map((i) => i.menuItem || i._id).filter(Boolean);
  const dbMenuItems = await MenuItem.find({
    _id: { $in: itemIds },
    restaurant: restaurantId,
  })
    .select("name base_price isAvailable dietaryType variants")
    .lean();

  const dbMenuItemMap = new Map(dbMenuItems.map((i) => [i._id.toString(), i]));

  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const rawItem of items) {
    const menuItemId = (rawItem.menuItem || rawItem._id || "").toString();
    const dbItem = dbMenuItemMap.get(menuItemId);

    if (!dbItem) {
      throw new Error(`Menu item '${rawItem.name || menuItemId}' is invalid or no longer available`);
    }

    const quantity = Math.max(1, parseInt(rawItem.quantity || 1, 10));
    let unitPrice = Number(rawItem.unitPrice ?? dbItem.base_price);

    let validatedVariant = undefined;
    if (rawItem.variant && rawItem.variant.name) {
      validatedVariant = {
        name: String(rawItem.variant.name),
        price: Number(rawItem.variant.price) || 0,
      };
      if (validatedVariant.price > 0) {
        unitPrice = validatedVariant.price;
      }
    }

    const validatedAddons = [];
    let addonsTotal = 0;
    if (Array.isArray(rawItem.addons)) {
      for (const addon of rawItem.addons) {
        if (addon && addon.name) {
          const addonPrice = Math.max(0, Number(addon.price) || 0);
          validatedAddons.push({
            name: String(addon.name),
            price: addonPrice,
          });
          addonsTotal += addonPrice;
        }
      }
    }

    const lineTotalPrice = (unitPrice + addonsTotal) * quantity;
    calculatedSubtotal += lineTotalPrice;

    validatedItems.push({
      menuItem: dbItem._id,
      name: rawItem.name || dbItem.name,
      quantity,
      unitPrice,
      variant: validatedVariant,
      addons: validatedAddons,
      specialInstructions: rawItem.specialInstructions || "",
      totalPrice: lineTotalPrice,
    });
  }

  return { validatedItems, calculatedSubtotal };
};

export const resolveCustomer = async (customerId, customerInfo) => {
  if (customerId) return customerId;
  
  if (customerInfo?.phone) {
    try {
      let user = await User.findOne({ phone: customerInfo.phone });
      if (!user) {
        user = await User.create({
          phone: customerInfo.phone,
          name: customerInfo.name || "Guest Customer",
          email: customerInfo.email || undefined,
        });
      }
      return user._id;
    } catch (err) {
      console.warn("Could not auto-create customer record:", err?.message);
    }
  }
  return null;
};
