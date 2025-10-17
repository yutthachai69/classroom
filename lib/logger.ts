import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'workload-tracker' },
  transports: [
    // In production (Vercel), use console transport only
    ...(process.env.NODE_ENV === 'production' ? [] : [
      // Write all logs with importance level of `error` or less to `error.log`
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      // Write all logs with importance level of `info` or less to `combined.log`
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
    ]),
  ],
});

// Add console transport for both development and production
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

// Security event logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'security' },
  transports: [
    // In production (Vercel), use console transport only
    ...(process.env.NODE_ENV === 'production' ? [] : [
      new winston.transports.File({ 
        filename: 'logs/security.log',
        maxsize: 5242880, // 5MB
        maxFiles: 10
      }),
    ]),
  ],
});

// Add console transport for security logger in production
if (process.env.NODE_ENV === 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Log security events
export function logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
  securityLogger.log({
    level: 'info',
    message: `Security Event: ${event}`,
    event,
    details,
    severity,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  });
}

// Log authentication events
export function logAuthEvent(event: 'login' | 'logout' | 'failed_login' | 'token_expired', details: any) {
  const severity = event === 'failed_login' ? 'medium' : 'low';
  logSecurityEvent(`auth_${event}`, details, severity);
}

// Log authorization events
export function logAuthzEvent(event: 'access_denied' | 'unauthorized_access', details: any) {
  logSecurityEvent(`authz_${event}`, details, 'high');
}

// Log rate limiting events
export function logRateLimitEvent(details: any) {
  logSecurityEvent('rate_limit_exceeded', details, 'medium');
}

// Log input validation events
export function logValidationEvent(event: 'invalid_input' | 'malicious_input', details: any) {
  const severity = event === 'malicious_input' ? 'high' : 'low';
  logSecurityEvent(`validation_${event}`, details, severity);
}

// Log database events
export function logDatabaseEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'low') {
  logSecurityEvent(`db_${event}`, details, severity);
}
