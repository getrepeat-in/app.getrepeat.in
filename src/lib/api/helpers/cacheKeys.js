import { deleteCache, deleteCacheByPattern } from "@/services/backend/redis/cache.service";

export const getRestaurantCacheKey = (userId) => `restaurant:user:${userId}`;
export const getRestaurantDetailsCacheKey = (restaurantId) => `restaurant:details:${restaurantId}`;
export const getRestaurantSlugCacheKey = (slug) => `restaurant:slug:${slug}`;
export const getRestaurantIdSlugCacheKey = (slug) => `restaurant:slug:${slug}:id`;
export const getCategoriesCacheKey = (restaurantId) => `restaurant:categories:${restaurantId}`;
export const getItemsCacheKey = (restaurantId) => `restaurant:items:${restaurantId}`;
export const getRolesCacheKey = () => `restaurant:roles:all`;
export const getStaffCacheKey = (restaurantId, options = {}) => {
  const { status = "all", search = "", page = "", limit = "" } = options;
  return `restaurant:staff:${restaurantId}:${status || "all"}:${(search || "").trim().toLowerCase()}:${page || ""}:${limit || ""}`;
};
export const getUsersCacheKey = (restaurantId, options = {}) => {
  const { status = "all", search = "", page = "", limit = "" } = options;
  return `restaurant:users:${restaurantId}:${status || "all"}:${(search || "").trim().toLowerCase()}:${page || ""}:${limit || ""}`;
};

export const getUserProfileCacheKey = (userId) => `user:profile:${userId}`;
export const getInstagramPostsCacheKey = (restaurantId) => `restaurant:${restaurantId}:instagram:posts`;
export const getImageSearchCacheKey = (query, page, limit) => `image-search:${query.toLowerCase()}:${page}:${limit}`;
export const getAddonGroupsCacheKey = (restaurantId) => `restaurant:addon-groups:${restaurantId}`;
export const getTablesCacheKey = (restaurantId) => `restaurant:tables:${restaurantId}`;
export const getPromotionCacheKey = (restaurantId) => `restaurant:${restaurantId}:promotions`;
export const getMenuCacheKey = (restaurantId) => `restaurant:${restaurantId}:menu`;
export const getWebsiteConfigCacheKey = (restaurantId) => `restaurant:${restaurantId}:website-config`;

export const invalidateMenuCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCache(getMenuCacheKey(restaurantId));
    }
};

export const invalidateRestaurantCache = async (arg1, arg2, arg3) => {
    let userId, restaurantId, slugs;

    if (typeof arg1 === "object" && arg1 !== null && !Array.isArray(arg1)) {
        userId = arg1.userId;
        restaurantId = arg1.restaurantId;
        slugs = arg1.slugs ?? arg1.slug;
    } else {
        userId = arg1;
        restaurantId = arg2;
        slugs = arg3;
    }

    const tasks = [];

    if (userId) {
        tasks.push(deleteCache(getRestaurantCacheKey(userId)));
    }
    if (restaurantId) {
        tasks.push(deleteCache(getRestaurantDetailsCacheKey(restaurantId)));
    }
    if (slugs) {
        const slugList = Array.isArray(slugs) ? slugs : [slugs];
        const validSlugs = slugList.filter((s) => typeof s === "string" && s.trim());
        validSlugs.forEach((s) => {
            tasks.push(deleteCache(getRestaurantSlugCacheKey(s.trim())));
            tasks.push(deleteCache(getRestaurantIdSlugCacheKey(s.trim())));
        });
    }

    if (tasks.length > 0) {
        await Promise.all(tasks);
    }
};

export const invalidateCategoryCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCache(getCategoriesCacheKey(restaurantId));
        await invalidateMenuCache(restaurantId);
    }
};

export const invalidateItemCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCache(getItemsCacheKey(restaurantId));
        await invalidateMenuCache(restaurantId);
    }
};

export const invalidateRoleCache = async () => {
    await deleteCache(getRolesCacheKey());
};

export const invalidateStaffCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCacheByPattern(`restaurant:staff:${restaurantId}:*`);
        await deleteCache(`restaurant:staff:${restaurantId}`);
    }
};

export const invalidateUserCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCacheByPattern(`restaurant:users:${restaurantId}:*`);
        await deleteCache(`restaurant:users:${restaurantId}`);
    }
};

export const invalidateAddonGroupCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCache(getAddonGroupsCacheKey(restaurantId));
        await invalidateMenuCache(restaurantId);
    }
};

export const invalidateTableCache = async (restaurantId) => {
    if (restaurantId) await deleteCache(getTablesCacheKey(restaurantId));
};

export const invalidateOrderCache = async (restaurantId) => {
    if (restaurantId) await deleteCacheByPattern(`restaurant:${restaurantId}:orders:*`);
};

export const invalidatePromotionCache = async (restaurantId) => {
    if (restaurantId) {
        const baseKey = getPromotionCacheKey(restaurantId);
        await deleteCache(baseKey);
        await deleteCache(`${baseKey}:status:ACTIVE`);
        await deleteCache(`${baseKey}:status:INACTIVE`);
        
        await deleteCacheByPattern(`${baseKey}*`);
        await invalidateMenuCache(restaurantId);
    }
};

export const invalidateWebsiteConfigCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCache(getWebsiteConfigCacheKey(restaurantId));
    }
};