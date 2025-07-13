import Redis from 'ioredis';
import { logger } from './logger';

export class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      commandTimeout: 5000,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      // Continue without Redis for development
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.redis.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (!this.isConnected) return null;
      return await this.redis.get(key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (!this.isConnected) return;
      
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.isConnected) return;
      await this.redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      return (await this.redis.exists(key)) === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      if (!this.isConnected) return [];
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error('Cache keys error:', error);
      return [];
    }
  }

  async flushAll(): Promise<void> {
    try {
      if (!this.isConnected) return;
      await this.redis.flushall();
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  async getStats(): Promise<any> {
    try {
      if (!this.isConnected) return { connected: false };
      
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      
      return {
        connected: true,
        memory: info,
        stats: stats,
        keyCount: await this.redis.dbsize()
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

export const cacheService = new CacheService();