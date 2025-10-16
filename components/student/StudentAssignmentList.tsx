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
import { useAssignmentView } from '@/lib/useAssignmentView';
import { useSuccessAnimation } from '@/components/common/SuccessAnimation';
import SuccessAnimation from '@/components/common/SuccessAnimation';

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
  const [notificationStatuses, setNotificationStatuses] = useState<Map<string, string>>(new Map());
  const { markAsViewed } = useAssignmentView();
  const { showSuccess, isOpen: isSuccessOpen, config: successConfig, closeSuccess } = useSuccessAnimation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignmentForView, setSelectedAssignmentForView] = useState<Assignment | null>(null);
  const [content, setContent] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [originalAttachments, setOriginalAttachments] = useState<string[]>([]);

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

      // ดึง notification status
      const notificationsRes = await fetch('/api/notifications');
      const notificationsData = await notificationsRes.json();
      
      if (notificationsData.success) {
        const statusMap = new Map<string, string>();
        notificationsData.data.notifications.forEach((notif: any) => {
          statusMap.set(notif.assignmentId, notif.status);
        });
        setNotificationStatuses(statusMap);
      }
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

    setIsSubmitting(true);

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
        showSuccess('สำเร็จ!', 'ส่งงานสำเร็จ', 'submit', () => {
          setIsModalOpen(false);
          setContent('');
          setSelectedAssignment(null);
          setFiles(null);
          fetchData();
        });
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถส่งงานได้', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
    if (!hasChanges()) {
      Swal.fire('แจ้งเตือน', 'ไม่มีการเปลี่ยนแปลงใดๆ กรุณาแก้ไขเนื้อหาหรือไฟล์ก่อนบันทึก', 'info');
      return;
    }

    if (!content && existingAttachments.length === 0 && (!files || files.length === 0) || !selectedSubmission) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกเนื้อหาหรือแนบไฟล์อย่างน้อย 1 รายการ', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let attachments: string[] = [...existingAttachments]; // เริ่มจากไฟล์เก่า
      
      if (files && files.length > 0) {
        const form = new FormData();
        Array.from(files).forEach(f => form.append('files', f));
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'อัปโหลดไฟล์ไม่สำเร็จ');
        
        // เพิ่มไฟล์ใหม่เข้าไป
        if (uploadData.urls) {
          attachments = [...attachments, ...uploadData.urls];
        }
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
        showSuccess('สำเร็จ!', 'แก้ไขงานสำเร็จ', 'complete', () => {
          setIsEditModalOpen(false);
          setContent('');
          setSelectedSubmission(null);
          setSelectedAssignment(null);
          setFiles(null);
          setExistingAttachments([]);
          setOriginalContent('');
          setOriginalAttachments([]);
          fetchData();
        });
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to edit submission:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแก้ไขงานได้', 'error');
    } finally {
      setIsSubmitting(false);
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

  // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
  const hasChanges = () => {
    // ตรวจสอบเนื้อหา
    const contentChanged = content.trim() !== originalContent.trim();
    
    // ตรวจสอบไฟล์แนบ
    const attachmentsChanged = 
      existingAttachments.length !== originalAttachments.length ||
      !existingAttachments.every((attachment, index) => attachment === originalAttachments[index]);
    
    // ตรวจสอบไฟล์ใหม่
    const hasNewFiles = files && files.length > 0;
    
    return contentChanged || attachmentsChanged || hasNewFiles;
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
            const notificationStatus = notificationStatuses.get(assignment._id);
            const isNew = notificationStatus === 'new' && !submission;
            const isViewed = notificationStatus === 'viewed' && !submission;

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
                        {isViewed && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            ดูแล้ว
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
                                    setExistingAttachments(submission.attachments || []);
                                    setFileNames([]);
                                    setFiles(null);
                                    
                                    // เก็บข้อมูลเดิมไว้เปรียบเทียบ
                                    setOriginalContent(submission.content || '');
                                    setOriginalAttachments(submission.attachments || []);
                                    
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
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            onClick={async () => {
                              // เปิด modal รายละเอียดงาน
                              setSelectedAssignmentForView(assignment);
                              setIsViewModalOpen(true);
                              
                              // Mark as viewed
                              await markAsViewed(assignment._id, assignment.classId);
                            }}
                            className="flex items-center gap-1"
                          >
                            <FileText size={16} />
                            ดูงาน
                          </Button>
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
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send size={16} />
                  ส่งงาน
                </>
              )}
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

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ไฟล์ที่แนบแล้ว:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {existingAttachments.map((attachment, i) => (
                      <div key={i} className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                        <span className="text-xs text-green-700">{attachment}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setExistingAttachments(prev => prev.filter((_, index) => index !== i));
                          }}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Files */}
              {fileNames.length > 0 && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ไฟล์ใหม่ที่เลือก:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fileNames.map((n, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-200">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message if no files */}
              {existingAttachments.length === 0 && fileNames.length === 0 && (
                <p className="text-sm text-gray-500 italic">ยังไม่มีไฟล์แนบ</p>
              )}
            </div>
          </div>
          
          {/* แสดงสถานะการเปลี่ยนแปลง */}
          {!hasChanges() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-yellow-700 font-medium">
                  ไม่มีการเปลี่ยนแปลงใดๆ
                </span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                กรุณาแก้ไขเนื้อหาหรือไฟล์ก่อนบันทึก
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1"
              disabled={isSubmitting || !hasChanges()}
              title={!hasChanges() ? 'ไม่มีการเปลี่ยนแปลงใดๆ' : ''}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Edit size={16} />
                  บันทึกการแก้ไข
                </>
              )}
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
                setExistingAttachments([]);
                setFileNames([]);
                setFiles(null);
                setOriginalContent('');
                setOriginalAttachments([]);
              }}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal ดูรายละเอียดงาน */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAssignmentForView(null);
        }}
        title="รายละเอียดงาน"
      >
        {selectedAssignmentForView && (() => {
          const isOverdue = new Date(selectedAssignmentForView.dueDate) < new Date();
          return (
            <div className="space-y-6">
            {/* Assignment Header */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {selectedAssignmentForView.title}
              </h3>
              <p className="text-blue-800 mb-3">
                {selectedAssignmentForView.description || 'ไม่มีคำอธิบาย'}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">
                    กำหนดส่ง: {formatDate(selectedAssignmentForView.dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700">
                    คะแนนเต็ม: {selectedAssignmentForView.points}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">ข้อมูลงาน</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ชื่องาน:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAssignmentForView.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">คลาส:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAssignmentForView.className}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">กำหนดส่ง:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(selectedAssignmentForView.dueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">คะแนนเต็ม:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAssignmentForView.points}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">สถานะ:</span>
                    <span className={`text-sm font-medium ${
                      isOverdue ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {isOverdue ? 'หมดเวลาส่งงาน' : 'ยังไม่ส่งงาน'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAssignmentForView.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">คำอธิบายงาน</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedAssignmentForView.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedAssignment(selectedAssignmentForView);
                  setIsModalOpen(true);
                }}
                disabled={isOverdue}
                className="flex items-center gap-1"
              >
                <Send size={16} />
                {isOverdue ? 'หมดเวลาส่งงาน' : 'ส่งงาน'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                ปิด
              </Button>
            </div>
          </div>
          );
        })()}
      </Modal>

      {/* Custom Success Animation */}
      <SuccessAnimation
        isOpen={isSuccessOpen}
        onClose={closeSuccess}
        title={successConfig.title}
        message={successConfig.message}
        type={successConfig.type}
        onConfirm={successConfig.onConfirm}
      />
    </div>
  );
}

