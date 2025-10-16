'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { PlusCircle, FileText, Calendar, Users, Trash2, Edit } from 'lucide-react';
import Swal from 'sweetalert2';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  points: number;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface Class {
  _id: string;
  name: string;
  description: string;
  classCode: string;
  teacherId: string;
  students: string[];
}

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: string;
}

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, classesRes, teachersRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/classes'),
        fetch('/api/users?userType=teacher'),
      ]);

      const [assignmentsData, classesData, teachersData] = await Promise.all([
        assignmentsRes.json(),
        classesRes.json(),
        teachersRes.json(),
      ]);

      setAssignments(assignmentsData.assignments || []);
      setClasses(classesData.classes || []);
      setTeachers(teachersData.users || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getClassName = (classId: string) => {
    const classData = classes.find(c => c._id === classId);
    return classData ? classData.name : 'ไม่พบคลาส';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'ไม่พบครู';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteAssignment = async (assignmentId: string, title: string) => {
    const result = await Swal.fire({
      title: 'ลบงาน?',
      text: `คุณต้องการลบงาน "${title}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire('สำเร็จ!', 'ลบงานเรียบร้อยแล้ว', 'success');
          fetchData();
        } else {
          const data = await response.json();
          Swal.fire('ข้อผิดพลาด', data.error || 'ไม่สามารถลบงานได้', 'error');
        }
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบงานได้', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">จัดการงาน</h2>
        <Button 
          variant="primary" 
          className="flex items-center gap-2"
          onClick={() => {
            Swal.fire({
              title: 'สร้างงานใหม่',
              text: 'ฟีเจอร์นี้จะเพิ่มในอนาคต',
              icon: 'info',
              confirmButtonText: 'ตกลง'
            });
          }}
        >
          <PlusCircle size={16} />
          สร้างงานใหม่
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">งานทั้งหมด</p>
              <h3 className="text-3xl font-bold mt-2">{assignments.length}</h3>
            </div>
            <FileText size={40} className="text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">คลาสที่มีงาน</p>
              <h3 className="text-3xl font-bold mt-2">
                {new Set(assignments.map(a => a.classId)).size}
              </h3>
            </div>
            <Users size={40} className="text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">คะแนนรวม</p>
              <h3 className="text-3xl font-bold mt-2">
                {assignments.reduce((sum, a) => sum + a.points, 0)}
              </h3>
            </div>
            <Calendar size={40} className="text-purple-200" />
          </div>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">รายการงานทั้งหมด</h3>
        
        {assignments.length === 0 ? (
          <Card className="text-center py-12">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีงาน</h3>
            <p className="text-gray-600">ครูสามารถสร้างงานใหม่ได้ในหน้า Teacher Dashboard</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h4>
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                        {assignment.points} คะแนน
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {assignment.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{getClassName(assignment.classId)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>กำหนดส่ง: {formatDate(assignment.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>ครู: {getTeacherName(assignment.teacherId)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        Swal.fire({
                          title: 'แก้ไขงาน',
                          text: 'ฟีเจอร์นี้จะเพิ่มในอนาคต',
                          icon: 'info',
                          confirmButtonText: 'ตกลง'
                        });
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit size={14} />
                      แก้ไข
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment._id, assignment.title)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      ลบ
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
