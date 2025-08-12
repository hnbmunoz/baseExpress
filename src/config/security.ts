import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request } from 'express';

// Rate limiting configuration
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs, // 15 minutes by default
    max, // limit each IP to max requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Use default key generator to handle IPv6 properly
    // Skip successful requests for certain endpoints
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  });
};

// Different rate limits for different endpoints
export const rateLimiters = {
  // General API rate limit
  general: createRateLimiter(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  
  // Strict rate limit for authentication endpoints
  auth: createRateLimiter(15 * 60 * 1000, 5), // 5 requests per 15 minutes
  
  // More lenient for health checks
  health: createRateLimiter(1 * 60 * 1000, 30), // 30 requests per minute
  
  // API documentation access
  docs: createRateLimiter(5 * 60 * 1000, 20), // 20 requests per 5 minutes
};

// Helmet security configuration
export const helmetConfig = helmet({
  // Content Security Policy - Disabled for API-only server
  contentSecurityPolicy: false,
  
  // Cross Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for API compatibility
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },
  
  // Frame Options
  frameguard: {
    action: 'deny'
  },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: {
    policy: ["no-referrer", "strict-origin-when-cross-origin"]
  },
  
  // X-XSS-Protection
  xssFilter: true,
});

// Security constants
export const SECURITY_CONFIG = {
  // JWT
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE || '30'),
  
  // Request limits
  MAX_FILE_UPLOAD: parseInt(process.env.MAX_FILE_UPLOAD || '1000000'), // 1MB
  MAX_JSON_SIZE: '10mb',
  MAX_URL_ENCODED_SIZE: '10mb',
  
  // API Keys
  API_KEY_HEADER: 'X-API-Key',
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'https://localhost:3000',
    'https://localhost:3001',
    'https://localhost:5173'
  ],
  
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100,
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'no-referrer, strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  }
};