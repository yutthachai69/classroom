'use client';

import React, { useState, useEffect } from 'react';
import { useAssignmentView } from '@/lib/useAssignmentView';
import { useAlert } from '@/lib/useAlert';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { BookOpen, Eye, Send, Clock } from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  classId: string;
  className?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onView: (assignment: Assignment) => void;
  onSubmit: (assignment: Assignment) => void;
}

export default function AssignmentCard({ assignment, onView, onSubmit }: AssignmentCardProps) {
  const { markAsViewed } = useAssignmentView();
  const [isViewed, setIsViewed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleView = async () => {
    // Mark as viewed
    await markAsViewed(assignment._id, assignment.classId);
    setIsViewed(true);
    onView(assignment);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmit(assignment);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
          {!isViewed && (
            <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
              ใหม่
            </div>
          )}
          
          {isViewed && !isSubmitted && (
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          className="flex items-center space-x-1"
        >
          <Eye className="h-4 w-4" />
          <span>ดูงาน</span>
        </Button>
        
        {!isSubmitted && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            className="flex items-center space-x-1"
          >
            <Send className="h-4 w-4" />
            <span>ส่งงาน</span>
          </Button>
        )}
      </div>
    </Card>
  );
}

// Example usage component
export function AssignmentListExample() {
  const { alert, success } = useAlert();
  const [assignments] = useState<Assignment[]>([
    {
      _id: '1',
      title: 'แบบฝึกหัดคณิตศาสตร์ บทที่ 1',
      description: 'ทำแบบฝึกหัดหน้า 1-10',
      dueDate: '2024-01-15',
      points: 25,
      classId: 'class1',
      className: 'คณิตศาสตร์ ม.5'
    },
    {
      _id: '2',
      title: 'รายงานวิทยาศาสตร์',
      description: 'เขียนรายงานเรื่องการทดลอง',
      dueDate: '2024-01-20',
      points: 30,
      classId: 'class1',
      className: 'วิทยาศาสตร์ ม.5'
    }
  ]);

  const handleView = (assignment: Assignment) => {
    success('เปิดดูงาน', `กำลังเปิดดู "${assignment.title}"`);
  };

  const handleSubmit = (assignment: Assignment) => {
    success('ส่งงานสำเร็จ', `ส่งงาน "${assignment.title}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">รายการงาน</h1>
      
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            onView={handleView}
            onSubmit={handleSubmit}
          />
        ))}
      </div>

      {/* Alert Modal */}
      <Modal {...alert} />
    </div>
  );
}
