'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, Users, Calculator, Eye, Settings, BarChart3, PlusCircle } from 'lucide-react';

interface GradeStructure {
  _id: string;
  name: string;
  description?: string;
  classId: string;
  className: string;
  totalPoints: number;
  categories: any[];
  isActive: boolean;
  createdAt: string;
}

interface Class {
  _id: string;
  name: string;
  classCode: string;
}

export default function GradeManagementTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradeStructures, setGradeStructures] = useState<GradeStructure[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<GradeStructure | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [testResults, setTestResults] = useState<{
    apiWorking: boolean;
    dataLoaded: boolean;
    structuresFound: number;
    classesFound: number;
    errors: string[];
  }>({
    apiWorking: false,
    dataLoaded: false,
    structuresFound: 0,
    classesFound: 0,
    errors: []
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [isAuthenticated, user?.id]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch classes
      const classesRes = await fetch(`/api/classes?teacherId=${user?.id}`);
      const classesData = await classesRes.json();
      setClasses(classesData.classes || []);

      // Fetch grade structures
      const structuresRes = await fetch(`/api/grade-structures?teacherId=${user?.id}`);
      const structuresData = await structuresRes.json();
      setGradeStructures(structuresData.gradeStructures || []);

      setTestResults(prev => ({
        ...prev,
        apiWorking: true,
        dataLoaded: true,
        structuresFound: structuresData.gradeStructures?.length || 0,
        classesFound: classesData.classes?.length || 0,
        errors: []
      }));

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setTestResults(prev => ({
        ...prev,
        apiWorking: false,
        dataLoaded: false,
        errors: [...prev.errors, 'ไม่สามารถดึงข้อมูลได้']
      }));
    } finally {
      setLoadingData(false);
    }
  };

  const handleStructureClick = (structure: GradeStructure) => {
    setSelectedStructure(structure);
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    setSelectedStructure(null);
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
          <p className="text-gray-500 mb-4">กรุณาล็อกอินเพื่อดูข้อมูลโครงสร้างคะแนน</p>
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทดสอบการจัดการคะแนน
        </h1>

        {/* Test Results */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">ผลการทดสอบ</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className={`w-3 h-3 rounded-full ${testResults.dataLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">ข้อมูลโหลด</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.dataLoaded ? 'สำเร็จ' : 'ไม่สำเร็จ'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">คลาสเรียน</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.classesFound} คลาส
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-medium">โครงสร้าง</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.structuresFound} โครงสร้าง
              </p>
            </div>
          </div>
          
          {testResults.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">ข้อผิดพลาด:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {testResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">จัดการคะแนน</h2>
              <p className="text-gray-600">สร้างและจัดการโครงสร้างคะแนนสำหรับคลาสเรียน</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => {}}
              className="shadow-lg"
              disabled
            >
              <PlusCircle size={20} />
              สร้างโครงสร้างคะแนน
            </Button>
          </div>

          {/* Instructions */}
          {gradeStructures.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">วิธีดูคะแนนนักเรียน</h3>
                  <p className="text-sm text-blue-800">
                    คลิกที่การ์ดโครงสร้างคะแนนหรือปุ่ม <strong>"ดูคะแนน"</strong> เพื่อเปิดสมุดบันทึกคะแนนของคลาสนั้น
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Grade Structures */}
          {loadingData ? (
            <Card className="p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลโครงสร้างคะแนน...</p>
            </Card>
          ) : gradeStructures.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีโครงสร้างคะแนน</h3>
                <p className="text-gray-600 mb-6">เริ่มต้นด้วยการสร้างโครงสร้างคะแนนสำหรับคลาสเรียนของคุณ</p>
                <Button variant="primary" disabled>
                  <PlusCircle size={20} />
                  สร้างโครงสร้างคะแนนแรก
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gradeStructures.map((structure) => (
                <Card 
                  key={structure._id} 
                  hover 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                  onClick={() => handleStructureClick(structure)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{structure.name}</h3>
                        <p className="text-sm text-gray-600">{structure.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            structure.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {structure.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {structure.className}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Eye className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">โครงสร้างคะแนน:</h4>
                      {structure.categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <span className="font-medium">{category.name}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({category.maxPoints} คะแนน)
                            </span>
                          </div>
                          <span className="font-semibold text-blue-600">{category.weight}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart3 size={16} />
                        <span>คะแนนเต็ม: {structure.totalPoints}</span>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleStructureClick(structure)}
                          className="flex items-center space-x-1"
                        >
                          <Eye size={16} />
                          <span>ดูคะแนน</span>
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          disabled
                        >
                          <Settings size={16} />
                          แก้ไข
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Instructions Modal */}
        {showInstructions && selectedStructure && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  เปิดสมุดบันทึกคะแนน
                </h3>
                <p className="text-gray-600 mb-4">
                  คลิกที่การ์ด <strong>"{selectedStructure.name}"</strong> 
                  เพื่อเปิดสมุดบันทึกคะแนนของคลาส <strong>"{selectedStructure.className}"</strong>
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• แสดงคะแนนนักเรียนแต่ละคน</p>
                  <p>• คะแนนย่อยแต่ละหมวด</p>
                  <p>• คะแนนรวมและเกรด</p>
                  <p>• Export ข้อมูลเป็น CSV</p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleCloseInstructions}
                  className="mt-4"
                >
                  เข้าใจแล้ว
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            การทำงานใหม่
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <p>• <strong>สมุดบันทึกคะแนน:</strong> อยู่ใน modal เมื่อกดที่การ์ดโครงสร้างคะแนน</p>
            <p>• <strong>ไม่แสดงในหน้า:</strong> ไม่มี Gradebook component แยกในหน้าแล้ว</p>
            <p>• <strong>คลิกที่การ์ด:</strong> เปิด modal แสดงคะแนนนักเรียนในคลาสนั้น</p>
            <p>• <strong>ปุ่ม "ดูคะแนน":</strong> เปิด modal เดียวกัน</p>
            <p>• <strong>ข้อมูลครบถ้วน:</strong> แสดงเลขที่, รหัสนักเรียน, คะแนนย่อย, คะแนนรวม</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
