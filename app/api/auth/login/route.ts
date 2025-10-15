import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword } from '@/lib/utils';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password, userType } = await request.json();
    
    console.log('Login attempt:', { username, userType });

    if (!username || !password || !userType) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection<User>('users').findOne({
      username,
      userType,
    });

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with username:', username, 'userType:', userType);
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Return user data without password
    const { password: _, ...userData } = user;
    return NextResponse.json({
      user: {
        id: user._id?.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        teacherId: user.teacherId,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}

