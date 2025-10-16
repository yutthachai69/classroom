import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
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
    const user = await db.collection<User>('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // ส่งข้อมูลผู้ใช้กลับไป (ไม่รวมรหัสผ่าน)
    const userData = {
      id: user._id?.toString(), // แปลง _id เป็น string และใช้ id
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      email: user.email,
    };

    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
