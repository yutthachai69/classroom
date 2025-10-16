'use client';

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FileText, X, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function FileAttachmentDemo() {
  const [existingFiles, setExistingFiles] = useState<string[]>([
    'assignment_1.pdf',
    'homework_doc.docx'
  ]);
  const [newFiles, setNewFiles] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const addNewFile = (fileName: string) => {
    setNewFiles(prev => [...prev, fileName]);
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const saveChanges = () => {
    // Simulate saving
    setExistingFiles(prev => [...prev, ...newFiles]);
    setNewFiles([]);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ระบบจัดการไฟล์แนบ
        </h1>

        {/* Problem Statement */}
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">ปัญหาที่พบ</h2>
              <p className="text-red-800">
                ใน modal แก้ไขงาน ไฟล์ที่เคยแนบไปแล้วไม่แสดงขึ้นมา ทำให้ไม่รู้ว่ามีไฟล์อะไรบ้าง
              </p>
            </div>
          </div>
        </Card>

        {/* Solution */}
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">วิธีแก้ไข</h2>
              <p className="text-green-800">
                แสดงไฟล์เก่าและไฟล์ใหม่แยกกัน พร้อมปุ่มลบไฟล์เก่าได้
              </p>
            </div>
          </div>
        </Card>

        {/* Demo Button */}
        <div className="text-center mb-6">
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <FileText className="h-5 w-5 mr-2" />
            ดูตัวอย่าง Modal แก้ไขงาน
          </Button>
        </div>

        {/* File Management Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current State */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">สถานะปัจจุบัน</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">ไฟล์ที่แนบแล้ว:</h4>
                <div className="space-y-2">
                  {existingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <span className="text-sm text-green-700">{file}</span>
                      <button
                        onClick={() => removeExistingFile(index)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">ไฟล์ใหม่:</h4>
                <div className="space-y-2">
                  {newFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                      <span className="text-sm text-blue-700">{file}</span>
                      <button
                        onClick={() => removeNewFile(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => addNewFile(`new_file_${Date.now()}.pdf`)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มไฟล์ใหม่
              </Button>
            </div>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">คุณสมบัติใหม่</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">แสดงไฟล์เก่า</h4>
                  <p className="text-sm text-gray-600">แสดงไฟล์ที่เคยแนบไปแล้ว</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">ลบไฟล์เก่าได้</h4>
                  <p className="text-sm text-gray-600">มีปุ่ม X สำหรับลบไฟล์ที่ไม่ต้องการ</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">แยกไฟล์เก่า-ใหม่</h4>
                  <p className="text-sm text-gray-600">ไฟล์เก่าสีเขียว ไฟล์ใหม่สีน้ำเงิน</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">รวมไฟล์ทั้งหมด</h4>
                  <p className="text-sm text-gray-600">เมื่อบันทึกจะรวมไฟล์เก่าและใหม่</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Code Example */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ตัวอย่างโค้ด</h3>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`// State สำหรับไฟล์
const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
const [fileNames, setFileNames] = useState<string[]>([]);

// เมื่อเปิด modal แก้ไข
onClick={() => {
  setSelectedSubmission(submission);
  setContent(submission.content || '');
  setExistingAttachments(submission.attachments || []);
  setFileNames([]);
  setFiles(null);
  setIsEditModalOpen(true);
}}

// เมื่อบันทึก
let attachments: string[] = [...existingAttachments]; // เริ่มจากไฟล์เก่า

if (files && files.length > 0) {
  // อัปโหลดไฟล์ใหม่
  const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
  const uploadData = await uploadRes.json();
  
  // เพิ่มไฟล์ใหม่เข้าไป
  if (uploadData.urls) {
    attachments = [...attachments, ...uploadData.urls];
  }
}`}
            </pre>
          </div>
        </Card>

        {/* Modal Demo */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">แก้ไขงาน</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งาน: ตัวอย่างงาน
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เนื้อหางาน
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    placeholder="กรอกเนื้อหางาน..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    แนบไฟล์ (เลือกได้หลายไฟล์)
                  </label>
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">
                    เลือกไฟล์
                  </button>

                  {/* Existing Files */}
                  {existingFiles.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ไฟล์ที่แนบแล้ว:
                      </label>
                      <div className="space-y-2">
                        {existingFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-2 py-1">
                            <span className="text-xs text-green-700">{file}</span>
                            <button className="text-green-600 hover:text-green-800 text-xs">
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Files */}
                  {newFiles.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ไฟล์ใหม่ที่เลือก:
                      </label>
                      <div className="space-y-2">
                        {newFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                            <span className="text-xs text-blue-700">{file}</span>
                            <button className="text-blue-600 hover:text-blue-800 text-xs">
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {existingFiles.length === 0 && newFiles.length === 0 && (
                    <p className="text-sm text-gray-500 italic mt-2">ยังไม่มีไฟล์แนบ</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={saveChanges}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    บันทึกการแก้ไข
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
