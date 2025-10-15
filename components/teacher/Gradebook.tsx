import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import { Download, Filter } from 'lucide-react';

interface ClassItem { _id: string; name: string; }
interface Student { _id: string; firstName: string; lastName: string; }

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

interface GradebookProps {
  teacherId: string;
}

export default function Gradebook({ teacherId }: GradebookProps) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [summaries, setSummaries] = useState<Record<string, StudentSummary>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/classes?teacherId=${teacherId}`);
        const data = await res.json();
        const list: ClassItem[] = data.classes || [];
        setClasses(list);
        if (list.length > 0) setSelectedClassId(list[0]._id);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [teacherId]);

  useEffect(() => {
    if (!selectedClassId) return;
    (async () => {
      setLoading(true);
      try {
        // 1) fetch students in class
        const studentsRes = await fetch(`/api/classes/${selectedClassId}`);
        const studentsData = await studentsRes.json();
        const members: Student[] = (studentsData.class?.studentDetails || []).map((u: any) => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
        }));
        setStudents(members);

        // 2) fetch summaries per student
        const entries = await Promise.all(
          members.map(async (s) => {
            const res = await fetch(`/api/grades/summary?studentId=${s._id}&classId=${selectedClassId}`);
            const data = await res.json();
            return [s._id, data.summary] as const;
          })
        );
        setSummaries(Object.fromEntries(entries.filter(([, sum]) => !!sum)));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClassId]);

  const categoryHeaders = useMemo(() => {
    const anySummary = Object.values(summaries)[0];
    return anySummary?.categories?.map((c) => ({ id: c.categoryId, name: c.categoryName, max: c.maxPoints })) || [];
  }, [summaries]);

  const exportCSV = () => {
    const rows: string[] = [];
    const head = ['Student', ...categoryHeaders.map((h) => `${h.name} (${h.max})`), 'Total', 'Percent', 'Grade'];
    rows.push(head.join(','));
    students.forEach((s) => {
      const sum = summaries[s._id];
      const cells: (string | number)[] = [];
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
    a.download = 'gradebook.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (initialLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <Button variant="secondary" onClick={exportCSV} className="flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-gray-600">ยังไม่มีนักเรียนในคลาสนี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">นักเรียน</th>
                  {categoryHeaders.map((h) => (
                    <th key={h.id} className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{h.name} ({h.max})</th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">รวม</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">เปอร์เซ็นต์</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">เกรด</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const sum = summaries[s._id];
                  return (
                    <tr key={s._id} className="border-t">
                      <td className="px-4 py-2 whitespace-nowrap">{s.firstName} {s.lastName}</td>
                      {categoryHeaders.map((h) => {
                        const cat = sum?.categories.find((c) => String(c.categoryId) === String(h.id));
                        return (
                          <td key={h.id} className="px-4 py-2 whitespace-nowrap">
                            {cat ? `${cat.earnedPoints}/${cat.maxPoints}` : '0/0'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 whitespace-nowrap">{sum ? `${sum.totalEarnedPoints}/${sum.totalMaxPoints}` : '0/0'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{sum ? sum.finalPercentage.toFixed(2) : '0.00'}%</td>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold">{sum ? sum.finalGrade : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
