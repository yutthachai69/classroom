import { NextRequest, NextResponse } from 'next/server';
import { getSmartNotifications, markAssignmentAsViewed } from '@/lib/smart-notifications';
import { apiRateLimit } from '@/lib/rate-limit';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - ดึงข้อมูลการแจ้งเตือนที่ฉลาด
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ดึง token จาก cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // ตรวจสอบ token
    const decoded = verifyToken(token);
    
    // ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบหรือไม่
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    });

    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await getSmartNotifications(decoded.userId);

    return NextResponse.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน' },
      { status: 500 }
    );
  }
}

// POST - อัพเดทสถานะการดูงาน
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ดึง token จาก cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // ตรวจสอบ token
    const decoded = verifyToken(token);
    
    // ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบหรือไม่
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    });

    if (!user || user.userType !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { assignmentId, classId, action } = await request.json();

    if (!assignmentId || !classId || !action) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      );
    }

    if (action === 'view') {
      await markAssignmentAsViewed(decoded.userId, assignmentId, classId);
    }

    return NextResponse.json({
      success: true,
      message: 'อัพเดทสถานะเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Update notification status error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' },
      { status: 500 }
    );
  }
}
