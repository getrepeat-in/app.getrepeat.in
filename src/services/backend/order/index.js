import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import Restaurant from "@/models/Restaurant";
import { ImageService } from "@/services/backend/images";
import { invalidateOrderCache } from "@/lib/api/helpers/cacheKeys";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { resolveTable, validateAndCalculateItems, resolveCustomer } from "./helpers";
import Order, { OrderStatus, PaymentStatus, FulfillmentStatus } from "@/models/Order";

const generateOrderNumber = () => {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${timestampPart}-${randomPart}`;
};

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
  createOrder: async ({
    restaurantId,
    orderType,
    table,
    customer,
    customerInfo,
    items,
    tax: rawTax = 0,
    discount: rawDiscount = 0,
    paymentMethod = "cash",
    paymentStatus = "pending",
    specialInstructions = "",
    initialStatus = null,
    updatedBy = null,
  }) => {
    await dbConnect();

    const restaurant = await Restaurant.findById(restaurantId).select("_id name").lean();
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const validOrderTypes = ["dine-in", "takeaway", "delivery"];
    if (!validOrderTypes.includes(orderType)) {
      throw new Error(`Invalid order type. Must be one of: ${validOrderTypes.join(", ")}`);
    }

    const resolvedTableId = await resolveTable(restaurantId, orderType, table);
    const { validatedItems, calculatedSubtotal } = await validateAndCalculateItems(restaurantId, items);

    const subtotal = calculatedSubtotal;
    const discount = Math.max(0, Number(rawDiscount) || 0);
    const tax = Math.max(0, Number(rawTax) || 0);
    const totalAmount = Math.max(0, subtotal + tax - discount);

    let orderStatus = initialStatus || OrderStatus.PLACED;
    let resolvedPaymentStatus = paymentStatus === "pending" ? PaymentStatus.PENDING : paymentStatus.toUpperCase();
    let fulfillmentStatus = FulfillmentStatus.PENDING;

    if (paymentMethod === "online" && resolvedPaymentStatus !== PaymentStatus.PAID) {
      orderStatus = OrderStatus.PLACED;
    }

    const resolvedCustomerId = await resolveCustomer(customer, customerInfo);
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
      paymentStatus: resolvedPaymentStatus,
      fulfillmentStatus,
      specialInstructions: specialInstructions || "",
      orderStatus,
      statusHistory: [
        {
          statusType: "ORDER",
          status: orderStatus,
          timestamp: new Date(),
          updatedBy: updatedBy || null,
        },
      ],
    });

    await invalidateOrderCache(restaurantId);

    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: "items.menuItem",
        select: "name base_price dietaryType image",
        populate: { path: "image", select: "original variants key" },
      })
      .populate("table", "tableNumber label zone")
      .populate("customer", "name phone email");

    const formattedOrder = formatOrderResponse(populatedOrder);
    


    return formattedOrder;
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

    const cacheKey = `restaurant:${restaurantId}:orders:page:${page}:limit:${limit}:status:${status || "all"}:type:${orderType || "all"}:search:${search || "none"}:start:${startDate || "all"}:end:${endDate || "all"}:summary:${summary}:customer:${customerId || "all"}`;

    const { data: cachedOrFetchedData, isCached } = await getOrSetCache(
      cacheKey,
      async () => {
        const query = {};
        if (restaurantId) query.restaurant = restaurantId;
        if (customerId) query.customer = customerId;

        if (status) {
          if (status.includes(",")) {
            query.orderStatus = { $in: status.split(",").map((s) => s.trim()) };
          } else {
            query.orderStatus = status;
          }
        }

        if (orderType) query.orderType = orderType;

        if (startDate || endDate) {
          query.createdAt = {};
          if (startDate) query.createdAt.$gte = new Date(startDate);
          if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (summary && restaurantId) {
          const counts = await Order.aggregate([
            {
              $match: {
                restaurant: mongoose.Types.ObjectId.isValid(restaurantId)
                  ? new mongoose.Types.ObjectId(restaurantId)
                  : restaurantId,
                orderStatus: {
                  $in: [
                    "PLACED",
                    "ACCEPTED",
                    "PREPARING",
                    "READY",
                    "COMPLETED",
                  ],
                },
              },
            },
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
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
      120 
    );

    return { ...cachedOrFetchedData, isCached };
  },

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
        query.orderStatus = { $in: status.split(",").map((s) => s.trim()) };
      } else {
        query.orderStatus = status;
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
  
  advanceOrderState: async (orderId, { updatedBy = null, restaurantId = null }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    const { orderStatus, orderType, fulfillmentStatus } = order;

    const transitionMap = {
      [OrderStatus.PLACED]: { order: OrderStatus.ACCEPTED },
      [OrderStatus.ACCEPTED]: { order: OrderStatus.PREPARING },
      [OrderStatus.PREPARING]: { order: OrderStatus.READY, fulfillment: FulfillmentStatus.READY },
      [OrderStatus.READY]: {
        "dine-in": { order: OrderStatus.COMPLETED, fulfillment: FulfillmentStatus.FULFILLED },
        "takeaway": { order: OrderStatus.COMPLETED, fulfillment: FulfillmentStatus.FULFILLED },
        "delivery": {
          [FulfillmentStatus.READY]: { fulfillment: FulfillmentStatus.IN_TRANSIT },
          [FulfillmentStatus.IN_TRANSIT]: { order: OrderStatus.COMPLETED, fulfillment: FulfillmentStatus.FULFILLED }
        }[fulfillmentStatus]
      }[orderType]
    };

    const nextState = transitionMap[orderStatus] || {};
    const nextOrderStatus = nextState.order || orderStatus;
    const nextFulfillmentStatus = nextState.fulfillment || fulfillmentStatus;

    if (nextOrderStatus === orderStatus && nextFulfillmentStatus === fulfillmentStatus) {
      throw new Error("Order cannot be advanced further or is in an invalid state.");
    }

    if (nextOrderStatus !== orderStatus) {
      order.orderStatus = nextOrderStatus;
      order.statusHistory.push({
        statusType: "ORDER",
        status: nextOrderStatus,
        timestamp: new Date(),
        updatedBy,
      });
    }

    if (nextFulfillmentStatus !== fulfillmentStatus) {
      order.fulfillmentStatus = nextFulfillmentStatus;
      order.statusHistory.push({
        statusType: "FULFILLMENT",
        status: nextFulfillmentStatus,
        timestamp: new Date(),
        updatedBy,
      });
    }

    await order.save();
    await invalidateOrderCache(order.restaurant);

    const updatedOrder = await OrderService.getOrderById(order._id);

    return updatedOrder;
  },

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
      if (paymentStatus === "completed" && order.orderStatus === OrderStatus.PENDING_PAYMENT) {
        order.orderStatus = OrderStatus.PLACED;
        order.statusHistory.push({
          statusType: "ORDER",
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

    const updatedOrder = await OrderService.getOrderById(order._id);

    return updatedOrder;
  },

  cancelOrder: async (orderId, { cancelledBy = null, restaurantId = null }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    if (
      [OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(
        order.orderStatus
      )
    ) {
      throw new Error(`Cannot cancel order in status ${order.orderStatus}`);
    }

    order.orderStatus = OrderStatus.CANCELLED;
    order.statusHistory.push({
      statusType: "ORDER",
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      updatedBy: cancelledBy,
    });

    await order.save();
    await invalidateOrderCache(order.restaurant);

    return OrderService.getOrderById(order._id);
  },

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
