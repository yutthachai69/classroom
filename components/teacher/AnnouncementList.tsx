'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { PlusCircle, Bell, MessageCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Swal from 'sweetalert2';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  className: string;
  teacherName: string;
  comments: any[];
  createdAt: string;
}

interface Class {
  _id: string;
  name: string;
}

interface AnnouncementListProps {
  userId: string;
}

export default function AnnouncementList({ userId }: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: '',
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [announcementsRes, classesRes] = await Promise.all([
        fetch(`/api/announcements?teacherId=${userId}`),
        fetch(`/api/classes?teacherId=${userId}`),
      ]);

      const [announcementsData, classesData] = await Promise.all([
        announcementsRes.json(),
        classesRes.json(),
      ]);

      setAnnouncements(announcementsData.announcements || []);
      setClasses(classesData.classes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.classId) {
      Swal.fire('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacherId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('สำเร็จ', 'สร้างประกาศสำเร็จ', 'success');
        setIsModalOpen(false);
        setFormData({ title: '', content: '', classId: '' });
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างประกาศได้', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">ประกาศ</h2>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          disabled={classes.length === 0}
        >
          <PlusCircle size={20} />
          สร้างประกาศใหม่
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">กรุณาสร้างคลาสเรียนก่อนเพื่อสร้างประกาศ</p>
        </Card>
      ) : announcements.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">คุณยังไม่มีประกาศ</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement._id} hover>
              <div className="flex gap-4">
                <div className="bg-blue-100 p-3 rounded-lg h-fit">
                  <Bell size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{announcement.className}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(announcement.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3">{announcement.content}</p>
                  {announcement.comments.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                      <MessageCircle size={16} />
                      <span>{announcement.comments.length} ความคิดเห็น</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="สร้างประกาศใหม่"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="หัวข้อประกาศ"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="เช่น ประกาศสอบกลางภาค"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เนื้อหา
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="เนื้อหาประกาศ"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คลาส
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              required
            >
              <option value="">เลือกคลาส</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              สร้างประกาศ
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

