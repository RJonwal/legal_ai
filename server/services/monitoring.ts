import * as Sentry from '@sentry/node';
import { logger } from './simple-logger';
import { cacheService } from './cache';
import { Request, Response } from 'express';

// Initialize Sentry for error tracking
export function initializeSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        // Enable HTTP instrumentation
        new Sentry.Integrations.Http({ tracing: true }),
        // Enable Express.js instrumentation
        new Sentry.Integrations.Express({ app: true }),
      ],
      beforeSend(event, hint) {
        // Filter out certain errors in development
        if (process.env.NODE_ENV === 'development') {
          const error = hint.originalException;
          if (error && error.message?.includes('ECONNREFUSED')) {
            return null; // Don't send Redis connection errors in development
          }
        }
        return event;
      }
    });
    
    logger.info('Sentry initialized for error tracking');
  } else {
    logger.warn('SENTRY_DSN not provided, error tracking disabled');
  }
}

// Metrics storage
interface MetricsData {
  requests: { [key: string]: number };
  errors: { [key: string]: number };
  responseTime: { [key: string]: number[] };
  memory: number[];
  cpu: number[];
  timestamp: number;
}

class MetricsService {
  private metrics: MetricsData = {
    requests: {},
    errors: {},
    responseTime: {},
    memory: [],
    cpu: [],
    timestamp: Date.now()
  };

  // Track request metrics
  trackRequest(method: string, path: string, statusCode: number, responseTime: number) {
    const key = `${method} ${path}`;
    
    // Track request count
    this.metrics.requests[key] = (this.metrics.requests[key] || 0) + 1;
    
    // Track errors
    if (statusCode >= 400) {
      this.metrics.errors[key] = (this.metrics.errors[key] || 0) + 1;
    }
    
    // Track response time
    if (!this.metrics.responseTime[key]) {
      this.metrics.responseTime[key] = [];
    }
    this.metrics.responseTime[key].push(responseTime);
    
    // Keep only last 100 response times per endpoint
    if (this.metrics.responseTime[key].length > 100) {
      this.metrics.responseTime[key] = this.metrics.responseTime[key].slice(-100);
    }
  }

  // Track system metrics
  trackSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memory.push(memoryUsage.heapUsed);
    this.metrics.cpu.push(cpuUsage.user + cpuUsage.system);
    
    // Keep only last 60 measurements (1 hour if collected every minute)
    if (this.metrics.memory.length > 60) {
      this.metrics.memory = this.metrics.memory.slice(-60);
    }
    if (this.metrics.cpu.length > 60) {
      this.metrics.cpu = this.metrics.cpu.slice(-60);
    }
  }

  // Get metrics summary
  getMetrics() {
    return {
      ...this.metrics,
      summary: {
        totalRequests: Object.values(this.metrics.requests).reduce((a, b) => a + b, 0),
        totalErrors: Object.values(this.metrics.errors).reduce((a, b) => a + b, 0),
        averageResponseTime: this.calculateAverageResponseTime(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };
  }

  private calculateAverageResponseTime(): number {
    const allResponseTimes = Object.values(this.metrics.responseTime).flat();
    return allResponseTimes.length > 0 
      ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length 
      : 0;
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requests: {},
      errors: {},
      responseTime: {},
      memory: [],
      cpu: [],
      timestamp: Date.now()
    };
  }
}

export const metricsService = new MetricsService();

// Health check service
export class HealthCheckService {
  private checks: { [key: string]: () => Promise<boolean> } = {};

  registerCheck(name: string, check: () => Promise<boolean>) {
    this.checks[name] = check;
  }

  async runHealthChecks(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [name, check] of Object.entries(this.checks)) {
      try {
        results[name] = await check();
      } catch (error) {
        logger.error(`Health check failed for ${name}:`, error);
        results[name] = false;
      }
    }
    
    return results;
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    checks: { [key: string]: boolean };
    timestamp: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
  }> {
    const checks = await this.runHealthChecks();
    const healthyChecks = Object.values(checks).filter(check => check).length;
    const totalChecks = Object.values(checks).length;
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (healthyChecks === 0) {
      status = 'unhealthy';
    } else if (healthyChecks < totalChecks) {
      status = 'degraded';
    }
    
    return {
      status,
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

export const healthCheckService = new HealthCheckService();

// Register default health checks
healthCheckService.registerCheck('database', async () => {
  try {
    // Simple database check - in a real app, this would ping the database
    return true;
  } catch (error) {
    return false;
  }
});

healthCheckService.registerCheck('redis', async () => {
  return cacheService.isHealthy();
});

healthCheckService.registerCheck('memory', async () => {
  const memoryUsage = process.memoryUsage();
  const maxMemory = 1024 * 1024 * 1024; // 1GB
  return memoryUsage.heapUsed < maxMemory;
});

healthCheckService.registerCheck('disk', async () => {
  try {
    const fs = require('fs');
    const stats = fs.statSync(process.cwd());
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
});

// Performance monitoring middleware
export function performanceMiddleware(req: Request, res: Response, next: Function) {
  const startTime = Date.now();
  
  // Track the response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metricsService.trackRequest(req.method, req.path, res.statusCode, duration);
    
    // Log slow requests
    if (duration > 1000) { // 1 second threshold
      logger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
}

// Start system metrics collection
export function startSystemMetricsCollection() {
  setInterval(() => {
    metricsService.trackSystemMetrics();
  }, 60000); // Collect every minute
  
  logger.info('System metrics collection started');
}

// Graceful shutdown handler
export function setupGracefulShutdown() {
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    // Close Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.close(2000);
    }
    
    // Close cache connection
    cacheService.disconnect().then(() => {
      logger.info('Cache connection closed');
    }).catch((error) => {
      logger.error('Error closing cache connection:', error);
    });
    
    // Exit process
    setTimeout(() => {
      logger.info('Graceful shutdown completed');
      process.exit(0);
    }, 1000);
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Export Sentry for request handlers
export { Sentry };