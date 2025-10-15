import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { GradeStructure } from '@/lib/types';

// GET grade structure by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const gradeStructure = await db
      .collection<GradeStructure>('gradeStructures')
      .findOne({ _id: new ObjectId(id) });

    if (!gradeStructure) {
      return NextResponse.json({ error: 'ไม่พบโครงสร้างคะแนน' }, { status: 404 });
    }

    return NextResponse.json({ gradeStructure });
  } catch (error) {
    console.error('Get grade structure error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PUT update grade structure
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

    // Ensure relational fields are stored as ObjectId
    if (data.classId) {
      try {
        updateData.classId = new ObjectId(String(data.classId));
      } catch {}
    }
    if (data.teacherId) {
      try {
        updateData.teacherId = new ObjectId(String(data.teacherId));
      } catch {}
    }

    delete updateData._id;

    const result = await db
      .collection<GradeStructure>('gradeStructures')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบโครงสร้างคะแนน' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'อัปเดตโครงสร้างคะแนนสำเร็จ',
      gradeStructure: updateData
    });
  } catch (error) {
    console.error('Update grade structure error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตโครงสร้างคะแนน' },
      { status: 500 }
    );
  }
}

// DELETE grade structure
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db
      .collection<GradeStructure>('gradeStructures')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบโครงสร้างคะแนน' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบโครงสร้างคะแนนสำเร็จ' });
  } catch (error) {
    console.error('Delete grade structure error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบโครงสร้างคะแนน' },
      { status: 500 }
    );
  }
}
