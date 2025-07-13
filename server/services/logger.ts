import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'white',
  debug: 'cyan',
  silly: 'grey'
};

winston.addColors(colors);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    let logEntry = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      logEntry += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logEntry += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logEntry;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    let logEntry = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      logEntry += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logEntry += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logEntry;
  })
);

// Create transports based on environment
const transports: winston.transport[] = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      level: 'info',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

// Always add console transport for production errors
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'error',
      format: consoleFormat,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      format: logFormat 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      format: logFormat 
    })
  ],
  exitOnError: false,
});

// Stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Structured logging helpers
export const structuredLogger = {
  // Authentication events
  auth: {
    login: (userId: string, ip: string, userAgent: string) => {
      logger.info('User login', {
        event: 'auth.login',
        userId,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });
    },
    logout: (userId: string, ip: string) => {
      logger.info('User logout', {
        event: 'auth.logout',
        userId,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    failed: (email: string, ip: string, reason: string) => {
      logger.warn('Failed login attempt', {
        event: 'auth.failed',
        email,
        ip,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  },

  // API events
  api: {
    request: (method: string, path: string, userId?: string, ip?: string) => {
      logger.http('API request', {
        event: 'api.request',
        method,
        path,
        userId,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    response: (method: string, path: string, statusCode: number, duration: number, userId?: string) => {
      logger.http('API response', {
        event: 'api.response',
        method,
        path,
        statusCode,
        duration,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    error: (method: string, path: string, error: Error, userId?: string) => {
      logger.error('API error', {
        event: 'api.error',
        method,
        path,
        error: error.message,
        stack: error.stack,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Database events
  database: {
    query: (query: string, duration: number, userId?: string) => {
      logger.debug('Database query', {
        event: 'database.query',
        query,
        duration,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    error: (query: string, error: Error, userId?: string) => {
      logger.error('Database error', {
        event: 'database.error',
        query,
        error: error.message,
        stack: error.stack,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Security events
  security: {
    rateLimit: (ip: string, path: string) => {
      logger.warn('Rate limit exceeded', {
        event: 'security.rateLimit',
        ip,
        path,
        timestamp: new Date().toISOString()
      });
    },
    suspiciousActivity: (ip: string, activity: string, details: any) => {
      logger.warn('Suspicious activity detected', {
        event: 'security.suspicious',
        ip,
        activity,
        details,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Performance events
  performance: {
    slow: (operation: string, duration: number, threshold: number) => {
      logger.warn('Slow operation detected', {
        event: 'performance.slow',
        operation,
        duration,
        threshold,
        timestamp: new Date().toISOString()
      });
    },
    memory: (usage: NodeJS.MemoryUsage) => {
      logger.info('Memory usage', {
        event: 'performance.memory',
        usage,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Ensure logs directory exists
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;