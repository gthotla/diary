import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';
import Diary from '../models/diary.js';

const CACHE_PREFIX = 'recent_entries:';
const CACHE_DURATION = 5 * 60; // 5 minutes in seconds

export const getRecentEntriesCache = async (userId, limit = 5) => {
  if (!isRedisAvailable()) {
    logger.warn('Redis not available, skipping cache lookup');
    return null;
  }

  const redisClient = getRedisClient();
  const cacheKey = `${CACHE_PREFIX}${userId}:${limit}`;
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      logger.info(`✅ Cache hit for user ${userId} recent entries`);
      return JSON.parse(cachedData);
    }
    
    logger.info(`❌ Cache miss for user ${userId} recent entries`);
    return null;
  } catch (error) {
    logger.error('❌ Error reading from cache:', error);
    return null;
  }
};

export const setRecentEntriesCache = async (userId, entries, limit = 5) => {
  if (!isRedisAvailable()) {
    logger.warn('Redis not available, skipping cache update');
    return false;
  }

  const redisClient = getRedisClient();
  const cacheKey = `${CACHE_PREFIX}${userId}:${limit}`;
  
  try {
    await redisClient.setex(cacheKey, CACHE_DURATION, JSON.stringify(entries));
    logger.info(`✅ Cached recent entries for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('❌ Error writing to cache:', error);
    return false;
  }
};

export const invalidateRecentEntriesCache = async (userId) => {
  if (!isRedisAvailable()) {
    return false;
  }

  const redisClient = getRedisClient();
  
  try {
    // Delete all cached recent entries for this user (different limits)
    const pattern = `${CACHE_PREFIX}${userId}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info(`✅ Invalidated recent entries cache for user ${userId}`);
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Error invalidating cache:', error);
    return false;
  }
};

export const getRecentEntries = async (userId, limit = 5) => {
  try {
    // Try to get from cache first
    const cachedEntries = await getRecentEntriesCache(userId, limit);
    if (cachedEntries) {
      return {
        success: true,
        entries: cachedEntries,
        fromCache: true
      };
    }

    // Cache miss - fetch from database
    logger.info(`📊 Fetching recent entries from database for user ${userId}`);
    
    const entries = await Diary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Cache the results
    await setRecentEntriesCache(userId, entries, limit);

    return {
      success: true,
      entries,
      fromCache: false
    };
  } catch (error) {
    logger.error('❌ Error fetching recent entries:', error);
    return {
      success: false,
      error: error.message,
      entries: []
    };
  }
};

export const refreshRecentEntriesCache = async (userId) => {
  try {
    // Invalidate existing cache
    await invalidateRecentEntriesCache(userId);
    
    // Pre-populate cache with fresh data
    const result = await getRecentEntries(userId, 5);
    
    if (result.success) {
      logger.info(`🔄 Refreshed recent entries cache for user ${userId}`);
    }
    
    return result.success;
  } catch (error) {
    logger.error('❌ Error refreshing cache:', error);
    return false;
  }
};

export default {
  getRecentEntries,
  getRecentEntriesCache,
  setRecentEntriesCache,
  invalidateRecentEntriesCache,
  refreshRecentEntriesCache
};
