'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';
import { getGradeColor } from '@/lib/utils';

interface GradeCategory {
  categoryId: string;
  categoryName: string;
  earnedPoints: number;
  maxPoints: number;
  percentage: number;
  weight: number;
  weightedPoints: number;
}

interface StudentGradeSummary {
  studentId: string;
  studentName: string;
  gradeStructureId: string;
  categories: GradeCategory[];
  totalEarnedPoints: number;
  totalMaxPoints: number;
  finalPercentage: number;
  finalGrade: string;
  lastUpdated: string;
}

interface Class {
  _id: string;
  name: string;
  classCode: string;
}

interface StudentGradePortalProps {
  userId: string;
}

export default function StudentGradePortal({ userId }: StudentGradePortalProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [gradeSummary, setGradeSummary] = useState<StudentGradeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [userId]);

  useEffect(() => {
    if (selectedClass) {
      fetchGradeSummary();
    }
  }, [selectedClass, userId]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/classes?studentId=${userId}`);
      const data = await response.json();
      setClasses(data.classes || []);
      
      if (data.classes && data.classes.length > 0) {
        setSelectedClass(data.classes[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeSummary = async () => {
    if (!selectedClass) return;
    
    setLoadingGrades(true);
    try {
      const response = await fetch(`/api/grades/summary?studentId=${userId}&classId=${selectedClass}`);
      const data = await response.json();
      
      if (response.ok) {
        setGradeSummary(data.summary);
      } else {
        setGradeSummary(null);
      }
    } catch (error) {
      console.error('Failed to fetch grade summary:', error);
      setGradeSummary(null);
    } finally {
      setLoadingGrades(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (classes.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่ได้เข้าร่วมคลาสเรียน</h3>
          <p className="text-gray-600">เข้าร่วมคลาสเรียนเพื่อดูคะแนนของคุณ</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">คะแนนของฉัน</h2>
          <p className="text-gray-600">ติดตามคะแนนและความก้าวหน้าในการเรียน</p>
        </div>
      </div>

      {/* Class Selector */}
      <Card>
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">เลือกคลาสเรียน:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.classCode})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loadingGrades ? (
        <LoadingSpinner size="lg" />
      ) : gradeSummary ? (
        <>
          {/* Overall Grade Summary */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">คะแนนรวม</h3>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getGradeColor(gradeSummary.finalGrade)}`}>
                  {gradeSummary.finalGrade}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {gradeSummary.finalPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">คะแนนรวม</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {gradeSummary.totalEarnedPoints}
                  </div>
                  <div className="text-sm text-gray-600">คะแนนที่ได้</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    {gradeSummary.totalMaxPoints}
                  </div>
                  <div className="text-sm text-gray-600">คะแนนเต็ม</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ความคืบหน้า</span>
                  <span className={`font-medium ${getProgressTextColor(gradeSummary.finalPercentage)}`}>
                    {gradeSummary.finalPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(gradeSummary.finalPercentage)}`}
                    style={{ width: `${Math.min(gradeSummary.finalPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">รายละเอียดคะแนนแต่ละหมวด</h3>
            <div className="space-y-4">
              {gradeSummary.categories.map((category, index) => (
                <div key={category.categoryId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{category.categoryName}</h4>
                      <p className="text-sm text-gray-600">
                        น้ำหนัก {category.weight}% • คะแนนเต็ม {category.maxPoints}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {category.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {category.earnedPoints}/{category.maxPoints}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">คะแนนในหมวดนี้</span>
                      <span className="font-medium">{category.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(category.percentage)}`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">คะแนนที่คิดในเกรดรวม:</span>
                      <span className="font-medium text-green-600">
                        {category.weightedPoints.toFixed(1)} คะแนน
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            อัปเดตล่าสุด: {new Date(gradeSummary.lastUpdated).toLocaleString('th-TH')}
          </div>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีโครงสร้างคะแนน</h3>
            <p className="text-gray-600">ครูยังไม่ได้สร้างโครงสร้างคะแนนสำหรับคลาสนี้</p>
          </div>
        </Card>
      )}
    </div>
  );
}

