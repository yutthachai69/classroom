'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, FileText, Bell, LogOut, BarChart3, Users } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Swal from 'sweetalert2';
import ClassList from '@/components/teacher/ClassList';
import AssignmentList from '@/components/teacher/AssignmentList';
import AnnouncementList from '@/components/teacher/AnnouncementList';
import GradeManagement from '@/components/teacher/GradeManagement';
import ClassRoster from '@/components/common/ClassRoster';

type TabType = 'classes' | 'assignments' | 'announcements' | 'grades' | 'roster';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClassName, setSelectedClassName] = useState<string>('');

  useEffect(() => {
    if (!loading && (!user || user.userType !== 'teacher')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: 'คุณต้องการออกจากระบบหรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        router.push('/login');
      }
    });
  };

  const handleNavigateToAssignments = (classId?: string, className?: string) => {
    setSelectedClassId(classId || '');
    setSelectedClassName(className || '');
    setActiveTab('assignments');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm text-gray-600">
                ยินดีต้อนรับ {user.firstName} {user.lastName}
              </p>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut size={20} />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'classes'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen size={20} />
              คลาสเรียน
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'assignments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={20} />
              งาน/การบ้าน
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'announcements'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell size={20} />
              ประกาศ
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'grades'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 size={20} />
              คะแนน
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'roster'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={20} />
              รายชื่อนักเรียน
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'classes' && (
          <ClassList 
            userId={user.id} 
            onNavigateToAssignments={handleNavigateToAssignments}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentList 
            userId={user.id}
            selectedClassId={selectedClassId}
            selectedClassName={selectedClassName}
            onClearClassFilter={() => {
              setSelectedClassId('');
              setSelectedClassName('');
            }}
          />
        )}
        {activeTab === 'announcements' && <AnnouncementList userId={user.id} />}
        {activeTab === 'grades' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">จัดการคะแนน</h2>
                  <p className="text-sm text-gray-600">สร้างและจัดการโครงสร้างคะแนนสำหรับคลาสเรียน</p>
                </div>
              </div>
              <GradeManagement userId={user.id} />
            </div>
          </div>
        )}
        {activeTab === 'roster' && selectedClassId && selectedClassName && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">รายชื่อนักเรียน</h2>
                  <p className="text-sm text-gray-600">ดูรายชื่อนักเรียนและครูผู้สอนในคลาส</p>
                </div>
              </div>
              <ClassRoster 
                classId={selectedClassId}
                className={selectedClassName}
                userType="teacher"
                userId={user.id}
              />
            </div>
          </div>
        )}
        {activeTab === 'roster' && !selectedClassId && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">เลือกคลาสเพื่อดูรายชื่อนักเรียน</h3>
            <p className="text-gray-600 mb-4">กรุณาเลือกคลาสจากแท็บ "คลาสเรียน" เพื่อดูรายชื่อนักเรียน</p>
            <Button
              variant="primary"
              onClick={() => setActiveTab('classes')}
            >
              ไปที่คลาสเรียน
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

