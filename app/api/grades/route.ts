import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { AssignmentGrade, User } from '@/lib/types';
import { calculatePercentage } from '@/lib/utils';

// GET grades for an assignment or student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    const db = await getDatabase();
    let query: any = {};

    if (assignmentId) {
      query.assignmentId = new ObjectId(assignmentId);
    }
    if (studentId) {
      query.studentId = new ObjectId(studentId);
    }
    if (classId) {
      // Get assignments for this class first
      const assignments = await db.collection('assignments').find({ classId: new ObjectId(classId) }).toArray();
      const assignmentIds = assignments.map(a => a._id);
      query.assignmentId = { $in: assignmentIds };
    }

    const grades = await db.collection<AssignmentGrade>('assignmentGrades').find(query).toArray();

    // Populate student names
    const gradesWithNames = await Promise.all(
      grades.map(async (grade) => {
        const student = await db
          .collection<User>('users')
          .findOne({ _id: grade.studentId });
        return {
          ...grade,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        };
      })
    );

    return NextResponse.json({ grades: gradesWithNames });
  } catch (error) {
    console.error('Get grades error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคะแนน' },
      { status: 500 }
    );
  }
}

// POST create or update grade
export async function POST(request: NextRequest) {
  try {
    const { assignmentId, studentId, gradeCategoryId, points, maxPoints, feedback, gradedBy } = await request.json();

    console.log('Received grade data:', { assignmentId, studentId, gradeCategoryId, points, maxPoints, feedback, gradedBy });

    if (!assignmentId || !studentId || points === undefined || !maxPoints || !gradedBy) {
      console.log('Missing required fields:', { assignmentId, studentId, points, maxPoints, gradedBy });
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Validate gradeCategoryId if provided
    if (gradeCategoryId && gradeCategoryId !== 'default' && !ObjectId.isValid(gradeCategoryId)) {
      console.log('Invalid gradeCategoryId:', gradeCategoryId);
      return NextResponse.json(
        { error: 'gradeCategoryId ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    if (points < 0 || points > maxPoints) {
      return NextResponse.json(
        { error: 'คะแนนต้องอยู่ระหว่าง 0 ถึงคะแนนเต็ม' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if assignment exists
    const assignment = await db.collection('assignments').findOne({ _id: new ObjectId(assignmentId) });
    if (!assignment) {
      return NextResponse.json(
        { error: 'ไม่พบงานที่ระบุ' },
        { status: 404 }
      );
    }

    // Check if student exists
    const student = await db.collection<User>('users').findOne({ _id: new ObjectId(studentId) });
    if (!student) {
      return NextResponse.json(
        { error: 'ไม่พบนักเรียนที่ระบุ' },
        { status: 404 }
      );
    }

    const percentage = calculatePercentage(points, maxPoints);

    // Resolve grade category: map to active grade structure for the assignment's class
    let resolvedGradeCategoryId: ObjectId | undefined;
    let resolvedGradeCategoryName: string | undefined;

    if (gradeCategoryId && ObjectId.isValid(gradeCategoryId)) {
      resolvedGradeCategoryId = new ObjectId(gradeCategoryId);
    }

    if (!resolvedGradeCategoryId) {
      // Find active grade structure for this class and pick the first category as default
      const activeStructure = await db.collection('gradeStructures').findOne({
        classId: assignment.classId,
        isActive: true,
      });

      if (activeStructure && Array.isArray(activeStructure.categories) && activeStructure.categories.length > 0) {
        const defaultCategory = activeStructure.categories[0];
        resolvedGradeCategoryId = defaultCategory._id as ObjectId;
        resolvedGradeCategoryName = defaultCategory.name;
      }
    } else {
      // Try to resolve the name from the grade structure, if available
      const containingStructure = await db.collection('gradeStructures').findOne({
        classId: assignment.classId,
        isActive: true,
        'categories._id': resolvedGradeCategoryId,
      });
      if (containingStructure) {
        const matched = containingStructure.categories.find((c: any) => c._id?.toString() === resolvedGradeCategoryId?.toString());
        resolvedGradeCategoryName = matched?.name;
      }
    }

    // Check if grade already exists
    const existingGrade = await db.collection<AssignmentGrade>('assignmentGrades').findOne({
      assignmentId: new ObjectId(assignmentId),
      studentId: new ObjectId(studentId),
    });

    const gradeData: Omit<AssignmentGrade, '_id'> = {
      assignmentId: new ObjectId(assignmentId),
      studentId: new ObjectId(studentId),
      studentName: `${student.firstName} ${student.lastName}`,
      gradeCategoryId: resolvedGradeCategoryId as ObjectId,
      gradeCategoryName: resolvedGradeCategoryName,
      points,
      maxPoints,
      percentage,
      feedback: feedback || '',
      gradedAt: new Date(),
      gradedBy: new ObjectId(gradedBy),
    };

    let result;
    if (existingGrade) {
      // Update existing grade
      result = await db.collection<AssignmentGrade>('assignmentGrades').updateOne(
        { _id: existingGrade._id },
        { $set: gradeData }
      );
    } else {
      // Create new grade
      result = await db.collection<AssignmentGrade>('assignmentGrades').insertOne(gradeData as AssignmentGrade);
    }

    return NextResponse.json({
      message: existingGrade ? 'อัปเดตคะแนนสำเร็จ' : 'บันทึกคะแนนสำเร็จ',
      gradeId: existingGrade ? existingGrade._id : result.insertedId,
    });
  } catch (error) {
    console.error('Save grade error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกคะแนน' },
      { status: 500 }
    );
  }
}

