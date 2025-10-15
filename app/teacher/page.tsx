'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, FileText, Bell, LogOut, BarChart3 } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Swal from 'sweetalert2';
import ClassList from '@/components/teacher/ClassList';
import AssignmentList from '@/components/teacher/AssignmentList';
import AnnouncementList from '@/components/teacher/AnnouncementList';
import GradeManagement from '@/components/teacher/GradeManagement';
import Gradebook from '@/components/teacher/Gradebook';

type TabType = 'classes' | 'assignments' | 'announcements' | 'grades';

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
            <GradeManagement userId={user.id} />
            <Gradebook teacherId={user.id} />
          </div>
        )}
      </main>
    </div>
  );
}

