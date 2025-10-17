import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateStudentId, generateTeacherId } from '@/lib/utils';
import { User } from '@/lib/types';
import { requireAdmin } from '@/lib/middleware';
import { validateData, userSchema, sanitizeInput } from '@/lib/validation';
import { apiRateLimit } from '@/lib/rate-limit';
import { logDatabaseEvent } from '@/lib/logger';

// GET all users (Admin only)
export const GET = requireAdmin(async (request) => {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType');

    // Validate userType parameter if provided
    if (userType && !['student', 'teacher', 'admin'].includes(userType)) {
      return NextResponse.json(
        { error: 'ประเภทผู้ใช้ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const query = userType ? { userType: userType as 'admin' | 'teacher' | 'student' } : {};
    
    const users = await db
      .collection<User>('users')
      .find(query)
      .project({ password: 0 }) // Exclude password
      .toArray();

    // Log database access
    logDatabaseEvent('users_retrieved', {
      userId: request.user.userId,
      userType: request.user.userType,
      query: query,
      count: users.length
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    logDatabaseEvent('users_retrieve_error', {
      userId: request.user.userId,
      error: error instanceof Error ? error.message : String(error)
    }, 'high');
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' },
      { status: 500 }
    );
  }
});

// POST create new user (Admin only)
export const POST = requireAdmin(async (request) => {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const rawData = await request.json();
    
    // Sanitize input
    const sanitizedData = sanitizeInput(rawData);
    
    // Validate input
    const validation = validateData(userSchema, sanitizedData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors?.join(', ') },
        { status: 400 }
      );
    }

    const { username, password, firstName, lastName, userType } = validation.data as {
      username: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: 'admin' | 'teacher' | 'student';
    };

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

    // Log user creation
    logDatabaseEvent('user_created', {
      createdBy: request.user.userId,
      newUserId: result.insertedId.toString(),
      userType: userType,
      username: username
    });

    return NextResponse.json({
      message: 'สร้างผู้ใช้สำเร็จ',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Create user error:', error);
    logDatabaseEvent('user_creation_error', {
      createdBy: request.user.userId,
      error: error instanceof Error ? error.message : String(error)
    }, 'high');
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    );
  }
});

