import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Class } from '@/lib/types';

// GET class by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const classData = await db
      .collection<Class>('classes')
      .findOne({ _id: new ObjectId(id) });

    if (!classData) {
      return NextResponse.json({ error: 'ไม่พบคลาส' }, { status: 404 });
    }

    // Populate teacher details
    const teacherDetails = await db
      .collection('users')
      .findOne({ 
        _id: classData.teacherId,
        userType: 'teacher'
      });

    // Populate student details
    if (classData.students && classData.students.length > 0) {
      const studentDetails = await db
        .collection('users')
        .find({ 
          _id: { $in: classData.students.map((id: any) => new ObjectId(id)) },
          userType: 'student'
        })
        .toArray();

      const classWithDetails = {
        ...classData,
        teacherDetails,
        studentDetails
      };

      return NextResponse.json({ class: classWithDetails });
    }

    return NextResponse.json({ 
      class: { 
        ...classData, 
        teacherDetails,
        studentDetails: [] 
      } 
    });
  } catch (error) {
    console.error('Get class error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PUT update class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = await getDatabase();

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    delete updateData._id;

    const result = await db
      .collection<Class>('classes')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบคลาส' }, { status: 404 });
    }

    return NextResponse.json({ message: 'อัพเดทคลาสสำเร็จ' });
  } catch (error) {
    console.error('Update class error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทคลาส' },
      { status: 500 }
    );
  }
}

// DELETE class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db
      .collection<Class>('classes')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบคลาส' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบคลาสสำเร็จ' });
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบคลาส' },
      { status: 500 }
    );
  }
}

