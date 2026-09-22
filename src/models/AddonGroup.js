import mongoose, { Schema, Types } from "mongoose";

const AddonItemSchema = new Schema(
    {
        name:        { type: String, required: true, trim: true },
        description: { type: String, default: "" },
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
        displayOrder: { type: Number, default: 0 },
    },
    { _id: true }
);

const AddonGroupSchema = new Schema(
    {
        restaurant: {
            type: Types.ObjectId,
            ref: "Restaurant",
            required: [true, "Restaurant reference is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Addon group name is required (e.g., Toppings, Sauces)"],
            trim: true,
        },
        selectionType: {
            type: String,
            enum: ["single", "multiple"],
            default: "multiple",
            required: true,
        },
        minSelection: { type: Number, default: 0, min: 0 },
        maxSelection: { type: Number, default: null },
        items: [AddonItemSchema],
    },
    { timestamps: true }
);

AddonGroupSchema.index({ restaurant: 1 });
export default mongoose.models.AddonGroup || mongoose.model("AddonGroup", AddonGroupSchema);

