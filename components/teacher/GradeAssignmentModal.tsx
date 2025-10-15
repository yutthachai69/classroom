'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';
import Swal from 'sweetalert2';

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

interface Assignment {
  _id: string;
  title: string;
  description: string;
  points: number;
  dueDate: string;
  gradeCategoryName?: string;
}

interface GradeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  submissions: Submission[];
  onGradeSubmit: (submissionId: string, grade: number, feedback: string) => Promise<void>;
}

export default function GradeAssignmentModal({ 
  isOpen, 
  onClose, 
  assignment, 
  submissions, 
  onGradeSubmit 
}: GradeAssignmentModalProps) {
  const [gradingData, setGradingData] = useState<{ [key: string]: { grade: number; feedback: string } }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submissions) {
      const initialData: { [key: string]: { grade: number; feedback: string } } = {};
      submissions.forEach(submission => {
        initialData[submission._id] = {
          grade: submission.grade || 0,
          feedback: submission.feedback || '',
        };
      });
      setGradingData(initialData);
    }
  }, [submissions]);

  const handleGradeChange = (submissionId: string, field: 'grade' | 'feedback', value: string | number) => {
    setGradingData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleSubmitGrades = async () => {
    setLoading(true);
    try {
      const promises = Object.entries(gradingData).map(([submissionId, data]) =>
        onGradeSubmit(submissionId, data.grade, data.feedback)
      );
      
      await Promise.all(promises);
      
      Swal.fire({
        icon: 'success',
        title: 'บันทึกคะแนนสำเร็จ!',
        text: 'คะแนนทั้งหมดได้ถูกบันทึกเรียบร้อยแล้ว',
        background: '#f0fdf4',
        color: '#15803d',
        iconColor: '#10b981',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to submit grades:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกคะแนนได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (submission: Submission) => {
    if (submission.grade !== undefined) {
      return { icon: CheckCircle, color: 'text-green-600', text: 'ตรวจแล้ว' };
    }
    if (new Date(submission.submittedAt) > new Date(assignment?.dueDate || '')) {
      return { icon: AlertCircle, color: 'text-red-600', text: 'ส่งสาย' };
    }
    return { icon: Clock, color: 'text-blue-600', text: 'รอตรวจ' };
  };

  const getEditStatus = (submission: Submission) => {
    if (submission.isEdited) {
      return { 
        text: 'แก้ไขแล้ว', 
        color: 'text-orange-600 bg-orange-100',
        tooltip: `แก้ไขเมื่อ: ${submission.editedAt ? new Date(submission.editedAt).toLocaleString('th-TH') : 'ไม่ทราบ'}`
      };
    }
    return null;
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">ตรวจงาน: {assignment.title}</h2>
              <p className="text-white/90 mt-1">
                คะแนนเต็ม: {assignment.points} คะแนน
                {assignment.gradeCategoryName && ` • ${assignment.gradeCategoryName}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีงานส่ง</h3>
              <p className="text-gray-600">นักเรียนยังไม่ได้ส่งงานนี้</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => {
                const status = getSubmissionStatus(submission);
                const editStatus = getEditStatus(submission);
                const StatusIcon = status.icon;
                
                return (
                  <div key={submission._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <User size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{submission.studentName}</h4>
                          <p className="text-sm text-gray-600">
                            ส่งเมื่อ: {new Date(submission.submittedAt).toLocaleString('th-TH')}
                          </p>
                          {editStatus && (
                            <div className="mt-1">
                              <span 
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${editStatus.color}`}
                                title={editStatus.tooltip}
                              >
                                {editStatus.text}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center space-x-2 ${status.color}`}>
                        <StatusIcon size={16} />
                        <span className="text-sm font-medium">{status.text}</span>
                      </div>
                    </div>

                    {/* Submission Content */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">เนื้อหางาน:</h5>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                      </div>
                    </div>

                    {/* Attachments */}
                    {submission.attachments && submission.attachments.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">ไฟล์แนบ:</h5>
                        <div className="space-y-2">
                          {submission.attachments.map((attachment, index) => (
                            <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-100 p-1 rounded">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <span className="text-blue-700 text-sm font-medium">
                                    {attachment.split('/').pop()}
                                  </span>
                                </div>
                                <a
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  เปิดไฟล์
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grading Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          คะแนน (0-{assignment.points})
                        </label>
                        <input
                          type="number"
                          value={gradingData[submission._id]?.grade || ''}
                          onChange={(e) => handleGradeChange(submission._id, 'grade', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          min="0"
                          max={assignment.points}
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เปอร์เซ็นต์
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                          {gradingData[submission._id]?.grade 
                            ? ((gradingData[submission._id].grade / assignment.points) * 100).toFixed(1)
                            : '0'
                          }%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ความคิดเห็น/ข้อเสนอแนะ
                      </label>
                      <textarea
                        value={gradingData[submission._id]?.feedback || ''}
                        onChange={(e) => handleGradeChange(submission._id, 'feedback', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                        placeholder="ให้ความคิดเห็นหรือข้อเสนอแนะ..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {submissions.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                จำนวนงานที่ส่ง: {submissions.length} ชิ้น
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitGrades}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกคะแนนทั้งหมด'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

