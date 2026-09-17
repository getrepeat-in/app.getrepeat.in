import { deleteCache, deleteCacheByPattern } from "@/services/backend/redis/cache.service";

export const getRestaurantCacheKey = (userId) => `restaurant:user:${userId}`;
export const getRestaurantDetailsCacheKey = (restaurantId) => `restaurant:details:${restaurantId}`;
export const getCategoriesCacheKey = (restaurantId) => `restaurant:categories:${restaurantId}`;
export const getItemsCacheKey = (restaurantId) => `restaurant:items:${restaurantId}`;
export const getRolesCacheKey = () => `restaurant:roles:all`;
export const getStaffCacheKey = (restaurantId) => `restaurant:staff:${restaurantId}`;
export const getUsersCacheKey = (restaurantId) => `restaurant:users:${restaurantId}`;
export const getAddonGroupsCacheKey = (restaurantId) => `restaurant:addon-groups:${restaurantId}`;
export const getTablesCacheKey = (restaurantId) => `restaurant:tables:${restaurantId}`;
export const getPromotionCacheKey = (restaurantId) => `restaurant:${restaurantId}:promotions`;

export const getMenuCacheKey = (restaurantId) => `restaurant:${restaurantId}:menu`;
export const getMenuSlugCacheKey = (slug) => `restaurant:slug:${slug}:menu`;

export const invalidateMenuCache = async (restaurantId) => {
    if (restaurantId) {
        await deleteCache(getMenuCacheKey(restaurantId));
    }
    await deleteCacheByPattern("restaurant:slug:*:menu");
};

export const invalidateRestaurantCache = async (userId, restaurantId) => {
    if (userId) await deleteCache(getRestaurantCacheKey(userId));
    if (restaurantId) await deleteCache(getRestaurantDetailsCacheKey(restaurantId));
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
    if (restaurantId) await deleteCache(getStaffCacheKey(restaurantId));
};

export const invalidateUserCache = async (restaurantId) => {
    if (restaurantId) await deleteCache(getUsersCacheKey(restaurantId));
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
        await deleteCacheByPattern(`${getPromotionCacheKey(restaurantId)}*`);
        await invalidateMenuCache(restaurantId);
    }
};

