'use client';

import React from 'react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function SimpleModalExample() {
  const { alert, success, error, warning, info } = useAlert();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Modal Examples</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Success Modal - 1 ปุ่ม */}
        <Button 
          onClick={() => success('สำเร็จ!', 'ส่งงานเรียบร้อยแล้ว')} 
          variant="success"
        >
          Success (1 ปุ่ม)
        </Button>

        {/* Error Modal - 1 ปุ่ม */}
        <Button 
          onClick={() => error('เกิดข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง')} 
          variant="danger"
        >
          Error (1 ปุ่ม)
        </Button>

        {/* Warning Modal - 1 ปุ่ม */}
        <Button 
          onClick={() => warning('คำเตือน', 'ข้อมูลอาจจะหายไป')} 
          variant="secondary"
        >
          Warning (1 ปุ่ม)
        </Button>

        {/* Info Modal - 1 ปุ่ม */}
        <Button 
          onClick={() => info('ข้อมูล', 'นี่คือข้อมูลสำคัญ')} 
          variant="primary"
        >
          Info (1 ปุ่ม)
        </Button>
      </div>

      {/* Modal Component */}
      <Modal {...alert} />
    </div>
  );
}
