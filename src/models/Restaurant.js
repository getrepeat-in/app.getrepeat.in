import mongoose, { Schema, Types } from "mongoose";

const RestaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      minlength: [2, "Restaurant name must be at least 2 characters"],
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can contain only lowercase letters, numbers, and hyphens",
      ],
    },

    logo: {
      type: Schema.Types.ObjectId,
      ref: "ImageAsset",
      default: null,
    },

    domain: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      street: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      postalCode: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "",
      },

      country: {
        type: String,
        uppercase: true,
        trim: true,
        default: "IN",
        minlength: 2,
        maxlength: 2,
      },

      location: {
        type: {
          type: String,
          enum: ["Point"]
        },

        coordinates: {
          type: [Number],
          default: undefined,
        },
      },
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9\s-]{10,20}$/, "Please provide a valid phone number"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
        "Please provide a valid GST number",
      ],
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "INR",
      enum: {
        values: ["INR"],
        message: "Only INR is currently supported",
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    openingHours: {
      currentlyOpen: {
        type: Boolean,
        default: true,
      },
      days: [
        {
          day: {
            type: String,
            required: true,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
          isOpen: {
            type: Boolean,
            default: true,
          },
          openTime: {
            type: String,
            default: null,
            match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format"],
          },
          closeTime: {
            type: String,
            default: null,
            match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format"],
          },
        },
      ],
    },

    createdBy: {
      type: String,
      required: true,
      immutable: true,
      index: true,
    },
  },
  {
    timestamps: true,

    versionKey: false,

    toJSON: {
      virtuals: true,
      transform: (_, returnedObject) => {
        delete returnedObject.__v;
        return returnedObject;
      },
    },

    toObject: {
      virtuals: true,
    },
  },
);

RestaurantSchema.index({ "address.location": "2dsphere" });
RestaurantSchema.index({ name: "text" });
export default mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);
