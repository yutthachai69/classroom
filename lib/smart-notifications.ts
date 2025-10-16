import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { Assignment, Submission, NotificationStatus, SmartNotification } from './types';

export interface NotificationSummary {
  newAssignments: number; // งานใหม่ที่ยังไม่ดู
  pendingAssignments: number; // งานที่ดูแล้วแต่ยังไม่ส่ง
  submittedAssignments: number; // งานที่ส่งแล้ว
  totalNotifications: number;
  notifications: SmartNotification[];
}

/**
 * อัพเดทสถานะเมื่อนักเรียนดูงาน
 */
export async function markAssignmentAsViewed(
  studentId: string,
  assignmentId: string,
  classId: string
): Promise<void> {
  const db = await getDatabase();
  
  // อัพเดท assignment document
  await db.collection<Assignment>('assignments').updateOne(
    { _id: new ObjectId(assignmentId) },
    {
      $addToSet: { viewedBy: new ObjectId(studentId) },
      $set: { lastViewedAt: new Date() },
      $set: { updatedAt: new Date() }
    }
  );

  // อัพเดท notification status
  await db.collection<NotificationStatus>('notification_status').updateOne(
    {
      studentId: new ObjectId(studentId),
      assignmentId: new ObjectId(assignmentId)
    },
    {
      $set: {
        status: 'viewed',
        viewedAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

/**
 * อัพเดทสถานะเมื่อนักเรียนส่งงาน
 */
export async function markAssignmentAsSubmitted(
  studentId: string,
  assignmentId: string,
  classId: string
): Promise<void> {
  const db = await getDatabase();
  
  // อัพเดท notification status
  await db.collection<NotificationStatus>('notification_status').updateOne(
    {
      studentId: new ObjectId(studentId),
      assignmentId: new ObjectId(assignmentId)
    },
    {
      $set: {
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

/**
 * สร้าง notification status สำหรับงานใหม่
 */
export async function createNotificationForNewAssignment(
  assignmentId: string,
  classId: string
): Promise<void> {
  const db = await getDatabase();
  
  // ดึงรายชื่อนักเรียนในคลาส
  const classData = await db.collection('classes').findOne({
    _id: new ObjectId(classId)
  });

  if (!classData) return;

  // สร้าง notification status สำหรับนักเรียนทุกคน
  const notificationStatuses = classData.students.map((studentId: ObjectId) => ({
    studentId,
    assignmentId: new ObjectId(assignmentId),
    classId: new ObjectId(classId),
    status: 'new' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await db.collection<NotificationStatus>('notification_status').insertMany(notificationStatuses);
}

/**
 * ดึงข้อมูลการแจ้งเตือนที่ฉลาดสำหรับนักเรียน
 */
export async function getSmartNotifications(studentId: string): Promise<NotificationSummary> {
  const db = await getDatabase();
  const studentObjectId = new ObjectId(studentId);

  // ดึงข้อมูล notification status ของนักเรียน
  const notificationStatuses = await db.collection<NotificationStatus>('notification_status')
    .find({ studentId: studentObjectId })
    .toArray();

  // ดึงข้อมูลงานทั้งหมดที่เกี่ยวข้อง
  const assignmentIds = notificationStatuses.map(ns => ns.assignmentId);
  const assignments = await db.collection<Assignment>('assignments')
    .find({ _id: { $in: assignmentIds } })
    .toArray();

  // ดึงข้อมูลการส่งงาน
  const submissions = await db.collection<Submission>('submissions')
    .find({ studentId: studentObjectId })
    .toArray();

  // สร้าง map สำหรับการส่งงาน
  const submissionMap = new Map();
  submissions.forEach(sub => {
    submissionMap.set(sub.assignmentId.toString(), sub);
  });

  // ประมวลผลข้อมูล
  let newAssignments = 0;
  let pendingAssignments = 0;
  let submittedAssignments = 0;
  const notifications: SmartNotification[] = [];

  for (const status of notificationStatuses) {
    const assignment = assignments.find(a => a._id?.toString() === status.assignmentId.toString());
    if (!assignment) continue;

    const submission = submissionMap.get(status.assignmentId.toString());
    const isSubmitted = !!submission;

    // ถ้าส่งงานแล้ว ให้ข้าม (ไม่แสดงในการแจ้งเตือน)
    if (isSubmitted) {
      submittedAssignments++;
      continue; // ไม่เพิ่มเข้า notifications
    }

    // กำหนดสถานะและข้อความ
    let notificationStatus: 'new' | 'pending' | 'submitted';
    let message: string;
    let priority: 'high' | 'medium' | 'low';

    if (status.status === 'viewed') {
      notificationStatus = 'pending';
      message = `งาน "${assignment.title}" ยังไม่ได้ส่ง`;
      priority = 'medium';
      pendingAssignments++;
    } else {
      notificationStatus = 'new';
      message = `งานใหม่: "${assignment.title}"`;
      priority = 'high';
      newAssignments++;
    }

    // ตรวจสอบใกล้ครบกำหนด
    const daysUntilDue = Math.ceil((assignment.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 1 && !isSubmitted) {
      priority = 'high';
      message += ' (ใกล้ครบกำหนด!)';
    }

    notifications.push({
      assignmentId: assignment._id!,
      assignmentTitle: assignment.title,
      className: assignment.className || '',
      teacherName: '', // จะต้องดึงจาก teacher data
      dueDate: assignment.dueDate,
      status: notificationStatus,
      message,
      priority,
      createdAt: assignment.createdAt
    });
  }

  // เรียงลำดับตาม priority และวันที่
  notifications.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return {
    newAssignments,
    pendingAssignments,
    submittedAssignments,
    totalNotifications: newAssignments + pendingAssignments,
    notifications
  };
}

/**
 * ดึงจำนวนการแจ้งเตือนสำหรับ header
 */
export async function getNotificationCount(studentId: string): Promise<{
  newCount: number;
  pendingCount: number;
  totalCount: number;
}> {
  const db = await getDatabase();
  const studentObjectId = new ObjectId(studentId);

  // นับงานใหม่
  const newCount = await db.collection<NotificationStatus>('notification_status').countDocuments({
    studentId: studentObjectId,
    status: 'new'
  });

  // นับงานที่ดูแล้วแต่ยังไม่ส่ง
  const pendingCount = await db.collection<NotificationStatus>('notification_status').countDocuments({
    studentId: studentObjectId,
    status: 'viewed'
  });

  // ตรวจสอบว่ามีการส่งงานหรือไม่
  const pendingStatuses = await db.collection<NotificationStatus>('notification_status')
    .find({
      studentId: studentObjectId,
      status: 'viewed'
    })
    .toArray();

  let actualPendingCount = 0;
  for (const status of pendingStatuses) {
    const submission = await db.collection<Submission>('submissions').findOne({
      studentId: studentObjectId,
      assignmentId: status.assignmentId
    });
    if (!submission) {
      actualPendingCount++;
    }
  }

  return {
    newCount,
    pendingCount: actualPendingCount,
    totalCount: newCount + actualPendingCount
  };
}

/**
 * ล้างข้อมูล notification สำหรับงานที่หมดอายุ
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const db = await getDatabase();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ลบ notification สำหรับงานที่หมดอายุแล้ว 1 สัปดาห์
  const result = await db.collection<NotificationStatus>('notification_status').deleteMany({
    createdAt: { $lt: oneWeekAgo }
  });

  return result.deletedCount;
}
