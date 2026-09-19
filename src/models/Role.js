import mongoose, { Schema, Types } from "mongoose";
import { Permission } from "./Permission";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
    
    isSystemRole: { type: Boolean, default: false },

    permissions: [
      {
        type: Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);