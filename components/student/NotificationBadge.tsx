'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationCount {
  newCount: number;
  pendingCount: number;
  totalCount: number;
}

interface NotificationBadgeProps {
  studentId: string;
  onClick?: () => void;
}

export default function NotificationBadge({ studentId, onClick }: NotificationBadgeProps) {
  const [count, setCount] = useState<NotificationCount>({ newCount: 0, pendingCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [studentId]);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/notifications/count');
      if (response.ok) {
        const data = await response.json();
        setCount(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative p-2">
        <Bell className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
      title={`งานใหม่: ${count.newCount}, ยังไม่ส่ง: ${count.pendingCount}`}
    >
      <Bell className="h-5 w-5" />
      
      {count.totalCount > 0 && (
        <>
          {/* Badge for total count */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {count.totalCount > 99 ? '99+' : count.totalCount}
          </span>
          
          {/* Small dot for new items */}
          {count.newCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          )}
        </>
      )}
    </button>
  );
}
