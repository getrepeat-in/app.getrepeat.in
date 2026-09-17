import { Schema, model, models, Types } from "mongoose";

const staffSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
        },
    
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    
    clerkUserId: {
      type: String,
      sparse: true,
      index: true,
    },
    
    image: {
      type: Types.ObjectId,
      ref: "ImageAsset",
      default: null,
    },

    role: {
      type: Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
        },
    
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "SUSPENDED",
        "DISABLED",
      ],
      default: "DISABLED",
      index: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

staffSchema.index({ email: 1, restaurant: 1 }, { unique: true });
staffSchema.index({ clerkUserId: 1, restaurant: 1 }, { unique: true, sparse: true });

export const Staff = models.Staff || model("Staff", staffSchema);