'use client';

import React from 'react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function ModalExample() {
  const { alert, success, error, warning, info, confirm, confirmLogout } = useAlert();

  const handleSuccess = () => {
    success('สำเร็จ!', 'ส่งงานเรียบร้อยแล้ว');
  };

  const handleError = () => {
    error('เกิดข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง');
  };

  const handleWarning = () => {
    warning('คำเตือน', 'ข้อมูลอาจจะหายไป');
  };

  const handleInfo = () => {
    info('ข้อมูล', 'นี่คือข้อมูลสำคัญ');
  };

  const handleConfirm = () => {
    confirm(
      'ยืนยันการลบ',
      'คุณต้องการลบรายการนี้หรือไม่?',
      () => {
        console.log('ลบแล้ว');
        success('ลบสำเร็จ', 'รายการถูกลบแล้ว');
      }
    );
  };

  const handleLogout = () => {
    confirmLogout(() => {
      console.log('ออกจากระบบ');
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Modal Examples</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Success Modal */}
        <Button onClick={handleSuccess} variant="success">
          Success Modal
        </Button>

        {/* Error Modal */}
        <Button onClick={handleError} variant="danger">
          Error Modal
        </Button>

        {/* Warning Modal */}
        <Button onClick={handleWarning} variant="secondary">
          Warning Modal
        </Button>

        {/* Info Modal */}
        <Button onClick={handleInfo} variant="primary">
          Info Modal
        </Button>

        {/* Confirm Modal */}
        <Button onClick={handleConfirm} variant="outline">
          Confirm Modal
        </Button>

        {/* Logout Modal */}
        <Button onClick={handleLogout} variant="danger">
          Logout Modal
        </Button>
      </div>

      {/* Modal Component */}
      <Modal {...alert} />
    </div>
  );
}
