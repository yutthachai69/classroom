'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Clock, CheckCircle, Eye } from 'lucide-react';

interface SmartNotification {
  assignmentId: string;
  assignmentTitle: string;
  className: string;
  teacherName: string;
  dueDate: string;
  status: 'new' | 'pending' | 'submitted';
  message: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface NotificationSummary {
  newAssignments: number;
  pendingAssignments: number;
  submittedAssignments: number;
  totalNotifications: number;
  notifications: SmartNotification[];
}

interface SmartNotificationPanelProps {
  studentId: string;
  onNotificationClick?: (assignmentId: string, classId: string) => void;
}

export default function SmartNotificationPanel({ 
  studentId, 
  onNotificationClick 
}: SmartNotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [studentId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (assignmentId: string, classId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          classId,
          action: 'view'
        })
      });
      
      // Refresh notifications
      await fetchNotifications();
      
      // Call parent callback
      if (onNotificationClick) {
        onNotificationClick(assignmentId, classId);
      }
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'submitted': return <CheckCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'งานใหม่';
      case 'pending': return 'ยังไม่ส่ง';
      case 'submitted': return 'ส่งแล้ว';
      default: return 'ไม่ทราบสถานะ';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!notifications) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 text-center text-gray-500">
        ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div 
        className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-blue-600" />
              {notifications.totalNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.totalNotifications}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">การแจ้งเตือนงาน</h3>
              <p className="text-sm text-gray-500">
                งานใหม่: {notifications.newAssignments} | 
                ยังไม่ส่ง: {notifications.pendingAssignments} | 
                ส่งแล้ว: {notifications.submittedAssignments}
              </p>
            </div>
          </div>
          <div className="text-gray-400">
            {expanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4">
          {notifications.notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>ไม่มีงานใหม่</p>
              <p className="text-sm">เมื่อมีงานใหม่จะแจ้งเตือนที่นี่</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.notifications.map((notification) => (
                <div
                  key={notification.assignmentId}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getPriorityColor(notification.priority)}`}
                  onClick={() => {
                    if (notification.status !== 'submitted') {
                      markAsViewed(notification.assignmentId, notification.className);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(notification.status)}
                        <span className="text-xs font-medium">
                          {getStatusText(notification.status)}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">
                        {notification.assignmentTitle}
                      </h4>
                      <p className="text-xs opacity-75 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span>ครบกำหนด: {new Date(notification.dueDate).toLocaleDateString('th-TH')}</span>
                        <span className="opacity-75">
                          {notification.className}
                        </span>
                      </div>
                    </div>
                    {notification.status === 'new' && (
                      <div className="ml-2">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
