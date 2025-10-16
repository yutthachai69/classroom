'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastComponentProps extends ToastProps {
  onRemove: (id: string) => void;
}

export default function Toast({
  id = Date.now().toString(),
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
  onRemove
}: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto remove
    if (duration > 0) {
      const removeTimer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(removeTimer);
    }
    
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(id);
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div
      className={cn(
        'relative max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 transform transition-all duration-300 ease-in-out',
        getStyles(),
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isLeaving && 'translate-x-full opacity-0'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm opacity-75">
                {message}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg animate-progress">
          <style jsx>{`
            @keyframes progress {
              from { width: 100%; }
              to { width: 0%; }
            }
            .animate-progress {
              animation: progress ${duration}ms linear;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// Toast Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'success', title, message, ...options });
  };

  const error = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'error', title, message, ...options });
  };

  const warning = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'warning', title, message, ...options });
  };

  const info = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
