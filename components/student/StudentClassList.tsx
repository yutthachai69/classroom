'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import JoinClassModal from './JoinClassModal';
import { BookOpen, Users, LogOut, Plus, FileText, Bell } from 'lucide-react';
import Swal from 'sweetalert2';

interface Class {
  _id: string;
  name: string;
  description: string;
  teacherName: string;
  students: string[];
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  createdAt: string;
}

interface ClassWithAssignments extends Class {
  assignments: Assignment[];
  newAssignmentsCount: number;
}

interface StudentClassListProps {
  userId: string;
  onNavigateToAssignments?: (classId?: string, className?: string) => void;
}

export default function StudentClassList({ userId, onNavigateToAssignments }: StudentClassListProps) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [notificationStatuses, setNotificationStatuses] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchClasses();
  }, [userId]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes?studentId=${userId}`);
      const data = await response.json();
      const classesData = data.classes || [];

      // ดึง notification status
      const notificationsRes = await fetch('/api/notifications');
      const notificationsData = await notificationsRes.json();
      
      let statusMap = new Map<string, string>();
      if (notificationsData.success) {
        notificationsData.data.notifications.forEach((notif: any) => {
          statusMap.set(notif.assignmentId, notif.status);
        });
        setNotificationStatuses(statusMap);
      }

      // Fetch assignments for each class to count new assignments
      const classesWithAssignments = await Promise.all(
        classesData.map(async (cls: Class) => {
          try {
            const assignmentsResponse = await fetch(`/api/assignments?classId=${cls._id}`);
            const assignmentsData = await assignmentsResponse.json();
            const assignments = assignmentsData.assignments || [];

            // นับงานใหม่จาก notification status แทนวันที่สร้าง
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
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClassAssignments = (classId: string, className: string) => {
    // Navigate to assignments tab with class filter
    if (onNavigateToAssignments) {
      onNavigateToAssignments(classId, className);
    }
  };

  const handleLeaveClass = async (cls: Class) => {
    const result = await Swal.fire({
      title: 'ยืนยันการออกจากคลาส?',
      text: `คุณต้องการออกจากคลาส ${cls.name} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ใช่, ออกจากคลาส',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/api/classes/${cls._id}/students?studentId=${userId}`,
          {
            method: 'DELETE',
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire('สำเร็จ', 'ออกจากคลาสสำเร็จ', 'success');
          fetchClasses();
        } else {
          Swal.fire('ข้อผิดพลาด', data.error, 'error');
        }
      } catch (error) {
        console.error('Failed to leave class:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถออกจากคลาสได้', 'error');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">คลาสเรียนของฉัน</h2>
        <Button 
          variant="primary" 
          onClick={() => setShowJoinModal(true)}
          className="shadow-lg"
        >
          <Plus size={20} />
          เข้าร่วมคลาส
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">คุณยังไม่ได้เข้าร่วมคลาสเรียนใดๆ</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls._id} hover className="cursor-pointer" onClick={() => handleViewClassAssignments(cls._id, cls.name)}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <BookOpen size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                      <p className="text-sm text-gray-600">ครู: {cls.teacherName}</p>
                    </div>
                  </div>
                  
                  {/* New Assignments Notification */}
                  {cls.newAssignmentsCount > 0 && (
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Bell size={12} />
                      งานใหม่ {cls.newAssignmentsCount}
                    </div>
                  )}
                </div>
                
                {cls.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{cls.description}</p>
                )}
                
                {/* Assignment Summary */}
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FileText size={14} />
                      <span>งานทั้งหมด: {cls.assignments.length}</span>
                    </div>
                    {cls.newAssignmentsCount > 0 && (
                      <span className="text-red-600 font-medium">
                        ใหม่ {cls.newAssignmentsCount} ชิ้น
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{cls.students.length} นักเรียน</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewClassAssignments(cls._id, cls.name);
                      }}
                    >
                      <FileText size={16} />
                      ดูงาน
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeaveClass(cls);
                      }}
                      className="!p-2"
                    >
                      <LogOut size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Join Class Modal */}
      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        studentId={userId}
        onSuccess={fetchClasses}
      />
    </div>
  );
}

