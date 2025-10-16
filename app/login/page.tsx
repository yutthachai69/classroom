'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { BookOpen, LogIn, User, GraduationCap, Eye, EyeOff, Shield } from 'lucide-react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const { alert, success, error } = useAlert();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'teacher' | 'student'>('student');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      error('เกิดข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);

    // Simulate loading delay like the old system
    setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, userType }),
        });

        const data = await response.json();

        if (response.ok) {
          login(data.user, ''); // ไม่ต้องส่ง token เพราะ server จะตั้งค่า cookie แล้ว
          
          success('เข้าสู่ระบบสำเร็จ!', `ยินดีต้อนรับ${userType === 'teacher' ? 'ครู' : 'นักเรียน'}`);

          // Clear form
          setUsername('');
          setPassword('');

          // Redirect based on user type
          setTimeout(() => {
            switch (data.user.userType) {
              case 'teacher':
                router.push('/teacher');
                break;
              case 'student':
                router.push('/student');
                break;
            }
          }, 1500);
        } else {
          error('เข้าสู่ระบบไม่สำเร็จ!', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
      } catch (error) {
        console.error('Login error:', error);
        error('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // Secret Admin Access - Double click on logo
  const handleLogoDoubleClick = () => {
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-warning/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 cursor-pointer hover:bg-opacity-30 transition-all"
            onDoubleClick={handleLogoDoubleClick}
            title="Double click for admin access"
          >
            <BookOpen size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Classroom</h1>
          <p className="text-white/90">ระบบจัดการงานออนไลน์</p>
        </div>

        {/* User Type Selector */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                userType === 'student'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <GraduationCap size={32} />
              <span className="mt-2 font-medium">นักเรียน</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('teacher')}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                userType === 'teacher'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User size={32} />
              <span className="mt-2 font-medium">ครู</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
          {/* Hidden fields to prevent browser autofill */}
          <input type="text" style={{ display: 'none' }} autoComplete="username" />
          <input type="password" style={{ display: 'none' }} autoComplete="current-password" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="กรอกชื่อผู้ใช้"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="กรอกรหัสผ่าน"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">
              ข้อมูลทดสอบ:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>ครู:</strong> teacher / teacher123</p>
              <p><strong>นักเรียน:</strong> student1 / student123</p>
              <p className="text-blue-600 mt-2">หรือ student2 / student123</p>
            </div>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('teacher');
                  setPassword('teacher123');
                  setUserType('teacher');
                }}
                className="w-full bg-green-100 text-green-700 py-2 px-3 rounded text-xs hover:bg-green-200 transition-colors"
              >
                เติมข้อมูลครู
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('student1');
                  setPassword('student123');
                  setUserType('student');
                }}
                className="w-full bg-purple-100 text-purple-700 py-2 px-3 rounded text-xs hover:bg-purple-200 transition-colors"
              >
                เติมข้อมูลนักเรียน
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ</span>
            )}
          </button>
        </form>

      </div>
      
      {/* Modal Component */}
      <Modal {...alert} />
    </div>
  );
}

