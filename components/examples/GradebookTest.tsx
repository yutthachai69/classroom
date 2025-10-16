'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { BookOpen, Users, Calculator, Download, Filter, CheckCircle, AlertCircle } from 'lucide-react';

interface ClassItem { _id: string; name: string; }
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

export default function GradebookTest() {
  const { user, loading, isAuthenticated } = useApp();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [summaries, setSummaries] = useState<Record<string, StudentSummary>>({});
  const [loadingData, setLoadingData] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [testResults, setTestResults] = useState<{
    apiWorking: boolean;
    dataLoaded: boolean;
    studentsFound: number;
    gradesFound: number;
    errors: string[];
  }>({
    apiWorking: false,
    dataLoaded: false,
    studentsFound: 0,
    gradesFound: 0,
    errors: []
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchClasses();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (selectedClassId) {
      fetchGradebookData();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch(`/api/classes?teacherId=${user?.id}`);
      const data = await res.json();
      const list: ClassItem[] = data.classes || [];
      setClasses(list);
      if (list.length > 0) setSelectedClassId(list[0]._id);
      
      setTestResults(prev => ({
        ...prev,
        apiWorking: true,
        errors: prev.errors.filter(e => !e.includes('classes'))
      }));
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setTestResults(prev => ({
        ...prev,
        apiWorking: false,
        errors: [...prev.errors, 'ไม่สามารถดึงข้อมูลคลาสได้']
      }));
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchGradebookData = async () => {
    if (!selectedClassId) return;

    setLoadingData(true);
    try {
      // 1) fetch students in class
      const studentsRes = await fetch(`/api/classes/${selectedClassId}`);
      const studentsData = await studentsRes.json();
      const members: Student[] = (studentsData.class?.studentDetails || []).map((u: any) => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        studentId: u.studentId || u.username,
        studentNumber: u.studentNumber || 0,
      }));
      setStudents(members);

      // 2) fetch summaries per student
      const entries = await Promise.all(
        members.map(async (s) => {
          try {
            const res = await fetch(`/api/grades/summary?studentId=${s._id}&classId=${selectedClassId}`);
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

      setTestResults(prev => ({
        ...prev,
        dataLoaded: true,
        studentsFound: members.length,
        gradesFound: Object.keys(validSummaries).length,
        errors: prev.errors.filter(e => !e.includes('gradebook'))
      }));

    } catch (error) {
      console.error('Failed to fetch gradebook data:', error);
      setTestResults(prev => ({
        ...prev,
        errors: [...prev.errors, 'ไม่สามารถดึงข้อมูลคะแนนได้']
      }));
    } finally {
      setLoadingData(false);
    }
  };

  const exportCSV = () => {
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
    a.download = `gradebook-test-${classes.find(c => c._id === selectedClassId)?.name || 'class'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลด...</h2>
          <p className="text-gray-500">ตรวจสอบสถานะการล็อกอิน</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่ได้ล็อกอิน</h2>
          <p className="text-gray-500 mb-4">กรุณาล็อกอินเพื่อดูข้อมูลคะแนน</p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
          >
            เข้าสู่ระบบ
          </Button>
        </Card>
      </div>
    );
  }

  const categoryHeaders = Object.values(summaries)[0]?.categories?.map((c) => ({ 
    id: c.categoryId, 
    name: c.categoryName, 
    max: c.maxPoints 
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทดสอบสมุดบันทึกคะแนน
        </h1>

        {/* Test Results */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">ผลการทดสอบ</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {testResults.apiWorking ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">API ทำงาน</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.apiWorking ? 'ปกติ' : 'ผิดพลาด'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {testResults.dataLoaded ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">ข้อมูลโหลด</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.dataLoaded ? 'สำเร็จ' : 'ไม่สำเร็จ'}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">นักเรียน</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.studentsFound} คน
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-medium">มีคะแนน</span>
              </div>
              <p className="text-sm text-gray-600">
                {testResults.gradesFound} คน
              </p>
            </div>
          </div>
          
          {testResults.errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2">ข้อผิดพลาด:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {testResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Filter className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">เลือกคลาส</h2>
                <p className="text-sm text-gray-600">เลือกคลาสเพื่อดูคะแนนนักเรียน</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  disabled={initialLoading}
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
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
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">จำนวนนักเรียน</p>
                <p className="text-lg font-semibold text-gray-900">{students.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">หมวดคะแนน</p>
                <p className="text-lg font-semibold text-gray-900">{categoryHeaders.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
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
          </Card>
          
          <Card className="p-4">
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
          </Card>
        </div>

        {/* Gradebook Table */}
        <Card className="p-6">
          {initialLoading ? (
            <div className="py-12 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลคลาส...</p>
            </div>
          ) : loadingData ? (
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
        </Card>

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            คำอธิบายการใช้งาน
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>เลขที่:</strong> เลขประจำตัวนักเรียนในคลาส</p>
            <p>• <strong>รหัสนักเรียน:</strong> รหัสประจำตัวนักเรียนในระบบ</p>
            <p>• <strong>คะแนนย่อย:</strong> แสดงคะแนนที่ได้/คะแนนเต็ม และเปอร์เซ็นต์</p>
            <p>• <strong>คะแนนรวม:</strong> คะแนนรวมทุกหมวด</p>
            <p>• <strong>เกรด:</strong> เกรดสุดท้ายตามเกณฑ์การประเมิน</p>
            <p>• <strong>Export CSV:</strong> ส่งออกข้อมูลเป็นไฟล์ Excel</p>
            <p>• <strong>การทดสอบ:</strong> ตรวจสอบการทำงานของ API และการแสดงผลข้อมูล</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
