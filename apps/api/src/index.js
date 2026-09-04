/**
 * PetAdopt API Server
 * Main Express application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import { errorHandler, asyncHandler } from './middleware/errorHandler.js';
import { sanitizeInputs, rateLimit } from './middleware/validation.js';
import { optionalAuth } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import petRoutes from './routes/pets.js';
import adoptionRoutes from './routes/adoptions.js';
import uploadRoutes from './routes/upload.js';
import adminPetRoutes from './routes/admin/pets.js';

// Load environment variables from .env.local or .env (try .env.local first)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPathLocal = path.join(__dirname, '../.env.local');
const envPathDefault = path.join(__dirname, '../.env');
dotenv.config({ path: envPathLocal });
dotenv.config({ path: envPathDefault });

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

// Global sanitization
app.use(sanitizeInputs);

// Global rate limiting
app.use(rateLimit(100, 60000)); // 100 requests per minute globally

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
      database: process.env.SUPABASE_URL ? 'configured' : 'not-configured',
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
// API ROUTES
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
      auth: 'POST /api/auth/*',
      pets: 'GET/POST/PATCH/DELETE /api/pets/*',
      adoptions: 'GET/POST/PATCH /api/adoptions/*',
      admin: 'GET/PATCH /api/admin/pets/*',
    },
    documentation: '/docs',
  });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/pets', adminPetRoutes);

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
 * Global error handler (must be last)
 */
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('🚀 Starting PetAdopt API Server...');
    
    if (process.env.SUPABASE_URL) {
      console.log('✅ Supabase configured');
    } else {
      console.log('⚠️  SUPABASE_URL not set - running without database');
    }

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('✅ Cloudinary configured');
    } else {
      console.log('⚠️  CLOUDINARY credentials not set - photo upload disabled');
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
      console.log(`🔍 Health: curl http://localhost:${PORT}/api/health`);
      console.log(`📊 Status: curl http://localhost:${PORT}/api/status`);
      console.log(`ℹ️  Info: curl http://localhost:${PORT}/api/info`);
      console.log(`\n📖 Routes mounted:`);
      console.log(`   - /api/auth       → Authentication`);
      console.log(`   - /api/pets       → Pet management (with photo upload)`);
      console.log(`   - /api/adoptions  → Adoption requests`);
      console.log(`   - /api/admin/pets → Admin approval/rejection\n`);
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
