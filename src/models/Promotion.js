import mongoose, { Schema, Types } from "mongoose";

const PromotionSchema = new Schema(
  {
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["ITEM_DISCOUNT", "BESTSELLER", "CART_DISCOUNT", "BOGO", "FREEBIE"],
      default: "ITEM_DISCOUNT",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },

    discount_type: {
      type: String,
      enum: ["PERCENTAGE", "FLAT"],
      default: "PERCENTAGE",
    },

    discount_value: {
      type: Number,
      min: 0,
    },

    items: [
      {
        type: Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    starts_at: {
      type: Date,
      default: null,
    },

    ends_at: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    usage_limit: {
      type: Number,
      default: null,
    },

    per_user_limit: { type: Number, default: null, comment: "Maximum number of times a single user can use this promotion" },

    min_order_value: {
      type: Number,
      default: null,
      min: 0
    },

    times_used: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default mongoose.models.Promotion ||
  mongoose.model("Promotion", PromotionSchema);