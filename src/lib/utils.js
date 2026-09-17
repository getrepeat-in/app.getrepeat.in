import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(imageInput, useAvif = true, variant = "original") {
  if (!imageInput) return "";

  if (typeof imageInput === "string") {
    if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      return imageInput;
    }
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;
    const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;
    return `${baseUrl}/${imageInput.replace(/^\//, "")}`;
  }

  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;

  let variants = null;
  let fallbackKey = "";

  if (imageInput && typeof imageInput === "object") {
    fallbackKey =
      imageInput.original?.key ||
      (typeof imageInput.original === "string" ? imageInput.original : "") ||
      imageInput.key ||
      "";
    variants = imageInput.variants;
  }

  if (variants && typeof variants === "object") {
    let order = ["card", "thumbnail", "detail", "original"];
    if (variant === "thumbnail") order = ["thumbnail", "card", "detail", "original"];
    else if (variant === "card") order = ["card", "detail", "thumbnail", "original"];
    else if (variant === "detail") order = ["detail", "card", "thumbnail", "original"];
    else if (variant === "original") order = ["original", "detail", "card", "thumbnail"];

    for (const vName of order) {
      const val = variants[vName];
      // If variant is direct string key
      if (typeof val === "string" && val) {
        if (val.startsWith("http://") || val.startsWith("https://")) return val;
        return `${baseUrl}/${val.replace(/^\//, "")}`;
      }
      // If variant is raw array of objects
      if (Array.isArray(val) && val.length > 0) {
        let selected = null;
        if (useAvif) {
          selected =
            val.find((v) => v.format === "avif") ||
            val.find((v) => v.format === "webp");
        } else {
          selected =
            val.find((v) => v.format === "webp") ||
            val.find((v) => v.format === "jpg") ||
            val.find((v) => v.format === "png");
        }
        selected = selected || val[0];
        if (selected?.key) {
          return `${baseUrl}/${selected.key.replace(/^\//, "")}`;
        }
      }
    }
  }

  if (fallbackKey) {
    if (fallbackKey.startsWith("http://") || fallbackKey.startsWith("https://")) {
      return fallbackKey;
    }
    return `${baseUrl}/${fallbackKey.replace(/^\//, "")}`;
  }

  return "";
}
