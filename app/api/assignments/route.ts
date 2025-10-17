import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Assignment, Class } from '@/lib/types';
import { createNotificationForNewAssignment } from '@/lib/smart-notifications';

// GET all assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    const db = await getDatabase();
    const query: Record<string, unknown> = {};

    if (classId) {
      query.classId = new ObjectId(classId);
    } else if (teacherId) {
      query.teacherId = new ObjectId(teacherId);
    }

    const assignments = await db
      .collection<Assignment>('assignments')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Populate class names
    const assignmentsWithClass = await Promise.all(
      assignments.map(async (assignment) => {
        const classData = await db
          .collection<Class>('classes')
          .findOne({ _id: assignment.classId });
        return {
          ...assignment,
          className: classData?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({ assignments: assignmentsWithClass });
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลงาน' },
      { status: 500 }
    );
  }
}

// POST create new assignment
export async function POST(request: NextRequest) {
  try {
    const { title, description, classId, teacherId, dueDate, points, attachments } =
      await request.json();

    if (!title || !classId || !teacherId || !dueDate || !points) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newAssignment: Omit<Assignment, '_id'> = {
      title,
      description: description || '',
      classId: new ObjectId(classId),
      teacherId: new ObjectId(teacherId),
      dueDate: new Date(dueDate),
      points: Number(points),
      attachments: attachments || [],
      allowEdit: true, // อนุญาตให้แก้ไขเป็นค่าเริ่มต้น
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<Assignment>('assignments')
      .insertOne(newAssignment as Assignment);

    // สร้าง notification สำหรับงานใหม่
    await createNotificationForNewAssignment(result.insertedId.toString(), classId);

    return NextResponse.json({
      message: 'สร้างงานสำเร็จ',
      assignmentId: result.insertedId,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างงาน' },
      { status: 500 }
    );
  }
}

