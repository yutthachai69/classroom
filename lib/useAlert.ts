import { useState } from 'react';
import { ModalProps } from '@/components/common/Modal';

export interface AlertOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export function useAlert() {
  const [alert, setAlert] = useState<ModalProps & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    onClose: () => {}
  });

  const showAlert = (options: AlertOptions & { type: ModalProps['type'] }) => {
    setAlert({
      isOpen: true,
      ...options,
      onClose: () => setAlert(prev => ({ ...prev, isOpen: false }))
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  // Success Alert
  const success = (title: string, message?: string) => {
    showAlert({
      type: 'success',
      title,
      message,
      confirmText: 'ตกลง',
      showCancel: false // ไม่แสดงปุ่มยกเลิก
    });
  };

  // Error Alert
  const error = (title: string, message?: string) => {
    showAlert({
      type: 'error',
      title,
      message,
      confirmText: 'ตกลง',
      showCancel: false // ไม่แสดงปุ่มยกเลิก
    });
  };

  // Warning Alert
  const warning = (title: string, message?: string) => {
    showAlert({
      type: 'warning',
      title,
      message,
      confirmText: 'ตกลง',
      showCancel: false // ไม่แสดงปุ่มยกเลิก
    });
  };

  // Info Alert
  const info = (title: string, message?: string) => {
    showAlert({
      type: 'info',
      title,
      message,
      confirmText: 'ตกลง',
      showCancel: false // ไม่แสดงปุ่มยกเลิก
    });
  };

  // Confirm Dialog
  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: Partial<AlertOptions>
  ) => {
    showAlert({
      type: 'confirm',
      title,
      message,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      showCancel: true,
      onConfirm: () => {
        onConfirm();
        hideAlert();
      },
      onCancel: options?.onCancel,
      ...options
    });
  };

  // Logout Confirmation
  const confirmLogout = (onLogout: () => void) => {
    showAlert({
      type: 'confirm',
      title: 'ออกจากระบบ?',
      message: 'คุณต้องการออกจากระบบหรือไม่?',
      confirmText: 'ใช่, ออกจากระบบ',
      cancelText: 'ยกเลิก',
      showCancel: true,
      confirmVariant: 'danger',
      onConfirm: () => {
        onLogout();
        hideAlert();
      }
    });
  };

  // Delete Confirmation
  const confirmDelete = (
    itemName: string,
    onDelete: () => void,
    options?: Partial<AlertOptions>
  ) => {
    showAlert({
      type: 'confirm',
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบ "${itemName}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      showCancel: true,
      confirmVariant: 'danger',
      onConfirm: () => {
        onDelete();
        hideAlert();
      },
      ...options
    });
  };

  return {
    alert,
    showAlert,
    hideAlert,
    success,
    error,
    warning,
    info,
    confirm,
    confirmLogout,
    confirmDelete
  };
}
