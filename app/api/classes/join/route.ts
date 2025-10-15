import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Class } from '@/lib/types';

// POST join class with class code
export async function POST(request: NextRequest) {
  try {
    const { classCode, studentId } = await request.json();

    if (!classCode || !studentId) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Find class by class code
    const classData = await db.collection<Class>('classes').findOne({ 
      classCode: classCode.toUpperCase() 
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'ไม่พบคลาสที่มีรหัสนี้' },
        { status: 404 }
      );
    }

    const studentObjectId = new ObjectId(studentId);

    // Check if student is already in the class
    const isAlreadyMember = classData.students.some(
      (id) => id.toString() === studentObjectId.toString()
    );

    if (isAlreadyMember) {
      return NextResponse.json(
        { error: 'คุณเป็นสมาชิกของคลาสนี้อยู่แล้ว' },
        { status: 400 }
      );
    }

    // Add student to class
    await db.collection<Class>('classes').updateOne(
      { _id: classData._id },
      { 
        $push: { students: studentObjectId },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      message: 'เข้าร่วมคลาสสำเร็จ',
      class: {
        id: classData._id,
        name: classData.name,
        description: classData.description,
      },
    });
  } catch (error) {
    console.error('Join class error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าร่วมคลาส' },
      { status: 500 }
    );
  }
}

