'use client';

import React, { useState } from 'react';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { BookOpen, FileText } from 'lucide-react';

export default function CreateClassForm() {
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Class created:', { className, description });
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">สร้างคลาสใหม่</h2>
          <p className="text-gray-600">กรอกข้อมูลเพื่อสร้างคลาสเรียนใหม่</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Name Input - ไม่ใช้ animated เพื่อหลีกเลี่ยงปัญหา floating label */}
          <Input
            label="ชื่อคลาส"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="เช่น คณิตศาสตร์ ม.1, วิทยาศาสตร์ ม.2"
            icon={<BookOpen className="h-5 w-5" />}
            animated={false} // ปิด floating label animation
            required
          />

          {/* Description Textarea - ไม่ใช้ animated เพื่อหลีกเลี่ยงปัญหา floating label */}
          <Textarea
            label="คำอธิบาย"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="คำอธิบายเกี่ยวกับคลาส (ไม่บังคับ)"
            icon={<FileText className="h-5 w-5" />}
            animated={false} // ปิด floating label animation
            rows={4}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              variant="primary"
              size="lg"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างคลาส'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
