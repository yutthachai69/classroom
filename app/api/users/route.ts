import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateStudentId, generateTeacherId } from '@/lib/utils';
import { User } from '@/lib/types';

// GET all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');

    const db = await getDatabase();
    const query = userType ? { userType } : {};
    
    const users = await db
      .collection<User>('users')
      .find(query)
      .project({ password: 0 }) // Exclude password
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const { username, password, firstName, lastName, userType } = await request.json();

    if (!username || !password || !firstName || !lastName || !userType) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if username already exists
    const existingUser = await db.collection<User>('users').findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser: Omit<User, '_id'> = {
      username,
      password: hashedPassword,
      firstName,
      lastName,
      userType,
      ...(userType === 'student' && { studentId: generateStudentId() }),
      ...(userType === 'teacher' && { teacherId: generateTeacherId() }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<User>('users').insertOne(newUser as User);

    return NextResponse.json({
      message: 'สร้างผู้ใช้สำเร็จ',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    );
  }
}

