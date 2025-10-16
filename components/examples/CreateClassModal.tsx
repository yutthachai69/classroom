'use client';

import React, { useState } from 'react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import { BookOpen, FileText } from 'lucide-react';

export default function CreateClassModal() {
  const { alert, success, error } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!className.trim()) {
      error('เกิดข้อผิดพลาด', 'กรุณากรอกชื่อคลาส');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      success('สร้างคลาสสำเร็จ!', `คลาส "${className}" ถูกสร้างเรียบร้อยแล้ว`);
      setIsOpen(false);
      setClassName('');
      setDescription('');
    }, 1000);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setClassName('');
    setDescription('');
  };

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={() => setIsOpen(true)} variant="primary">
        สร้างคลาสใหม่
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title="สร้างคลาสใหม่"
        type="info"
        showCancel={false} // ไม่แสดงปุ่มยกเลิกของ Modal
        confirmText="" // ไม่แสดงปุ่มยืนยันของ Modal
      >
        {/* Custom Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="ชื่อคลาส"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="เช่น คณิตศาสตร์ ม.1, วิทยาศาสตร์ ม.2"
            icon={<BookOpen className="h-5 w-5" />}
            animated={false}
            required
          />

          <Textarea
            label="คำอธิบาย"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="คำอธิบายเกี่ยวกับคลาส (ไม่บังคับ)"
            icon={<FileText className="h-5 w-5" />}
            animated={false}
            rows={4}
          />

          {/* Custom Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างคลาส'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alert Modal */}
      <Modal {...alert} />
    </>
  );
}
