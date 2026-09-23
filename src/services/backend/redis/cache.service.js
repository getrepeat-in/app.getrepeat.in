import redisClient, { connectRedis } from "@/lib/redis.js";

export const getCache = async (key) => {
  try {
    await connectRedis();
    if (!redisClient.isOpen) return null;
    
    const data = await redisClient.get(key);
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(`Redis GET error [${key}]:`, error.message || error);
    return null;
  }
};

export const setCache = async (key, value, ttl = 300) => {
  try {
    await connectRedis();
    if (!redisClient.isOpen) return;

    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (error) {
    console.error(`Redis SET error [${key}]:`, error.message || error);
  }
};

export const deleteCache = async (key) => {
  try {
    await connectRedis();
    if (!redisClient.isOpen) return;

    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis DELETE error [${key}]:`, error.message || error);
  }
};

export const deleteCacheByPattern = async (pattern) => {
  try {
    await connectRedis();
    if (!redisClient.isOpen) return;

    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error(`Redis pattern delete error [${pattern}]:`, error.message || error);
  }
};

export const getOrSetCache = async (key, fetcherFn, ttl = 300) => {
  const cached = await getCache(key);
  if (cached !== null && cached !== undefined) {
    return { data: cached, isCached: true };
  }

  const freshData = await fetcherFn();
  if (freshData !== null && freshData !== undefined) {
    await setCache(key, freshData, ttl);
  }

  return { data: freshData, isCached: false };
};