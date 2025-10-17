import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { unlockAccount, getLockedAccounts } from '@/lib/account-lockout';
import { validateData, sanitizeInput } from '@/lib/validation';
import { apiRateLimit } from '@/lib/rate-limit';
import Joi from 'joi';

// Schema for unlock account request
const unlockAccountSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'กรุณากรอกชื่อผู้ใช้'
  })
});

// GET - ดึงรายการบัญชีที่ถูกล็อค
export const GET = requireAdmin(async (request) => {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const lockedAccounts = await getLockedAccounts();

    return NextResponse.json({
      lockedAccounts: lockedAccounts.map(account => ({
        id: account._id?.toString(),
        username: account.username,
        firstName: account.firstName,
        lastName: account.lastName,
        userType: account.userType,
        failedLoginAttempts: account.failedLoginAttempts || 0,
        lockedUntil: account.lockedUntil,
        lastFailedLogin: account.lastFailedLogin
      }))
    });
  } catch (error) {
    console.error('Get locked accounts error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัญชีที่ถูกล็อค' },
      { status: 500 }
    );
  }
});

// POST - ปลดล็อคบัญชี
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
    const validation = validateData(unlockAccountSchema, sanitizedData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors?.join(', ') },
        { status: 400 }
      );
    }

    const { username } = validation.data as { username: string };
    const adminUserId = request.user.userId;

    const result = await unlockAccount(username, adminUserId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      username: username
    });
  } catch (error) {
    console.error('Unlock account error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการปลดล็อคบัญชี' },
      { status: 500 }
    );
  }
});
