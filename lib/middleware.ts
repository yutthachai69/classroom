import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './auth';
import { getDatabase } from './mongodb';
import { User } from './types';

// Extend NextRequest to include user
declare module 'next/server' {
  interface NextRequest {
    user?: JWTPayload;
  }
}

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  requiredUserTypes?: string[]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header or cookie
      const authHeader = request.headers.get('authorization');
      const cookieToken = request.cookies.get('auth-token')?.value;
      const token = extractTokenFromHeader(authHeader) || cookieToken;

      if (!token) {
        return NextResponse.json(
          { error: 'ไม่พบ token การยืนยันตัวตน' },
          { status: 401 }
        );
      }

      // Verify token
      const payload = verifyToken(token);
      
      // Check if user still exists in database
      const db = await getDatabase();
      const user = await db.collection<User>('users').findOne({
        username: payload.username,
        userType: payload.userType
      });

      if (!user) {
        return NextResponse.json(
          { error: 'ผู้ใช้ไม่พบในระบบ' },
          { status: 401 }
        );
      }

      // Check user type permissions
      if (requiredUserTypes && !requiredUserTypes.includes(payload.userType)) {
        return NextResponse.json(
          { error: 'ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้' },
          { status: 403 }
        );
      }

      // Add user info to request
      (request as AuthenticatedRequest).user = payload;
      
      return handler(request as AuthenticatedRequest);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'การยืนยันตัวตนไม่ถูกต้อง' },
        { status: 401 }
      );
    }
  };
}

export function withOptionalAuth(
  handler: (request: NextRequest | AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get('authorization');
      const cookieToken = request.cookies.get('auth-token')?.value;
      const token = extractTokenFromHeader(authHeader) || cookieToken;

      if (token) {
        const payload = verifyToken(token);
        
        // Check if user still exists
        const db = await getDatabase();
        const user = await db.collection<User>('users').findOne({
          username: payload.username,
          userType: payload.userType
        });

        if (user) {
          (request as AuthenticatedRequest).user = payload;
        }
      }
      
      return handler(request);
    } catch (error) {
      // Continue without auth if token is invalid
      return handler(request);
    }
  };
}

// Role-based access control
export const requireAdmin = (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, ['admin']);

export const requireTeacher = (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, ['teacher', 'admin']);

export const requireStudent = (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler, ['student', 'teacher', 'admin']);

export const requireAuth = (handler: (request: AuthenticatedRequest) => Promise<NextResponse>) =>
  withAuth(handler);
