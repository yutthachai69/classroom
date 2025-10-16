'use client';

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useSuccessAnimation } from '@/components/common/SuccessAnimation';
import SuccessAnimation from '@/components/common/SuccessAnimation';
import Swal from 'sweetalert2';
import { Send, FileText, Award, CheckCircle, Sparkles, Zap } from 'lucide-react';

export default function AnimationComparison() {
  const [showComparison, setShowComparison] = useState(false);
  const { showSuccess, isOpen, config, closeSuccess } = useSuccessAnimation();

  const showSweetAlert = () => {
    Swal.fire({
      title: 'สำเร็จ',
      text: 'ส่งงานสำเร็จ',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  };

  const showCustomAnimation = () => {
    showSuccess('สำเร็จ!', 'ส่งงานสำเร็จ', 'submit');
  };

  const showGradeAnimation = () => {
    showSuccess('ได้รับคะแนน!', 'ตรวจงานแล้ว', 'grade');
  };

  const showCompleteAnimation = () => {
    showSuccess('เสร็จสิ้น!', 'แก้ไขงานสำเร็จ', 'complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          เปรียบเทียบ Animation
        </h1>

        {/* Problem Statement */}
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">ปัญหาของ SweetAlert2</h2>
              <p className="text-red-800 mb-3">
                SweetAlert2 ดูพื้นฐานและไม่โดดเด่นเมื่อเทียบกับ Google Classroom หรือ Microsoft Teams
              </p>
              <ul className="text-red-700 space-y-1">
                <li>• Animation เรียบง่ายเกินไป</li>
                <li>• ไม่มี visual effects ที่น่าสนใจ</li>
                <li>• ดูเหมือนระบบเก่า</li>
                <li>• ไม่มีการโต้ตอบกับผู้ใช้</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SweetAlert2 */}
          <Card className="p-6 bg-gray-50 border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">SweetAlert2 (เก่า)</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">สำเร็จ</h4>
                    <p className="text-sm text-gray-600">ส่งงานสำเร็จ</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={showSweetAlert}
                >
                  ดู Animation
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <h4 className="font-medium mb-2">คุณสมบัติ:</h4>
                <ul className="space-y-1">
                  <li>• Animation เรียบง่าย</li>
                  <li>• สีพื้นฐาน</li>
                  <li>• ไม่มี visual effects</li>
                  <li>• ดูเหมือนระบบเก่า</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Custom Animation */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Custom Animation (ใหม่)</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">สำเร็จ!</h4>
                    <p className="text-sm text-gray-600">ส่งงานสำเร็จ</p>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={showCustomAnimation}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  ดู Animation
                </Button>
              </div>
              
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-2">คุณสมบัติ:</h4>
                <ul className="space-y-1">
                  <li>• ✨ Confetti animation</li>
                  <li>• 🎨 Gradient colors</li>
                  <li>• 💫 Sparkle effects</li>
                  <li>• 🎯 Interactive animations</li>
                  <li>• 🌟 Modern design</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Animation Types */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ประเภท Animation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Submit Animation */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">ส่งงาน</h3>
                  <p className="text-sm text-blue-700">Submit Animation</p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                onClick={() => showSuccess('สำเร็จ!', 'ส่งงานสำเร็จ', 'submit')}
              >
                ทดสอบ
              </Button>
            </div>

            {/* Grade Animation */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900">ได้รับคะแนน</h3>
                  <p className="text-sm text-yellow-700">Grade Animation</p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                onClick={() => showSuccess('ได้รับคะแนน!', 'ตรวจงานแล้ว', 'grade')}
              >
                ทดสอบ
              </Button>
            </div>

            {/* Complete Animation */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">เสร็จสิ้น</h3>
                  <p className="text-sm text-green-700">Complete Animation</p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                onClick={() => showSuccess('เสร็จสิ้น!', 'แก้ไขงานสำเร็จ', 'complete')}
              >
                ทดสอบ
              </Button>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">คุณสมบัติพิเศษ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🎨 Visual Effects</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>Confetti animation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Sparkle effects</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                  <span>Gradient backgrounds</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Pulsing animations</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Interactive Elements</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Auto-close after 3 seconds</li>
                <li>• Smooth enter/exit animations</li>
                <li>• Bounce effects</li>
                <li>• Scale transformations</li>
                <li>• Rotation effects</li>
                <li>• Staggered animations</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Custom Success Animation */}
        <SuccessAnimation
          isOpen={isOpen}
          onClose={closeSuccess}
          title={config.title}
          message={config.message}
          type={config.type}
          onConfirm={config.onConfirm}
        />
      </div>
    </div>
  );
}
