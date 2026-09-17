import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Order, { OrderStatus } from "@/models/Order";
import Table from "@/models/Table";
import MenuItem from "@/models/Item";
import Restaurant from "@/models/Restaurant";
import { User } from "@/models/User";
import { Staff } from "@/models/Staff";
import { ImageService } from "@/services/backend/images";
import { invalidateOrderCache } from "@/lib/api/helpers/cacheKeys";

/**
 * Generate a unique, human-friendly order number
 * Format: ORD-XXXXXX-XXXX (e.g. ORD-982341-7A2F)
 */
const generateOrderNumber = () => {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${timestampPart}-${randomPart}`;
};

/**
 * Format order document for clean API response
 */
export const formatOrderResponse = (orderDoc) => {
  if (!orderDoc) return null;
  const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };

  if (Array.isArray(order.items)) {
    order.items = order.items.map((item) => {
      const itemObj = { ...item };
      if (itemObj.menuItem && typeof itemObj.menuItem === "object") {
        itemObj.menuItem = {
          _id: itemObj.menuItem._id,
          name: itemObj.menuItem.name,
          base_price: itemObj.menuItem.base_price,
          dietaryType: itemObj.menuItem.dietaryType,
          image: ImageService.formatImage(itemObj.menuItem.image),
        };
      }
      return itemObj;
    });
  }

  return order;
};

export const OrderService = {
  /**
   * Create a new order (Storefront / POS)
   */
  createOrder: async ({
    restaurantId,
    orderType,
    table,
    customer,
    customerInfo,
    items,
    subtotal: rawSubtotal,
    tax: rawTax = 0,
    discount: rawDiscount = 0,
    totalAmount: rawTotalAmount,
    paymentMethod = "cash",
    paymentStatus = "pending",
    specialInstructions = "",
    initialStatus = null,
    updatedBy = null,
  }) => {
    await dbConnect();

    // 1. Verify restaurant
    const restaurant = await Restaurant.findById(restaurantId).select("_id name").lean();
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    // 2. Validate Order Type
    const validOrderTypes = ["dine-in", "takeaway", "online"];
    if (!validOrderTypes.includes(orderType)) {
      throw new Error(`Invalid order type. Must be one of: ${validOrderTypes.join(", ")}`);
    }

    // 3. Validate and resolve Table for dine-in orders
    let resolvedTableId = null;
    if (orderType === "dine-in") {
      if (!table) {
        throw new Error("Table is required for dine-in orders");
      }

      let tableDoc = null;
      if (mongoose.Types.ObjectId.isValid(table)) {
        tableDoc = await Table.findOne({ _id: table, restaurant: restaurantId });
      }
      if (!tableDoc && typeof table === "string") {
        tableDoc = await Table.findOne({ qrToken: table, restaurant: restaurantId });
      }
      if (!tableDoc && !isNaN(Number(table))) {
        tableDoc = await Table.findOne({ tableNumber: Number(table), restaurant: restaurantId });
      }

      if (!tableDoc) {
        throw new Error("Specified table not found for this restaurant");
      }

      resolvedTableId = tableDoc._id;
    }

    // 4. Validate and sanitize items
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

      // Validate variant if provided
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

      // Validate addons if provided
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

    // 5. Calculate taxes, discounts, and total
    const subtotal = calculatedSubtotal;
    const discount = Math.max(0, Number(rawDiscount) || 0);
    const tax = Math.max(0, Number(rawTax) || 0);
    const totalAmount = Math.max(0, subtotal + tax - discount);

    // 6. Determine initial status
    let status = initialStatus;
    if (!status) {
      if (paymentMethod === "online" && paymentStatus !== "completed") {
        status = OrderStatus.PENDING_PAYMENT;
      } else {
        status = OrderStatus.PLACED;
      }
    }

    // 7. Resolve Customer
    let resolvedCustomerId = customer || null;
    if (!resolvedCustomerId && customerInfo?.phone) {
      try {
        let user = await User.findOne({ phone: customerInfo.phone });
        if (!user) {
          user = await User.create({
            phone: customerInfo.phone,
            name: customerInfo.name || "Guest Customer",
            email: customerInfo.email || undefined,
          });
        }
        resolvedCustomerId = user._id;
      } catch (err) {
        console.warn("Could not auto-create customer record:", err?.message);
      }
    }

    const orderNumber = generateOrderNumber();

    const newOrder = await Order.create({
      restaurant: restaurantId,
      orderNumber,
      orderType,
      table: resolvedTableId,
      customer: resolvedCustomerId,
      items: validatedItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      specialInstructions: specialInstructions || "",
      status,
      statusHistory: [
        {
          status,
          timestamp: new Date(),
          updatedBy: updatedBy || null,
        },
      ],
    });

    // 8. Invalidate restaurant order cache
    await invalidateOrderCache(restaurantId);

    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: "items.menuItem",
        select: "name base_price dietaryType image",
        populate: { path: "image", select: "original variants key" },
      })
      .populate("table", "tableNumber label zone")
      .populate("customer", "name phone email");

    return formatOrderResponse(populatedOrder);
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (orderId, { restaurantId = null, customerId = null } = {}) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;
    if (customerId) query.customer = customerId;

    const order = await Order.findOne(query)
      .populate({
        path: "items.menuItem",
        select: "name base_price dietaryType image",
        populate: { path: "image", select: "original variants key" },
      })
      .populate("table", "tableNumber label zone")
      .populate("customer", "name phone email profileImageUrl")
      .populate("statusHistory.updatedBy", "name email");

    if (!order) {
      throw new Error("Order not found");
    }

    return formatOrderResponse(order);
  },

  /**
   * Get single order by Order Number
   */
  getOrderByNumber: async (orderNumber, { restaurantId = null } = {}) => {
    await dbConnect();

    const query = { orderNumber };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query)
      .populate({
        path: "items.menuItem",
        select: "name base_price dietaryType image",
        populate: { path: "image", select: "original variants key" },
      })
      .populate("table", "tableNumber label zone")
      .populate("customer", "name phone email profileImageUrl")
      .populate("statusHistory.updatedBy", "name email");

    if (!order) {
      throw new Error("Order not found");
    }

    return formatOrderResponse(order);
  },

  /**
   * List orders with filtering and pagination
   */
  listOrders: async ({
    restaurantId,
    customerId,
    status,
    orderType,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    summary = false,
  }) => {
    await dbConnect();

    const query = {};
    if (restaurantId) query.restaurant = restaurantId;
    if (customerId) query.customer = customerId;

    if (status) {
      if (status.includes(",")) {
        query.status = { $in: status.split(",").map((s) => s.trim()) };
      } else {
        query.status = status;
      }
    }

    if (orderType) query.orderType = orderType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Summary count mode for dashboard tabs
    if (summary && restaurantId) {
      const counts = await Order.aggregate([
        {
          $match: {
            restaurant: mongoose.Types.ObjectId.isValid(restaurantId)
              ? new mongoose.Types.ObjectId(restaurantId)
              : restaurantId,
            status: {
              $in: [
                "PENDING_PAYMENT",
                "PLACED",
                "ACCEPTED",
                "PREPARING",
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY",
                "PICKED_UP",
              ],
            },
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      return counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
    }

    if (search) {
      const matchingCustomers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const customerIds = matchingCustomers.map((c) => c._id);

      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customer: { $in: customerIds } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.menuItem",
          select: "name base_price dietaryType image",
          populate: { path: "image", select: "original variants key" },
        })
        .populate("table", "tableNumber label zone")
        .populate("customer", "name phone email profileImageUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders: orders.map(formatOrderResponse),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get orders for a specific customer (by customer ID or phone)
   */
  getCustomerOrders: async ({
    restaurantId = null,
    customerId = null,
    phone = null,
    status = null,
    page = 1,
    limit = 20,
  }) => {
    await dbConnect();

    if (!customerId && !phone) {
      throw new Error("Customer ID or phone number is required");
    }

    const query = {};
    if (restaurantId) query.restaurant = restaurantId;

    const customerConditions = [];
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      customerConditions.push({ customer: new mongoose.Types.ObjectId(customerId) });
    }

    if (phone) {
      const usersWithPhone = await User.find({ phone }).select("_id").lean();
      const userIds = usersWithPhone.map((u) => u._id);
      if (userIds.length > 0) {
        customerConditions.push({ customer: { $in: userIds } });
      }
    }

    if (customerConditions.length > 0) {
      if (customerConditions.length === 1) {
        Object.assign(query, customerConditions[0]);
      } else {
        query.$or = customerConditions;
      }
    } else if (customerId) {
      query.customer = customerId;
    }

    if (status) {
      if (status.includes(",")) {
        query.status = { $in: status.split(",").map((s) => s.trim()) };
      } else {
        query.status = status;
      }
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate({
          path: "items.menuItem",
          select: "name base_price dietaryType image",
          populate: { path: "image", select: "original variants key" },
        })
        .populate("table", "tableNumber label zone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders: orders.map(formatOrderResponse),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, { status, updatedBy = null, restaurantId = null }) => {
    await dbConnect();

    if (!Object.values(OrderStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy,
    });

    await order.save();
    await invalidateOrderCache(order.restaurant);

    return OrderService.getOrderById(order._id);
  },

  /**
   * Update order payment status / method
   */
  updateOrderPayment: async (
    orderId,
    { paymentStatus, paymentMethod, restaurantId = null, updatedBy = null }
  ) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      // Auto-advance status if paid online from PENDING_PAYMENT to PLACED
      if (paymentStatus === "completed" && order.status === OrderStatus.PENDING_PAYMENT) {
        order.status = OrderStatus.PLACED;
        order.statusHistory.push({
          status: OrderStatus.PLACED,
          timestamp: new Date(),
          updatedBy,
        });
      }
    }

    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    await order.save();
    await invalidateOrderCache(order.restaurant);

    return OrderService.getOrderById(order._id);
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId, { reason = "", cancelledBy = null, restaurantId = null }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    if (
      [OrderStatus.DELIVERED, OrderStatus.PICKED_UP, OrderStatus.CANCELLED].includes(
        order.status
      )
    ) {
      throw new Error(`Cannot cancel order in status ${order.status}`);
    }

    order.status = OrderStatus.CANCELLED;
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      updatedBy: cancelledBy,
    });

    await order.save();
    await invalidateOrderCache(order.restaurant);

    return OrderService.getOrderById(order._id);
  },

  /**
   * Delete an order
   */
  deleteOrder: async (orderId, { restaurantId = null }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    await Order.deleteOne({ _id: orderId });
    await invalidateOrderCache(order.restaurant);

    return { success: true };
  },
};
