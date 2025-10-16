import { NextRequest, NextResponse } from 'next/server';
import { requireStudent } from '@/lib/middleware';
import { getNotificationCount } from '@/lib/smart-notifications';
import { apiRateLimit } from '@/lib/rate-limit';

// GET - ดึงจำนวนการแจ้งเตือนสำหรับ header
export const GET = requireStudent(async (request) => {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const studentId = request.user.userId;
    const counts = await getNotificationCount(studentId);

    return NextResponse.json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงจำนวนการแจ้งเตือน' },
      { status: 500 }
    );
  }
});
