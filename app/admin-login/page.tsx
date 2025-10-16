'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Shield, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const { alert, success, error } = useAlert();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      error('เกิดข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType: 'admin' }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, ''); // ไม่ต้องส่ง token เพราะ server จะตั้งค่า cookie แล้ว
        
        success('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${data.user.firstName} ${data.user.lastName}`);

        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        error('เกิดข้อผิดพลาด', data.error || 'ไม่สามารถเข้าสู่ระบบได้');
      }
    } catch (error) {
      console.error('Login error:', error);
      error('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500 p-4 rounded-full">
              <Shield size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Access
          </h1>
          <p className="text-gray-600">เข้าสู่ระบบผู้ดูแลระบบ</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
          {/* Hidden fields to prevent browser autofill */}
          <input type="text" style={{ display: 'none' }} autoComplete="username" />
          <input type="password" style={{ display: 'none' }} autoComplete="current-password" />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้ใช้ Admin
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="กรอกชื่อผู้ใช้ Admin"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน Admin
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="กรอกรหัสผ่าน Admin"
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-red-800 mb-2">
              ข้อมูลทดสอบ Admin:
            </p>
            <div className="text-xs text-red-700">
              <p><strong>Admin:</strong> admin / admin123</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
              }}
              className="w-full mt-3 bg-red-100 text-red-700 py-2 px-3 rounded text-xs hover:bg-red-200 transition-colors"
            >
              เติมข้อมูล Admin
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ Admin</span>
            )}
          </button>
        </form>

        {/* Demo Account */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-3">บัญชีทดสอบ:</p>
          <div className="text-xs text-gray-500 text-center">
            <p>🔐 Admin: <strong>admin / admin123</strong></p>
          </div>
        </div>

        {/* Back to regular login */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            ← กลับไปหน้า Login ปกติ
          </button>
        </div>
      </div>
      
      {/* Modal Component */}
      <Modal {...alert} />
    </div>
  );
}
