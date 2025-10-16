import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword } from '@/lib/utils';
import { User } from '@/lib/types';
import { generateToken } from '@/lib/auth';
import { validateData, loginSchema, sanitizeInput } from '@/lib/validation';
import { loginRateLimit } from '@/lib/rate-limit';
import { logAuthEvent } from '@/lib/logger';
import { checkAccountLockout, handleFailedLogin, handleSuccessfulLogin } from '@/lib/account-lockout';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = loginRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const rawData = await request.json();
    
    // Sanitize input
    const sanitizedData = sanitizeInput(rawData);
    
    // Validate input
    const validation = validateData(loginSchema, sanitizedData);
    if (!validation.isValid) {
      logAuthEvent('failed_login', {
        reason: 'validation_failed',
        errors: validation.errors,
        ip: request.ip || 'unknown'
      });
      
      return NextResponse.json(
        { error: validation.errors?.join(', ') },
        { status: 400 }
      );
    }

    const { username, password, userType } = validation.data;
    
    console.log('Login attempt:', { username, userType });

    // ตรวจสอบว่าบัญชีถูกล็อคหรือไม่
    const lockoutCheck = await checkAccountLockout(username);
    if (lockoutCheck.isLocked) {
      return NextResponse.json(
        { 
          error: lockoutCheck.message,
          lockoutTime: lockoutCheck.lockoutTime
        },
        { status: 423 } // 423 Locked
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
      
      // บันทึก failed login attempt
      await handleFailedLogin(username);
      
      logAuthEvent('failed_login', {
        username,
        userType,
        reason: 'user_not_found',
        ip: request.ip || 'unknown'
      });
      
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      // บันทึก failed login attempt
      await handleFailedLogin(username);
      
      logAuthEvent('failed_login', {
        username,
        userType,
        reason: 'invalid_password',
        ip: request.ip || 'unknown'
      });
      
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Login สำเร็จ - รีเซ็ต failed attempts
    await handleSuccessfulLogin(username);

    // Generate JWT token
    const token = generateToken(user);
    
    // Log successful login
    logAuthEvent('login', {
      username,
      userType,
      userId: user._id?.toString(),
      ip: request.ip || 'unknown'
    });

    // Return user data without password and token
    const { password: _, ...userData } = user;
    const response = NextResponse.json({
      user: {
        id: user._id?.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        teacherId: user.teacherId,
        studentId: user.studentId,
      },
      token
    });

    // Set httpOnly cookie for token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}

