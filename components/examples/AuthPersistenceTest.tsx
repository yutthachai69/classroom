'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { RefreshCw, LogOut, User, Shield } from 'lucide-react';

export default function AuthPersistenceTest() {
  const { user, loading, logout, isAuthenticated } = useApp();
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefresh(new Date());
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    window.location.reload();
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ทดสอบการคงอยู่ของการล็อกอิน
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* สถานะการล็อกอิน */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-full ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
                {isAuthenticated ? (
                  <User className="h-6 w-6 text-green-600" />
                ) : (
                  <Shield className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                สถานะการล็อกอิน
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className={`px-3 py-2 rounded-lg ${isAuthenticated ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <strong>สถานะ:</strong> {isAuthenticated ? 'ล็อกอินแล้ว' : 'ยังไม่ได้ล็อกอิน'}
              </div>
              
              {user && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p><strong>ชื่อผู้ใช้:</strong> {user.username}</p>
                  <p><strong>ชื่อ:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>ประเภท:</strong> {user.userType}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
              )}
            </div>
          </Card>

          {/* การทดสอบ Refresh */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                การทดสอบ Refresh
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p><strong>จำนวนครั้งที่ Refresh:</strong> {refreshCount}</p>
                <p><strong>ครั้งล่าสุด:</strong> {lastRefresh?.toLocaleString('th-TH')}</p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>คำแนะนำ:</strong> กดปุ่ม "Refresh หน้า" หรือกด F5 เพื่อทดสอบว่าการล็อกอินยังคงอยู่หรือไม่
                </p>
              </div>
              
              <Button
                variant="primary"
                onClick={handleRefresh}
                className="w-full flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh หน้า</span>
              </Button>
            </div>
          </Card>

          {/* การจัดการ */}
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-full">
                <LogOut className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                การจัดการ
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Button
                  variant="danger"
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/login'}
                  className="flex items-center justify-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>เข้าสู่ระบบ</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center space-x-2"
              >
                <span>กลับหน้าหลัก</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* คำอธิบาย */}
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            คำอธิบายการทำงาน
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>httpOnly Cookies:</strong> ระบบใช้ httpOnly cookies เพื่อเก็บ authentication token</p>
            <p>• <strong>Server-side Validation:</strong> ทุกครั้งที่ refresh จะตรวจสอบ token จาก server</p>
            <p>• <strong>Persistent Session:</strong> การล็อกอินจะคงอยู่แม้หลังจาก refresh หรือปิดเบราว์เซอร์</p>
            <p>• <strong>Security:</strong> Token ไม่สามารถเข้าถึงได้จาก JavaScript เพื่อความปลอดภัย</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
