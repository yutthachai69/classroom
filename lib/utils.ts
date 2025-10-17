import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateStudentId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `STD${timestamp}${random}`;
}

export function generateTeacherId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TCH${timestamp}${random}`;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Generate random class code (6 characters: uppercase letters and numbers)
export function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Grade calculation utilities
export function calculatePercentage(earned: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((earned / max) * 100 * 100) / 100; // Round to 2 decimal places
}

export function calculateWeightedPoints(earned: number, max: number, weight: number): number {
  const percentage = calculatePercentage(earned, max);
  return Math.round((percentage * weight / 100) * 100) / 100;
}

export function calculateFinalGrade(percentage: number): string {
  if (percentage >= 80) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'D+';
  if (percentage >= 50) return 'D';
  return 'F';
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100';
    case 'B+': return 'text-green-500 bg-green-50';
    case 'B': return 'text-blue-600 bg-blue-100';
    case 'C+': return 'text-yellow-600 bg-yellow-100';
    case 'C': return 'text-orange-600 bg-orange-100';
    case 'D+': return 'text-red-500 bg-red-50';
    case 'D': return 'text-red-600 bg-red-100';
    case 'F': return 'text-red-700 bg-red-200';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export function validateGradeStructure(categories: { weight: number }[]): { isValid: boolean; error?: string } {
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
  
  if (Math.abs(totalWeight - 100) > 0.01) {
    return { isValid: false, error: `น้ำหนักรวมต้องเป็น 100% (ปัจจุบัน: ${totalWeight}%)` };
  }
  
  if (categories.some(cat => cat.weight <= 0)) {
    return { isValid: false, error: 'น้ำหนักแต่ละหมวดต้องมากกว่า 0%' };
  }
  
  return { isValid: true };
}

