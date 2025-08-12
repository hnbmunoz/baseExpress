import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import morgan from 'morgan';
// Express validator imports using require for compatibility
const { body, validationResult } = require('express-validator');
import { SECURITY_CONFIG } from '../config/security';

// XSS Clean import (deprecated package, using alternative approach)
const xss = require('xss-clean');

// Request logging middleware
export const requestLogger = morgan('combined', {
  // Log format: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
  skip: (req: Request) => {
    // Skip logging for health checks in production
    return process.env.NODE_ENV === 'production' && req.url === '/api/v1/health';
  }
});

// Security logger for suspicious activities
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi,
    /(javascript:|vbscript:|onload=|onerror=)/gi,
    /(union.*select|select.*from|insert.*into|delete.*from|drop.*table)/gi,
    /(\$ne|\$gt|\$lt|\$regex|\$where)/gi
  ];

  const userAgent = req.get('User-Agent') || '';
  const requestBody = JSON.stringify(req.body);
  const queryString = JSON.stringify(req.query);
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  // Check for suspicious patterns
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestBody) || 
    pattern.test(queryString) || 
    pattern.test(fullUrl) ||
    pattern.test(userAgent)
  );

  if (isSuspicious) {
    console.warn(`🚨 SECURITY ALERT: Suspicious request detected`, {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Data sanitization middleware
export const sanitizeData = [
  // Prevent NoSQL injection attacks
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`🚨 SECURITY: NoSQL injection attempt blocked`, {
        ip: req.ip,
        key,
        timestamp: new Date().toISOString()
      });
    }
  }),
  
  // Prevent XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: ['sort', 'fields', 'page', 'limit'] // Allow these parameters to be arrays
  })
];

// Compression middleware
export const compressionMiddleware = compression({
  // Only compress responses that are larger than this threshold
  threshold: 1024,
  // Compression level (1-9, where 9 is best compression but slowest)
  level: 6,
  // Filter function to determine what should be compressed
  filter: (req: Request, res: Response) => {
    // Don't compress if the request includes a Cache-Control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
});

// API Key authentication middleware
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header(SECURITY_CONFIG.API_KEY_HEADER);
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  // Skip API key check for public endpoints
  const publicEndpoints = [
    '/api/v1/health',
    '/api-docs',
    '/api/v1/auth/register',
    '/api/v1/auth/login'
  ];

  if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    next();
    return;
  }

  // If API keys are configured, validate them
  if (validApiKeys.length > 0) {
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key is required'
      });
      return;
    }

    if (!validApiKeys.includes(apiKey)) {
      console.warn(`🚨 SECURITY: Invalid API key attempt`, {
        ip: req.ip,
        apiKey: apiKey.substring(0, 8) + '...',
        timestamp: new Date().toISOString()
      });
      
      res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
      return;
    }
  }

  next();
};

// Request size limiting middleware
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = parseInt(req.get('content-length') || '0');
  
  if (contentLength > SECURITY_CONFIG.MAX_FILE_UPLOAD) {
    res.status(413).json({
      success: false,
      error: `Request entity too large. Maximum size is ${SECURITY_CONFIG.MAX_FILE_UPLOAD} bytes`
    });
    return;
  }
  
  next();
};

// Input validation helpers
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin', 'doctor'])
    .withMessage('Role must be either user, admin, or doctor')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: any) => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
    return;
  }
  
  next();
};

// Security headers middleware (additional to helmet)
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Set additional security headers
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

// HTTPS redirect middleware (for production)
export const httpsRedirect = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
    return;
  }
  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};