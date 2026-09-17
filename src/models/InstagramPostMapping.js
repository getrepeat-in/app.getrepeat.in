import mongoose, { Schema, Types } from "mongoose";

const InstagramPostMappingSchema = new Schema(
  {
    restaurant: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    postId: {
      type: String,
      required: true,
    },
    mappedItems: [
      {
        type: Types.ObjectId,
        ref: "MenuItem",
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

InstagramPostMappingSchema.index({ restaurant: 1, postId: 1 }, { unique: true });

export default mongoose.models.InstagramPostMapping || mongoose.model("InstagramPostMapping", InstagramPostMappingSchema);
