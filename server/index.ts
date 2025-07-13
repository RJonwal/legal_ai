import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityMiddleware } from "./services/encryption";
import { logger, httpLogStream } from "./services/simple-logger";
import { cacheService } from "./services/cache";
import { 
  initializeSentry, 
  performanceMiddleware, 
  startSystemMetricsCollection, 
  setupGracefulShutdown,
  Sentry
} from "./services/monitoring";
import { sessionConfig } from "./services/session";
import { pool } from "./db";
import session from "express-session";
import morgan from "morgan";
import responseTime from "response-time";
import helmet from "helmet";

const app = express();

// Initialize monitoring services (non-blocking)
try {
  initializeSentry();
  setupGracefulShutdown();
  startSystemMetricsCollection();
} catch (error) {
  logger.error('Failed to initialize monitoring services:', error);
}

// Initialize cache service (non-blocking)
cacheService.connect().catch((error) => {
  logger.error('Failed to connect to cache service:', error);
});

// Sentry request handler (must be first)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Add security middleware
app.use(securityMiddleware.addSecurityHeaders);
app.use(securityMiddleware.rateLimit);

// Performance monitoring
app.use(responseTime());
app.use(performanceMiddleware);

// HTTP logging
app.use(morgan('combined', { stream: httpLogStream }));

// Session management (with error handling)
try {
  app.use(session(sessionConfig));
} catch (error) {
  logger.error('Failed to initialize session middleware:', error);
  // Use basic session fallback
  app.use((req, res, next) => {
    req.session = req.session || {};
    next();
  });
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Enhanced process-level error handling with structured logging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Report to Sentry if configured
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });

  // Report to Sentry if configured
  if (process.env.SENTRY_DSN && reason instanceof Error) {
    Sentry.captureException(reason);
  }
});

// Handle memory pressure
process.on('warning', (warning) => {
  logger.warn('Node.js Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
    timestamp: new Date().toISOString()
  });
});

// Memory leak prevention
setInterval(() => {
  if (global.gc) {
    global.gc();
  }
}, 60000); // Run garbage collection every minute

// Note: Graceful shutdown is handled by monitoring service

// Global error handlers with better logging
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Report to Sentry if configured
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
  
  // Don't exit immediately in development
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 1000); // Give time for logging
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
    timestamp: new Date().toISOString()
  });
  
  // Report to Sentry if configured
  if (process.env.SENTRY_DSN && reason instanceof Error) {
    Sentry.captureException(reason);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  // Close server and database connections
  if (pool) {
    pool.end().then(() => {
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  // Close server and database connections
  if (pool) {
    pool.end().then(() => {
      process.exit(0);
    }).catch(() => {
      process.exit(1);
    });
  } else {
    process.exit(0);
  }
});

// Add global error handler as Express middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Express error handler caught:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Don't crash the server - just return an error response
  if (!res.headersSent) {
    res.status(500).json({
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log detailed error information
      console.error("Server error:", {
        message: err.message,
        stack: err.stack,
        url: _req.url,
        method: _req.method,
        timestamp: new Date().toISOString()
      });

      // Only send response if not already sent
      if (!res.headersSent) {
        try {
          res.status(status).json({ 
            message,
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
          });
        } catch (responseError) {
          console.error("Error sending error response:", responseError);
        }
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      try {
        await setupVite(app, server);
      } catch (viteError) {
        console.error("Vite setup error:", viteError);
        // Continue without Vite if it fails
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

    server.on('error', (error) => {
      console.error('Server error:', error);
      // Don't exit - just log the error
    });

    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Don't exit - attempt to recover
    setTimeout(() => {
      log('Attempting to restart...');
      process.exit(1); // Let the process manager restart us
    }, 5000);
  }
})();