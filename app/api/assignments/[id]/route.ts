import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Assignment } from '@/lib/types';

// GET assignment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const assignment = await db
      .collection<Assignment>('assignments')
      .findOne({ _id: new ObjectId(id) });

    if (!assignment) {
      return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PUT update assignment
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

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

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
      .collection<Assignment>('assignments')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });
    }

    return NextResponse.json({ message: 'อัพเดทงานสำเร็จ' });
  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทงาน' },
      { status: 500 }
    );
  }
}

// DELETE assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db
      .collection<Assignment>('assignments')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบงานสำเร็จ' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบงาน' },
      { status: 500 }
    );
  }
}

