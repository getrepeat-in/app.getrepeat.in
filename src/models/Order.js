import mongoose, { Schema, Types, models, model } from "mongoose";

const ORDER_STATUS = {
  PLACED: "PLACED",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED"
};

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  AUTHORIZED: "AUTHORIZED",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED"
};

const FULFILLMENT_STATUS = {
  PENDING: "PENDING",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  FULFILLED: "FULFILLED"
};

const ORDER_TYPES = ["dine-in", "takeaway", "delivery"];
const PAYMENT_METHODS = ["cash", "card", "upi", "online"];

const OrderItemSchema = new Schema({
  menuItem: {
    type: Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true }, 
  
  variant: {
    name: { type: String },
    price: { type: Number, default: 0 }, 
  },
  
  addons: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
  
  specialInstructions: { type: String, default: "" },
  totalPrice: { type: Number, required: true }
});

const OrderSchema = new Schema({
  restaurant: {
    type: Types.ObjectId,
    ref: "Restaurant",
    required: true,
    index: true,
  },
  orderNumber: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  orderType: {
    type: String,
    enum: ORDER_TYPES,
    required: true,
    index: true,
  },
  table: {
    type: Types.ObjectId,
    ref: "Table",
    required: function() { return this.orderType === "dine-in"; },
  },
  customer: {
    type: Types.ObjectId,
    ref: "User",
    index: true,
  },
  
  items: [OrderItemSchema],
  
  orderStatus: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PLACED,
    index: true,
  },
  
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
    index: true,
  },

  fulfillmentStatus: {
    type: String,
    enum: Object.values(FULFILLMENT_STATUS),
    default: FULFILLMENT_STATUS.PENDING,
    index: true,
  },
  
  statusHistory: [{
    statusType: { type: String, enum: ['ORDER', 'PAYMENT', 'FULFILLMENT'], required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Types.ObjectId, ref: "Staff", default: null }
  }],
  
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

OrderSchema.pre('save', function() {
  if (this.isModified('subtotal') || this.isModified('tax') || this.isModified('discount')) {
    this.totalAmount = this.subtotal + this.tax - this.discount;
  }
});

export const OrderStatus = ORDER_STATUS;
export const PaymentStatus = PAYMENT_STATUS;
export const FulfillmentStatus = FULFILLMENT_STATUS;
export default models.Order || model("Order", OrderSchema);
