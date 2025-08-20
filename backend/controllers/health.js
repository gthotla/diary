import mongoose from 'mongoose';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import os from 'os';

// Basic health check - lightweight for load balancers
export const basicHealth = async (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Detailed health status - comprehensive system checks
export const detailedHealth = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        mongodb: 'unknown',
        redis: 'unknown'
      },
      system: {
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((os.totalmem() / 1024 / 1024) * 100) / 100,
          free: Math.round((os.freemem() / 1024 / 1024) * 100) / 100
        },
        cpu: os.loadavg(),
        platform: os.platform(),
        version: process.version
      }
    };

    // Check MongoDB connection
    try {
      const mongoState = mongoose.connection.readyState;
      health.services.mongodb = mongoState === 1 ? 'healthy' : 
                               mongoState === 2 ? 'connecting' : 
                               mongoState === 3 ? 'disconnecting' : 'disconnected';
    } catch (error) {
      health.services.mongodb = 'error';
      health.services.mongoError = error.message;
    }

    // Check Redis connection
    try {
      const redis = getRedisClient();
      if (redis && redis.status === 'ready') {
        await redis.ping();
        health.services.redis = 'healthy';
      } else if (redis && redis.status === 'connecting') {
        health.services.redis = 'connecting';
      } else if (redis === null) {
        health.services.redis = 'unavailable';
      } else {
        health.services.redis = 'disconnected';
      }
    } catch (error) {
      health.services.redis = 'error';
      health.services.redisError = error.message;
    }

    // Determine overall status
    const hasErrors = health.services.mongodb === 'error' || 
                     health.services.redis === 'error' ||
                     health.services.mongodb === 'disconnected';
    
    if (hasErrors) {
      health.status = 'degraded';
      return res.status(503).json(health);
    }

    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Readiness probe - for Kubernetes/Docker deployments
export const readinessProbe = async (req, res) => {
  try {
    // Check if all critical services are ready
    const checks = [];

    // MongoDB readiness
    checks.push(
      new Promise((resolve) => {
        const mongoState = mongoose.connection.readyState;
        resolve({
          service: 'mongodb',
          ready: mongoState === 1,
          state: mongoState === 1 ? 'connected' : 
                 mongoState === 2 ? 'connecting' : 
                 mongoState === 3 ? 'disconnecting' : 'disconnected'
        });
      })
    );

    // Redis readiness
    checks.push(
      new Promise(async (resolve) => {
        try {
          const redis = getRedisClient();
          if (redis && redis.status === 'ready') {
            await redis.ping();
            resolve({ service: 'redis', ready: true, state: 'connected' });
          } else if (redis === null) {
            resolve({ service: 'redis', ready: false, state: 'unavailable' });
          } else {
            resolve({ service: 'redis', ready: false, state: redis.status });
          }
        } catch (error) {
          resolve({ service: 'redis', ready: false, state: 'error', error: error.message });
        }
      })
    );

    const results = await Promise.all(checks);
    const allReady = results.every(result => result.ready);

    const response = {
      ready: allReady,
      timestamp: new Date().toISOString(),
      services: results
    };

    res.status(allReady ? 200 : 503).json(response);
  } catch (error) {
    res.status(500).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Liveness probe - for Kubernetes/Docker deployments
export const livenessProbe = async (req, res) => {
  try {
    // Simple liveness check - is the process running and responsive?
    const isAlive = process.uptime() > 0;
    
    if (isAlive) {
      res.status(200).json({
        alive: true,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        pid: process.pid
      });
    } else {
      res.status(500).json({
        alive: false,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      alive: false,
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};
