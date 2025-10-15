'use client';

import { useState } from 'react';
import { X, Users } from 'lucide-react';
import Swal from 'sweetalert2';

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess: () => void;
}

export default function JoinClassModal({ isOpen, onClose, studentId, onSuccess }: JoinClassModalProps) {
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classCode.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกรหัสคลาส',
        text: 'กรุณากรอกรหัสคลาสที่ต้องการเข้าร่วม',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          classCode: classCode.toUpperCase(), 
          studentId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'เข้าร่วมคลาสสำเร็จ!',
          text: `คุณได้เข้าร่วมคลาส "${data.class.name}" แล้ว`,
          background: '#f0fdf4',
          color: '#15803d',
          iconColor: '#10b981',
          timer: 2000,
          showConfirmButton: false,
        });

        setClassCode('');
        onClose();
        onSuccess();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เข้าร่วมคลาสไม่สำเร็จ',
          text: data.error || 'ไม่สามารถเข้าร่วมคลาสได้',
          background: '#fef2f2',
          color: '#dc2626',
          iconColor: '#ef4444',
        });
      }
    } catch (error) {
      console.error('Join class error:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-bold">เข้าร่วมคลาส</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              📋 <strong>วิธีการเข้าร่วมคลาส:</strong>
            </p>
            <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
              <li>ขอรหัสคลาสจากครูผู้สอน</li>
              <li>กรอกรหัสคลาส 6 ตัวอักษร</li>
              <li>กดปุ่มเข้าร่วมคลาส</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสคลาส (Class Code)
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-2xl font-bold tracking-widest uppercase"
              placeholder="ABC123"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              รหัสประกอบด้วย 6 ตัวอักษร (A-Z, 0-9)
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || classCode.length !== 6}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังเข้าร่วม...' : 'เข้าร่วมคลาส'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

