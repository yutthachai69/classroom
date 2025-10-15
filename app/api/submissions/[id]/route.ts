import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Submission } from '@/lib/types';

// GET submission by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const submission = await db
      .collection<Submission>('submissions')
      .findOne({ _id: new ObjectId(id) });

    if (!submission) {
      return NextResponse.json({ error: 'ไม่พบการส่งงาน' }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PUT update submission (for grading or content editing)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { grade, feedback, content, attachments } = await request.json();
    const db = await getDatabase();

    const updateData: any = {
      updatedAt: new Date(),
    };

    // For grading (teacher)
    if (grade !== undefined) {
      updateData.grade = Number(grade);
      updateData.gradedAt = new Date();
    }
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }

    // For content editing (student)
    if (content !== undefined) {
      updateData.content = content;
      updateData.isEdited = true;
      updateData.editedAt = new Date();
      // Reset grade when content is edited
      updateData.grade = undefined;
      updateData.feedback = undefined;
      updateData.gradedAt = undefined;
    }
    if (attachments !== undefined) {
      updateData.attachments = attachments;
    }

    const result = await db
      .collection<Submission>('submissions')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบการส่งงาน' }, { status: 404 });
    }

    const message = grade !== undefined ? 'ให้คะแนนสำเร็จ' : 'แก้ไขงานสำเร็จ';
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดต' },
      { status: 500 }
    );
  }
}

// DELETE submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db
      .collection<Submission>('submissions')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบการส่งงาน' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบการส่งงานสำเร็จ' });
  } catch (error) {
    console.error('Delete submission error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบการส่งงาน' },
      { status: 500 }
    );
  }
}

