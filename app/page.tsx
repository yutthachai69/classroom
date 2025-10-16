'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import { BookOpen, Users, GraduationCap, Shield, ArrowRight, Star, CheckCircle, Globe, Smartphone } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useApp();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user type
        switch (user.userType) {
          case 'admin':
            router.push('/admin');
            break;
          case 'teacher':
            router.push('/teacher');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            router.push('/login');
        }
      } else {
        // Show landing page for new users
        setShowLanding(true);
      }
    }
  }, [user, loading, router]);

  if (loading || !showLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Classroom Management</span>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="px-6"
              >
                เข้าสู่ระบบ
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="px-6"
              >
                เริ่มต้นใช้งาน
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ระบบจัดการคลาสเรียน
              <span className="text-blue-600 block">ออนไลน์</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              แพลตฟอร์มครบครันสำหรับการจัดการเรียนการสอน 
              ตั้งแต่งานมอบหมาย การให้คะแนน ไปจนถึงการติดต่อสื่อสาร
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/login')}
                size="lg"
                className="px-8 py-4 text-lg"
              >
                เริ่มต้นใช้งานฟรี
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => router.push('#features')}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                ดูฟีเจอร์
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ฟีเจอร์ครบครันสำหรับทุกคน
            </h2>
            <p className="text-lg text-gray-600">
              ออกแบบมาเพื่อตอบสนองความต้องการของครู นักเรียน และผู้ดูแลระบบ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Teacher Features */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-3 rounded-full">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-900">สำหรับครู</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>สร้างและจัดการงานมอบหมาย</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>ระบบให้คะแนนอัตโนมัติ</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>ส่งประกาศและแจ้งเตือน</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>จัดการโครงสร้างคะแนน</span>
                </li>
              </ul>
            </div>

            {/* Student Features */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-green-600 p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-900">สำหรับนักเรียน</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>ส่งงานออนไลน์</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>ดูคะแนนและผลการเรียน</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>เข้าร่วมคลาสเรียน</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>รับประกาศและข้อความ</span>
                </li>
              </ul>
            </div>

            {/* Admin Features */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-900">สำหรับผู้ดูแล</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>จัดการผู้ใช้และสิทธิ์</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>ระบบความปลอดภัยขั้นสูง</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>รายงานและสถิติ</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>จัดการบัญชีที่ถูกล็อค</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ความปลอดภัยระดับ Enterprise
            </h2>
            <p className="text-lg text-gray-600">
              ระบบความปลอดภัยขั้นสูงที่ปกป้องข้อมูลของคุณ
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">JWT Authentication</h3>
              <p className="text-sm text-gray-600">ระบบยืนยันตัวตนที่ปลอดภัย</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Account Lockout</h3>
              <p className="text-sm text-gray-600">ป้องกันการแฮ็กด้วยรหัสผ่าน</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">HTTPS & CSP</h3>
              <p className="text-sm text-gray-600">การเข้ารหัสและป้องกัน XSS</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rate Limiting</h3>
              <p className="text-sm text-gray-600">ป้องกันการโจมตีแบบ Brute Force</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            เข้าร่วมกับครูและนักเรียนหลายพันคนที่ใช้ระบบของเรา
          </p>
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg"
          >
            เริ่มต้นใช้งานฟรี
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-semibold">Classroom Management</span>
              </div>
              <p className="text-gray-400">
                ระบบจัดการคลาสเรียนออนไลน์ที่ครบครันและปลอดภัย
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">สำหรับครู</h3>
              <ul className="space-y-2 text-gray-400">
                <li>สร้างงานมอบหมาย</li>
                <li>ให้คะแนนอัตโนมัติ</li>
                <li>ส่งประกาศ</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">สำหรับนักเรียน</h3>
              <ul className="space-y-2 text-gray-400">
                <li>ส่งงานออนไลน์</li>
                <li>ดูคะแนน</li>
                <li>เข้าร่วมคลาส</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">ความปลอดภัย</h3>
              <ul className="space-y-2 text-gray-400">
                <li>JWT Authentication</li>
                <li>Account Lockout</li>
                <li>HTTPS & CSP</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Classroom Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
