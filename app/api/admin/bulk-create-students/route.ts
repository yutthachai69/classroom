import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/lib/types';
import { hashPassword } from '@/lib/utils';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface StudentData {
  studentId: string; // รหัสนักเรียน
  firstName: string; // ชื่อ
  lastName: string; // นามสกุล
  englishName: string; // ชื่อภาษาอังกฤษ (ใช้เป็น username)
  studentNumber?: string; // เลขที่
}

interface BulkCreateResult {
  success: number;
  failed: number;
  errors: string[];
  createdStudents: {
    username: string;
    firstName: string;
    lastName: string;
    studentId: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'กรุณาเลือกไฟล์' },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'รองรับเฉพาะไฟล์ CSV และ Excel (.xlsx, .xls)' },
        { status: 400 }
      );
    }

    // อ่านไฟล์
    const buffer = await file.arrayBuffer();
    let studentsData: StudentData[] = [];

    if (file.type === 'text/csv') {
      // ประมวลผลไฟล์ CSV
      const csvText = new TextDecoder('utf-8').decode(buffer);
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (result.errors.length > 0) {
        return NextResponse.json(
          { error: `ข้อผิดพลาดในการอ่านไฟล์ CSV: ${result.errors[0].message}` },
          { status: 400 }
        );
      }

      studentsData = result.data.map((row: any) => ({
        studentId: String(row['รหัสนักเรียน'] || row['studentId'] || row['รหัส'] || '').trim(),
        firstName: String(row['ชื่อ'] || row['firstName'] || row['ชื่อจริง'] || '').trim(),
        lastName: String(row['นามสกุล'] || row['lastName'] || row['สกุล'] || '').trim(),
        englishName: String(row['ชื่อภาษาอังกฤษ'] || row['englishName'] || row['username'] || '').trim(),
        studentNumber: String(row['เลขที่'] || row['studentNumber'] || row['ที่'] || '').trim(),
      }));
    } else {
      // ประมวลผลไฟล์ Excel
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        return NextResponse.json(
          { error: 'ไฟล์ Excel ต้องมีข้อมูลอย่างน้อย 2 แถว (หัวข้อและข้อมูล)' },
          { status: 400 }
        );
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      studentsData = dataRows.map((row) => {
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header.trim()] = row[index] || '';
        });

        return {
          studentId: String(rowData['รหัสนักเรียน'] || rowData['studentId'] || rowData['รหัส'] || '').trim(),
          firstName: String(rowData['ชื่อ'] || rowData['firstName'] || rowData['ชื่อจริง'] || '').trim(),
          lastName: String(rowData['นามสกุล'] || rowData['lastName'] || rowData['สกุล'] || '').trim(),
          englishName: String(rowData['ชื่อภาษาอังกฤษ'] || rowData['englishName'] || rowData['username'] || '').trim(),
          studentNumber: String(rowData['เลขที่'] || rowData['studentNumber'] || rowData['ที่'] || '').trim(),
        };
      });
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    const errors: string[] = [];
    const validStudents: StudentData[] = [];

    studentsData.forEach((student, index) => {
      const rowNumber = index + 2; // +2 เพราะเริ่มจากแถวที่ 2 (ข้ามหัวข้อ)

      if (!student.studentId) {
        errors.push(`แถว ${rowNumber}: ไม่พบรหัสนักเรียน`);
        return;
      }

      if (!student.firstName || !student.lastName) {
        errors.push(`แถว ${rowNumber}: ไม่พบชื่อหรือนามสกุล`);
        return;
      }

      if (!student.englishName) {
        errors.push(`แถว ${rowNumber}: ไม่พบชื่อภาษาอังกฤษ`);
        return;
      }

      // ตรวจสอบรหัสนักเรียนซ้ำ
      if (validStudents.some(s => s.studentId === student.studentId)) {
        errors.push(`แถว ${rowNumber}: รหัสนักเรียน ${student.studentId} ซ้ำ`);
        return;
      }

      // ตรวจสอบชื่อภาษาอังกฤษซ้ำ
      if (validStudents.some(s => s.englishName === student.englishName)) {
        errors.push(`แถว ${rowNumber}: ชื่อภาษาอังกฤษ ${student.englishName} ซ้ำ`);
        return;
      }

      validStudents.push(student);
    });

    if (validStudents.length === 0) {
      return NextResponse.json(
        { 
          error: 'ไม่พบข้อมูลนักเรียนที่ถูกต้อง',
          details: errors 
        },
        { status: 400 }
      );
    }

    // สร้างบัญชีนักเรียน
    const db = await getDatabase();
    const result: BulkCreateResult = {
      success: 0,
      failed: 0,
      errors: [...errors],
      createdStudents: []
    };

    for (const student of validStudents) {
      try {
        // ตรวจสอบว่ามี username ซ้ำหรือไม่
        const existingUser = await db.collection<User>('users').findOne({
          $or: [
            { username: student.englishName },
            { studentId: student.studentId }
          ]
        });

        if (existingUser) {
          result.failed++;
          result.errors.push(`รหัสนักเรียน ${student.studentId} หรือ username ${student.englishName} มีอยู่แล้ว`);
          continue;
        }

        // สร้างบัญชีใหม่
        const hashedPassword = await hashPassword(student.studentId);
        
        const newUser: Omit<User, '_id'> = {
          username: student.englishName,
          password: hashedPassword,
          firstName: student.firstName,
          lastName: student.lastName,
          email: `${student.englishName}@school.local`, // สร้าง email ชั่วคราว
          userType: 'student',
          studentId: student.studentId,
          studentNumber: student.studentNumber,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const insertResult = await db.collection<User>('users').insertOne(newUser as User);
        
        if (insertResult.insertedId) {
          result.success++;
          result.createdStudents.push({
            username: student.englishName,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId,
          });
        } else {
          result.failed++;
          result.errors.push(`ไม่สามารถสร้างบัญชีสำหรับ ${student.studentId} ได้`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(`ข้อผิดพลาดในการสร้างบัญชี ${student.studentId}: ${error}`);
      }
    }

    return NextResponse.json({
      message: `สร้างบัญชีนักเรียนสำเร็จ ${result.success} รายการ`,
      result
    });

  } catch (error) {
    console.error('Bulk create students error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการประมวลผลไฟล์' },
      { status: 500 }
    );
  }
}
