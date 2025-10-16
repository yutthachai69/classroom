'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useAlert } from '@/lib/useAlert';
import Modal from './Modal';

interface LogoutButtonProps {
  onLogout: () => void;
  className?: string;
  variant?: 'button' | 'icon' | 'text';
}

export default function LogoutButton({ 
  onLogout, 
  className = '',
  variant = 'button'
}: LogoutButtonProps) {
  const { alert, confirmLogout } = useAlert();

  const handleLogoutClick = () => {
    confirmLogout(onLogout);
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={handleLogoutClick}
            className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${className}`}
            title="ออกจากระบบ"
          >
            <LogOut className="h-5 w-5" />
          </button>
        );
      
      case 'text':
        return (
          <button
            onClick={handleLogoutClick}
            className={`text-gray-600 hover:text-red-600 transition-colors duration-200 ${className}`}
          >
            ออกจากระบบ
          </button>
        );
      
      default:
        return (
          <button
            onClick={handleLogoutClick}
            className={`flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:shadow-lg ${className}`}
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <Modal {...alert} />
    </>
  );
}
