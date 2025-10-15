'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, Users } from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  description: string;
  teacherName: string;
  students: string[];
  createdAt: string;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">จัดการคลาสเรียน</h2>
      </div>

      {classes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">ยังไม่มีคลาสเรียนในระบบ</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls._id} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <BookOpen size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                      <p className="text-sm text-gray-600">ครูผู้สอน: {cls.teacherName}</p>
                    </div>
                  </div>
                </div>
                {cls.description && (
                  <p className="text-sm text-gray-600">{cls.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                  <Users size={16} />
                  <span>{cls.students.length} นักเรียน</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

