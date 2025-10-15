'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Bell, MessageCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  className: string;
  teacherName: string;
  comments: any[];
  createdAt: string;
}

interface StudentAnnouncementListProps {
  userId: string;
}

export default function StudentAnnouncementList({ userId }: StudentAnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [userId]);

  const fetchAnnouncements = async () => {
    try {
      // First get all classes the student is in
      const classesRes = await fetch(`/api/classes?studentId=${userId}`);
      const classesData = await classesRes.json();
      const classes = classesData.classes || [];

      // Then get all announcements for those classes
      const announcementPromises = classes.map((cls: any) =>
        fetch(`/api/announcements?classId=${cls._id}`).then((res) => res.json())
      );

      const announcementResults = await Promise.all(announcementPromises);
      const allAnnouncements = announcementResults.flatMap(
        (result) => result.announcements || []
      );

      // Sort by date (newest first)
      allAnnouncements.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAnnouncements(allAnnouncements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
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
        <h2 className="text-xl font-bold text-gray-900">ประกาศ</h2>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">ยังไม่มีประกาศสำหรับคุณ</p>
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
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>{announcement.className}</span>
                        <span>•</span>
                        <span>{announcement.teacherName}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(announcement.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  {announcement.comments.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-gray-600">
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
    </div>
  );
}

