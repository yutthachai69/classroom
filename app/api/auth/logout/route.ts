import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { logAuthEvent } from '@/lib/logger';

export const POST = requireAuth(async (request) => {
  try {
    // Log logout event
    logAuthEvent('logout', {
      userId: request.user.userId,
      username: request.user.username,
      userType: request.user.userType,
      ip: (request as any).ip || 'unknown'
    });

    // Create response
    const response = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' });

    // Clear auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    );
  }
});
