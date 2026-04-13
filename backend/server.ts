import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import path from 'path';

// Stripe related import add here

//import api routes here
import authRoutes from './routes/auth';

// Configuration
import { SERVER_CONFIG } from './config/constants';

// Middleware
import { errorHandler } from './middleware/errorHandler';

// Database
import { db } from './db';

const app = express();

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    // Simple query to test connection
    await db.execute('SELECT 1');
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection error:', error);
    console.warn('Database connection failed, but server will continue to run');
    // Don't exit, continue running the server
  }
}

/**
 * Static Files
 */
try {
  const REACT_BUILD_FOLDER = path.join(__dirname, '..', 'frontend', 'dist');
  console.log('React build folder:', REACT_BUILD_FOLDER);
  app.use(
    express.static(REACT_BUILD_FOLDER, {
      setHeaders: (res, path) => {
        // Disable caching for CSS and JS files to ensure changes are reflected immediately
        if (path.endsWith('.css') || path.endsWith('.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );

  app.use(
    '/assets',
    express.static(path.join(REACT_BUILD_FOLDER, 'assets'), {
      setHeaders: (res, path) => {
        // Disable caching for CSS and JS files in assets folder
        if (path.endsWith('.css') || path.endsWith('.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );
} catch (error) {
  console.error('Static files setup error:', error);
}

// API Routes import here
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);

/**
 * Install Stripe Routes here
 */

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * SPA Fallback Route
 * Handles client-side routing for React Router
 * Must be registered after all API routes
 */
app.get('*', (_req, res) => {
  try {
    const REACT_BUILD_FOLDER = path.join(__dirname, '..', 'frontend', 'dist');
    res.sendFile(path.join(REACT_BUILD_FOLDER, 'index.html'));
  } catch (error) {
    console.error('SPA fallback error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Error Handler
 * Must be the last middleware
 */
app.use(errorHandler as ErrorRequestHandler);

/**
 * Start Server
 */
async function startServer() {
  try {
    // Test database connection
    await testDatabaseConnection();
    
    app.listen(SERVER_CONFIG.PORT, () => {
      console.log(`Server ready on port ${SERVER_CONFIG.PORT}`);
      console.log(`Health check: http://localhost:${SERVER_CONFIG.PORT}/health`);
    });
  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
