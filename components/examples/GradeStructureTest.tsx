'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, Users, Calculator, Eye, Settings, BarChart3 } from 'lucide-react';

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

export default function GradeStructureTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradeStructures, setGradeStructures] = useState<GradeStructure[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<GradeStructure | null>(null);
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
          ทดสอบโครงสร้างคะแนน
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

        {/* Refresh Button */}
        <div className="flex justify-center mb-6">
          <Button
            variant="primary"
            onClick={fetchData}
            disabled={loadingData}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>{loadingData ? 'กำลังโหลด...' : 'Refresh ข้อมูล'}</span>
          </Button>
        </div>

        {/* Grade Structures */}
        {loadingData ? (
          <Card className="p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลโครงสร้างคะแนน...</p>
          </Card>
        ) : gradeStructures.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีโครงสร้างคะแนน</h3>
            <p className="text-gray-600">สร้างโครงสร้างคะแนนใหม่เพื่อเริ่มต้น</p>
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

        {/* Selected Structure Details */}
        {selectedStructure && (
          <Card className="mt-6 p-6 bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              โครงสร้างที่เลือก: {selectedStructure.name}
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>• <strong>คลาส:</strong> {selectedStructure.className}</p>
              <p>• <strong>คำอธิบาย:</strong> {selectedStructure.description || 'ไม่มีคำอธิบาย'}</p>
              <p>• <strong>สถานะ:</strong> {selectedStructure.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}</p>
              <p>• <strong>คะแนนเต็ม:</strong> {selectedStructure.totalPoints}</p>
              <p>• <strong>จำนวนหมวด:</strong> {selectedStructure.categories.length}</p>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            คำอธิบายการใช้งาน
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>คลิกที่การ์ด:</strong> เพื่อดูคะแนนนักเรียนในคลาส</p>
            <p>• <strong>ปุ่ม "ดูคะแนน":</strong> เปิด modal แสดงคะแนนนักเรียน</p>
            <p>• <strong>ปุ่ม "แก้ไข":</strong> แก้ไขโครงสร้างคะแนน</p>
            <p>• <strong>ปุ่ม "ปิดใช้งาน":</strong> เปลี่ยนสถานะการใช้งาน</p>
            <p>• <strong>ชื่อคลาส:</strong> แสดงในแท็กสีน้ำเงิน</p>
            <p>• <strong>สถานะ:</strong> แสดงในแท็กสีเขียว/เทา</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
