'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Users, AlertCircle, CheckCircle, BookOpen, Eye } from 'lucide-react';

interface Student { 
  _id: string; 
  firstName: string; 
  lastName: string; 
  studentId?: string;
  studentNumber?: number;
}

interface GradeStructure {
  _id: string;
  name: string;
  description?: string;
  classId: string;
  className: string;
  totalPoints: number;
  categories: any[];
  isActive: boolean;
}

export default function StudentDataTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [gradeStructures, setGradeStructures] = useState<GradeStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<GradeStructure | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [testResults, setTestResults] = useState<{
    apiWorking: boolean;
    studentsFound: number;
    classData: any;
    errors: string[];
  }>({
    apiWorking: false,
    studentsFound: 0,
    classData: null,
    errors: []
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchGradeStructures();
    }
  }, [isAuthenticated, user?.id]);

  const fetchGradeStructures = async () => {
    try {
      const structuresRes = await fetch(`/api/grade-structures?teacherId=${user?.id}`);
      const structuresData = await structuresRes.json();
      setGradeStructures(structuresData.gradeStructures || []);
      
      if (structuresData.gradeStructures?.length > 0) {
        setSelectedStructure(structuresData.gradeStructures[0]);
      }
    } catch (error) {
      console.error('Failed to fetch grade structures:', error);
      setTestResults(prev => ({
        ...prev,
        errors: [...prev.errors, 'ไม่สามารถดึงข้อมูลโครงสร้างคะแนนได้']
      }));
    }
  };

  const testStudentData = async (structure: GradeStructure) => {
    setLoadingData(true);
    setTestResults({
      apiWorking: false,
      studentsFound: 0,
      classData: null,
      errors: []
    });

    try {
      console.log('Testing class:', structure.classId);
      
      // Test API call
      const studentsRes = await fetch(`/api/classes/${structure.classId}`);
      const studentsData = await studentsRes.json();
      
      console.log('API Response:', studentsData);
      
      if (studentsData.error) {
        setTestResults(prev => ({
          ...prev,
          errors: [...prev.errors, `API Error: ${studentsData.error}`]
        }));
        return;
      }

      const members: Student[] = (studentsData.class?.studentDetails || []).map((u: any) => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        studentId: u.studentId || u.username,
        studentNumber: u.studentNumber || 0,
      }));

      setStudents(members);
      
      setTestResults({
        apiWorking: true,
        studentsFound: members.length,
        classData: studentsData,
        errors: []
      });

    } catch (error) {
      console.error('Failed to fetch students:', error);
      setTestResults(prev => ({
        ...prev,
        errors: [...prev.errors, `Network Error: ${error}`]
      }));
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลด...</h2>
          <p className="text-gray-500">ตรวจสอบสถานะการล็อกอิน</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่ได้ล็อกอิน</h2>
          <p className="text-gray-500 mb-4">กรุณาล็อกอินเพื่อทดสอบข้อมูลนักเรียน</p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
          >
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทดสอบข้อมูลนักเรียนในคลาส
        </h1>

        {/* Grade Structure Selection */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">เลือกโครงสร้างคะแนน</h2>
          </div>
          
          {gradeStructures.length === 0 ? (
            <p className="text-gray-600">ยังไม่มีโครงสร้างคะแนน</p>
          ) : (
            <div className="space-y-3">
              {gradeStructures.map((structure) => (
                <div 
                  key={structure._id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedStructure?._id === structure._id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStructure(structure)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{structure.name}</h3>
                      <p className="text-sm text-gray-600">{structure.className}</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        testStudentData(structure);
                      }}
                      disabled={loadingData}
                    >
                      {loadingData ? 'กำลังทดสอบ...' : 'ทดสอบข้อมูล'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Test Results */}
        {testResults.classData && (
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                {testResults.apiWorking ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">ผลการทดสอบ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${testResults.apiWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">API ทำงาน</span>
                </div>
                <p className="text-sm text-gray-600">
                  {testResults.apiWorking ? 'ปกติ' : 'ผิดพลาด'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">นักเรียน</span>
                </div>
                <p className="text-sm text-gray-600">
                  {testResults.studentsFound} คน
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span className="font-medium">คลาส</span>
                </div>
                <p className="text-sm text-gray-600">
                  {testResults.classData?.class?.name || 'ไม่พบ'}
                </p>
              </div>
            </div>

            {testResults.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">ข้อผิดพลาด:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {testResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Students List */}
        {students.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                รายชื่อนักเรียน ({students.length} คน)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">เลขที่</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">รหัสนักเรียน</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, index) => (
                    <tr key={s._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-center font-medium text-gray-900">
                        {s.studentNumber || index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">
                        {s.studentId || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-gray-500">
                        {s._id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Raw Data */}
        {testResults.classData && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลดิบจาก API</h3>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(testResults.classData, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            คำอธิบายการทดสอบ
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>เลือกโครงสร้างคะแนน:</strong> คลิกที่โครงสร้างคะแนนที่ต้องการทดสอบ</p>
            <p>• <strong>กดปุ่ม "ทดสอบข้อมูล":</strong> เรียก API เพื่อดึงข้อมูลนักเรียนในคลาส</p>
            <p>• <strong>ตรวจสอบผลลัพธ์:</strong> ดูจำนวนนักเรียนที่พบและข้อมูลดิบ</p>
            <p>• <strong>หากไม่พบนักเรียน:</strong> ตรวจสอบว่าโครงสร้างคะแนนเชื่อมโยงกับคลาสที่ถูกต้อง</p>
            <p>• <strong>ข้อมูลดิบ:</strong> แสดงข้อมูลทั้งหมดที่ได้รับจาก API</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
