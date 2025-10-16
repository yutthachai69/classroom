'use client';

import React, { useState } from 'react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import { BookOpen, FileText, Plus, Trash2 } from 'lucide-react';

interface ScoreCategory {
  id: string;
  name: string;
  weight: number;
  fullScore: number;
}

export default function GradeStructureModal() {
  const { alert, success, error } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [structureName, setStructureName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<ScoreCategory[]>([
    { id: '1', name: 'งานก่อนกลางภาค', weight: 25, fullScore: 25 },
    { id: '2', name: 'สอบกลางภาค', weight: 20, fullScore: 20 },
    { id: '3', name: 'งานหลังกลางภาค', weight: 25, fullScore: 25 },
    { id: '4', name: 'สอบปลายภาค', weight: 30, fullScore: 30 },
  ]);
  const [loading, setLoading] = useState(false);

  const addCategory = () => {
    const newId = (categories.length + 1).toString();
    setCategories([...categories, { 
      id: newId, 
      name: '', 
      weight: 0, 
      fullScore: 0 
    }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const updateCategory = (id: string, field: keyof ScoreCategory, value: string | number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!structureName.trim()) {
      error('เกิดข้อผิดพลาด', 'กรุณากรอกชื่อโครงสร้างคะแนน');
      return;
    }

    if (categories.some(cat => !cat.name.trim())) {
      error('เกิดข้อผิดพลาด', 'กรุณากรอกชื่อหมวดคะแนนให้ครบถ้วน');
      return;
    }

    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    if (totalWeight !== 100) {
      error('เกิดข้อผิดพลาด', `น้ำหนักรวมต้องเป็น 100% (ปัจจุบัน: ${totalWeight}%)`);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      success('สร้างโครงสร้างคะแนนสำเร็จ!', `โครงสร้าง "${structureName}" ถูกสร้างเรียบร้อยแล้ว`);
      setIsOpen(false);
      setStructureName('');
      setDescription('');
      setCategories([
        { id: '1', name: 'งานก่อนกลางภาค', weight: 25, fullScore: 25 },
        { id: '2', name: 'สอบกลางภาค', weight: 20, fullScore: 20 },
        { id: '3', name: 'งานหลังกลางภาค', weight: 25, fullScore: 25 },
        { id: '4', name: 'สอบปลายภาค', weight: 30, fullScore: 30 },
      ]);
    }, 1000);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setStructureName('');
    setDescription('');
    setCategories([
      { id: '1', name: 'งานก่อนกลางภาค', weight: 25, fullScore: 25 },
      { id: '2', name: 'สอบกลางภาค', weight: 20, fullScore: 20 },
      { id: '3', name: 'งานหลังกลางภาค', weight: 25, fullScore: 25 },
      { id: '4', name: 'สอบปลายภาค', weight: 30, fullScore: 30 },
    ]);
  };

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={() => setIsOpen(true)} variant="primary">
        สร้างโครงสร้างคะแนน
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title="สร้างโครงสร้างคะแนน"
        type="info"
        showCancel={false}
        confirmText=""
        size="xl"
      >
        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="ชื่อโครงสร้างคะแนน"
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
              placeholder="เช่น โครงสร้างคะแนน ม.5"
              icon={<BookOpen className="h-5 w-5" />}
              animated={false}
              required
            />

            <Textarea
              label="คำอธิบาย"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายเกี่ยวกับโครงสร้างคะแนน (ไม่บังคับ)"
              icon={<FileText className="h-5 w-5" />}
              animated={false}
              rows={3}
            />
          </div>

          {/* Categories Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">หมวดคะแนน</h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addCategory}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                เพิ่มหมวด
              </Button>
            </div>

            {/* Weight Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                น้ำหนักรวม: <span className="font-semibold">{totalWeight}%</span>
                {totalWeight !== 100 && (
                  <span className="text-red-600 ml-2">
                    (ต้องเป็น 100%)
                  </span>
                )}
              </p>
            </div>

            {/* Categories List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {categories.map((category, index) => (
                <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">หมวดที่ {index + 1}</h5>
                    {categories.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="ชื่อหมวด"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                      placeholder="เช่น งานก่อนกลางภาค"
                      animated={false}
                      required
                    />

                    <Input
                      label="น้ำหนัก (%)"
                      type="number"
                      value={category.weight}
                      onChange={(e) => updateCategory(category.id, 'weight', parseInt(e.target.value) || 0)}
                      placeholder="25"
                      animated={false}
                      min="0"
                      max="100"
                      required
                    />

                    <Input
                      label="คะแนนเต็ม"
                      type="number"
                      value={category.fullScore}
                      onChange={(e) => updateCategory(category.id, 'fullScore', parseInt(e.target.value) || 0)}
                      placeholder="25"
                      animated={false}
                      min="0"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
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
              disabled={loading || totalWeight !== 100}
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างโครงสร้าง'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Alert Modal */}
      <Modal {...alert} />
    </>
  );
}
