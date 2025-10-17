'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { CheckCircle, Clock, Users, RefreshCw, ClipboardCheck } from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  className: string;
  classId: string;
  dueDate: string;
  points: number;
}

interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

interface AssignmentStats {
  total: number;
  graded: number;
  pending: number;
}

export default function GradingStatusTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<Record<string, AssignmentStats>>({});
  const [loadingData, setLoadingData] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = async () => {
    if (!user?.id) return;

    setLoadingData(true);

    try {
      // ดึงข้อมูลงาน
      const assignmentsRes = await fetch(`/api/assignments?teacherId=${user.id}`);
      const assignmentsData = await assignmentsRes.json();
      const assignmentsList = assignmentsData.assignments || [];
      setAssignments(assignmentsList);

      // ดึงสถิติการตรวจงานสำหรับแต่ละงาน
      const statsEntries = await Promise.all(
        assignmentsList.map(async (assignment: Assignment) => {
          try {
            // ดึงข้อมูล submissions
            const submissionsRes = await fetch(`/api/submissions?assignmentId=${assignment._id}`);
            const submissionsData = await submissionsRes.json();
            const submissions = submissionsData.submissions || [];
            const total = submissions.length;

            // ดึงข้อมูล grades จาก assignmentGrades collection
            const gradesRes = await fetch(`/api/grades?assignmentId=${assignment._id}`);
            const gradesData = await gradesRes.json();
            const grades = gradesData.grades || [];
            const graded = grades.length;
            const pending = total - graded;

            return [assignment._id, { total, graded, pending }] as const;
          } catch (error) {
            console.error(`Failed to fetch stats for assignment ${assignment._id}:`, error);
            return [assignment._id, { total: 0, graded: 0, pending: 0 }] as const;
          }
        })
      );

      setAssignmentStats(Object.fromEntries(statsEntries));
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
          <p className="text-gray-500 mb-4">กรุณาล็อกอินเพื่อดูข้อมูลงาน</p>
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

  const totalAssignments = assignments.length;
  const totalSubmissions = Object.values(assignmentStats).reduce((sum, stats) => sum + stats.total, 0);
  const totalGraded = Object.values(assignmentStats).reduce((sum, stats) => sum + stats.graded, 0);
  const totalPending = Object.values(assignmentStats).reduce((sum, stats) => sum + stats.pending, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทดสอบสถานะการตรวจงาน
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* ข้อมูลผู้ใช้ */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                ข้อมูลครู
              </h2>
            </div>
            
            <div className="space-y-2 text-sm">
              {user && (
                <>
                  <p><strong>ชื่อ:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>ประเภท:</strong> {user.userType}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </>
              )}
            </div>
          </Card>

          {/* สถิติรวม */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                สถิติรวม
              </h2>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>งานทั้งหมด:</span>
                <span className="font-medium">{totalAssignments}</span>
              </div>
              <div className="flex justify-between">
                <span>งานส่งทั้งหมด:</span>
                <span className="font-medium">{totalSubmissions}</span>
              </div>
              <div className="flex justify-between">
                <span>ตรวจแล้ว:</span>
                <span className="font-medium text-green-600">{totalGraded}</span>
              </div>
              <div className="flex justify-between">
                <span>รอตรวจ:</span>
                <span className="font-medium text-yellow-600">{totalPending}</span>
              </div>
            </div>
          </Card>

          {/* การทดสอบ */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-full">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                การทดสอบ
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-2 rounded-lg text-sm">
                <p><strong>Refresh:</strong> {refreshCount}</p>
                <p><strong>สถานะ:</strong> {loadingData ? 'กำลังโหลด...' : 'พร้อมใช้งาน'}</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="primary"
                  onClick={handleRefresh}
                  disabled={loadingData}
                  size="sm"
                  className="w-full flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh ข้อมูล</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handlePageRefresh}
                  size="sm"
                  className="w-full flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh หน้า</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* อัตราการตรวจ */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                อัตราการตรวจ
              </h2>
            </div>
            
            <div className="space-y-2 text-sm">
              {totalSubmissions > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span>อัตราการตรวจ:</span>
                    <span className="font-medium">
                      {Math.round((totalGraded / totalSubmissions) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(totalGraded / totalSubmissions) * 100}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">ยังไม่มีงานส่ง</p>
              )}
            </div>
          </Card>
        </div>

        {/* รายการงาน */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              รายการงานและสถานะการตรวจ
            </h3>
            {loadingData && <LoadingSpinner size="sm" />}
          </div>
          
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีงาน</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const stats = assignmentStats[assignment._id] || { total: 0, graded: 0, pending: 0 };
                const gradingProgress = stats.total > 0 ? (stats.graded / stats.total) * 100 : 0;

                return (
                  <div key={assignment._id} className="bg-gray-50 p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <ClipboardCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.className}</p>
                          <p className="text-sm text-gray-500">{assignment.description}</p>
                        </div>
                      </div>
                      
                      {/* สถานะการตรวจ */}
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                          รวม {stats.total}
                        </div>
                        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                          ตรวจแล้ว {stats.graded}
                        </div>
                        <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
                          รอตรวจ {stats.pending}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>คะแนนเต็ม: {assignment.points}</span>
                        <span>ครบกำหนด: {new Date(assignment.dueDate).toLocaleDateString('th-TH')}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      {stats.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>ความคืบหน้าการตรวจ</span>
                            <span className="font-medium">{Math.round(gradingProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${gradingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* รายละเอียด */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                          <div className="text-blue-700">งานส่งทั้งหมด</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{stats.graded}</div>
                          <div className="text-green-700">ตรวจแล้ว</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                          <div className="text-yellow-700">รอตรวจ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* คำอธิบาย */}
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            คำอธิบายการทำงาน
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>การนับสถานะ:</strong> ใช้ข้อมูลจาก assignmentGrades collection แทน submissions</p>
            <p>• <strong>การอัพเดท:</strong> สถานะจะอัพเดททันทีหลังจากตรวจงาน</p>
            <p>• <strong>การ Refresh:</strong> ข้อมูลจะ refresh อัตโนมัติหลังจากตรวจงาน</p>
            <p>• <strong>ความแม่นยำ:</strong> สถานะแสดงผลถูกต้องตามการตรวจงานจริง</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
