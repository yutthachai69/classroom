import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Announcement, Class, User } from '@/lib/types';

// GET all announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');

    const db = await getDatabase();
    const query: Record<string, unknown> = {};

    if (classId) {
      query.classId = new ObjectId(classId);
    } else if (teacherId) {
      query.teacherId = new ObjectId(teacherId);
    }

    const announcements = await db
      .collection<Announcement>('announcements')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Populate class and teacher names
    const announcementsWithDetails = await Promise.all(
      announcements.map(async (announcement) => {
        const classData = await db
          .collection<Class>('classes')
          .findOne({ _id: announcement.classId });
        const teacher = await db
          .collection<User>('users')
          .findOne({ _id: announcement.teacherId });
        return {
          ...announcement,
          className: classData?.name || 'Unknown',
          teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
        };
      })
    );

    return NextResponse.json({ announcements: announcementsWithDetails });
  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประกาศ' },
      { status: 500 }
    );
  }
}

// POST create announcement
export async function POST(request: NextRequest) {
  try {
    const { title, content, classId, teacherId, attachments } = await request.json();

    if (!title || !content || !classId || !teacherId) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newAnnouncement: Omit<Announcement, '_id'> = {
      title,
      content,
      classId: new ObjectId(classId),
      teacherId: new ObjectId(teacherId),
      comments: [],
      attachments: attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection<Announcement>('announcements')
      .insertOne(newAnnouncement as Announcement);

    return NextResponse.json({
      message: 'สร้างประกาศสำเร็จ',
      announcementId: result.insertedId,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างประกาศ' },
      { status: 500 }
    );
  }
}

