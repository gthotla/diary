import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

const createRedisClient = () => {
  try {
    const client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    client.on('connect', () => {
      logger.info('✅ Connected to Redis server');
    });

    client.on('error', (error) => {
      logger.error('❌ Redis connection error:', error);
    });

    client.on('ready', () => {
      logger.info('🚀 Redis client ready');
    });

    client.on('close', () => {
      logger.warn('⚠️  Redis connection closed');
    });

    return client;
  } catch (error) {
    logger.error('❌ Failed to create Redis client:', error);
    return null;
  }
};

export const initializeRedis = async () => {
  try {
    redisClient = createRedisClient();
    
    if (redisClient) {
      await redisClient.ping();
      logger.info('🎯 Redis initialized successfully');
      return true;
    }
    
    logger.warn('⚠️  Redis not available - caching will be disabled');
    return false;
  } catch (error) {
    logger.error('❌ Redis initialization failed:', error);
    redisClient = null;
    return false;
  }
};

export const getRedisClient = () => {
  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('👋 Redis connection closed gracefully');
    } catch (error) {
      logger.error('❌ Error closing Redis connection:', error);
    }
    redisClient = null;
  }
};

export const isRedisAvailable = () => {
  return redisClient !== null && redisClient.status === 'ready';
};

export default {
  initializeRedis,
  getRedisClient,
  closeRedisConnection,
  isRedisAvailable
};
