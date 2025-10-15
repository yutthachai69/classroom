'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Calendar, FileText, CheckCircle, Send, Award, Filter, ArrowLeft, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Swal from 'sweetalert2';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  className: string;
  classId: string;
  dueDate: string;
  points: number;
  allowEdit: boolean;
  createdAt: string;
}

interface Submission {
  _id: string;
  assignmentId: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

interface Class {
  _id: string;
  name: string;
}

interface StudentAssignmentListProps {
  userId: string;
  selectedClassId?: string;
  selectedClassName?: string;
  onClearClassFilter?: () => void;
}

export default function StudentAssignmentList({ 
  userId, 
  selectedClassId: propSelectedClassId, 
  selectedClassName: propSelectedClassName,
  onClearClassFilter 
}: StudentAssignmentListProps) {
  const searchParams = useSearchParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  // Get class filter from URL params or props
  const urlClassId = searchParams.get('classId');
  const urlClassName = searchParams.get('className');

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    // Set initial class filter from props or URL
    if (propSelectedClassId) {
      setSelectedClassId(propSelectedClassId);
    } else if (urlClassId) {
      setSelectedClassId(urlClassId);
    }
  }, [propSelectedClassId, urlClassId]);

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
      // First get all classes the student is in
      const classesRes = await fetch(`/api/classes?studentId=${userId}`);
      const classesData = await classesRes.json();
      const classesList = classesData.classes || [];
      setClasses(classesList);

      // Then get all assignments for those classes
      const assignmentPromises = classesList.map((cls: any) =>
        fetch(`/api/assignments?classId=${cls._id}`).then((res) => res.json())
      );

      const assignmentResults = await Promise.all(assignmentPromises);
      const allAssignments = assignmentResults.flatMap(
        (result) => result.assignments || []
      );

      // Get student's submissions
      const submissionsRes = await fetch(`/api/submissions?studentId=${userId}`);
      const submissionsData = await submissionsRes.json();

      setAssignments(allAssignments);
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content && (!files || files.length === 0) || !selectedAssignment) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกเนื้อหาหรือแนบไฟล์อย่างน้อย 1 รายการ', 'error');
      return;
    }

    try {
      let attachments: string[] = [];
      if (files && files.length > 0) {
        const form = new FormData();
        Array.from(files).forEach(f => form.append('files', f));
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'อัปโหลดไฟล์ไม่สำเร็จ');
        attachments = uploadData.urls || [];
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          studentId: userId,
          content,
          attachments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('สำเร็จ', 'ส่งงานสำเร็จ', 'success');
        setIsModalOpen(false);
        setContent('');
        setSelectedAssignment(null);
        setFiles(null);
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถส่งงานได้', 'error');
    }
  };

  const handleEditSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content && (!files || files.length === 0) || !selectedSubmission) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกเนื้อหาหรือแนบไฟล์อย่างน้อย 1 รายการ', 'error');
      return;
    }

    try {
      let attachments: string[] | undefined;
      if (files && files.length > 0) {
        const form = new FormData();
        Array.from(files).forEach(f => form.append('files', f));
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'อัปโหลดไฟล์ไม่สำเร็จ');
        attachments = uploadData.urls || [];
      }

      const response = await fetch(`/api/submissions/${selectedSubmission._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          attachments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('สำเร็จ', 'แก้ไขงานสำเร็จ', 'success');
        setIsEditModalOpen(false);
        setContent('');
        setSelectedSubmission(null);
        setSelectedAssignment(null);
        setFiles(null);
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to edit submission:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแก้ไขงานได้', 'error');
    }
  };

  const handleFilesChange = (list: FileList | null) => {
    setFiles(list);
    if (list && list.length > 0) {
      setFileNames(Array.from(list).map(f => f.name));
    } else {
      setFileNames([]);
    }
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find((sub) => sub.assignmentId === assignmentId);
  };

  const clearClassFilter = () => {
    setSelectedClassId('');
    if (onClearClassFilter) {
      onClearClassFilter();
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
            {propSelectedClassName || urlClassName ? `งาน/การบ้าน - ${propSelectedClassName || urlClassName}` : 'งาน/การบ้าน'}
          </h2>
          {(propSelectedClassName || urlClassName) && (
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
              {filteredAssignments.filter(a => getSubmission(a._id)).length}
            </div>
            <div className="text-sm text-gray-600">ส่งแล้ว</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredAssignments.filter(a => !getSubmission(a._id) && new Date(a.dueDate) >= new Date()).length}
            </div>
            <div className="text-sm text-gray-600">ยังไม่ส่ง</div>
          </div>
        </Card>
      </div>

      {filteredAssignments.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">
            {selectedClassId ? 'ไม่มีงานในคลาสนี้' : 'ยังไม่มีงานสำหรับคุณ'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const submission = getSubmission(assignment._id);
            const isOverdue = new Date(assignment.dueDate) < new Date();
            const isNew = new Date(assignment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            return (
              <Card key={assignment._id} hover>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <FileText size={24} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {assignment.title}
                        </h3>
                        {isNew && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            ใหม่
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{assignment.className}</p>
                      {assignment.description && (
                        <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar size={16} />
                          <span>ครบกำหนด: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <CheckCircle size={16} />
                          <span>คะแนนเต็ม: {assignment.points}</span>
                        </div>
                      </div>
                      {submission ? (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-600" />
                              <span className="text-sm text-green-600 font-medium">
                                ส่งงานแล้ว
                              </span>
                            </div>
                            {/* Show edit button based on grading status and allowEdit setting */}
                            {(() => {
                              const hasGrade = submission.grade !== undefined;
                              const canEdit = !hasGrade || assignment.allowEdit;
                              
                              return canEdit && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setSelectedAssignment(assignment);
                                    setContent(submission.content || '');
                                    setIsEditModalOpen(true);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Edit size={14} />
                                  แก้ไข
                                </Button>
                              );
                            })()}
                          </div>
                          {submission.grade !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                              <Award size={16} className="text-blue-600" />
                              <span className="text-sm text-blue-600 font-medium">
                                คะแนน: {submission.grade}/{assignment.points}
                              </span>
                              {!assignment.allowEdit && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  ปิดการแก้ไข
                                </span>
                              )}
                            </div>
                          )}
                          {submission.feedback && (
                            <p className="text-sm text-gray-600 mt-2">
                              ความคิดเห็น: {submission.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Button
                            variant={isOverdue ? 'danger' : 'primary'}
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setIsModalOpen(true);
                            }}
                            disabled={isOverdue}
                          >
                            <Send size={16} />
                            {isOverdue ? 'หมดเวลาส่งงาน' : 'ส่งงาน'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setContent('');
          setSelectedAssignment(null);
        }}
        title="ส่งงาน"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              งาน: <strong>{selectedAssignment?.title}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เนื้อหางาน
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="กรอกเนื้อหางานหรือคำตอบของคุณ"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              แนบไฟล์ (เลือกได้หลายไฟล์)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                เลือกไฟล์
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFilesChange(e.target.files)}
                  className="hidden"
                />
              </label>
              {fileNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fileNames.map((n, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              <Send size={16} />
              ส่งงาน
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                setContent('');
                setSelectedAssignment(null);
              }}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Submission Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setContent('');
          setSelectedSubmission(null);
          setSelectedAssignment(null);
        }}
        title="แก้ไขงาน"
      >
        <form onSubmit={handleEditSubmission} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              งาน: <strong>{selectedAssignment?.title}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เนื้อหางาน
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="กรอกเนื้อหางานหรือคำตอบของคุณ"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              แนบไฟล์ (เลือกได้หลายไฟล์)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                เลือกไฟล์
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFilesChange(e.target.files)}
                  className="hidden"
                />
              </label>
              {fileNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {fileNames.map((n, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              <Edit size={16} />
              บันทึกการแก้ไข
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsEditModalOpen(false);
                setContent('');
                setSelectedSubmission(null);
                setSelectedAssignment(null);
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

