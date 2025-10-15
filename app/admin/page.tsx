'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Users, GraduationCap, BookOpen, LogOut, PlusCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Swal from 'sweetalert2';
import TeacherManagement from '@/components/admin/TeacherManagement';
import StudentManagement from '@/components/admin/StudentManagement';
import ClassManagement from '@/components/admin/ClassManagement';

type TabType = 'teachers' | 'students' | 'classes' | 'stats';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalAssignments: 0,
  });

  useEffect(() => {
    if (!loading && (!user || user.userType !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.userType === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [teachersRes, studentsRes, classesRes, assignmentsRes] = await Promise.all([
        fetch('/api/users?userType=teacher'),
        fetch('/api/users?userType=student'),
        fetch('/api/classes'),
        fetch('/api/assignments'),
      ]);

      const [teachers, students, classes, assignments] = await Promise.all([
        teachersRes.json(),
        studentsRes.json(),
        classesRes.json(),
        assignmentsRes.json(),
      ]);

      setStats({
        totalTeachers: teachers.users?.length || 0,
        totalStudents: students.users?.length || 0,
        totalClasses: classes.classes?.length || 0,
        totalAssignments: assignments.assignments?.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              สถิติ
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'teachers'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              จัดการครู
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              จัดการนักเรียน
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-4 px-3 border-b-2 font-medium text-sm ${
                activeTab === 'classes'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              จัดการคลาส
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">สถิติการใช้งานระบบ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">ครูทั้งหมด</p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalTeachers}</h3>
                  </div>
                  <Users size={40} className="text-blue-200" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">นักเรียนทั้งหมด</p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
                  </div>
                  <GraduationCap size={40} className="text-green-200" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">คลาสทั้งหมด</p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalClasses}</h3>
                  </div>
                  <BookOpen size={40} className="text-purple-200" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">งานทั้งหมด</p>
                    <h3 className="text-3xl font-bold mt-2">{stats.totalAssignments}</h3>
                  </div>
                  <PlusCircle size={40} className="text-orange-200" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && <TeacherManagement onUpdate={fetchStats} />}
        {activeTab === 'students' && <StudentManagement onUpdate={fetchStats} />}
        {activeTab === 'classes' && <ClassManagement />}
      </main>
    </div>
  );
}

