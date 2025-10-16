'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import { Users, Calculator, BookOpen, Download } from 'lucide-react';

interface Student { 
  _id: string; 
  firstName: string; 
  lastName: string; 
  studentId?: string;
  studentNumber?: number;
}

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  earnedPoints: number;
  maxPoints: number;
  percentage: number;
  weight: number;
  weightedPoints: number;
}

interface StudentSummary {
  studentId: string;
  studentName: string;
  categories: CategorySummary[];
  totalEarnedPoints: number;
  totalMaxPoints: number;
  finalPercentage: number;
  finalGrade: string;
}

interface GradeStructure {
  _id: string;
  name: string;
  description?: string;
  classId: string;
  className: string;
  totalPoints: number;
  categories: any[];
  isActive: boolean;
}

interface GradebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeStructure: GradeStructure | null;
}

export default function GradebookModal({ isOpen, onClose, gradeStructure }: GradebookModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [summaries, setSummaries] = useState<Record<string, StudentSummary>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && gradeStructure) {
      fetchGradebookData();
    }
  }, [isOpen, gradeStructure]);

  const fetchGradebookData = async () => {
    if (!gradeStructure) return;

    setLoading(true);
    try {
      console.log('Fetching students for class:', gradeStructure.classId);
      
      // 1) fetch students in class
      const studentsRes = await fetch(`/api/classes/${gradeStructure.classId}`);
      const studentsData = await studentsRes.json();
      
      console.log('Students API response:', studentsData);
      console.log('Student details:', studentsData.class?.studentDetails);
      
      const members: Student[] = (studentsData.class?.studentDetails || []).map((u: any) => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        studentId: u.studentId || u.username,
        studentNumber: u.studentNumber || 0,
      }));
      
      console.log('Mapped students:', members);
      setStudents(members);

      // 2) fetch summaries per student
      const entries = await Promise.all(
        members.map(async (s) => {
          try {
            const res = await fetch(`/api/grades/summary?studentId=${s._id}&classId=${gradeStructure.classId}`);
            const data = await res.json();
            return [s._id, data.summary] as const;
          } catch (error) {
            console.error(`Failed to fetch summary for student ${s._id}:`, error);
            return [s._id, null] as const;
          }
        })
      );
      
      const validSummaries = Object.fromEntries(entries.filter(([, sum]) => !!sum));
      setSummaries(validSummaries);

    } catch (error) {
      console.error('Failed to fetch gradebook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!gradeStructure) return;

    const rows: string[] = [];
    const categoryHeaders = Object.values(summaries)[0]?.categories?.map((c) => ({ 
      id: c.categoryId, 
      name: c.categoryName, 
      max: c.maxPoints 
    })) || [];
    
    const head = ['เลขที่', 'รหัสนักเรียน', 'ชื่อ-นามสกุล', ...categoryHeaders.map((h) => `${h.name} (${h.max})`), 'คะแนนรวม', 'เปอร์เซ็นต์', 'เกรด'];
    rows.push(head.join(','));
    
    students.forEach((s) => {
      const sum = summaries[s._id];
      const cells: (string | number)[] = [];
      cells.push(s.studentNumber || '');
      cells.push(s.studentId || '');
      cells.push(`${s.firstName} ${s.lastName}`);
      categoryHeaders.forEach((h) => {
        const cat = sum?.categories.find((c) => String(c.categoryId) === String(h.id));
        cells.push(cat ? `${cat.earnedPoints}/${cat.maxPoints}` : '0/0');
      });
      cells.push(sum ? `${sum.totalEarnedPoints}/${sum.totalMaxPoints}` : '0/0');
      cells.push(sum ? sum.finalPercentage.toFixed(2) : '0');
      cells.push(sum ? sum.finalGrade : '');
      rows.push(cells.join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradebook-${gradeStructure.className}-${gradeStructure.name}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const categoryHeaders = Object.values(summaries)[0]?.categories?.map((c) => ({ 
    id: c.categoryId, 
    name: c.categoryName, 
    max: c.maxPoints 
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`คะแนนนักเรียน - ${gradeStructure?.className}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {gradeStructure?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {gradeStructure?.className} • {gradeStructure?.description}
              </p>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            onClick={exportCSV} 
            className="flex items-center space-x-2"
            disabled={students.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">จำนวนนักเรียน</p>
                <p className="text-lg font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">หมวดคะแนน</p>
                <p className="text-lg font-semibold text-gray-900">{categoryHeaders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">มีคะแนนแล้ว</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Object.keys(summaries).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Calculator className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Object.keys(summaries).length > 0 
                    ? (Object.values(summaries).reduce((sum, s) => sum + s.finalPercentage, 0) / Object.keys(summaries).length).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gradebook Table */}
        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="py-12 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">กำลังดึงข้อมูลคะแนน...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">ยังไม่มีนักเรียนในคลาสนี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap w-16">เลขที่</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap w-24">รหัสนักเรียน</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap min-w-32">ชื่อ-นามสกุล</th>
                    {categoryHeaders.map((h) => (
                      <th key={h.id} className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap text-center">
                        {h.name}
                        <br />
                        <span className="text-xs text-gray-500">({h.max})</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap text-center">คะแนนรวม</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap text-center">เปอร์เซ็นต์</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap text-center">เกรด</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, index) => {
                    const sum = summaries[s._id];
                    return (
                      <tr key={s._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-center font-medium text-gray-900">
                          {s.studentNumber || index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">
                          {s.studentId || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                          {s.firstName} {s.lastName}
                        </td>
                        {categoryHeaders.map((h) => {
                          const cat = sum?.categories.find((c) => String(c.categoryId) === String(h.id));
                          const earnedPoints = cat?.earnedPoints || 0;
                          const maxPoints = cat?.maxPoints || h.max;
                          const percentage = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0;
                          
                          return (
                            <td key={h.id} className="px-4 py-3 whitespace-nowrap text-center">
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900">
                                  {earnedPoints}/{maxPoints}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {percentage.toFixed(1)}%
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {sum ? `${sum.totalEarnedPoints}/${sum.totalMaxPoints}` : '0/0'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className={`font-semibold ${
                            sum && sum.finalPercentage >= 80 ? 'text-green-600' :
                            sum && sum.finalPercentage >= 60 ? 'text-yellow-600' :
                            sum && sum.finalPercentage >= 50 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {sum ? sum.finalPercentage.toFixed(1) : '0.0'}%
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className={`font-bold text-lg ${
                            sum && sum.finalGrade === 'A' ? 'text-green-600' :
                            sum && sum.finalGrade === 'B+' ? 'text-blue-600' :
                            sum && sum.finalGrade === 'B' ? 'text-blue-500' :
                            sum && sum.finalGrade === 'C+' ? 'text-yellow-600' :
                            sum && sum.finalGrade === 'C' ? 'text-yellow-500' :
                            sum && sum.finalGrade === 'D+' ? 'text-orange-600' :
                            sum && sum.finalGrade === 'D' ? 'text-orange-500' :
                            sum && sum.finalGrade === 'F' ? 'text-red-600' :
                            'text-gray-400'
                          }`}>
                            {sum ? sum.finalGrade : '-'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
