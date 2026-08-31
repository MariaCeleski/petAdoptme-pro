/**
 * PetAdopt API Server
 * Main Express application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// HEALTH CHECK ROUTES
// ============================================

/**
 * GET /api/health
 * Simple health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

/**
 * GET /api/status
 * Detailed server status
 */
app.get('/api/status', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      uptime: process.uptime(),
      database: process.env.DATABASE_URL ? 'configured' : 'not-configured',
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// ============================================
// API ROUTES (PLACEHOLDER)
// ============================================

/**
 * GET /api/info
 * API information endpoint
 */
app.get('/api/info', (req, res) => {
  res.status(200).json({
    name: 'PetAdopt API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: 'GET /api/health',
      status: 'GET /api/status',
      info: 'GET /api/info',
    },
    documentation: '/docs',
    status: 'development - routes coming soon',
  });
});

// TODO: Import and use route handlers
// app.use('/api/auth', authRoutes);
// app.use('/api/pets', petRoutes);
// app.use('/api/adoptions', adoptionRoutes);
// app.use('/api/upload', uploadRoutes);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 Not Found handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('🚀 Starting PetAdopt API Server...');
    
    if (process.env.DATABASE_URL) {
      console.log('✅ Database URL configured');
    } else {
      console.log('⚠️  DATABASE_URL not set - running in development mode without database');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🐾 PetAdopt API Server Started        ║
╠════════════════════════════════════════╣
║  Port:        ${PORT}                       
║  Environment: ${NODE_ENV}                   
║  Time:        ${new Date().toISOString()}
╚════════════════════════════════════════╝
      `);
      console.log(`📡 Server running at http://localhost:${PORT}`);
      console.log(`🔍 Health check: curl http://localhost:${PORT}/api/health`);
      console.log(`📊 Status: curl http://localhost:${PORT}/api/status`);
      console.log(`ℹ️  Info: curl http://localhost:${PORT}/api/info`);
      console.log(`\n📖 Docs: Check ./docs for API documentation\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n📛 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n📛 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
