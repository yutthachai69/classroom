import Joi from 'joi';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

// User validation schemas
export const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'ชื่อผู้ใช้ต้องมีเฉพาะตัวอักษรและตัวเลข',
      'string.min': 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร',
      'string.max': 'ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร',
      'any.required': 'กรุณากรอกชื่อผู้ใช้'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.min': 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
      'string.pattern.base': 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ',
      'any.required': 'กรุณากรอกรหัสผ่าน'
    }),
  
  firstName: Joi.string()
    .max(50)
    .pattern(/^[a-zA-Zก-๙\s]+$/)
    .required()
    .messages({
      'string.max': 'ชื่อต้องไม่เกิน 50 ตัวอักษร',
      'string.pattern.base': 'ชื่อต้องมีเฉพาะตัวอักษร',
      'any.required': 'กรุณากรอกชื่อ'
    }),
  
  lastName: Joi.string()
    .max(50)
    .pattern(/^[a-zA-Zก-๙\s]+$/)
    .required()
    .messages({
      'string.max': 'นามสกุลต้องไม่เกิน 50 ตัวอักษร',
      'string.pattern.base': 'นามสกุลต้องมีเฉพาะตัวอักษร',
      'any.required': 'กรุณากรอกนามสกุล'
    }),
  
  userType: Joi.string()
    .valid('student', 'teacher', 'admin')
    .required()
    .messages({
      'any.only': 'ประเภทผู้ใช้ต้องเป็น student, teacher หรือ admin',
      'any.required': 'กรุณาเลือกประเภทผู้ใช้'
    })
});

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'กรุณากรอกชื่อผู้ใช้'
  }),
  password: Joi.string().required().messages({
    'any.required': 'กรุณากรอกรหัสผ่าน'
  }),
  userType: Joi.string().valid('student', 'teacher', 'admin').required().messages({
    'any.only': 'ประเภทผู้ใช้ไม่ถูกต้อง',
    'any.required': 'กรุณาเลือกประเภทผู้ใช้'
  })
});

// Assignment validation
export const assignmentSchema = Joi.object({
  title: Joi.string()
    .max(200)
    .required()
    .messages({
      'string.max': 'ชื่องานต้องไม่เกิน 200 ตัวอักษร',
      'any.required': 'กรุณากรอกชื่องาน'
    }),
  
  description: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'คำอธิบายต้องไม่เกิน 2000 ตัวอักษร'
    }),
  
  dueDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'วันครบกำหนดต้องเป็นวันที่ในอนาคต',
      'any.required': 'กรุณาเลือกวันครบกำหนด'
    }),
  
  maxPoints: Joi.number()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.min': 'คะแนนเต็มต้องอย่างน้อย 1 คะแนน',
      'number.max': 'คะแนนเต็มต้องไม่เกิน 1000 คะแนน',
      'any.required': 'กรุณากรอกคะแนนเต็ม'
    }),
  
  classId: Joi.string().required().messages({
    'any.required': 'กรุณาเลือกคลาสเรียน'
  })
});

// Grade validation
export const gradeSchema = Joi.object({
  studentId: Joi.string().required().messages({
    'any.required': 'กรุณาเลือknักเรียน'
  }),
  
  assignmentId: Joi.string().required().messages({
    'any.required': 'กรุณาเลือกงาน'
  }),
  
  earnedPoints: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'คะแนนที่ได้ต้องไม่น้อยกว่า 0',
      'any.required': 'กรุณากรอกคะแนนที่ได้'
    }),
  
  feedback: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'ข้อความติชมต้องไม่เกิน 500 ตัวอักษร'
    })
});

// Generic validation function
export function validateData<T>(schema: Joi.ObjectSchema, data: any): ValidationResult<T> {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  return {
    isValid: true,
    data: value
  };
}

// Sanitization functions
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeText(text: string): string {
  return purify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

export function sanitizeFilename(filename: string): string {
  // Remove dangerous characters and limit length
  return filename
    .replace(/[^a-zA-Z0-9ก-๙._-]/g, '')
    .substring(0, 255);
}

// Input sanitization middleware
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[sanitizeText(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

// Password strength validation
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว' };
  }
  
  return { isValid: true };
}
