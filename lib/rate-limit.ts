import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (สำหรับ development)
// ใน production ควรใช้ Redis หรือ database
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // เวลาใน milliseconds
  maxRequests: number; // จำนวน request สูงสุด
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests', skipSuccessfulRequests = false } = options;

  return (request: NextRequest, response?: NextResponse): NextResponse | null => {
    // Get client IP
    const clientIP = getClientIP(request);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitMap.get(clientIP);
    
    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitMap.set(clientIP, entry);
      return null; // Allow request
    }
    
    // Increment count
    entry.count++;
    
    if (entry.count > maxRequests) {
      // Rate limit exceeded
      const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: message,
          retryAfter: resetTimeSeconds,
          limit: maxRequests,
          remaining: 0
        },
        { 
          status: 429,
          headers: {
            'Retry-After': resetTimeSeconds.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      );
    }
    
    // Update entry
    rateLimitMap.set(clientIP, entry);
    
    // Add rate limit headers to response
    if (response) {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
      response.headers.set('X-RateLimit-Reset', entry.resetTime.toString());
    }
    
    return null; // Allow request
  };
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for production with proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection IP (may not work in all environments)
  // @ts-ignore
  return (request as any).socket?.remoteAddress || 'unknown';
}

// Predefined rate limiters
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many API requests, please slow down.'
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
  message: 'Too many file uploads, please wait before trying again.'
});

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
