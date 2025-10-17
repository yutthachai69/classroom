'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, Bell, Users, RefreshCw } from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  createdAt: string;
}

interface Class {
  _id: string;
  name: string;
  description: string;
  teacherName: string;
  classCode: string;
}

interface ClassWithAssignments extends Class {
  assignments: Assignment[];
  newAssignmentsCount: number;
}

interface NotificationStatus {
  assignmentId: string;
  status: 'new' | 'viewed' | 'submitted';
}

export default function ClassNotificationTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [classes, setClasses] = useState<ClassWithAssignments[]>([]);
  const [notificationStatuses, setNotificationStatuses] = useState<Map<string, string>>(new Map());
  const [loadingData, setLoadingData] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = async () => {
    if (!user?.id) return;

    setLoadingData(true);

    try {
      // ดึงข้อมูลคลาส
      const classesRes = await fetch(`/api/classes?studentId=${user.id}`);
      const classesData = await classesRes.json();
      const classesList = classesData.classes || [];

      // ดึง notification status
      const notificationsRes = await fetch('/api/notifications');
      const notificationsData = await notificationsRes.json();
      
      let statusMap = new Map<string, string>();
      if (notificationsData.success) {
        notificationsData.data.notifications.forEach((notif: NotificationStatus) => {
          statusMap.set(notif.assignmentId, notif.status);
        });
        setNotificationStatuses(statusMap);
      }

      // ดึงข้อมูลงานสำหรับแต่ละคลาส
      const classesWithAssignments = await Promise.all(
        classesList.map(async (cls: Class) => {
          try {
            const assignmentsRes = await fetch(`/api/assignments?classId=${cls._id}`);
            const assignmentsData = await assignmentsRes.json();
            const assignments = assignmentsData.assignments || [];

            // นับงานใหม่จาก notification status
            const newAssignmentsCount = assignments.filter((assignment: Assignment) => {
              const status = statusMap.get(assignment._id);
              return status === 'new';
            }).length;

            return {
              ...cls,
              assignments,
              newAssignmentsCount,
            };
          } catch (error) {
            console.error(`Failed to fetch assignments for class ${cls._id}:`, error);
            return {
              ...cls,
              assignments: [],
              newAssignmentsCount: 0,
            };
          }
        })
      );

      setClasses(classesWithAssignments);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [isAuthenticated, user?.id]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    fetchData();
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
          ทดสอบการแจ้งเตือนงานใหม่ในคลาส
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                <p><strong>สถานะ:</strong> {loadingData ? 'กำลังโหลด...' : 'พร้อมใช้งาน'}</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={handleRefresh}
                  disabled={loadingData}
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
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                สถิติการแจ้งเตือน
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{classes.length}</p>
                <p className="text-sm text-green-700">คลาสทั้งหมด</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {classes.reduce((sum, cls) => sum + cls.newAssignmentsCount, 0)}
                </p>
                <p className="text-sm text-red-700">งานใหม่ทั้งหมด</p>
              </div>
            </div>
          </Card>
        </div>

        {/* รายการคลาส */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              รายการคลาสและงานใหม่
            </h3>
            {loadingData && <LoadingSpinner size="sm" />}
          </div>
          
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีคลาส</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls) => (
                <div key={cls._id} className="bg-gray-50 p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{cls.name}</h4>
                        <p className="text-sm text-gray-600">ครู: {cls.teacherName}</p>
                        <p className="text-sm text-gray-500">{cls.description}</p>
                      </div>
                    </div>
                    
                    {/* แจ้งเตือนงานใหม่ */}
                    {cls.newAssignmentsCount > 0 && (
                      <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Bell className="h-4 w-4" />
                        <span>งานใหม่ {cls.newAssignmentsCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>งานทั้งหมด:</span>
                      <span>{cls.assignments.length} ชิ้น</span>
                    </div>
                    <div className="flex justify-between">
                      <span>งานใหม่:</span>
                      <span className={cls.newAssignmentsCount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {cls.newAssignmentsCount} ชิ้น
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>รหัสคลาส:</span>
                      <span className="font-mono text-xs">{cls.classCode}</span>
                    </div>
                  </div>
                  
                  {/* รายละเอียดงาน */}
                  {cls.assignments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">รายการงาน:</h5>
                      <div className="space-y-1">
                        {cls.assignments.map((assignment) => {
                          const status = notificationStatuses.get(assignment._id);
                          return (
                            <div key={assignment._id} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{assignment.title}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                status === 'new' ? 'bg-red-100 text-red-600' :
                                status === 'viewed' ? 'bg-yellow-100 text-yellow-600' :
                                status === 'submitted' ? 'bg-green-100 text-green-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {status === 'new' ? 'ใหม่' :
                                 status === 'viewed' ? 'ดูแล้ว' :
                                 status === 'submitted' ? 'ส่งแล้ว' :
                                 'ไม่ทราบสถานะ'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
            <p>• <strong>การนับงานใหม่:</strong> ใช้ notification status แทนวันที่สร้างงาน</p>
            <p>• <strong>สถานะงาน:</strong> ใหม่ (แดง), ดูแล้ว (เหลือง), ส่งแล้ว (เขียว)</p>
            <p>• <strong>การอัพเดท:</strong> สถานะจะอัพเดทเมื่อดูงานหรือส่งงาน</p>
            <p>• <strong>การคงอยู่:</strong> สถานะจะคงอยู่แม้หลังจาก refresh หน้า</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
