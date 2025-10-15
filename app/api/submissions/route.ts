import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { Submission, User } from '@/lib/types';

// GET all submissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    const db = await getDatabase();
    let query: any = {};

    if (assignmentId) {
      query.assignmentId = new ObjectId(assignmentId);
    } else if (studentId) {
      query.studentId = new ObjectId(studentId);
    }

    const submissions = await db
      .collection<Submission>('submissions')
      .find(query)
      .sort({ submittedAt: -1 })
      .toArray();

    // Populate student names and grades
    const submissionsWithStudent = await Promise.all(
      submissions.map(async (submission) => {
        const student = await db
          .collection<User>('users')
          .findOne({ _id: submission.studentId });
        
        // Get grade for this submission
        const grade = await db.collection('assignmentGrades').findOne({
          assignmentId: submission.assignmentId,
          studentId: submission.studentId,
        });
        
        return {
          ...submission,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          grade: grade?.points,
          feedback: grade?.feedback,
        };
      })
    );

    return NextResponse.json({ submissions: submissionsWithStudent });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการส่งงาน' },
      { status: 500 }
    );
  }
}

// POST create submission
export async function POST(request: NextRequest) {
  try {
    const { assignmentId, studentId, content, attachments } = await request.json();

    if (!assignmentId || !studentId || !content) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if student already submitted
    const existingSubmission = await db.collection<Submission>('submissions').findOne({
      assignmentId: new ObjectId(assignmentId),
      studentId: new ObjectId(studentId),
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'คุณส่งงานนี้แล้ว' },
        { status: 400 }
      );
    }

    const newSubmission: Omit<Submission, '_id'> = {
      assignmentId: new ObjectId(assignmentId),
      studentId: new ObjectId(studentId),
      content,
      attachments: attachments || [],
      submittedAt: new Date(),
    };

    const result = await db
      .collection<Submission>('submissions')
      .insertOne(newSubmission as Submission);

    return NextResponse.json({
      message: 'ส่งงานสำเร็จ',
      submissionId: result.insertedId,
    });
  } catch (error) {
    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งงาน' },
      { status: 500 }
    );
  }
}

