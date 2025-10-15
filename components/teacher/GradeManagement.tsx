'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Settings, BarChart3, Users, Calculator } from 'lucide-react';
import Swal from 'sweetalert2';

interface GradeCategory {
  _id?: string;
  name: string;
  description?: string;
  weight: number;
  maxPoints: number;
  order: number;
}

interface GradeStructure {
  _id: string;
  name: string;
  description?: string;
  totalPoints: number;
  categories: GradeCategory[];
  isActive: boolean;
  createdAt: string;
}

interface Class {
  _id: string;
  name: string;
  classCode: string;
}

interface GradeManagementProps {
  userId: string;
}

export default function GradeManagement({ userId }: GradeManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradeStructures, setGradeStructures] = useState<GradeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<GradeStructure | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalPoints: 100,
  });
  const [categories, setCategories] = useState<GradeCategory[]>([
    { name: 'งานก่อนกลางภาค', weight: 25, maxPoints: 25, order: 1 },
    { name: 'สอบกลางภาค', weight: 20, maxPoints: 20, order: 2 },
    { name: 'งานหลังกลางภาค', weight: 25, maxPoints: 25, order: 3 },
    { name: 'สอบปลายภาค', weight: 30, maxPoints: 30, order: 4 },
  ]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch classes
      const classesResponse = await fetch(`/api/classes?teacherId=${userId}`);
      const classesData = await classesResponse.json();
      setClasses(classesData.classes || []);

      // Fetch grade structures
      const structuresResponse = await fetch(`/api/grade-structures?teacherId=${userId}`);
      const structuresData = await structuresResponse.json();
      setGradeStructures(structuresData.gradeStructures || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClass || !formData.name) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกคลาสและกรอกชื่อโครงสร้างคะแนน', 'error');
      return;
    }

    // Validate categories
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      Swal.fire('ข้อผิดพลาด', `น้ำหนักรวมต้องเป็น 100% (ปัจจุบัน: ${totalWeight}%)`, 'error');
      return;
    }

    try {
      const response = await fetch('/api/grade-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          classId: selectedClass,
          teacherId: userId,
          categories: categories.map((cat, index) => ({
            ...cat,
            order: index + 1,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สร้างโครงสร้างคะแนนสำเร็จ!',
          text: 'โครงสร้างคะแนนได้ถูกสร้างและเปิดใช้งานแล้ว',
          background: '#f0fdf4',
          color: '#15803d',
          iconColor: '#10b981',
        });
        setIsModalOpen(false);
        setFormData({ name: '', description: '', totalPoints: 100 });
        setCategories([
          { name: 'งานก่อนกลางภาค', weight: 25, maxPoints: 25, order: 1 },
          { name: 'สอบกลางภาค', weight: 20, maxPoints: 20, order: 2 },
          { name: 'งานหลังกลางภาค', weight: 25, maxPoints: 25, order: 3 },
          { name: 'สอบปลายภาค', weight: 30, maxPoints: 30, order: 4 },
        ]);
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to create grade structure:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างโครงสร้างคะแนนได้', 'error');
    }
  };

  const addCategory = () => {
    setCategories([...categories, {
      name: '',
      weight: 0,
      maxPoints: 0,
      order: categories.length + 1,
    }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const updateCategory = (index: number, field: keyof GradeCategory, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleEditStructure = (structure: GradeStructure) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      description: structure.description || '',
      totalPoints: structure.totalPoints,
    });
    setCategories(structure.categories.map(cat => ({
      ...cat,
      _id: cat._id?.toString(),
    })));
    setIsEditModalOpen(true);
  };

  const handleUpdateStructure = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingStructure || !formData.name) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกชื่อโครงสร้างคะแนน', 'error');
      return;
    }

    // Validate categories
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      Swal.fire('ข้อผิดพลาด', `น้ำหนักรวมต้องเป็น 100% (ปัจจุบัน: ${totalWeight}%)`, 'error');
      return;
    }

    try {
      const response = await fetch(`/api/grade-structures/${editingStructure._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          totalPoints: formData.totalPoints,
          categories: categories.map((cat, index) => ({
            ...cat,
            order: index + 1,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขโครงสร้างคะแนนสำเร็จ!',
          text: 'โครงสร้างคะแนนได้ถูกอัปเดตเรียบร้อยแล้ว',
          background: '#f0fdf4',
          color: '#15803d',
          iconColor: '#10b981',
        });
        setIsEditModalOpen(false);
        setEditingStructure(null);
        resetForm();
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to update grade structure:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแก้ไขโครงสร้างคะแนนได้', 'error');
    }
  };

  const handleToggleActive = async (structure: GradeStructure) => {
    try {
      const response = await fetch(`/api/grade-structures/${structure._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !structure.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: structure.isActive ? 'ปิดใช้งานโครงสร้างคะแนน' : 'เปิดใช้งานโครงสร้างคะแนน',
          text: data.message,
        });
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to toggle structure:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', totalPoints: 100 });
    setCategories([
      { name: 'งานก่อนกลางภาค', weight: 25, maxPoints: 25, order: 1 },
      { name: 'สอบกลางภาค', weight: 20, maxPoints: 20, order: 2 },
      { name: 'งานหลังกลางภาค', weight: 25, maxPoints: 25, order: 3 },
      { name: 'สอบปลายภาค', weight: 30, maxPoints: 30, order: 4 },
    ]);
    setEditingStructure(null);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">จัดการคะแนน</h2>
          <p className="text-gray-600">สร้างและจัดการโครงสร้างคะแนนสำหรับคลาสเรียน</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg"
        >
          <PlusCircle size={20} />
          สร้างโครงสร้างคะแนน
        </Button>
      </div>

      {gradeStructures.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีโครงสร้างคะแนน</h3>
            <p className="text-gray-600 mb-6">เริ่มต้นด้วยการสร้างโครงสร้างคะแนนสำหรับคลาสเรียนของคุณ</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <PlusCircle size={20} />
              สร้างโครงสร้างคะแนนแรก
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gradeStructures.map((structure) => (
            <Card key={structure._id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{structure.name}</h3>
                    <p className="text-sm text-gray-600">{structure.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        structure.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {structure.isActive ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">โครงสร้างคะแนน:</h4>
                  {structure.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({category.maxPoints} คะแนน)
                        </span>
                      </div>
                      <span className="font-semibold text-primary">{category.weight}%</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BarChart3 size={16} />
                    <span>คะแนนเต็ม: {structure.totalPoints}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleEditStructure(structure)}
                    >
                      <Settings size={16} />
                      แก้ไข
                    </Button>
                    <Button 
                      variant={structure.isActive ? "danger" : "success"}
                      size="sm"
                      onClick={() => handleToggleActive(structure)}
                    >
                      {structure.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Grade Structure Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="สร้างโครงสร้างคะแนน"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกคลาสเรียน
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">เลือกคลาสเรียน</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.classCode})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="ชื่อโครงสร้างคะแนน"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น โครงสร้างคะแนน คณิตศาสตร์ ม.1"
            required
          />

          <Input
            label="คำอธิบาย"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">หมวดคะแนน</h4>
              <Button type="button" variant="secondary" size="sm" onClick={addCategory}>
                <PlusCircle size={16} />
                เพิ่มหมวด
              </Button>
            </div>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">หมวดที่ {index + 1}</h5>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ลบ
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ชื่อหมวด
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="เช่น งานก่อนกลางภาค"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        น้ำหนัก (%)
                      </label>
                      <input
                        type="number"
                        value={category.weight}
                        onChange={(e) => updateCategory(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        คะแนนเต็ม
                      </label>
                      <input
                        type="number"
                        value={category.maxPoints}
                        onChange={(e) => updateCategory(index, 'maxPoints', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-900">น้ำหนักรวม:</span>
                <span className={`font-bold ${
                  Math.abs(categories.reduce((sum, cat) => sum + cat.weight, 0) - 100) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {categories.reduce((sum, cat) => sum + cat.weight, 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              สร้างโครงสร้างคะแนน
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Grade Structure Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStructure(null);
          resetForm();
        }}
        title="แก้ไขโครงสร้างคะแนน"
      >
        <form onSubmit={handleUpdateStructure} className="space-y-6">
          <Input
            label="ชื่อโครงสร้างคะแนน"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="เช่น โครงสร้างคะแนน คณิตศาสตร์ ม.1"
            required
          />

          <Input
            label="คำอธิบาย"
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">หมวดคะแนน</h4>
              <Button type="button" variant="secondary" size="sm" onClick={addCategory}>
                <PlusCircle size={16} />
                เพิ่มหมวด
              </Button>
            </div>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">หมวดที่ {index + 1}</h5>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ลบ
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        ชื่อหมวด
                      </label>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="เช่น งานก่อนกลางภาค"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        น้ำหนัก (%)
                      </label>
                      <input
                        type="number"
                        value={category.weight}
                        onChange={(e) => updateCategory(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        คะแนนเต็ม
                      </label>
                      <input
                        type="number"
                        value={category.maxPoints}
                        onChange={(e) => updateCategory(index, 'maxPoints', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-900">น้ำหนักรวม:</span>
                <span className={`font-bold ${
                  Math.abs(categories.reduce((sum, cat) => sum + cat.weight, 0) - 100) < 0.01
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {categories.reduce((sum, cat) => sum + cat.weight, 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingStructure(null);
                resetForm();
              }}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
            >
              บันทึกการแก้ไข
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

