import { getDatabase } from './mongodb';
import { User } from './types';
import { logAuthEvent, logSecurityEvent } from './logger';

export interface AccountLockoutConfig {
  maxFailedAttempts: number; // จำนวนครั้งที่ใส่รหัสผ่านผิดได้
  lockoutDuration: number; // ระยะเวลาล็อค (milliseconds)
  incrementLockoutDuration: boolean; // เพิ่มเวลาล็อคเมื่อผิดซ้ำ
}

export const DEFAULT_LOCKOUT_CONFIG: AccountLockoutConfig = {
  maxFailedAttempts: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 นาที
  incrementLockoutDuration: true
};

export async function checkAccountLockout(username: string): Promise<{ isLocked: boolean; lockoutTime?: number; message?: string }> {
  const db = await getDatabase();
  const user = await db.collection<User>('users').findOne({ username });

  if (!user) {
    return { isLocked: false };
  }

  // ตรวจสอบว่าบัญชีถูกล็อคหรือไม่
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const lockoutTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
    const minutes = Math.ceil(lockoutTime / 60);
    
    return {
      isLocked: true,
      lockoutTime,
      message: `บัญชีถูกล็อคเนื่องจากใส่รหัสผ่านผิด ${user.failedLoginAttempts || 0} ครั้ง กรุณาลองใหม่อีกครั้งใน ${minutes} นาที`
    };
  }

  return { isLocked: false };
}

export async function handleFailedLogin(username: string, config: AccountLockoutConfig = DEFAULT_LOCKOUT_CONFIG): Promise<void> {
  const db = await getDatabase();
  const user = await db.collection<User>('users').findOne({ username });

  if (!user) {
    return;
  }

  const failedAttempts = (user.failedLoginAttempts || 0) + 1;
  const now = new Date();
  
  let lockoutUntil: Date | undefined;
  let lockoutDuration = config.lockoutDuration;

  // หากใส่ผิดเกินจำนวนที่กำหนด
  if (failedAttempts >= config.maxFailedAttempts) {
    // หากมีการเพิ่มเวลาล็อค ให้นับจากครั้งล่าสุดที่ล็อค
    if (config.incrementLockoutDuration && user.lockedUntil && user.lockedUntil > now) {
      lockoutDuration = Math.min(lockoutDuration * Math.pow(2, failedAttempts - config.maxFailedAttempts), 24 * 60 * 60 * 1000); // สูงสุด 24 ชั่วโมง
    }
    
    lockoutUntil = new Date(now.getTime() + lockoutDuration);
  }

  // อัพเดทข้อมูลในฐานข้อมูล
  await db.collection<User>('users').updateOne(
    { username },
    {
      $set: {
        failedLoginAttempts: failedAttempts,
        lastFailedLogin: now,
        ...(lockoutUntil && { lockedUntil: lockoutUntil }),
        updatedAt: now
      }
    }
  );

  // บันทึก log
  logAuthEvent('failed_login', {
    username,
    failedAttempts,
    isLocked: !!lockoutUntil,
    lockoutDuration: lockoutDuration,
    ip: 'unknown' // จะถูกส่งมาจาก API
  });
}

export async function handleSuccessfulLogin(username: string): Promise<void> {
  const db = await getDatabase();
  
  // รีเซ็ต failed attempts เมื่อ login สำเร็จ
  await db.collection<User>('users').updateOne(
    { username },
    {
      $unset: {
        failedLoginAttempts: 1,
        lockedUntil: 1,
        lastFailedLogin: 1
      },
      $set: {
        updatedAt: new Date()
      }
    }
  );
}

export async function unlockAccount(username: string, adminUserId: string): Promise<{ success: boolean; message: string }> {
  const db = await getDatabase();
  const user = await db.collection<User>('users').findOne({ username });

  if (!user) {
    return { success: false, message: 'ไม่พบผู้ใช้' };
  }

  // ตรวจสอบว่าบัญชีถูกล็อคจริงหรือไม่
  if (!user.lockedUntil || user.lockedUntil <= new Date()) {
    return { success: false, message: 'บัญชีไม่ได้ถูกล็อค' };
  }

  // ปลดล็อคบัญชี
  await db.collection<User>('users').updateOne(
    { username },
    {
      $unset: {
        failedLoginAttempts: 1,
        lockedUntil: 1,
        lastFailedLogin: 1
      },
      $set: {
        updatedAt: new Date()
      }
    }
  );

  // บันทึก log
  logSecurityEvent('account_unlocked', {
    username,
    unlockedBy: adminUserId,
    ip: 'unknown'
  }, 'medium');

  return { success: true, message: 'ปลดล็อคบัญชีสำเร็จ' };
}

export async function getLockedAccounts(): Promise<User[]> {
  const db = await getDatabase();
  const now = new Date();
  
  return await db.collection<User>('users').find({
    lockedUntil: { $gt: now }
  }).project({
    username: 1,
    firstName: 1,
    lastName: 1,
    userType: 1,
    failedLoginAttempts: 1,
    lockedUntil: 1,
    lastFailedLogin: 1
  }).toArray() as User[];
}

// ฟังก์ชันสำหรับล้างข้อมูล lockout ที่หมดอายุแล้ว (ควรเรียกเป็น scheduled job)
export async function cleanupExpiredLockouts(): Promise<number> {
  const db = await getDatabase();
  const now = new Date();
  
  const result = await db.collection<User>('users').updateMany(
    {
      lockedUntil: { $lte: now }
    },
    {
      $unset: {
        failedLoginAttempts: 1,
        lockedUntil: 1,
        lastFailedLogin: 1
      },
      $set: {
        updatedAt: now
      }
    }
  );

  return result.modifiedCount;
}
