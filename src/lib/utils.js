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
    if (/^[0-9a-fA-F]{24}$/.test(imageInput.trim())) {
      return "";
    }
    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
    const region = process.env.NEXT_PUBLIC_AWS_REGION;
    const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;
    return `${baseUrl}/${imageInput.replace(/^\//, "")}`;
  }

  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`;

  if (typeof imageInput === "object") {
    const directUrl = imageInput.imageUrl || imageInput.image_url || imageInput.url;
    if (typeof directUrl === "string" && (directUrl.startsWith("http://") || directUrl.startsWith("https://"))) {
      return directUrl;
    }
  }

  let variants = null;
  let fallbackKey = "";

  if (imageInput && typeof imageInput === "object") {
    let order = ["card", "thumbnail", "detail", "original"];
    if (variant === "thumbnail") order = ["thumbnail", "card", "detail", "original"];
    else if (variant === "card") order = ["card", "detail", "thumbnail", "original"];
    else if (variant === "detail") order = ["detail", "card", "thumbnail", "original"];
    else if (variant === "original") order = ["original", "detail", "card", "thumbnail"];

    for (const vName of order) {
      const val = imageInput[vName];
      if (typeof val === "string" && val && !/^[0-9a-fA-F]{24}$/.test(val.trim())) {
        if (val.startsWith("http://") || val.startsWith("https://")) return val;
        return `${baseUrl}/${val.replace(/^\//, "")}`;
      }
    }

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
      if (typeof val === "string" && val && !/^[0-9a-fA-F]{24}$/.test(val.trim())) {
        if (val.startsWith("http://") || val.startsWith("https://")) return val;
        return `${baseUrl}/${val.replace(/^\//, "")}`;
      }
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
        if (selected?.key && !/^[0-9a-fA-F]{24}$/.test(selected.key.trim())) {
          return `${baseUrl}/${selected.key.replace(/^\//, "")}`;
        }
      }
    }
  }

  if (fallbackKey && !/^[0-9a-fA-F]{24}$/.test(fallbackKey.trim())) {
    if (fallbackKey.startsWith("http://") || fallbackKey.startsWith("https://")) {
      return fallbackKey;
    }
    return `${baseUrl}/${fallbackKey.replace(/^\//, "")}`;
  }

  return "";
}
