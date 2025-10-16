'use client';

import React from 'react';
import { useAlert } from '@/lib/useAlert';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function ConfirmModalExample() {
  const { alert, confirm, confirmLogout, confirmDelete } = useAlert();

  const handleDelete = () => {
    confirmDelete(
      'รายการงาน',
      () => {
        console.log('ลบแล้ว');
      }
    );
  };

  const handleLogout = () => {
    confirmLogout(() => {
      console.log('ออกจากระบบ');
    });
  };

  const handleCustomConfirm = () => {
    confirm(
      'ยืนยันการส่งงาน',
      'คุณต้องการส่งงานนี้หรือไม่?',
      () => {
        console.log('ส่งงานแล้ว');
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirm Modal Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delete Confirm - 2 ปุ่ม */}
        <Button 
          onClick={handleDelete} 
          variant="danger"
        >
          Delete Confirm (2 ปุ่ม)
        </Button>

        {/* Logout Confirm - 2 ปุ่ม */}
        <Button 
          onClick={handleLogout} 
          variant="danger"
        >
          Logout Confirm (2 ปุ่ม)
        </Button>

        {/* Custom Confirm - 2 ปุ่ม */}
        <Button 
          onClick={handleCustomConfirm} 
          variant="primary"
        >
          Custom Confirm (2 ปุ่ม)
        </Button>
      </div>

      {/* Modal Component */}
      <Modal {...alert} />
    </div>
  );
}
