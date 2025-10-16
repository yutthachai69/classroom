import { ObjectId } from 'mongodb';

export type UserType = 'admin' | 'teacher' | 'student';

export interface User {
  _id?: ObjectId;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  teacherId?: string;
  studentId?: string;
  // Account lockout fields
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  lastFailedLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  _id?: ObjectId;
  name: string;
  description: string;
  classCode: string; // Class Code for students to join (e.g. "ABC123")
  teacherId: ObjectId;
  teacherName?: string;
  students: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  _id?: ObjectId;
  title: string;
  description: string;
  classId: ObjectId;
  className?: string;
  teacherId: ObjectId;
  dueDate: Date;
  points: number;
  attachments: string[];
  gradeCategoryId?: ObjectId; // เชื่อมโยงกับ Grade Category
  gradeCategoryName?: string;
  allowEdit: boolean; // อนุญาตให้นักเรียนแก้ไขงานที่ส่งแล้ว
  createdAt: Date;
  updatedAt: Date;
  // Notification tracking
  viewedBy?: ObjectId[]; // นักเรียนที่ดูงานแล้ว
  lastViewedAt?: Date; // เวลาที่ดูล่าสุด
}

export interface Submission {
  _id?: ObjectId;
  assignmentId: ObjectId;
  studentId: ObjectId;
  studentName?: string;
  content: string;
  attachments: string[];
  grade?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  isEdited: boolean; // ถูกแก้ไขหรือไม่
  editedAt?: Date; // เวลาที่แก้ไขล่าสุด
}

export interface Comment {
  userId: ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Announcement {
  _id?: ObjectId;
  title: string;
  content: string;
  classId: ObjectId;
  className?: string;
  teacherId: ObjectId;
  teacherName?: string;
  comments: Comment[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  teacherId?: string;
  studentId?: string;
}

export interface GradeCategory {
  _id?: ObjectId;
  name: string; // เช่น "งานก่อนกลางภาค", "สอบกลางภาค"
  description?: string;
  weight: number; // น้ำหนักเป็นเปอร์เซ็นต์ (เช่น 25)
  maxPoints: number; // คะแนนเต็มของหมวดนี้
  order: number; // ลำดับการแสดงผล
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeStructure {
  _id?: ObjectId;
  classId: ObjectId;
  className?: string;
  teacherId: ObjectId;
  teacherName?: string;
  name: string; // เช่น "โครงสร้างคะแนน คณิตศาสตร์ ม.1"
  description?: string;
  totalPoints: number; // คะแนนเต็มทั้งหมด (เช่น 100)
  categories: GradeCategory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentGrade {
  _id?: ObjectId;
  assignmentId: ObjectId;
  studentId: ObjectId;
  studentName?: string;
  gradeCategoryId: ObjectId;
  gradeCategoryName?: string;
  points: number; // คะแนนที่ได้
  maxPoints: number; // คะแนนเต็ม
  percentage: number; // เปอร์เซ็นต์
  feedback?: string;
  gradedAt: Date;
  gradedBy: ObjectId; // teacherId
}

export interface StudentGradeSummary {
  studentId: ObjectId;
  studentName: string;
  gradeStructureId: ObjectId;
  categories: {
    categoryId: ObjectId;
    categoryName: string;
    earnedPoints: number;
    maxPoints: number;
    percentage: number;
    weight: number;
    weightedPoints: number;
  }[];
  totalEarnedPoints: number;
  totalMaxPoints: number;
  finalPercentage: number;
  finalGrade: string; // A, B+, B, C+, C, D+, D, F
  lastUpdated: Date;
}

export interface NotificationStatus {
  studentId: ObjectId;
  assignmentId: ObjectId;
  classId: ObjectId;
  status: 'new' | 'viewed' | 'submitted'; // สถานะการแจ้งเตือน
  viewedAt?: Date; // เวลาที่ดูงาน
  submittedAt?: Date; // เวลาที่ส่งงาน
  lastNotificationAt?: Date; // เวลาที่แจ้งเตือนล่าสุด
}

export interface SmartNotification {
  assignmentId: ObjectId;
  assignmentTitle: string;
  className: string;
  teacherName: string;
  dueDate: Date;
  status: 'new' | 'pending' | 'submitted';
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

