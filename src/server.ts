import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import errorHandler from './middleware/error';
import { swaggerUi, swaggerDocs } from './config/swagger';
import { helmetConfig, rateLimiters, SECURITY_CONFIG } from './config/security';
import {
  requestLogger,
  securityLogger,
  sanitizeData,
  compressionMiddleware,
  apiKeyAuth,
  requestSizeLimit,
  additionalSecurityHeaders,
  httpsRedirect,
  requestTimeout
} from './middleware/security';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app: Application = express();

// Trust proxy for proper IP handling
app.set('trust proxy', 1);

// HTTPS redirect (production only)
app.use(httpsRedirect);

// Request timeout
app.use(requestTimeout(30000)); // 30 seconds

// Security headers
app.use(helmetConfig);
app.use(additionalSecurityHeaders);

// Request logging
app.use(requestLogger);

// Security monitoring
app.use(securityLogger);

// Compression
app.use(compressionMiddleware);

// Request size limiting
app.use(requestSizeLimit);

// Body parser with size limits
app.use(express.json({
  limit: SECURITY_CONFIG.MAX_JSON_SIZE,
  type: 'application/json'
}));
app.use(express.urlencoded({
  extended: true,
  limit: SECURITY_CONFIG.MAX_URL_ENCODED_SIZE
}));

// Data sanitization
app.use(sanitizeData);

// API Key authentication (optional)
app.use(apiKeyAuth);

// Enable CORS with security configuration
app.use(cors({
  origin: SECURITY_CONFIG.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    SECURITY_CONFIG.API_KEY_HEADER
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
}));

// Rate limiting for different endpoints
app.use('/api/v1/health', rateLimiters.health);
app.use('/api-docs', rateLimiters.docs);
app.use('/api/v1/auth', rateLimiters.auth);
app.use('/api/v1', rateLimiters.general);

// Mount Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())} seconds`,
    security: {
      helmet: 'enabled',
      rateLimit: 'enabled',
      cors: 'enabled',
      sanitization: 'enabled'
    }
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to eKonsulta API',
    documentation: '/api-docs'
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`🚨 Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log(`🚨 Uncaught Exception: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💀 Process terminated');
  });
});