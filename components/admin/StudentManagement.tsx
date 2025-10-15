'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Edit, Trash2, Upload, Download, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';

interface Student {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  studentId: string;
  createdAt: string;
}

interface StudentManagementProps {
  onUpdate: () => void;
}

export default function StudentManagement({ onUpdate }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/users?userType=student');
      const data = await response.json();
      setStudents(data.users || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
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

    if (!editingStudent && !formData.password) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่าน', 'error');
      return;
    }

    try {
      const url = editingStudent ? `/api/users/${editingStudent._id}` : '/api/users';
      const method = editingStudent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userType: 'student',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('สำเร็จ', data.message, 'success');
        setIsModalOpen(false);
        resetForm();
        fetchStudents();
        onUpdate();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to save student:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const handleDelete = async (student: Student) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบนักเรียน ${student.firstName} ${student.lastName} หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/users/${student._id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire('สำเร็จ', data.message, 'success');
          fetchStudents();
          onUpdate();
        } else {
          Swal.fire('ข้อผิดพลาด', data.error, 'error');
        }
      } catch (error) {
        console.error('Failed to delete student:', error);
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      password: '',
      firstName: student.firstName,
      lastName: student.lastName,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', firstName: '', lastName: '' });
    setEditingStudent(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกไฟล์', 'error');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch('/api/admin/bulk-create-students', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const { result } = data;
        
        // แสดงผลลัพธ์การสร้างบัญชี
        let message = `สร้างบัญชีสำเร็จ: ${result.success} รายการ`;
        if (result.failed > 0) {
          message += `\nไม่สำเร็จ: ${result.failed} รายการ`;
        }

        Swal.fire({
          title: 'ผลการอัปโหลด',
          html: `
            <div class="text-left">
              <p><strong>สำเร็จ:</strong> ${result.success} รายการ</p>
              <p><strong>ไม่สำเร็จ:</strong> ${result.failed} รายการ</p>
              ${result.errors.length > 0 ? `
                <details class="mt-3">
                  <summary class="cursor-pointer text-red-600">ดูรายละเอียดข้อผิดพลาด</summary>
                  <div class="mt-2 text-sm text-red-600 max-h-32 overflow-y-auto">
                    ${result.errors.map((error: string) => `<p>• ${error}</p>`).join('')}
                  </div>
                </details>
              ` : ''}
            </div>
          `,
          icon: result.failed === 0 ? 'success' : 'warning',
          confirmButtonText: 'ตกลง'
        });

        setIsBulkUploadModalOpen(false);
        setUploadFile(null);
        fetchStudents();
        onUpdate();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error || 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'รหัสนักเรียน,ชื่อ,นามสกุล,ชื่อภาษาอังกฤษ,เลขที่\n12345,สมชาย,ใจดี,john_smith,1\n67890,สมหญิง,รักเรียน,jane_doe,2';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">จัดการนักเรียน</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            ดาวน์โหลด Template
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            อัปโหลดไฟล์
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <PlusCircle size={20} />
            เพิ่มนักเรียน
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">ยังไม่มีนักเรียนในระบบ</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card key={student._id} hover>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm text-gray-600">Username: {student.username}</p>
                <p className="text-sm text-gray-600">รหัสนักเรียน: {student.studentId}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleEdit(student)}
                  >
                    <Edit size={16} />
                    แก้ไข
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleDelete(student)}
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
        title={editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
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
            placeholder={editingStudent ? 'ปล่อยว่างหากไม่ต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'}
            showPasswordToggle={true}
            required={!editingStudent}
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

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkUploadModalOpen}
        onClose={() => {
          setIsBulkUploadModalOpen(false);
          setUploadFile(null);
        }}
        title="อัปโหลดไฟล์นักเรียน"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FileSpreadsheet size={24} className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">รูปแบบไฟล์ที่รองรับ</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• ไฟล์ CSV (.csv)</li>
                  <li>• ไฟล์ Excel (.xlsx, .xls)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">คอลัมน์ที่จำเป็น:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>รหัสนักเรียน</strong> - ใช้เป็นรหัสผ่าน</li>
              <li>• <strong>ชื่อ</strong> - ชื่อจริง</li>
              <li>• <strong>นามสกุล</strong> - นามสกุล</li>
              <li>• <strong>ชื่อภาษาอังกฤษ</strong> - ใช้เป็น username</li>
              <li>• <strong>เลขที่</strong> - เลขที่ในห้อง (ไม่บังคับ)</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกไฟล์
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                เลือกไฟล์
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {uploadFile && (
                <span className="text-sm text-gray-600">
                  {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBulkUpload}
              disabled={!uploadFile || uploadLoading}
              className="flex-1"
            >
              {uploadLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-r-transparent rounded-full mr-2"></span>
                  กำลังอัปโหลด...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  อัปโหลดไฟล์
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsBulkUploadModalOpen(false);
                setUploadFile(null);
              }}
              className="flex-1"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

