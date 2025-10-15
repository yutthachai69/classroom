import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Announcement, Comment } from '@/lib/types';

// POST add comment to announcement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, userName, content } = await request.json();

    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newComment: Comment = {
      userId: new ObjectId(userId),
      userName,
      content,
      createdAt: new Date(),
    };

    const result = await db
      .collection<Announcement>('announcements')
      .updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment }, $set: { updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบประกาศ' }, { status: 404 });
    }

    return NextResponse.json({ message: 'เพิ่มความคิดเห็นสำเร็จ' });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น' },
      { status: 500 }
    );
  }
}

