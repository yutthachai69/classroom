import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { GradeStructure, User } from '@/lib/types';
import { validateGradeStructure } from '@/lib/utils';

// GET all grade structures for a class
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    if (!classId && !teacherId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ classId หรือ teacherId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const query: Record<string, unknown> = {};

    if (classId) {
      query.classId = new ObjectId(classId);
    }
    if (teacherId) {
      query.teacherId = new ObjectId(teacherId);
    }

    const gradeStructures = await db.collection<GradeStructure>('gradeStructures').find(query).toArray();

    // Populate teacher names
    const structuresWithTeachers = await Promise.all(
      gradeStructures.map(async (structure) => {
        const teacher = await db
          .collection<User>('users')
          .findOne({ _id: structure.teacherId });
        return {
          ...structure,
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
        };
      })
    );

    return NextResponse.json({ gradeStructures: structuresWithTeachers });
  } catch (error) {
    console.error('Get grade structures error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างคะแนน' },
      { status: 500 }
    );
  }
}

// POST create new grade structure
export async function POST(request: NextRequest) {
  try {
    const { name, description, classId, teacherId, totalPoints, categories } = await request.json();

    if (!name || !classId || !teacherId || !totalPoints || !categories) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Validate grade structure
    const validation = validateGradeStructure(categories);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if class exists
    const classData = await db.collection('classes').findOne({ _id: new ObjectId(classId) });
    if (!classData) {
      return NextResponse.json(
        { error: 'ไม่พบคลาสเรียน' },
        { status: 404 }
      );
    }

    // Deactivate existing grade structures for this class
    await db.collection<GradeStructure>('gradeStructures').updateMany(
      { classId: new ObjectId(classId) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    const newGradeStructure: Omit<GradeStructure, '_id'> = {
      name,
      description: description || '',
      classId: new ObjectId(classId),
      className: classData.name,
      teacherId: new ObjectId(teacherId),
      totalPoints,
      categories: categories.map((cat: any, index: number) => ({
        ...cat,
        _id: new ObjectId(),
        order: index + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<GradeStructure>('gradeStructures').insertOne(newGradeStructure as GradeStructure);

    return NextResponse.json({
      message: 'สร้างโครงสร้างคะแนนสำเร็จ',
      gradeStructureId: result.insertedId,
    });
  } catch (error) {
    console.error('Create grade structure error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างโครงสร้างคะแนน' },
      { status: 500 }
    );
  }
}

