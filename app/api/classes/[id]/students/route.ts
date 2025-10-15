import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Class } from '@/lib/types';

// POST add student to class
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ studentId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const studentObjectId = new ObjectId(studentId);

    // Check if student is already in the class
    const existingClass = await db
      .collection<Class>('classes')
      .findOne({ _id: new ObjectId(id), students: studentObjectId });

    if (existingClass) {
      return NextResponse.json(
        { error: 'นักเรียนอยู่ในคลาสนี้แล้ว' },
        { status: 400 }
      );
    }

    const result = await db
      .collection<Class>('classes')
      .updateOne(
        { _id: new ObjectId(id) },
        { $push: { students: studentObjectId }, $set: { updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบคลาส' }, { status: 404 });
    }

    return NextResponse.json({ message: 'เพิ่มนักเรียนเข้าคลาสสำเร็จ' });
  } catch (error) {
    console.error('Add student error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มนักเรียน' },
      { status: 500 }
    );
  }
}

// DELETE remove student from class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ studentId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db
      .collection<Class>('classes')
      .updateOne(
        { _id: new ObjectId(id) },
        { $pull: { students: new ObjectId(studentId) }, $set: { updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบคลาส' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบนักเรียนออกจากคลาสสำเร็จ' });
  } catch (error) {
    console.error('Remove student error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบนักเรียน' },
      { status: 500 }
    );
  }
}

