import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';
import Diary from '../models/diary.js';
import Todo from '../models/todo.js';

const STATS_CACHE_PREFIX = 'user_stats:';
const STATS_CACHE_DURATION = 10 * 60; // 10 minutes in seconds

export const getUserStatsCache = async (userId) => {
  if (!isRedisAvailable()) {
    logger.warn('Redis not available, skipping stats cache lookup');
    return null;
  }

  const redisClient = getRedisClient();
  const cacheKey = `${STATS_CACHE_PREFIX}${userId}`;
  
  try {
    const cachedStats = await redisClient.get(cacheKey);
    
    if (cachedStats) {
      logger.info(`✅ Stats cache hit for user ${userId}`);
      return JSON.parse(cachedStats);
    }
    
    logger.info(`❌ Stats cache miss for user ${userId}`);
    return null;
  } catch (error) {
    logger.error('❌ Error reading stats from cache:', error);
    return null;
  }
};

export const setUserStatsCache = async (userId, stats) => {
  if (!isRedisAvailable()) {
    logger.warn('Redis not available, skipping stats cache update');
    return false;
  }

  const redisClient = getRedisClient();
  const cacheKey = `${STATS_CACHE_PREFIX}${userId}`;
  
  try {
    await redisClient.setex(cacheKey, STATS_CACHE_DURATION, JSON.stringify(stats));
    logger.info(`✅ Cached user stats for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('❌ Error writing stats to cache:', error);
    return false;
  }
};

export const invalidateUserStatsCache = async (userId) => {
  if (!isRedisAvailable()) {
    return false;
  }

  const redisClient = getRedisClient();
  const cacheKey = `${STATS_CACHE_PREFIX}${userId}`;
  
  try {
    await redisClient.del(cacheKey);
    logger.info(`✅ Invalidated user stats cache for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('❌ Error invalidating stats cache:', error);
    return false;
  }
};

export const getUserStats = async (userId) => {
  try {
    // Try to get from cache first
    const cachedStats = await getUserStatsCache(userId);
    if (cachedStats) {
      return {
        success: true,
        stats: cachedStats,
        fromCache: true
      };
    }

    // Cache miss - calculate from database
    logger.info(`📊 Calculating user stats from database for user ${userId}`);
    
    const [totalEntries, totalTodos, completedTodos, todayEntries] = await Promise.all([
      Diary.countDocuments({ userId }),
      Todo.countDocuments({ userId }),
      Todo.countDocuments({ userId, status: 'completed' }),
      Diary.countDocuments({ 
        userId, 
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    // Calculate streak days (simplified - consecutive days with entries)
    const streakDays = await calculateStreakDays(userId);

    const stats = {
      totalEntries,
      totalTodos,
      completedTodos,
      pendingTodos: totalTodos - completedTodos,
      todayEntries,
      streakDays,
      completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
      lastUpdated: new Date().toISOString()
    };

    // Cache the results
    await setUserStatsCache(userId, stats);

    return {
      success: true,
      stats,
      fromCache: false
    };
  } catch (error) {
    logger.error('❌ Error fetching user stats:', error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalEntries: 0,
        totalTodos: 0,
        completedTodos: 0,
        pendingTodos: 0,
        todayEntries: 0,
        streakDays: 0,
        completionRate: 0
      }
    };
  }
};

const calculateStreakDays = async (userId) => {
  try {
    // Get distinct dates for the user's entries, sorted by date descending
    const distinctDates = await Diary.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 365 } // Limit to last year for performance
    ]);

    if (distinctDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dateEntry of distinctDates) {
      const entryDate = new Date(dateEntry._id);
      const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        // Gap in entries, streak is broken
        break;
      }
    }

    return streak;
  } catch (error) {
    logger.error('❌ Error calculating streak days:', error);
    return 0;
  }
};

export const refreshUserStatsCache = async (userId) => {
  try {
    // Invalidate existing cache
    await invalidateUserStatsCache(userId);
    
    // Pre-populate cache with fresh data
    const result = await getUserStats(userId);
    
    if (result.success) {
      logger.info(`🔄 Refreshed user stats cache for user ${userId}`);
    }
    
    return result.success;
  } catch (error) {
    logger.error('❌ Error refreshing stats cache:', error);
    return false;
  }
};

export default {
  getUserStats,
  getUserStatsCache,
  setUserStatsCache,
  invalidateUserStatsCache,
  refreshUserStatsCache
};
