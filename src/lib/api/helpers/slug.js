export function normalizeSlug(slug) {
  if (!slug || typeof slug !== "string") return "";
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")      
    .replace(/-+/g, "-")          
    .replace(/^-+|-+$/g, "");    
}

export function isDuplicateSlugError(error) {
  return error?.code === 11000 && Boolean(error?.keyPattern?.slug);
}
