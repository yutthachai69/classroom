import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Class, User } from '@/lib/types';
import { generateClassCode } from '@/lib/utils';

// GET all classes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');

    const db = await getDatabase();
    let query: any = {};

    if (teacherId) {
      query.teacherId = new ObjectId(teacherId);
    } else if (studentId) {
      query.students = new ObjectId(studentId);
    }

    const classes = await db.collection<Class>('classes').find(query).toArray();

    // Populate teacher names
    const classesWithTeachers = await Promise.all(
      classes.map(async (cls) => {
        const teacher = await db
          .collection<User>('users')
          .findOne({ _id: cls.teacherId });
        return {
          ...cls,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
        };
      })
    );

    return NextResponse.json({ classes: classesWithTeachers });
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคลาส' },
      { status: 500 }
    );
  }
}

// POST create new class
export async function POST(request: NextRequest) {
  try {
    const { name, description, teacherId } = await request.json();

    if (!name || !teacherId) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Generate unique class code
    let classCode = generateClassCode();
    let existingClass = await db.collection<Class>('classes').findOne({ classCode });
    
    // Ensure class code is unique
    while (existingClass) {
      classCode = generateClassCode();
      existingClass = await db.collection<Class>('classes').findOne({ classCode });
    }
    
    const newClass: Omit<Class, '_id'> = {
      name,
      description: description || '',
      classCode,
      teacherId: new ObjectId(teacherId),
      students: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Class>('classes').insertOne(newClass as Class);

    return NextResponse.json({
      message: 'สร้างคลาสสำเร็จ',
      classId: result.insertedId,
      classCode: classCode,
    });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างคลาส' },
      { status: 500 }
    );
  }
}

