'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Teacher {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  createdAt: string;
}

interface TeacherManagementProps {
  onUpdate: () => void;
}

export default function TeacherManagement({ onUpdate }: TeacherManagementProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users?userType=teacher');
      const data = await response.json();
      setTeachers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.firstName || !formData.lastName) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    if (!editingTeacher && !formData.password) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่าน', 'error');
      return;
    }

    try {
      const url = editingTeacher ? `/api/users/${editingTeacher._id}` : '/api/users';
      const method = editingTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userType: 'teacher',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('สำเร็จ', data.message, 'success');
        setIsModalOpen(false);
        resetForm();
        fetchTeachers();
        onUpdate();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to save teacher:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบครู ${teacher.firstName} ${teacher.lastName} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/users/${teacher._id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire('สำเร็จ', data.message, 'success');
          fetchTeachers();
          onUpdate();
        } else {
          Swal.fire('ข้อผิดพลาด', data.error, 'error');
        }
      } catch (error) {
        console.error('Failed to delete teacher:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: teacher.username,
      password: '',
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', firstName: '', lastName: '' });
    setEditingTeacher(null);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">จัดการครู</h2>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <PlusCircle size={20} />
          เพิ่มครู
        </Button>
      </div>

      {teachers.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">ยังไม่มีครูในระบบ</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher._id} hover>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-sm text-gray-600">Username: {teacher.username}</p>
                <p className="text-sm text-gray-600">รหัสครู: {teacher.teacherId}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleEdit(teacher)}
                  >
                    <Edit size={16} />
                    แก้ไข
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleDelete(teacher)}
                  >
                    <Trash2 size={16} />
                    ลบ
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingTeacher ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อผู้ใช้"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="กรอกชื่อผู้ใช้"
            required
          />
          <Input
            label="รหัสผ่าน"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editingTeacher ? 'ปล่อยว่างหากไม่ต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'}
            showPasswordToggle={true}
            required={!editingTeacher}
          />
          <Input
            label="ชื่อ"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="กรอกชื่อ"
            required
          />
          <Input
            label="นามสกุล"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="กรอกนามสกุล"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              บันทึก
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

