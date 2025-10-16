'use client';

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Users, ArrowRight, Clock, Database, List } from 'lucide-react';

export default function StudentNumberSystem() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ระบบเลขที่นักเรียน
        </h1>

        {/* Main Answer */}
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">คำตอบ</h2>
              <p className="text-green-800 text-lg">
                <strong>ใช่ครับ!</strong> ลำดับเลขที่ขึ้นอยู่กับลำดับที่ admin เพิ่มนักเรียนเข้าไปในคลาส
              </p>
              <p className="text-green-700 mt-2">
                ใครที่ admin เพิ่มก่อน → ได้เลขที่น้อยกว่า (1, 2, 3, ...)
              </p>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Admin Adds Students */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Admin เพิ่มนักเรียน</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">09:00 น.</span>
                  <span className="font-medium">เพิ่ม สมชาย ใจดี</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">เลขที่ 1</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">09:15 น.</span>
                  <span className="font-medium">เพิ่ม สมหญิง รักดี</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">เลขที่ 2</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">10:30 น.</span>
                  <span className="font-medium">เพิ่ม สมศักดิ์ เก่งมาก</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">เลขที่ 3</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Database Storage */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">การเก็บใน Database</h3>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm text-gray-700">
{`{
  "_id": "class123",
  "name": "ม.5",
  "students": [
    "student1",  // สมชาย ใจดี (เพิ่มก่อน)
    "student2",  // สมหญิง รักดี
    "student3"   // สมศักดิ์ เก่งมาก (เพิ่มหลัง)
  ]
}`}
              </pre>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <p>• Array <code>students</code> เก็บ ID ของนักเรียนตามลำดับที่เพิ่ม</p>
              <p>• Index 0 = เลขที่ 1, Index 1 = เลขที่ 2, ...</p>
            </div>
          </Card>
        </div>

        {/* Display Logic */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <List className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">การแสดงผลในตาราง</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code Logic */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">รหัสการแสดงผล:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`{students.map((s, index) => (
  <tr key={s._id}>
    <td>
      {s.studentNumber || index + 1}
    </td>
    <td>{s.firstName} {s.lastName}</td>
  </tr>
))}`}
                </pre>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <p>• <code>index + 1</code> = เลขที่ (1, 2, 3, ...)</p>
                <p>• <code>s.studentNumber</code> = เลขที่ที่กำหนดเอง (ถ้ามี)</p>
              </div>
            </div>

            {/* Result */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">ผลลัพธ์:</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">เลขที่</th>
                      <th className="px-3 py-2 text-left">ชื่อ-นามสกุล</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2 text-center font-medium">1</td>
                      <td className="px-3 py-2">สมชาย ใจดี</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 text-center font-medium">2</td>
                      <td className="px-3 py-2">สมหญิง รักดี</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 text-center font-medium">3</td>
                      <td className="px-3 py-2">สมศักดิ์ เก่งมาก</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Two Ways to Add Students */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ArrowRight className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">2 วิธีในการเพิ่มนักเรียน</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Adds */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">1. Admin เพิ่มโดยตรง</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Admin เข้าไปในหน้า "จัดการคลาส"</p>
                <p>• เลือกคลาสที่ต้องการ</p>
                <p>• เพิ่มนักเรียนเข้าไปในคลาส</p>
                <p>• <strong>ลำดับขึ้นอยู่กับเวลาที่ admin เพิ่ม</strong></p>
              </div>
              
              <div className="mt-3 bg-white p-3 rounded border">
                <pre className="text-xs text-gray-700">
{`// API: POST /api/classes/{id}/students
{
  "studentId": "student123"
}

// Database: $push ไปที่ students array
{ $push: { students: studentObjectId } }`}
                </pre>
              </div>
            </div>

            {/* Student Joins */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">2. นักเรียนเข้าร่วมด้วยรหัสคลาส</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>• นักเรียนใช้รหัสคลาสเข้าร่วม</p>
                <p>• ระบบเพิ่มนักเรียนเข้าไปในคลาส</p>
                <p>• <strong>ลำดับขึ้นอยู่กับเวลาที่นักเรียนเข้าร่วม</strong></p>
              </div>
              
              <div className="mt-3 bg-white p-3 rounded border">
                <pre className="text-xs text-gray-700">
{`// API: POST /api/classes/join
{
  "classCode": "ABC123",
  "studentId": "student456"
}

// Database: $push ไปที่ students array
{ $push: { students: studentObjectId } }`}
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">ข้อสำคัญ</h3>
              <div className="space-y-2 text-yellow-800">
                <div className="flex items-start space-x-2">
                  <span className="font-bold">1.</span>
                  <p>ลำดับเลขที่ขึ้นอยู่กับ <strong>ลำดับใน array</strong> ไม่ใช่เวลาที่สร้างบัญชี</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">2.</span>
                  <p>ถ้า admin ลบนักเรียนออก แล้วเพิ่มใหม่ จะได้เลขที่ใหม่ (ท้ายสุด)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">3.</span>
                  <p>ระบบใช้ <code>index + 1</code> เป็นเลขที่ หากไม่มี <code>studentNumber</code></p>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">4.</span>
                  <p>หากต้องการเลขที่คงที่ ต้องกำหนด <code>studentNumber</code> ในข้อมูลนักเรียน</p>
                </div>
              </div>
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
            <Database className="h-4 w-4" />
            <span>{showDetails ? 'ซ่อน' : 'แสดง'} รหัสตัวอย่าง</span>
          </Button>
        </div>

        {showDetails && (
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">รหัสตัวอย่าง</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">1. การเพิ่มนักเรียนในคลาส:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// app/api/classes/[id]/students/route.ts
export async function POST(request, { params }) {
  const { studentId } = await request.json();
  
  // เพิ่มนักเรียนเข้าไปใน students array
  await db.collection('classes').updateOne(
    { _id: new ObjectId(id) },
    { $push: { students: new ObjectId(studentId) } }
  );
  
  return NextResponse.json({ message: 'เพิ่มนักเรียนสำเร็จ' });
}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">2. การแสดงเลขที่ในตาราง:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// components/teacher/GradebookModal.tsx
{students.map((s, index) => (
  <tr key={s._id}>
    <td className="text-center font-medium">
      {s.studentNumber || index + 1}
    </td>
    <td>{s.firstName} {s.lastName}</td>
  </tr>
))}`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">3. การดึงข้อมูลนักเรียน:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// app/api/classes/[id]/route.ts
const classData = await db.collection('classes').findOne({ _id: new ObjectId(id) });

// ดึงข้อมูลนักเรียนตามลำดับใน students array
const studentDetails = await db.collection('users').find({ 
  _id: { $in: classData.students.map(id => new ObjectId(id)) },
  userType: 'student'
}).toArray();

// ส่งข้อมูลกลับพร้อม studentDetails
return NextResponse.json({ 
  class: { ...classData, studentDetails }
});`}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
