import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Add comprehensive process-level error handling to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log stack trace for debugging
  console.error('Stack:', error.stack);
  // Don't exit - just log the error and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log additional details for debugging
  if (reason instanceof Error) {
    console.error('Error stack:', reason.stack);
  }
  // Don't exit - just log the error and continue
});

// Handle memory pressure
process.on('warning', (warning) => {
  console.warn('Node.js Warning:', warning.name, warning.message);
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('Potential memory leak detected - too many listeners');
  }
});

// Graceful cleanup on exit
process.on('exit', (code) => {
  console.log('Process exiting with code:', code);
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Handle SIGINT gracefully
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
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
