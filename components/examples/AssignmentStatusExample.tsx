'use client';

import React, { useState, useEffect } from 'react';
import { useAssignmentView } from '@/lib/useAssignmentView';
import { useAlert } from '@/lib/useAlert';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { BookOpen, Eye, Send, Clock, CheckCircle } from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  classId: string;
  className?: string;
  createdAt: string;
}

interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
}

interface NotificationStatus {
  assignmentId: string;
  status: 'new' | 'viewed' | 'submitted';
}

export default function AssignmentStatusExample() {
  const { markAsViewed } = useAssignmentView();
  const { alert, success } = useAlert();
  
  const [assignments] = useState<Assignment[]>([
    {
      _id: '1',
      title: 'แบบฝึกหัดคณิตศาสตร์ บทที่ 1',
      description: 'ทำแบบฝึกหัดหน้า 1-10',
      dueDate: '2024-01-15',
      points: 25,
      classId: 'class1',
      className: 'คณิตศาสตร์ ม.5',
      createdAt: '2024-01-01'
    },
    {
      _id: '2',
      title: 'รายงานวิทยาศาสตร์',
      description: 'เขียนรายงานเรื่องการทดลอง',
      dueDate: '2024-01-20',
      points: 30,
      classId: 'class1',
      className: 'วิทยาศาสตร์ ม.5',
      createdAt: '2024-01-01'
    }
  ]);

  const [submissions] = useState<Submission[]>([
    {
      _id: 'sub1',
      assignmentId: '2',
      studentId: 'student1',
      content: 'รายงานวิทยาศาสตร์',
      submittedAt: '2024-01-10'
    }
  ]);

  const [notificationStatuses] = useState<Map<string, string>>(new Map([
    ['1', 'new'],      // งานใหม่ - ยังไม่ดู
    ['2', 'submitted'] // งานที่ส่งแล้ว
  ]));

  const getSubmission = (assignmentId: string) => {
    return submissions.find(sub => sub.assignmentId === assignmentId);
  };

  const getNotificationStatus = (assignmentId: string) => {
    return notificationStatuses.get(assignmentId) || 'new';
  };

  const handleView = async (assignment: Assignment) => {
    await markAsViewed(assignment._id, assignment.classId);
    success('ดูงานแล้ว', `กำลังดู "${assignment.title}"`);
  };

  const handleSubmit = (assignment: Assignment) => {
    success('ส่งงานสำเร็จ', `ส่งงาน "${assignment.title}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ตัวอย่างสถานะงาน</h1>
      
      <div className="space-y-4">
        {assignments.map((assignment) => {
          const submission = getSubmission(assignment._id);
          const notificationStatus = getNotificationStatus(assignment._id);
          const isNew = notificationStatus === 'new' && !submission;
          const isViewed = notificationStatus === 'viewed' && !submission;
          const isSubmitted = !!submission;

          return (
            <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>ครบกำหนด: {new Date(assignment.dueDate).toLocaleDateString('th-TH')}</span>
                      </div>
                      <span>{assignment.points} คะแนน</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Status Indicators */}
                  {isNew && (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                      ใหม่
                    </div>
                  )}
                  
                  {isViewed && (
                    <div className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                      ดูแล้ว
                    </div>
                  )}
                  
                  {isSubmitted && (
                    <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                      ส่งแล้ว
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                {!isSubmitted && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(assignment)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>ดูงาน</span>
                    </Button>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmit(assignment)}
                      className="flex items-center space-x-1"
                    >
                      <Send className="h-4 w-4" />
                      <span>ส่งงาน</span>
                    </Button>
                  </>
                )}
                
                {isSubmitted && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">ส่งงานแล้ว</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alert Modal */}
      <Modal {...alert} />
    </div>
  );
}
