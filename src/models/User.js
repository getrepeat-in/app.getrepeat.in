import { Schema, model, models, Types } from "mongoose";

const AddressSchema = new Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Other' },
  instructions: { type: String, trim: true },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
      
    phone: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
      default: null,
      select: false,
    },

    image: {
      type: Types.ObjectId,
      ref: "ImageAsset",
      default: null,
    },

    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
      index: true,
    },

    addresses: {
      type: [AddressSchema],
      validate: [
        function (val) {
          return val.length <= 3;
        },
        '{PATH} exceeds the limit of 3',
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model("User", userSchema);