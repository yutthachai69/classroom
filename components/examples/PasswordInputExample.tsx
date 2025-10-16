'use client';

import React, { useState } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { Lock, User, Mail } from 'lucide-react';

export default function PasswordInputExample() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('บันทึกข้อมูลสำเร็จ!');
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ทดสอบ Password Input</h2>
          <p className="text-gray-600">ทดสอบการทำงานของปุ่มแสดง/ซ่อนรหัสผ่าน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <Input
            label="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="กรอกชื่อผู้ใช้"
            icon={<User className="h-5 w-5" />}
            animated={false}
            required
          />

          {/* Email */}
          <Input
            label="อีเมล"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="กรอกอีเมล"
            icon={<Mail className="h-5 w-5" />}
            animated={false}
            required
          />

          {/* Password with Toggle */}
          <Input
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            icon={<Lock className="h-5 w-5" />}
            showPasswordToggle={true}
            animated={false}
            required
          />

          {/* Confirm Password with Toggle */}
          <Input
            label="ยืนยันรหัสผ่าน"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            icon={<Lock className="h-5 w-5" />}
            showPasswordToggle={true}
            animated={false}
            required
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </form>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">วิธีทดสอบ:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• กรอกรหัสผ่านในช่อง "รหัสผ่าน"</li>
            <li>• กดปุ่ม 👁️ เพื่อแสดง/ซ่อนรหัสผ่าน</li>
            <li>• กรอกรหัสผ่านในช่อง "ยืนยันรหัสผ่าน"</li>
            <li>• กดปุ่ม 👁️ เพื่อแสดง/ซ่อนรหัสผ่าน</li>
            <li>• ตรวจสอบว่าปุ่มทำงานได้ถูกต้อง</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
