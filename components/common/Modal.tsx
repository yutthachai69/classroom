'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
  showCancel = true,
  confirmVariant = 'primary',
  children,
  size = 'md'
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
        document.body.style.overflow = 'unset';
      }, 300);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      case 'info':
        return <Info className="h-16 w-16 text-blue-500" />;
      case 'confirm':
        return <AlertCircle className="h-16 w-16 text-orange-500" />;
    }
  };

  const getConfirmVariant = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'secondary';
      case 'confirm':
        return 'primary';
      default:
        return confirmVariant;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black bg-opacity-50 backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        isOpen && !isAnimating ? 'opacity-100' : 'opacity-0'
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh]',
          'transform transition-all duration-300 ease-in-out overflow-hidden flex flex-col',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-md',
          size === 'lg' && 'max-w-lg',
          size === 'xl' && 'max-w-2xl',
          isOpen && !isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        )}
      >
        {/* Close Button - Only show for non-confirm modals */}
        {type !== 'confirm' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Header - Fixed */}
        <div className="p-8 pb-4 flex-shrink-0">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={cn(
              'p-4 rounded-full transition-all duration-500',
              type === 'success' && 'bg-green-50 animate-pulse',
              type === 'error' && 'bg-red-50 animate-pulse',
              type === 'warning' && 'bg-yellow-50 animate-pulse',
              type === 'info' && 'bg-blue-50 animate-pulse',
              type === 'confirm' && 'bg-orange-50 animate-pulse'
            )}>
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
            {title}
          </h3>

          {/* Message */}
          {message && (
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8">
          {/* Custom Content */}
          {children && (
            <div className="pb-4">
              {children}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-8 pt-4 flex-shrink-0">

          {/* Buttons - Only show if not using children with custom buttons */}
          {!children && (
            <div className={cn(
              'flex gap-4',
              showCancel ? 'justify-between' : 'justify-center'
            )}>
              {showCancel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 max-w-32"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={getConfirmVariant() as any}
                onClick={handleConfirm}
                className={cn(
                  'flex-1',
                  showCancel ? 'max-w-32' : 'max-w-48'
                )}
              >
                {confirmText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal Hook for easy usage
export function useModal() {
  const [modal, setModal] = useState<Partial<ModalProps> & { isOpen: boolean }>({
    isOpen: false
  });

  const showModal = (props: Omit<ModalProps, 'isOpen' | 'onClose'>) => {
    setModal({ ...props, isOpen: true });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (title: string, message?: string) => {
    showModal({ title, message, type: 'success' });
  };

  const showError = (title: string, message?: string) => {
    showModal({ title, message, type: 'error' });
  };

  const showWarning = (title: string, message?: string) => {
    showModal({ title, message, type: 'warning' });
  };

  const showInfo = (title: string, message?: string) => {
    showModal({ title, message, type: 'info' });
  };

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void,
    options?: Partial<ModalProps>
  ) => {
    showModal({ 
      title, 
      message, 
      type: 'confirm',
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      onConfirm,
      ...options
    });
  };

  return {
    modal,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    ModalComponent: (props: Partial<ModalProps>) => (
      <Modal
        {...modal}
        {...props}
        onClose={hideModal}
      />
    )
  };
}