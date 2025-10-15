'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Calendar, FileText, CheckCircle, ClipboardCheck, Users, Lock, Unlock, Filter, ArrowLeft, Edit } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import Swal from 'sweetalert2';
import GradeAssignmentModal from './GradeAssignmentModal';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  className: string;
  classId: string;
  dueDate: string;
  points: number;
  gradeCategoryName?: string;
  allowEdit: boolean;
  createdAt: string;
}

interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  isEdited: boolean;
  editedAt?: string;
}

interface Class {
  _id: string;
  name: string;
}

interface AssignmentListProps {
  userId: string;
  selectedClassId?: string;
  selectedClassName?: string;
  onClearClassFilter?: () => void;
}

export default function AssignmentList({ 
  userId, 
  selectedClassId: propSelectedClassId, 
  selectedClassName: propSelectedClassName,
  onClearClassFilter 
}: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ title: string; description: string; classId: string; dueDate: string; points: string }>({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    points: '',
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    dueDate: '',
    points: '',
  });

  // NEW: map of assignmentId -> stats
  const [assignmentStats, setAssignmentStats] = useState<Record<string, { total: number; graded: number; pending: number }>>({});

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    // Set initial class filter from props
    if (propSelectedClassId) {
      setSelectedClassId(propSelectedClassId);
    }
  }, [propSelectedClassId]);

  useEffect(() => {
    // Filter assignments based on selected class
    if (selectedClassId) {
      setFilteredAssignments(assignments.filter(a => a.classId === selectedClassId));
    } else {
      setFilteredAssignments(assignments);
    }
  }, [selectedClassId, assignments]);

  const fetchData = async () => {
    try {
      const [assignmentsRes, classesRes] = await Promise.all([
        fetch(`/api/assignments?teacherId=${userId}`),
        fetch(`/api/classes?teacherId=${userId}`),
      ]);

      const [assignmentsData, classesData] = await Promise.all([
        assignmentsRes.json(),
        classesRes.json(),
      ]);

      const list: Assignment[] = assignmentsData.assignments || [];
      setAssignments(list);
      setClasses(classesData.classes || []);

      // Fetch stats for each assignment in parallel
      const statsEntries = await Promise.all(
        list.map(async (a) => {
          try {
            const res = await fetch(`/api/submissions?assignmentId=${a._id}`);
            const data = await res.json();
            const subs: Submission[] = data.submissions || [];
            const total = subs.length;
            const graded = subs.filter(s => typeof s.grade !== 'undefined').length;
            const pending = total - graded;
            return [a._id, { total, graded, pending }] as const;
          } catch (e) {
            return [a._id, { total: 0, graded: 0, pending: 0 }] as const;
          }
        })
      );
      setAssignmentStats(Object.fromEntries(statsEntries));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toInputDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        // If date is invalid, return current date/time
        const now = new Date();
        const pad = (n: number) => `${n}`.padStart(2, '0');
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const mi = pad(now.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
      }
      const pad = (n: number) => `${n}`.padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const mi = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    } catch (error) {
      console.error('Error converting date:', error);
      // Return current date/time as fallback
      const now = new Date();
      const pad = (n: number) => `${n}`.padStart(2, '0');
      const yyyy = now.getFullYear();
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = pad(now.getHours());
      const mi = pad(now.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    }
  };

  const handleOpenEdit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setEditForm({
      title: assignment.title || '',
      description: assignment.description || '',
      classId: assignment.classId || '',
      dueDate: toInputDateTime(assignment.dueDate),
      points: String(assignment.points || 0),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      const response = await fetch(`/api/assignments/${selectedAssignment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          classId: editForm.classId,
          dueDate: editForm.dueDate,
          points: Number(editForm.points),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire('สำเร็จ', 'แก้ไขงานเรียบร้อยแล้ว', 'success');
        setIsEditModalOpen(false);
        setSelectedAssignment(null);
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error || 'ไม่สามารถแก้ไขงานได้', 'error');
      }
    } catch (error) {
      console.error('Failed to update assignment:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแก้ไขงานได้', 'error');
    }
  };

  const clearClassFilter = () => {
    setSelectedClassId('');
    if (onClearClassFilter) {
      onClearClassFilter();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.classId || !formData.dueDate || !formData.points) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacherId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('สำเร็จ', 'สร้างงานสำเร็จ', 'success');
        setIsModalOpen(false);
        setFormData({ title: '', description: '', classId: '', dueDate: '', points: '' });
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างงานได้', 'error');
    }
  };

  const handleGradeAssignment = async (assignment: Assignment) => {
    try {
      // Fetch submissions for this assignment
      const response = await fetch(`/api/submissions?assignmentId=${assignment._id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubmissions(data.submissions || []);
        setSelectedAssignment(assignment);
        setIsGradeModalOpen(true);
      } else {
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลงานส่งได้', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลงานส่งได้', 'error');
    }
  };

  const handleGradeSubmit = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const submission = submissions.find(s => s._id === submissionId);
      const requestData = {
        assignmentId: selectedAssignment?._id,
        studentId: submission?.studentId,
        points: grade,
        maxPoints: selectedAssignment?.points || 100,
        feedback,
        gradedBy: userId,
      };

      // Only add gradeCategoryId if it exists and is not 'default'
      if (selectedAssignment?.gradeCategoryId && selectedAssignment.gradeCategoryId !== 'default') {
        requestData.gradeCategoryId = selectedAssignment.gradeCategoryId;
      }

      console.log('Sending grade data:', requestData);

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save grade');
      }
    } catch (error) {
      console.error('Failed to save grade:', error);
      throw error;
    }
  };

  const handleToggleAllowEdit = async (assignment: Assignment) => {
    try {
      const response = await fetch(`/api/assignments/${assignment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowEdit: !assignment.allowEdit,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire(
          'สำเร็จ', 
          assignment.allowEdit ? 'ปิดการแก้ไขงานแล้ว' : 'เปิดการแก้ไขงานแล้ว', 
          'success'
        );
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to toggle allow edit:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะการแก้ไขได้', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            {propSelectedClassName ? `งาน/การบ้าน - ${propSelectedClassName}` : 'งาน/การบ้าน'}
          </h2>
          {propSelectedClassName && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearClassFilter}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              ดูงานทั้งหมด
            </Button>
          )}
        </div>
        
        {/* Class Filter */}
        {classes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">ทุกคลาส</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          disabled={classes.length === 0}
        >
          <PlusCircle size={20} />
          สร้างงานใหม่
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredAssignments.length}</div>
            <div className="text-sm text-gray-600">งานทั้งหมด</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredAssignments.filter(a => a.allowEdit).length}
            </div>
            <div className="text-sm text-gray-600">อนุญาตแก้ไข</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredAssignments.filter(a => !a.allowEdit).length}
            </div>
            <div className="text-sm text-gray-600">ปิดการแก้ไข</div>
          </div>
        </Card>
      </div>

      {classes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">กรุณาสร้างคลาสเรียนก่อนเพื่อสร้างงาน</p>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">
            {selectedClassId ? 'ไม่มีงานในคลาสนี้' : 'คุณยังไม่มีงาน'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment._id} hover>
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FileText size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title || 'ไม่มีชื่องาน'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{assignment.className}</p>
                      </div>
                      {/* status badges */}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          รวม {assignmentStats[assignment._id]?.total ?? 0}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          ตรวจแล้ว {assignmentStats[assignment._id]?.graded ?? 0}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          รอตรวจ {assignmentStats[assignment._id]?.pending ?? 0}
                        </span>
                      </div>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>ครบกำหนด: {formatDateTime(assignment.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        <span>คะแนนเต็ม: {assignment.points}</span>
                      </div>
                      {assignment.gradeCategoryName && (
                        <div className="flex items-center gap-1">
                          <FileText size={16} />
                          <span>{assignment.gradeCategoryName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGradeAssignment(assignment)}
                  className="flex-1"
                >
                  <ClipboardCheck size={16} />
                  ตรวจงาน
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleGradeAssignment(assignment)}
                >
                  <Users size={16} />
                  ดูงานส่ง
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEdit(assignment)}
                  title="แก้ไขงาน"
                >
                  <Edit size={16} />
                  แก้ไขงาน
                </Button>
                <Button
                  variant={assignment.allowEdit ? "danger" : "success"}
                  size="sm"
                  onClick={() => handleToggleAllowEdit(assignment)}
                  title={assignment.allowEdit ? "ปิดการแก้ไขงาน" : "เปิดการแก้ไขงาน"}
                >
                  {assignment.allowEdit ? <Lock size={16} /> : <Unlock size={16} />}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="สร้างงาน/การบ้านใหม่"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ชื่องาน"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="เช่น แบบฝึกหัดบทที่ 1"
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
              placeholder="คำอธิบายเกี่ยวกับงาน"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คลาส
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              required
            >
              <option value="">เลือกคลาส</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="ครบกำหนด"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
          <Input
            label="คะแนนเต็ม"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            placeholder="เช่น 100"
            min="1"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              สร้างงาน
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

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขงาน/การบ้าน"
      >
        <form onSubmit={handleUpdateAssignment} className="space-y-4">
          <Input
            label="ชื่องาน"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="เช่น แบบฝึกหัดบทที่ 1"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="คำอธิบายเกี่ยวกับงาน"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คลาส</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              value={editForm.classId}
              onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
              required
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="ครบกำหนด"
            type="datetime-local"
            value={editForm.dueDate}
            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
            required
          />
          <Input
            label="คะแนนเต็ม"
            type="number"
            value={editForm.points}
            onChange={(e) => setEditForm({ ...editForm, points: e.target.value })}
            placeholder="เช่น 100"
            min="1"
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">บันทึก</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditModalOpen(false)}>ยกเลิก</Button>
          </div>
        </form>
      </Modal>

      {/* Grade Assignment Modal */}
      <GradeAssignmentModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        assignment={selectedAssignment}
        submissions={submissions}
        onGradeSubmit={handleGradeSubmit}
      />
    </div>
  );
}

