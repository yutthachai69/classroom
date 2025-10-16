'use client';

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { AlertCircle, CheckCircle, FileText, Eye, Bug, Database } from 'lucide-react';

export default function ViewAssignmentButtonIssue() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ปัญหาปุ่ม "ดูงาน" กดแล้วไม่มีอะไรขึ้น
        </h1>

        {/* Main Problem */}
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">ปัญหาที่พบ</h2>
              <p className="text-red-800">
                ปุ่ม "ดูงาน" กดแล้วไม่มีอะไรขึ้น ไม่มี modal หรือ popup แสดงรายละเอียดงาน
              </p>
            </div>
          </div>
        </Card>

        {/* What Should Happen */}
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">สิ่งที่ควรเกิดขึ้น</h2>
              <div className="space-y-2 text-green-800">
                <p>1. แสดง modal หรือ popup รายละเอียดงาน</p>
                <p>2. แสดงข้อมูลงาน: ชื่อ, คำอธิบาย, กำหนดส่ง, คะแนนเต็ม</p>
                <p>3. แสดงปุ่ม "ส่งงาน" หรือ "แก้ไข" (ถ้าส่งแล้ว)</p>
                <p>4. อัพเดทสถานะ "ดูแล้ว" ในระบบ</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Implementation Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Code */}
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Bug className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-900">โค้ดปัจจุบัน</h3>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <pre className="text-sm text-gray-700">
{`<Button
  variant="outline"
  onClick={async () => {
    // Mark as viewed
    await markAsViewed(assignment._id, assignment.classId);
    // Refresh data
    fetchData();
  }}
  className="flex items-center gap-1"
>
  <FileText size={16} />
  ดูงาน
</Button>`}
              </pre>
            </div>
            
            <div className="mt-3 text-sm text-yellow-800">
              <p><strong>ปัญหา:</strong> มีแค่การ mark as viewed และ refresh เท่านั้น</p>
              <p><strong>ไม่มี:</strong> การแสดง modal รายละเอียดงาน</p>
            </div>
          </Card>

          {/* What's Missing */}
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Eye className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">สิ่งที่ขาดหายไป</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-gray-900">Modal รายละเอียดงาน</h4>
                <p className="text-sm text-gray-600">ไม่มี modal แสดงรายละเอียดงาน</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-gray-900">ปุ่มส่งงาน</h4>
                <p className="text-sm text-gray-600">ไม่มีปุ่มส่งงานใน modal</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <h4 className="font-semibold text-gray-900">การแสดงข้อมูล</h4>
                <p className="text-sm text-gray-600">ไม่มีการแสดงรายละเอียดงาน</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Solution */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-blue-900">วิธีแก้ไข</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">1. เพิ่ม State สำหรับ Modal</h3>
              <div className="bg-white p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const [selectedAssignmentForView, setSelectedAssignmentForView] = useState<Assignment | null>(null);`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">2. แก้ไขปุ่ม "ดูงาน"</h3>
              <div className="bg-white p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`<Button
  variant="outline"
  onClick={async () => {
    // Set assignment to view
    setSelectedAssignmentForView(assignment);
    setIsViewModalOpen(true);
    
    // Mark as viewed
    await markAsViewed(assignment._id, assignment.classId);
  }}
  className="flex items-center gap-1"
>
  <FileText size={16} />
  ดูงาน
</Button>`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">3. เพิ่ม Modal รายละเอียดงาน</h3>
              <div className="bg-white p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`<Modal
  isOpen={isViewModalOpen}
  onClose={() => setIsViewModalOpen(false)}
  title="รายละเอียดงาน"
>
  {selectedAssignmentForView && (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {selectedAssignmentForView.title}
      </h3>
      <p className="text-gray-600">
        {selectedAssignmentForView.description}
      </p>
      <div className="flex justify-between">
        <span>กำหนดส่ง: {formatDate(selectedAssignmentForView.dueDate)}</span>
        <span>คะแนนเต็ม: {selectedAssignmentForView.points}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={() => {
            setIsViewModalOpen(false);
            setSelectedAssignment(selectedAssignmentForView);
            setIsModalOpen(true);
          }}
        >
          ส่งงาน
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsViewModalOpen(false)}
        >
          ปิด
        </Button>
      </div>
    </div>
  )}
