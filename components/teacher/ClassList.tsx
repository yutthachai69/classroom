'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Users, Trash2, Copy, Check, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

interface Class {
  _id: string;
  name: string;
  description: string;
  classCode: string;
  students: string[];
  createdAt: string;
}

interface ClassListProps {
  userId: string;
  onNavigateToAssignments?: (classId?: string, className?: string) => void;
}

export default function ClassList({ userId, onNavigateToAssignments }: ClassListProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchClasses();
  }, [userId]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes?teacherId=${userId}`);
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (classCode: string) => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopiedCode(classCode);
      setTimeout(() => setCopiedCode(null), 2000);
      
      Swal.fire({
        icon: 'success',
        title: 'คัดลอกแล้ว!',
        text: `คัดลอกรหัสคลาส ${classCode} เรียบร้อย`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถคัดลอกได้', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกชื่อคลาส', 'error');
      return;
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacherId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สร้างคลาสสำเร็จ!',
          html: `
            <p>รหัสคลาส: <strong style="font-size: 24px; color: #10b981;">${data.classCode}</strong></p>
            <p class="text-sm text-gray-600 mt-2">แชร์รหัสนี้กับนักเรียนเพื่อเข้าร่วมคลาส</p>
          `,
          background: '#f0fdf4',
          color: '#15803d',
          iconColor: '#10b981',
        });
        setIsModalOpen(false);
        setFormData({ name: '', description: '' });
        fetchClasses();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างคลาสได้', 'error');
    }
  };

  const handleDelete = async (cls: Class) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบคลาส ${cls.name} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/classes/${cls._id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire('สำเร็จ', 'ลบคลาสสำเร็จ', 'success');
          fetchClasses();
        } else {
          Swal.fire('ข้อผิดพลาด', data.error, 'error');
        }
      } catch (error) {
        console.error('Failed to delete class:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบคลาสได้', 'error');
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
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          สร้างคลาสใหม่
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">คุณยังไม่มีคลาสเรียน</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls._id} hover>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                {cls.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{cls.description}</p>
                )}
                
                {/* Class Code */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 border-2 border-primary/20">
                  <p className="text-xs text-gray-600 mb-1">รหัสคลาส:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary tracking-widest">
                      {cls.classCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(cls.classCode)}
                      className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors"
                      title="คัดลอกรหัสคลาส"
                    >
                      {copiedCode === cls.classCode ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
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
                      onClick={() => onNavigateToAssignments?.(cls._id, cls.name)}
                      className="flex items-center gap-1"
                    >
                      <FileText size={16} />
                      ดูงาน
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(cls)}
                      className="!p-2"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="สร้างคลาสใหม่"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่อคลาส"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น คณิตศาสตร์ ม.1"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="คำอธิบายเกี่ยวกับคลาส (ไม่บังคับ)"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              สร้างคลาส
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

