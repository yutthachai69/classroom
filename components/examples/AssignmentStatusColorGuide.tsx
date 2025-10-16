'use client';

import React from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

export default function AssignmentStatusColorGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ระบบสีสำหรับสถานะงาน
        </h1>

        {/* Current Problem */}
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">ปัญหาที่พบ</h2>
              <p className="text-red-800">
                สีที่ใช้แสดงสถานะงานไม่เหมาะสม - "ยังไม่ส่งงาน" ใช้สีเขียว ซึ่งทำให้เข้าใจผิด
              </p>
            </div>
          </div>
        </Card>

        {/* Color System */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ระบบสีที่แนะนำ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ส่งงานแล้ว */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">ส่งงานแล้ว</span>
              </div>
              <div className="text-sm text-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>สีเขียว (Green)</span>
                </div>
                <p className="text-xs">ความหมาย: สำเร็จ, เสร็จสิ้น</p>
              </div>
            </div>

            {/* ยังไม่ส่งงาน */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-900">ยังไม่ส่งงาน</span>
              </div>
              <div className="text-sm text-orange-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  <span>สีส้ม (Orange)</span>
                </div>
                <p className="text-xs">ความหมาย: รอการดำเนินการ</p>
              </div>
            </div>

            {/* หมดเวลาส่งงาน */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-900">หมดเวลาส่งงาน</span>
              </div>
              <div className="text-sm text-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>สีแดง (Red)</span>
                </div>
                <p className="text-xs">ความหมาย: ผิดพลาด, หมดเวลา</p>
              </div>
            </div>

            {/* ใกล้หมดเวลา */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">ใกล้หมดเวลา</span>
              </div>
              <div className="text-sm text-yellow-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                  <span>สีเหลือง (Yellow)</span>
                </div>
                <p className="text-xs">ความหมาย: เตือน, ระวัง</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Before vs After */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Before */}
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">ก่อนแก้ไข (ผิด)</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">ส่งงานแล้ว</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">✅ สีเขียว - ถูกต้อง</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">ยังไม่ส่งงาน</span>
                </div>
                <p className="text-xs text-red-600 mt-1">❌ สีเขียว - ผิด! ควรเป็นสีอื่น</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">หมดเวลาส่งงาน</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">✅ สีแดง - ถูกต้อง</p>
              </div>
            </div>
          </Card>

          {/* After */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">หลังแก้ไข (ถูก)</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">ส่งงานแล้ว</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">✅ สีเขียว - สำเร็จ</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-orange-600 font-medium">ยังไม่ส่งงาน</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">✅ สีส้ม - รอการดำเนินการ</p>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">หมดเวลาส่งงาน</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">✅ สีแดง - หมดเวลา/ผิดพลาด</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Psychology of Colors */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">จิตวิทยาของสี</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">สีเขียว (Green)</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• ความหมาย: สำเร็จ, เสร็จสิ้น, ปลอดภัย</li>
                  <li>• ใช้กับ: ส่งงานแล้ว, ผ่าน, สำเร็จ</li>
                  <li>• รู้สึก: สบายใจ, พอใจ, ความสำเร็จ</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">สีส้ม (Orange)</h3>
              <div className="bg-orange-50 p-4 rounded-lg">
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• ความหมาย: รอการดำเนินการ, ต้องทำ</li>
                  <li>• ใช้กับ: ยังไม่ส่งงาน, กำลังดำเนินการ</li>
                  <li>• รู้สึก: กระตือรือร้น, ต้องทำ, เตือน</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">สีแดง (Red)</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• ความหมาย: ผิดพลาด, หมดเวลา, อันตราย</li>
                  <li>• ใช้กับ: หมดเวลาส่งงาน, ล้มเหลว</li>
                  <li>• รู้สึก: เร่งด่วน, ผิดพลาด, ตื่นตัว</li>
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">สีเหลือง (Yellow)</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• ความหมาย: เตือน, ระวัง, ใกล้หมดเวลา</li>
                  <li>• ใช้กับ: ใกล้หมดเวลา, เตือน</li>
                  <li>• รู้สึก: เตือน, ระวัง, ต้องรีบ</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Implementation */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">การใช้งานในโค้ด</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">CSS Classes ที่ใช้:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`// ส่งงานแล้ว - สีเขียว
text-green-600

// ยังไม่ส่งงาน - สีส้ม  
text-orange-600

// หมดเวลาส่งงาน - สีแดง
text-red-600

// ใกล้หมดเวลา - สีเหลือง
text-yellow-600`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">โค้ดตัวอย่าง:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
{`<span className={\`text-sm font-medium ${
  isOverdue ? 'text-red-600' : 'text-orange-600'
}\`}>
  {isOverdue ? 'หมดเวลาส่งงาน' : 'ยังไม่ส่งงาน'}
</span>`}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
