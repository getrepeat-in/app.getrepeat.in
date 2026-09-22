import mongoose, { Schema } from "mongoose";

const IntegrationSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
    },
    instagram: {
      userId: { type: String, default: null },
      accessToken: { type: String, default: null },
      tokenExpiresAt: { type: Date, default: null },
      username: { type: String, default: null },
      connectedAt: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
    },
    razorpay: {
      accountId: { type: String, default: null },
      accessToken: { type: String, default: null },
      refreshToken: { type: String, default: null },
      connectedAt: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.models.Integration || mongoose.model("Integration", IntegrationSchema);
