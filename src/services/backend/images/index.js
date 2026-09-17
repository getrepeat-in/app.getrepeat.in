const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;
const S3_BASE_URL = S3_BUCKET && AWS_REGION ? `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com` : "";

export const ImageService = {
  formatImage: (imageDoc) => {
    if (!imageDoc) return null;

    if (typeof imageDoc === "string") {
      return {
        original: imageDoc,
        thumbnail: imageDoc,
        card: imageDoc,
        detail: imageDoc,
      };
    }

    if (imageDoc.card && imageDoc.thumbnail && typeof imageDoc.card === "string") {
      return {
        original: imageDoc.original || imageDoc.card,
        thumbnail: imageDoc.thumbnail || imageDoc.card,
        card: imageDoc.card,
        detail: imageDoc.detail || imageDoc.card,
      };
    }

    const originalKey =
      imageDoc.original?.key ||
      (typeof imageDoc.original === "string" ? imageDoc.original : "") ||
      imageDoc.key ||
      "";

    const rawVariants = imageDoc.variants || {};

    const extractKey = (variantName) => {
      const v = rawVariants[variantName];
      if (typeof v === "string" && v) return v;
      if (Array.isArray(v) && v.length > 0) {
        const match =
          v.find((item) => item.format === "avif") ||
          v.find((item) => item.format === "webp") ||
          v[0];
        return match?.key || originalKey;
      }
      return originalKey;
    };

    const card = extractKey("card");
    const thumbnail = extractKey("thumbnail");
    const detail = extractKey("detail");
    const original = originalKey || card;

    if (!card && !thumbnail && !original) return null;

    return {
      original,
      thumbnail: thumbnail || card || original,
      card: card || original,
      detail: detail || card || original,
    };
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

