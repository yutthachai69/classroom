'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '@/lib/types';

interface AppContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินจาก server
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // ส่ง cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    };

    // Simulate loading like the old system
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const login = (userData: AuthUser, token?: string) => {
    setUser(userData);
    // Token จะถูกตั้งค่าเป็น httpOnly cookie โดย server แล้ว
    // ไม่ต้องจัดการ cookie ที่นี่
  };

  const logout = async () => {
    try {
      // เรียก API logout เพื่อลบ cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-warning/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Classroom Management</h2>
          <p className="text-gray-500">กำลังโหลดระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

