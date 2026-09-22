import crypto from "crypto";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import Restaurant from "@/models/Restaurant";
import { ImageService } from "@/services/backend/images";
import Order, { OrderStatus, PaymentStatus } from "@/models/Order";
import { invalidateOrderCache } from "@/lib/api/helpers/cacheKeys";
import { getOrSetCache } from "@/services/backend/redis/cache.service";
import { BadRequestError, NotFoundError } from "@/lib/api/response-handler";
import { resolveTable, validateAndCalculateItems, resolveCustomer } from "./helpers";

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
    deliveryAddress = null,
    tax: rawTax = 0,
    discount: rawDiscount = 0,
    paymentMethod = "cash",
    paymentStatus = "pending",
    paymentDetails = null,
    specialInstructions = "",
    initialStatus = null,
    updatedByStaff = null,
    updatedByCustomer = null,
  }) => {
    await dbConnect();

    const restaurant = await Restaurant.findById(restaurantId).select("_id name").lean();
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const validOrderTypes = ["DINE_IN", "TAKEAWAY", "DELIVERY"];
    if (!validOrderTypes.includes(orderType)) {
      throw new BadRequestError(`Invalid order type. Must be one of: ${validOrderTypes.join(", ")}`);
    }

    if (orderType === "DELIVERY") {
      if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zipCode) {
        throw new BadRequestError("Delivery address with street, city, and zipCode is required for delivery orders");
      }
    }

    const resolvedTableId = await resolveTable(restaurantId, orderType, table);
    const { validatedItems, calculatedSubtotal } = await validateAndCalculateItems(restaurantId, items);

    const subtotal = calculatedSubtotal;
    const discount = Math.max(0, Number(rawDiscount) || 0);
    const tax = Math.max(0, Number(rawTax) || 0);
    const totalAmount = Math.max(0, subtotal + tax - discount);

    let orderStatus = initialStatus || OrderStatus.PLACED;
    let resolvedPaymentStatus = paymentStatus === "pending" ? PaymentStatus.PENDING : paymentStatus.toUpperCase();

    if (paymentMethod === "ONLINE" && resolvedPaymentStatus !== PaymentStatus.PAID) {
      orderStatus = OrderStatus.PLACED;
    }

    const resolvedCustomerId = await resolveCustomer(customer, customerInfo);
    const orderNumber = generateOrderNumber();

    const newOrder = await Order.create({
      restaurant: restaurantId,
      orderNumber,
      orderType,
      table: resolvedTableId,
      deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : undefined,
      customer: resolvedCustomerId,
      items: validatedItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: resolvedPaymentStatus,
      paymentDetails: paymentDetails && paymentDetails.razorpay_order_id ? {
        razorpayOrderId: paymentDetails.razorpay_order_id,
        razorpayPaymentId: paymentDetails.razorpay_payment_id,
        razorpaySignature: paymentDetails.razorpay_signature,
      } : undefined,
      specialInstructions: specialInstructions || "",
      orderStatus,
      statusHistory: [
        {
          statusType: "ORDER",
          status: orderStatus,
          timestamp: new Date(),
          updatedByStaff,
          updatedByCustomer
        },
      ],
    });

    await invalidateOrderCache(restaurantId);

    const populatedOrder = await Order.findById(newOrder._id)
      .populate({
        path: "items.menuItem",
        select: "name base_price dietaryType image",
        populate: { path: "image", select: "original thumbnail card detail" },
      })
      .populate("table", "tableNumber label zone")
      .populate({ path: "customer", select: "name phone email image", populate: { path: "image", select: "original thumbnail card detail" } })
      .populate({ path: "restaurant", select: "name logo address", populate: { path: "logo", select: "original thumbnail card detail" } });

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
        populate: { path: "image", select: "original thumbnail card detail" },
      })
      .populate("table", "tableNumber label zone")
      .populate({ path: "customer", select: "name phone email profileImageUrl image", populate: { path: "image", select: "original thumbnail card detail" } })
      .populate({ path: "restaurant", select: "name logo address", populate: { path: "logo", select: "original thumbnail card detail" } })
      .populate("statusHistory.updatedByStaff", "name email")
      .populate("statusHistory.updatedByCustomer", "name phone email profileImageUrl");

    if (!order) {
      throw new NotFoundError("Order not found");
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
        populate: { path: "image", select: "original thumbnail card detail" },
      })
      .populate("table", "tableNumber label zone")
      .populate({ path: "customer", select: "name phone email profileImageUrl image", populate: { path: "image", select: "original thumbnail card detail" } })
      .populate({ path: "restaurant", select: "name logo address", populate: { path: "logo", select: "original thumbnail card detail" } })
      .populate("statusHistory.updatedByStaff", "name email")
      .populate("statusHistory.updatedByCustomer", "name phone email profileImageUrl");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    return formatOrderResponse(order);
  },

  getOrderDetails: async (orderId, options = {}) => {
    if (orderId.startsWith("ORD-")) {
      return OrderService.getOrderByNumber(orderId, options);
    }
    if (orderId.startsWith("order_")) {
      return OrderService.getOrderByRazorpayId(orderId, options);
    }
    return OrderService.getOrderById(orderId, options);
  },

  getOrderByRazorpayId: async (razorpayOrderId, { restaurantId = null } = {}) => {
    await dbConnect();

    const query = { "paymentDetails.razorpayOrderId": razorpayOrderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query)
      .populate({
        path: "items.menuItem",
        select: "name base_price dietaryType image",
        populate: { path: "image", select: "original thumbnail card detail" },
      })
      .populate("table", "tableNumber label zone")
      .populate({ path: "customer", select: "name phone email profileImageUrl image", populate: { path: "image", select: "original thumbnail card detail" } })
      .populate({ path: "restaurant", select: "name logo address", populate: { path: "logo", select: "original thumbnail card detail" } })
      .populate("statusHistory.updatedByStaff", "name email")
      .populate("statusHistory.updatedByCustomer", "name phone email profileImageUrl");

    if (!order) {
      throw new NotFoundError("Order not found");
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
              populate: { path: "image", select: "original thumbnail card detail" },
            })
            .populate("table", "tableNumber label zone")
            .populate({ path: "customer", select: "name phone email profileImageUrl image", populate: { path: "image", select: "original thumbnail card detail" } })
            .populate({ path: "restaurant", select: "name logo address", populate: { path: "logo", select: "original thumbnail card detail" } })
            .populate("statusHistory.updatedByStaff", "name email")
      .populate("statusHistory.updatedByCustomer", "name phone email profileImageUrl")
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
      throw new BadRequestError("Customer ID or phone number is required");
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
          populate: { path: "image", select: "original thumbnail card detail" },
        })
        .populate("table", "tableNumber label zone")
        .populate({ path: "customer", select: "name phone email profileImageUrl image", populate: { path: "image", select: "original thumbnail card detail" } })
        .populate({ path: "restaurant", select: "name logo address", populate: { path: "logo", select: "original thumbnail card detail" } })
        .populate("statusHistory.updatedByStaff", "name email")
      .populate("statusHistory.updatedByCustomer", "name phone email profileImageUrl")
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
  
  advanceOrderState: async (orderId, { updatedByStaff = null, restaurantId = null }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const { orderStatus, orderType } = order;

    // Unified per-type transition map — single orderStatus field, no fulfillmentStatus
    const TRANSITION_MAP = {
      DINE_IN:   [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SERVED, OrderStatus.COMPLETED],
      TAKEAWAY:  [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED_UP, OrderStatus.COMPLETED],
      DELIVERY:  [OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.COMPLETED],
    };

    const normalizedOrderType = (orderType || "").toUpperCase();
    const flow = TRANSITION_MAP[normalizedOrderType];
    if (!flow) {
      throw new BadRequestError(`Unknown order type: ${orderType}`);
    }

    const currentIndex = flow.indexOf(orderStatus);
    if (currentIndex === -1 || currentIndex === flow.length - 1) {
      throw new BadRequestError("Order cannot be advanced further or is in an invalid state.");
    }

    const nextStatus = flow[currentIndex + 1];
    const now = new Date();

    if (orderStatus === OrderStatus.PLACED && nextStatus === OrderStatus.ACCEPTED) {
      order.statusHistory.push({ statusType: "ORDER", status: OrderStatus.ACCEPTED, timestamp: now, updatedByStaff });
      order.orderStatus = OrderStatus.PREPARING;
      order.statusHistory.push({ statusType: "ORDER", status: OrderStatus.PREPARING, timestamp: now, updatedByStaff });
    } else {
      order.orderStatus = nextStatus;
      order.statusHistory.push({ statusType: "ORDER", status: nextStatus, timestamp: now, updatedByStaff });
    }

    await order.save();
    await invalidateOrderCache(order.restaurant);

    return OrderService.getOrderById(order._id);
  },


  /**
   * Central dispatcher for all order update actions.
   * Routes to the appropriate service method based on the action field.
   */
  processOrderUpdate: async (orderId, { action, reason, paymentStatus, paymentMethod, restaurantId, updatedByStaff }) => {
    const ACTION_HANDLERS = {
      advance: () => OrderService.advanceOrderState(orderId, { updatedByStaff, restaurantId }),
      reject:  () => OrderService.rejectOrder(orderId, { rejectedBy: updatedByStaff, restaurantId, reason }),
      cancel:  () => OrderService.cancelOrder(orderId, { cancelledBy: updatedByStaff, restaurantId }),
    };

    const hasPaymentUpdate = paymentStatus || paymentMethod;
    const handler = ACTION_HANDLERS[action];

    if (!handler && !hasPaymentUpdate) {
      throw new BadRequestError("No valid action or update fields provided");
    }

    let updatedOrder = handler ? await handler() : null;

    if (hasPaymentUpdate) {
      updatedOrder = await OrderService.updateOrderPayment(orderId, {
        paymentStatus, paymentMethod, updatedByStaff, restaurantId,
      });
    }

    return updatedOrder;
  },

  updateOrderPayment: async (
    orderId,
    { paymentStatus, paymentMethod, restaurantId = null, updatedByStaff = null }
  ) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === "completed" && order.orderStatus === OrderStatus.PENDING_PAYMENT) {
        order.orderStatus = OrderStatus.PLACED;
        order.statusHistory.push({
          statusType: "ORDER",
          status: OrderStatus.PLACED,
          timestamp: new Date(),
          updatedByStaff,
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

  cancelOrder: async (orderId, { cancelledBy = null, restaurantId = null }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(order.orderStatus)) {
      throw new BadRequestError(`Cannot cancel order in status ${order.orderStatus}`);
    }

    order.orderStatus = OrderStatus.CANCELLED;
    order.statusHistory.push({
      statusType: "ORDER",
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      updatedByStaff: cancelledBy,
    });

    await order.save();
    await invalidateOrderCache(order.restaurant);

    return OrderService.getOrderById(order._id);
  },

  rejectOrder: async (orderId, { rejectedBy = null, restaurantId = null, reason = "" }) => {
    await dbConnect();

    const query = { _id: orderId };
    if (restaurantId) query.restaurant = restaurantId;

    const order = await Order.findOne(query);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(order.orderStatus)) {
      throw new BadRequestError(`Cannot reject order in status ${order.orderStatus}`);
    }

    order.orderStatus = OrderStatus.REJECTED;
    order.rejectionReason = reason;
    order.statusHistory.push({
      statusType: "ORDER",
      status: OrderStatus.REJECTED,
      timestamp: new Date(),
      updatedByStaff: rejectedBy,
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
      throw new NotFoundError("Order not found");
    }

    await Order.deleteOne({ _id: orderId });
    await invalidateOrderCache(order.restaurant);

    return { success: true };
  },
};
