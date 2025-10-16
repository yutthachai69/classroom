'use client';

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { AlertCircle, CheckCircle, Code, Database, Bug } from 'lucide-react';

export default function WhyItDidntWorkBefore() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทำไมก่อนหน้านี้มันแสดงไม่ได้?
        </h1>

        {/* Main Problem */}
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">ปัญหาหลัก</h2>
              <p className="text-red-800">
                API <code className="bg-red-100 px-2 py-1 rounded">/api/classes/{`{id}`}</code> ไม่ได้ส่งข้อมูลนักเรียนมาให้
              </p>
            </div>
          </div>
        </Card>

        {/* Before vs After */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Before */}
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Bug className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">ก่อนแก้ไข (มีปัญหา)</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-gray-900">API Response:</h4>
                <pre className="text-xs text-gray-600 mt-1">
{`{
  "class": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "ม.5",
    "students": ["student1", "student2"],
    // ❌ ไม่มี studentDetails
  }
}`}
                </pre>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-gray-900">GradebookModal:</h4>
                <pre className="text-xs text-gray-600 mt-1">
{`const members = (studentsData.class?.studentDetails || [])
// ❌ studentDetails เป็น undefined
// ❌ members เป็น array ว่าง []
// ❌ แสดง "ยังไม่มีนักเรียน"`}
                </pre>
              </div>
            </div>
          </Card>

          {/* After */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">หลังแก้ไข (ทำงานได้)</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <h4 className="font-semibold text-gray-900">API Response:</h4>
                <pre className="text-xs text-gray-600 mt-1">
{`{
  "class": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "ม.5",
    "students": ["student1", "student2"],
    "studentDetails": [  // ✅ เพิ่มข้อมูลนักเรียน
      {
        "_id": "student1",
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "studentId": "64001"
      }
    ]
  }
}`}
                </pre>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <h4 className="font-semibold text-gray-900">GradebookModal:</h4>
                <pre className="text-xs text-gray-600 mt-1">
{`const members = (studentsData.class?.studentDetails || [])
// ✅ studentDetails มีข้อมูลนักเรียน
// ✅ members มีข้อมูลนักเรียน
// ✅ แสดงตารางคะแนน`}
                </pre>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">รายละเอียดเทคนิค</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. ปัญหาใน API `/api/classes/[id]/route.ts`</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">ก่อนแก้ไข:</h4>
                <pre className="text-sm text-gray-700">
{`export async function GET(request, { params }) {
  const classData = await db.collection('classes').findOne({ _id: new ObjectId(id) });
  
  // ❌ ส่งข้อมูลคลาสเปล่าๆ ไม่มีข้อมูลนักเรียน
  return NextResponse.json({ class: classData });
}`}
                </pre>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mt-3">
                <h4 className="font-medium text-gray-800 mb-2">หลังแก้ไข:</h4>
                <pre className="text-sm text-gray-700">
{`export async function GET(request, { params }) {
  const classData = await db.collection('classes').findOne({ _id: new ObjectId(id) });
  
  // ✅ Populate ข้อมูลนักเรียน
  if (classData.students && classData.students.length > 0) {
    const studentDetails = await db.collection('users').find({ 
      _id: { $in: classData.students.map(id => new ObjectId(id)) },
      userType: 'student'
    }).toArray();
    
    return NextResponse.json({ 
      class: { ...classData, studentDetails }
    });
  }
  
  return NextResponse.json({ 
    class: { ...classData, studentDetails: [] }
  });
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. การทำงานของ GradebookModal</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`const fetchGradebookData = async () => {
  // เรียก API เพื่อดึงข้อมูลคลาส
  const studentsRes = await fetch(\`/api/classes/\${gradeStructure.classId}\`);
  const studentsData = await studentsRes.json();
  
  // แปลงข้อมูลนักเรียน
  const members = (studentsData.class?.studentDetails || []).map(u => ({
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    studentId: u.studentId || u.username,
    studentNumber: u.studentNumber || 0,
  }));
  
  setStudents(members); // ✅ ตอนนี้มีข้อมูลนักเรียนแล้ว
};`}
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Why This Happened */}
        <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Database className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-yellow-900">ทำไมถึงเกิดปัญหานี้?</h2>
          </div>
          
          <div className="space-y-3 text-yellow-800">
            <div className="flex items-start space-x-2">
              <span className="font-bold">1.</span>
              <p>API `/api/classes/{`{id}`}` ถูกสร้างมาเพื่อดึงข้อมูลคลาสเท่านั้น ไม่ได้คิดว่าจะต้องส่งข้อมูลนักเรียนด้วย</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">2.</span>
              <p>GradebookModal คาดหวังว่าจะได้รับ `studentDetails` array แต่ API ไม่ได้ส่งมา</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">3.</span>
              <p>เมื่อ `studentDetails` เป็น `undefined` การ map ข้อมูลจึงได้ array ว่าง `[]`</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">4.</span>
              <p>UI จึงแสดงข้อความ "ยังไม่มีนักเรียนในคลาสนี้" แม้ว่าจะมีนักเรียนจริงๆ</p>
            </div>
          </div>
        </Card>

        {/* Solution Summary */}
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-900">วิธีแก้ไข</h2>
          </div>
          
          <div className="space-y-3 text-green-800">
            <div className="flex items-start space-x-2">
              <span className="font-bold">1.</span>
              <p>แก้ไข API `/api/classes/[id]/route.ts` ให้ populate ข้อมูลนักเรียนจาก `users` collection</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">2.</span>
              <p>กรองเฉพาะนักเรียนที่มี `userType: 'student'`</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">3.</span>
              <p>ส่งข้อมูลกลับพร้อม `studentDetails` array</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold">4.</span>
              <p>เพิ่ม debugging logs ใน GradebookModal เพื่อตรวจสอบข้อมูล</p>
            </div>
          </div>
        </Card>

        {/* Debugging Tips */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bug className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">วิธี Debug ปัญหาแบบนี้</h2>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">1.</span>
              <p>เปิด Developer Console (F12) และดู Network tab เพื่อตรวจสอบ API response</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">2.</span>
              <p>เพิ่ม console.log ใน component เพื่อดูข้อมูลที่ได้รับ</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">3.</span>
              <p>ตรวจสอบ API endpoint ว่าได้ส่งข้อมูลครบถ้วนหรือไม่</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">4.</span>
              <p>ตรวจสอบ database ว่ามีข้อมูลนักเรียนในคลาสหรือไม่</p>
            </div>
          </div>
        </Card>

        {/* Toggle Details */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 mx-auto"
          >
            <Code className="h-4 w-4" />
            <span>{showDetails ? 'ซ่อน' : 'แสดง'} รหัสตัวอย่าง</span>
          </Button>
        </div>

        {showDetails && (
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">รหัสตัวอย่างการแก้ไข</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">API Route ที่แก้ไข:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// app/api/classes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest, { params }) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    
    const classData = await db.collection('classes').findOne({ 
      _id: new ObjectId(id) 
    });

    if (!classData) {
      return NextResponse.json({ error: 'ไม่พบคลาส' }, { status: 404 });
    }

    // ✅ เพิ่มการ populate ข้อมูลนักเรียน
    if (classData.students && classData.students.length > 0) {
      const studentDetails = await db.collection('users').find({ 
        _id: { $in: classData.students.map(id => new ObjectId(id)) },
        userType: 'student'
      }).toArray();

      return NextResponse.json({ 
        class: { ...classData, studentDetails }
      });
    }

    return NextResponse.json({ 
      class: { ...classData, studentDetails: [] }
    });
  } catch (error) {
    console.error('Get class error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}`}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
