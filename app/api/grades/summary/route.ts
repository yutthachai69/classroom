import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { StudentGradeSummary, GradeStructure, AssignmentGrade, User } from '@/lib/types';
import { calculateWeightedPoints, calculateFinalGrade } from '@/lib/utils';

// GET student grade summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'กรุณาระบุ studentId และ classId' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    console.log('Getting grade summary for:', { studentId, classId });

    // Get active grade structure for this class
    const gradeStructure = await db.collection<GradeStructure>('gradeStructures').findOne({
      classId: new ObjectId(classId),
      isActive: true,
    });

    console.log('Grade structure found:', gradeStructure ? 'Yes' : 'No');

    if (!gradeStructure) {
      console.log('No grade structure found for class:', classId);
      return NextResponse.json(
        { error: 'ไม่พบโครงสร้างคะแนนสำหรับคลาสนี้' },
        { status: 404 }
      );
    }

    // Get student info
    const student = await db.collection<User>('users').findOne({ _id: new ObjectId(studentId) });
    if (!student) {
      return NextResponse.json(
        { error: 'ไม่พบนักเรียนที่ระบุ' },
        { status: 404 }
      );
    }

    // Get all grades for this student in this class
    const assignments = await db.collection('assignments').find({ 
      classId: new ObjectId(classId) 
    }).toArray();
    
    const assignmentIds = assignments.map(a => a._id);
    
    const grades = await db.collection<AssignmentGrade>('assignmentGrades').find({
      studentId: new ObjectId(studentId),
      assignmentId: { $in: assignmentIds },
    }).toArray();

    console.log('Found assignments:', assignments.length);
    console.log('Found grades:', grades.length);
    console.log('Grade structure categories:', gradeStructure.categories.length);

    // Calculate summary for each category
    const categorySummaries = gradeStructure.categories.map(category => {
      // For now, assign all grades to the first category if no proper mapping exists
      // This ensures grades show up even if gradeCategoryId mapping is missing
      const categoryGrades = grades.filter(grade => {
        // If grade has a valid categoryId, match it exactly
        if (grade.gradeCategoryId && grade.gradeCategoryId.toString() === category._id?.toString()) {
          return true;
        }
        // If no categoryId or it's the first category, assign all unmatched grades to first category
        if (!grade.gradeCategoryId || category.order === 1) {
          return true;
        }
        return false;
      });

      const earnedPoints = categoryGrades.reduce((sum, grade) => sum + grade.points, 0);
      const maxPoints = category.maxPoints;
      const percentage = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0;
      const weightedPoints = calculateWeightedPoints(earnedPoints, maxPoints, category.weight);

      return {
        categoryId: category._id!,
        categoryName: category.name,
        earnedPoints,
        maxPoints,
        percentage: Math.round(percentage * 100) / 100,
        weight: category.weight,
        weightedPoints: Math.round(weightedPoints * 100) / 100,
      };
    });

    const totalEarnedPoints = categorySummaries.reduce((sum, cat) => sum + cat.earnedPoints, 0);
    const totalMaxPoints = gradeStructure.totalPoints;
    const finalPercentage = totalMaxPoints > 0 ? (totalEarnedPoints / totalMaxPoints) * 100 : 0;
    const finalGrade = calculateFinalGrade(finalPercentage);

    const summary: StudentGradeSummary = {
      studentId: new ObjectId(studentId),
      studentName: `${student.firstName} ${student.lastName}`,
      gradeStructureId: gradeStructure._id!,
      categories: categorySummaries,
      totalEarnedPoints,
      totalMaxPoints,
      finalPercentage: Math.round(finalPercentage * 100) / 100,
      finalGrade,
      lastUpdated: new Date(),
    };

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Get student grade summary error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการคำนวณคะแนน' },
      { status: 500 }
    );
  }
}

