const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;
const S3_BASE_URL = S3_BUCKET && AWS_REGION ? `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com` : "";

export const ImageService = {

  formatImage: (imageInput) => {
    if (!imageInput) return null;

    if (typeof imageInput === "string") {
      return {
        original: imageInput,
        thumbnail: imageInput,
        card: imageInput,
        detail: imageInput,
      };
    }

    const originalKey = typeof imageInput.original === 'string' 
      ? imageInput.original 
      : (imageInput.original?.key || "");

    const getVariantKey = (variantName) => {
      if (typeof imageInput[variantName] === 'string' && imageInput[variantName]) {
        return imageInput[variantName];
      }
      
      const v = imageInput.variants?.[variantName];
      if (typeof v === "string" && v) return v;
      if (Array.isArray(v) && v.length > 0) {
        const match =
          v.find((item) => item.format === "avif") ||
          v.find((item) => item.format === "webp") ||
          v[0];
        return match?.key || originalKey;
      }
      
      return null;
    };

    const card = getVariantKey("card");
    const thumbnail = getVariantKey("thumbnail");
    const detail = getVariantKey("detail");
    const original = originalKey || card;

    if (!card && !thumbnail && !original) return null;

    return {
      original,
      thumbnail: thumbnail || card || original,
      card: card || original,
      detail: detail || card || original,
    };
  },

  formatResponseImages: (data) => {
    if (data === null || data === undefined) return data;
    if (typeof data.toObject === 'function') {
      try {
        data = data.toObject();
      } catch (e) {}
    }

    if (Array.isArray(data)) {
      return data.map(item => ImageService.formatResponseImages(item));
    }

    if (typeof data === "object") {
      if (data instanceof Date || data instanceof RegExp) return data;
      
      if (data._bsontype === 'ObjectID' || data.constructor?.name === 'ObjectId') {
          return data;
      }

      const isOldSchema = data.variants && data.original && typeof data.original === "object";
      const isNewSchema = data.original && (data.thumbnail !== undefined || data.card !== undefined || data.detail !== undefined);
      
      if (isOldSchema || isNewSchema) {
        return ImageService.formatImage(data);
      }

      const formatted = {};
      for (const [key, value] of Object.entries(data)) {
        formatted[key] = ImageService.formatResponseImages(value);
      }
      return formatted;
    }

    return data;
  },

  resolveImageUrl: (imageInput, variant = "card") => {
    if (!imageInput) return null;

    if (typeof imageInput === "string") {
      if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
        return imageInput;
      }
      return S3_BASE_URL ? `${S3_BASE_URL}/${imageInput.replace(/^\//, "")}` : imageInput;
    }

    const formatted = ImageService.formatImage(imageInput);
    if (!formatted) return null;

    const key =
      formatted[variant] ||
      formatted.card ||
      formatted.thumbnail ||
      formatted.original ||
      null;

    if (!key) return null;
    return S3_BASE_URL ? `${S3_BASE_URL}/${key.replace(/^\//, "")}` : `/${key.replace(/^\//, "")}`;
  },
};