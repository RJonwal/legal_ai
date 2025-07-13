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

const PORT = process.env.PORT || 5000;
const app = express();

// Session configuration
app.use(session(sessionConfig));

// Security middleware
app.use(securityMiddleware);

// HTTP request logging
app.use(morgan('combined', { stream: httpLogStream }));

// Response time middleware
app.use(responseTime());

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "data:"],
      frameSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Performance monitoring
app.use(performanceMiddleware);

async function createServer() {
  try {
    // Initialize monitoring
    initializeSentry();

    // Start metrics collection
    startSystemMetricsCollection();

    // Initialize cache service
    await cacheService.connect();

    // Test database connection
    try {
      const result = await pool.query('SELECT 1');
      log('Database connection successful');
    } catch (dbError) {
      logger.error('Database connection failed:', dbError);
      // Continue without database for development
    }

    // Register routes
    const server = await registerRoutes(app);

    // Setup static files and Vite
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }

    // Setup graceful shutdown
    setupGracefulShutdown(server);

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      log(`Server running on http://0.0.0.0:${PORT}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to create server:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  Sentry.captureException(reason);
  // Don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

createServer().catch((error) => {
  logger.error('Server startup failed:', error);
  Sentry.captureException(error);
  process.exit(1);
});