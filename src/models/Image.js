import mongoose from "mongoose";

const ImageAssetSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    original: {
      type: String,
      required: true,
    },
    
    thumbnail: {
      type: String,
      default: null,
    },

    card: {
      type: String,
      default: null,
    },

    detail: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ImageAssetSchema.index({
  restaurant: 1,
  createdAt: -1,
});

const ImageAsset =
  mongoose.models.ImageAsset || mongoose.model("ImageAsset", ImageAssetSchema);

export default ImageAsset;