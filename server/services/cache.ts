import Redis from 'ioredis';
import { logger } from './simple-logger';

export class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    // Only try to connect to Redis if explicitly configured
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        commandTimeout: 1000,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.isConnected = false;
        // Only log once, not continuously
        if (!this.errorLogged) {
          logger.warn('Redis not available, using memory fallback');
          this.errorLogged = true;
        }
      });

      this.redis.on('close', () => {
        this.isConnected = false;
      });
    } else {
      logger.info('Redis not configured, using memory cache');
    }
  }

  private errorLogged = false;

  async connect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.connect();
      } catch (error) {
        if (!this.errorLogged) {
          logger.warn('Redis connection failed, using memory fallback');
          this.errorLogged = true;
        }
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis && this.isConnected) {
      await this.redis.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis || !this.isConnected) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redis || !this.isConnected) return;
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      // Silent fail for caching
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis || !this.isConnected) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      // Silent fail for caching
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false;
    try {
      return (await this.redis.exists(key)) === 1;
    } catch (error) {
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.redis || !this.isConnected) return [];
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      return [];
    }
  }

  async flushAll(): Promise<void> {
    if (!this.redis || !this.isConnected) return;
    try {
      await this.redis.flushall();
    } catch (error) {
      // Silent fail for caching
    }
  }

  async getStats(): Promise<any> {
    if (!this.redis || !this.isConnected) return { connected: false };
    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      
      return {
        connected: true,
        memory: info,
        stats: stats,
        keyCount: await this.redis.dbsize()
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  isHealthy(): boolean {
    return this.redis && this.isConnected;
  }
}

export const cacheService = new CacheService();