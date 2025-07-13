import session from 'express-session';
import { cacheService } from './cache';

// Memory store fallback for development
const MemoryStore = require('memorystore')(session);

// Try to import connect-redis, fallback if not available
let RedisStore: any = null;
try {
  const connectRedis = require('connect-redis');
  RedisStore = connectRedis(session);
} catch (error) {
  console.warn('connect-redis not available, using memory store');
}

export function createSessionStore() {
  // Try to use Redis store if available
  if (RedisStore && (process.env.REDIS_HOST || process.env.REDIS_URL)) {
    try {
      return new RedisStore({
        client: cacheService['redis'], // Access the Redis client
        prefix: 'sess:',
        ttl: 24 * 60 * 60, // 24 hours
        logErrors: (error: Error) => {
          console.error('Redis session store error:', error);
        }
      });
    } catch (error) {
      console.warn('Failed to create Redis session store, falling back to memory store:', error);
    }
  }
  
  // Fallback to memory store
  console.info('Using memory session store');
  return new MemoryStore({
    checkPeriod: 86400000, // Prune expired entries every 24h
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    stale: false
  });
}

export const sessionConfig = {
  store: createSessionStore(),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'legal-ai-session',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },
  rolling: true // Reset expiry on each request
};

// Session-based caching utilities
export class SessionCache {
  static async get(sessionId: string, key: string): Promise<any> {
    try {
      const cacheKey = `sess:${sessionId}:${key}`;
      const cached = await cacheService.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Session cache get error:', error);
      return null;
    }
  }

  static async set(sessionId: string, key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const cacheKey = `sess:${sessionId}:${key}`;
      await cacheService.set(cacheKey, JSON.stringify(value), ttl);
    } catch (error) {
      console.error('Session cache set error:', error);
    }
  }

  static async del(sessionId: string, key: string): Promise<void> {
    try {
      const cacheKey = `sess:${sessionId}:${key}`;
      await cacheService.del(cacheKey);
    } catch (error) {
      console.error('Session cache delete error:', error);
    }
  }

  static async clear(sessionId: string): Promise<void> {
    try {
      const pattern = `sess:${sessionId}:*`;
      const keys = await cacheService.keys(pattern);
      
      for (const key of keys) {
        await cacheService.del(key);
      }
    } catch (error) {
      console.error('Session cache clear error:', error);
    }
  }
}

// Rate limiting with Redis
export class RateLimiter {
  private prefix: string;
  private windowMs: number;
  private maxRequests: number;

  constructor(prefix: string, windowMs: number, maxRequests: number) {
    this.prefix = prefix;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    const window = Math.floor(now / this.windowMs);
    const windowKey = `${key}:${window}`;

    try {
      const current = await cacheService.get(windowKey);
      const count = current ? parseInt(current) : 0;
      
      if (count >= this.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (window + 1) * this.windowMs
        };
      }

      // Increment counter
      const newCount = count + 1;
      await cacheService.set(windowKey, newCount.toString(), Math.ceil(this.windowMs / 1000));

      return {
        allowed: true,
        remaining: this.maxRequests - newCount,
        resetTime: (window + 1) * this.windowMs
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Allow request on error to prevent blocking
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }
  }
}

// Create rate limiters for different endpoints
export const rateLimiters = {
  api: new RateLimiter('api', 60000, 100), // 100 requests per minute
  auth: new RateLimiter('auth', 300000, 5), // 5 requests per 5 minutes
  upload: new RateLimiter('upload', 3600000, 20), // 20 requests per hour
  export: new RateLimiter('export', 3600000, 10) // 10 requests per hour
};

// User session management
export class UserSession {
  static async create(userId: string, sessionData: any): Promise<string> {
    const sessionId = `user:${userId}:${Date.now()}`;
    
    try {
      await cacheService.set(sessionId, JSON.stringify(sessionData), 24 * 60 * 60); // 24 hours
      console.info(`Session created for user ${userId}`);
      return sessionId;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  static async get(sessionId: string): Promise<any> {
    try {
      const data = await cacheService.get(sessionId);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Session get error:', error);
      return null;
    }
  }

  static async update(sessionId: string, updates: any): Promise<void> {
    try {
      const existing = await this.get(sessionId);
      if (existing) {
        const updated = { ...existing, ...updates };
        await cacheService.set(sessionId, JSON.stringify(updated), 24 * 60 * 60);
      }
    } catch (error) {
      console.error('Session update error:', error);
    }
  }

  static async destroy(sessionId: string): Promise<void> {
    try {
      await cacheService.del(sessionId);
      console.info(`Session ${sessionId} destroyed`);
    } catch (error) {
      console.error('Session destroy error:', error);
    }
  }

  static async cleanup(): Promise<void> {
    try {
      const keys = await cacheService.keys('user:*');
      let cleaned = 0;
      
      for (const key of keys) {
        const exists = await cacheService.exists(key);
        if (!exists) {
          await cacheService.del(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.info(`Cleaned up ${cleaned} expired sessions`);
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }
}

// Start session cleanup interval
setInterval(() => {
  UserSession.cleanup();
}, 60000); // Run every minute