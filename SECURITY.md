# API Gateway Security Implementation

This document outlines the comprehensive security measures implemented in the eKonsulta API Gateway.

## Security Features Implemented

### 1. Security Headers (Helmet.js)
- **Content Security Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **HTTP Strict Transport Security (HSTS)**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer Policy**: Controls referrer information sent with requests

### 2. Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Health checks**: 30 requests per minute per IP
- **API documentation**: 20 requests per 5 minutes per IP

### 3. Input Validation & Sanitization
- **Express Validator**: Comprehensive input validation for all endpoints
- **MongoDB Injection Prevention**: Sanitizes NoSQL injection attempts
- **XSS Protection**: Cleans malicious scripts from user input
- **HTTP Parameter Pollution (HPP)**: Prevents parameter pollution attacks

### 4. Request Security
- **Request Size Limits**: 
  - JSON payload: 10MB maximum
  - URL encoded: 10MB maximum
  - File uploads: 1MB maximum (configurable)
- **Request Timeout**: 30 seconds maximum per request
- **Compression**: Gzip compression for responses > 1KB

### 5. Authentication & Authorization
- **JWT Token Authentication**: Secure token-based authentication
- **API Key Authentication**: Optional API key validation for additional security
- **Role-based Access Control**: User role validation for protected routes
- **Token Expiration**: Configurable token expiration times

### 6. CORS Configuration
- **Strict Origin Control**: Only allowed origins can access the API
- **Credential Support**: Secure cookie and credential handling
- **Method Restrictions**: Only specified HTTP methods allowed
- **Header Validation**: Controlled allowed headers

### 7. Security Monitoring & Logging
- **Request Logging**: Comprehensive request/response logging with Morgan
- **Security Event Logging**: Suspicious activity detection and logging
- **Error Handling**: Secure error responses that don't expose sensitive information

### 8. Production Security
- **HTTPS Enforcement**: Automatic HTTPS redirect in production
- **Environment-based Configuration**: Different security levels for dev/prod
- **Graceful Shutdown**: Proper process termination handling

## Configuration

### Environment Variables

```bash
# Security Configuration
API_KEYS=your_api_key_1,your_api_key_2
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
MAX_FILE_UPLOAD=1000000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
SECURITY_HSTS_MAX_AGE=31536000
```

### Rate Limiting Configuration

The API implements different rate limits for different endpoint categories:

- **Authentication endpoints** (`/api/v1/auth/*`): 5 requests per 15 minutes
- **Health check** (`/api/v1/health`): 30 requests per minute
- **API documentation** (`/api-docs`): 20 requests per 5 minutes
- **General API** (`/api/v1/*`): 100 requests per 15 minutes

### Input Validation Rules

#### Registration Validation
- **Name**: 2-50 characters, letters and spaces only
- **Email**: Valid email format, normalized
- **Password**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **Role**: Must be 'user', 'admin', or 'doctor'

#### Login Validation
- **Email**: Valid email format, normalized
- **Password**: Required field

## Security Headers Applied

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: no-referrer, strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Security Monitoring

### Suspicious Activity Detection

The system monitors for:
- XSS attack attempts in requests
- NoSQL injection patterns
- Suspicious user agents
- Malformed requests
- Repeated failed authentication attempts

### Logging

All security events are logged with:
- Timestamp
- IP address
- Request details
- User agent
- Attempted payload (sanitized)

## API Key Authentication

Optional API key authentication can be enabled by setting the `API_KEYS` environment variable. When enabled:

- Public endpoints (health, docs, auth) bypass API key validation
- All other endpoints require a valid API key in the `X-API-Key` header
- Invalid API key attempts are logged as security events

## Best Practices Implemented

1. **Defense in Depth**: Multiple layers of security controls
2. **Principle of Least Privilege**: Minimal required permissions
3. **Input Validation**: All user input is validated and sanitized
4. **Secure Defaults**: Security-first configuration out of the box
5. **Error Handling**: No sensitive information in error responses
6. **Logging**: Comprehensive security event logging
7. **Regular Updates**: Dependencies kept up to date

## Security Testing

To test the security implementation:

1. **Rate Limiting**: Send multiple rapid requests to test rate limits
2. **Input Validation**: Try sending malformed or malicious payloads
3. **CORS**: Test cross-origin requests from unauthorized domains
4. **Headers**: Verify security headers are present in responses
5. **Authentication**: Test with invalid/expired tokens

## Maintenance

### Regular Security Tasks

1. **Update Dependencies**: Keep all security packages updated
2. **Review Logs**: Monitor security logs for suspicious activity
3. **Rotate Keys**: Regularly rotate API keys and JWT secrets
4. **Security Audits**: Perform regular security assessments
5. **Configuration Review**: Periodically review security configurations

### Security Incident Response

1. **Detection**: Monitor logs for security events
2. **Analysis**: Investigate suspicious activities
3. **Response**: Block malicious IPs, revoke compromised tokens
4. **Recovery**: Restore normal operations
5. **Lessons Learned**: Update security measures based on incidents

## Compliance

This security implementation helps meet common compliance requirements:

- **OWASP Top 10**: Protection against common web vulnerabilities
- **GDPR**: Data protection and privacy controls
- **SOC 2**: Security controls and monitoring
- **ISO 27001**: Information security management

## Contact

For security-related questions or to report vulnerabilities, please contact the development team.