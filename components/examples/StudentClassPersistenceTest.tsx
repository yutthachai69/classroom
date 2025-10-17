'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { RefreshCw, Users, BookOpen, AlertCircle } from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  description: string;
  teacherName: string;
  classCode: string;
}

export default function StudentClassPersistenceTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchClasses = async () => {
    if (!user?.id) {
      setError('ไม่มีข้อมูลผู้ใช้');
      return;
    }

    setLoadingClasses(true);
    setError(null);

    try {
      const response = await fetch(`/api/classes?studentId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setClasses(data.classes || []);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลคลาส');
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchClasses();
    }
  }, [isAuthenticated, user?.id]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    fetchClasses();
  };

  const handlePageRefresh = () => {
    setRefreshCount(prev => prev + 1);
    window.location.reload();
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
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่ได้ล็อกอิน</h2>
          <p className="text-gray-500 mb-4">กรุณาล็อกอินเพื่อดูข้อมูลคลาส</p>
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
          ทดสอบการคงอยู่ของข้อมูลคลาสนักเรียน
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ข้อมูลผู้ใช้ */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                ข้อมูลผู้ใช้
              </h2>
            </div>
            
            <div className="space-y-3">
              {user && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p><strong>ชื่อผู้ใช้:</strong> {user.username}</p>
                  <p><strong>ชื่อ:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>ประเภท:</strong> {user.userType}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
              )}
            </div>
          </Card>

          {/* การทดสอบ */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                การทดสอบ
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>จำนวนครั้งที่ Refresh:</strong> {refreshCount}</p>
                <p><strong>สถานะ:</strong> {loadingClasses ? 'กำลังโหลด...' : 'พร้อมใช้งาน'}</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={handleRefresh}
                  disabled={loadingClasses}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh ข้อมูล</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handlePageRefresh}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh หน้า (F5)</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* สถิติ */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                สถิติคลาส
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{classes.length}</p>
                <p className="text-sm text-green-700">คลาสทั้งหมด</p>
              </div>
              
              {error && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* รายการคลาส */}
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              รายการคลาส
            </h3>
            {loadingClasses && <LoadingSpinner size="sm" />}
          </div>
          
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={handleRefresh}>
                ลองใหม่
              </Button>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีคลาส</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls._id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{cls.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{cls.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p><strong>ครู:</strong> {cls.teacherName}</p>
                    <p><strong>รหัสคลาส:</strong> {cls.classCode}</p>
                    <p><strong>ID:</strong> {cls._id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* คำอธิบาย */}
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            คำอธิบายการทำงาน
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>การคงอยู่ของข้อมูล:</strong> ข้อมูลคลาสจะคงอยู่แม้หลังจาก refresh หน้า</p>
            <p>• <strong>การตรวจสอบสถานะ:</strong> ระบบจะตรวจสอบสถานะการล็อกอินจาก server ทุกครั้ง</p>
            <p>• <strong>การดึงข้อมูล:</strong> ใช้ userId ที่ถูกต้องจาก authentication context</p>
            <p>• <strong>การจัดการข้อผิดพลาด:</strong> แสดงข้อผิดพลาดเมื่อไม่สามารถดึงข้อมูลได้</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
