'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import { Users, User, GraduationCap, Mail, Phone, Calendar, MapPin } from 'lucide-react';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  studentNumber?: number;
  email?: string;
  phone?: string;
  profilePicture?: string;
  joinedAt?: string;
}

interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
}

interface ClassInfo {
  _id: string;
  name: string;
  classCode: string;
  description?: string;
  teacher: Teacher;
  students: Student[];
  createdAt: string;
}

interface ClassRosterProps {
  classId: string;
  className: string;
  userType: 'teacher' | 'student';
  userId: string;
}

export default function ClassRoster({ classId, className, userType, userId }: ClassRosterProps) {
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (classId) {
      fetchClassRoster();
    }
  }, [classId]);

  const fetchClassRoster = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${classId}`);
      const data = await response.json();

      if (response.ok && data.class) {
        // Transform the data to match our interface
        const classData = data.class;
        setClassInfo({
          _id: classData._id,
          name: classData.name,
          classCode: classData.classCode,
          description: classData.description,
          teacher: {
            _id: classData.teacherId,
            firstName: classData.teacherDetails?.firstName || 'ไม่ระบุ',
            lastName: classData.teacherDetails?.lastName || '',
            email: classData.teacherDetails?.email,
            phone: classData.teacherDetails?.phone,
            profilePicture: classData.teacherDetails?.profilePicture
          },
          students: classData.studentDetails?.map((student: any, index: number) => ({
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId || student.username,
            studentNumber: index + 1, // Use array index + 1 as student number
            email: student.email,
            phone: student.phone,
            profilePicture: student.profilePicture,
            joinedAt: student.createdAt
          })) || [],
          createdAt: classData.createdAt
        });
      }
    } catch (error) {
      console.error('Failed to fetch class roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">ไม่พบข้อมูลคลาส</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{classInfo.name}</h2>
            <p className="text-sm text-gray-600">รหัสคลาส: {classInfo.classCode}</p>
            {classInfo.description && (
              <p className="text-sm text-gray-600 mt-1">{classInfo.description}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Teacher Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">ครูผู้สอน</h3>
        </div>
        
        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
          <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
            {getInitials(classInfo.teacher.firstName, classInfo.teacher.lastName)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">
              {classInfo.teacher.firstName} {classInfo.teacher.lastName}
            </h4>
            {classInfo.teacher.email && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {classInfo.teacher.email}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Students Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">เพื่อนร่วมชั้น</h3>
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {classInfo.students.length} คน
          </div>
        </div>

        {classInfo.students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">ยังไม่มีนักเรียนในคลาสนี้</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classInfo.students.map((student, index) => (
              <div
                key={student._id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleStudentClick(student)}
              >
                <div className={`${getAvatarColor(index)} w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold`}>
                  {getInitials(student.firstName, student.lastName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h4>
                    {userType === 'teacher' && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        เลขที่ {student.studentNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    รหัส: {student.studentId}
                  </p>
                  {student.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {userType === 'teacher' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentClick(student);
                      }}
                    >
                      ดูข้อมูล
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Student Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        title="ข้อมูลนักเรียน"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Header */}
            <div className="text-center">
              <div className={`${getAvatarColor(0)} w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4`}>
                {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <p className="text-gray-600">รหัสนักเรียน: {selectedStudent.studentId}</p>
              {userType === 'teacher' && selectedStudent.studentNumber && (
                <p className="text-gray-600">เลขที่: {selectedStudent.studentNumber}</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                ข้อมูลติดต่อ
              </h4>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {selectedStudent.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedStudent.email}</span>
                  </div>
                )}
                
                {selectedStudent.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedStudent.phone}</span>
                  </div>
                )}
                
                {selectedStudent.joinedAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      เข้าร่วม: {formatDate(selectedStudent.joinedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Class Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                ข้อมูลคลาส
              </h4>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ชื่อคลาส:</span>
                  <span className="text-sm font-medium text-gray-900">{classInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">รหัสคลาส:</span>
                  <span className="text-sm font-medium text-gray-900">{classInfo.classCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ครูผู้สอน:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {classInfo.teacher.firstName} {classInfo.teacher.lastName}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {userType === 'teacher' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Add functionality to view student grades
                    console.log('View grades for:', selectedStudent._id);
                  }}
                >
                  ดูคะแนน
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                ปิด
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