</Modal>`}
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Flow vs Expected Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Flow */}
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">Flow ปัจจุบัน (มีปัญหา)</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600 font-bold">1</div>
                <span className="text-sm">ผู้ใช้กดปุ่ม "ดูงาน"</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600 font-bold">2</div>
                <span className="text-sm">เรียก markAsViewed()</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600 font-bold">3</div>
                <span className="text-sm">เรียก fetchData()</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600 font-bold">4</div>
                <span className="text-sm text-red-600">❌ ไม่มีอะไรเกิดขึ้น!</span>
              </div>
            </div>
          </Card>

          {/* Expected Flow */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Flow ที่ควรเป็น</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 font-bold">1</div>
                <span className="text-sm">ผู้ใช้กดปุ่ม "ดูงาน"</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 font-bold">2</div>
                <span className="text-sm">เปิด Modal รายละเอียดงาน</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 font-bold">3</div>
                <span className="text-sm">แสดงรายละเอียดงาน</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 font-bold">4</div>
                <span className="text-sm">เรียก markAsViewed()</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 font-bold">5</div>
                <span className="text-sm">แสดงปุ่ม "ส่งงาน"</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Details */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">รายละเอียดเทคนิค</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">markAsViewed() ทำงานถูกต้อง</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`// lib/useAssignmentView.ts
export function useAssignmentView() {
  const markAsViewed = useCallback(async (assignmentId: string, classId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, classId, action: 'view' })
      });
      
      if (!response.ok) {
        console.error('Failed to mark assignment as viewed');
      }
    } catch (error) {
      console.error('Error marking assignment as viewed:', error);
    }
  }, []);
  
  return { markAsViewed };
}`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">API /api/notifications ทำงานถูกต้อง</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`// app/api/notifications/route.ts
export async function POST(request: NextRequest) {
  const { assignmentId, classId, action } = await request.json();
  
  if (action === 'view') {
    await markAssignmentAsViewed(decoded.userId, assignmentId, classId);
  }
  
  return NextResponse.json({
    success: true,
    message: 'อัพเดทสถานะเรียบร้อยแล้ว'
  });
}`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">ปัญหาคือ UI ไม่แสดงผล</h3>
              <p className="text-gray-700">
                ระบบ backend ทำงานถูกต้อง แต่ frontend ไม่มีการแสดง modal รายละเอียดงาน
              </p>
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
            <Bug className="h-4 w-4" />
            <span>{showDetails ? 'ซ่อน' : 'แสดง'} รหัสแก้ไข</span>
          </Button>
        </div>

        {showDetails && (
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">รหัสแก้ไขที่สมบูรณ์</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">1. เพิ่ม State ใน StudentAssignmentList.tsx:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// เพิ่ม state สำหรับ modal ดูรายละเอียด
const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const [selectedAssignmentForView, setSelectedAssignmentForView] = useState<Assignment | null>(null);`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">2. แก้ไขปุ่ม "ดูงาน":</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<Button
  variant="outline"
  onClick={async () => {
    // เปิด modal รายละเอียดงาน
    setSelectedAssignmentForView(assignment);
    setIsViewModalOpen(true);
    
    // mark as viewed
    await markAsViewed(assignment._id, assignment.classId);
  }}
  className="flex items-center gap-1"
>
  <FileText size={16} />
  ดูงาน
</Button>`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">3. เพิ่ม Modal รายละเอียดงาน:</h4>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{/* Modal รายละเอียดงาน */}
<Modal
  isOpen={isViewModalOpen}
  onClose={() => {
    setIsViewModalOpen(false);
    setSelectedAssignmentForView(null);
  }}
  title="รายละเอียดงาน"
>
  {selectedAssignmentForView && (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {selectedAssignmentForView.title}
        </h3>
        <p className="text-blue-800 mb-3">
          {selectedAssignmentForView.description || 'ไม่มีคำอธิบาย'}
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">
              กำหนดส่ง: {formatDate(selectedAssignmentForView.dueDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700">
              คะแนนเต็ม: {selectedAssignmentForView.points}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button
          variant="primary"
          onClick={() => {
            setIsViewModalOpen(false);
            setSelectedAssignment(selectedAssignmentForView);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1"
        >
          <Send size={16} />
          ส่งงาน
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsViewModalOpen(false)}
        >
          ปิด
        </Button>
      </div>
    </div>
  )}
</Modal>`}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
