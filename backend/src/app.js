import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import ApiResponse from './utils/ApiResponse.js';

// Route imports
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import linkRouter from './routes/link.routes.js';
import collectionRouter from './routes/collection.routes.js';

const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. CORS configuration (supports Vercel frontend, custom domains, and local dev)
const clientUrlEnv = process.env.CLIENT_URL || '';
const configuredOrigins = clientUrlEnv
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));
const isDevelopment = (process.env.NODE_ENV || 'development') !== 'production';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check explicit allowed origins list
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Automatically allow Vercel production and preview deployments (*.vercel.app)
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        // invalid URL format, fall through to block
      }

      // Allow localhost in development
      if (isDevelopment && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 4. Body parsers with payload limit protection
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 5. Cookie parser
app.use(cookieParser());

// 6. Health check route
app.get('/api/health', (req, res) => {
  new ApiResponse(200, 'Brainfy API is operational', {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  }).send(res);
});

// Route mounts
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/links', linkRouter);
app.use('/api/collections', collectionRouter);

// 7. 404 Handler for undefined routes
app.use(notFoundHandler);

// 8. Centralized Global Error Handler
app.use(errorHandler);

export default app;

