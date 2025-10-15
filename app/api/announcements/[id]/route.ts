import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Announcement } from '@/lib/types';

// GET announcement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const announcement = await db
      .collection<Announcement>('announcements')
      .findOne({ _id: new ObjectId(id) });

    if (!announcement) {
      return NextResponse.json({ error: 'ไม่พบประกาศ' }, { status: 404 });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

// PUT update announcement
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
      .collection<Announcement>('announcements')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบประกาศ' }, { status: 404 });
    }

    return NextResponse.json({ message: 'อัพเดทประกาศสำเร็จ' });
  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทประกาศ' },
      { status: 500 }
    );
  }
}

// DELETE announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db
      .collection<Announcement>('announcements')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'ไม่พบประกาศ' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ลบประกาศสำเร็จ' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบประกาศ' },
      { status: 500 }
    );
  }
}

