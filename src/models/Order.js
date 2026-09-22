import mongoose, { Schema, Types, models, model } from "mongoose";
const ORDER_STATUS = {
  PLACED: "PLACED",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
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


const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"];
const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "ONLINE"];

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
    name: { type: String, required: true, trim: true },
    price: {
        type: Number,
        default: 0,
        min: [0, "Price cannot be negative"],
    },
    isFree: { type: Boolean, default: false },
    dietaryType: {
        type: String,
        enum: ["veg", "non-veg", "egg", "vegan"],
        default: "veg",
    },
  }],
  
  specialInstructions: { type: String, default: "" },
  totalPrice: { type: Number, required: true }
});

const DeliveryAddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  zipCode: { type: String, required: true },
  label: { type: String },
  instructions: { type: String },
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
    required: function() { return this.orderType === "DINE_IN"; },
  },
  customer: {
    type: Types.ObjectId,
    ref: "User",
    index: true,
  },
  
  deliveryAddress: {
    type: DeliveryAddressSchema,
    required: function() { return this.orderType === "DELIVERY"; },
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

  statusHistory: [{
    statusType: { type: String, enum: ['ORDER', 'PAYMENT'], required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedByStaff: { type: Types.ObjectId, ref: "Staff", default: null },
    updatedByCustomer: { type: Types.ObjectId, ref: "User", default: null }
  }],
  
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  
  paymentMethod: {
    type: String,
    enum: PAYMENT_METHODS,
  },
  
  paymentDetails: {
    razorpayOrderId: { type: String, index: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  
  rejectionReason: { type: String },
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
export default models.Order || model("Order", OrderSchema);
