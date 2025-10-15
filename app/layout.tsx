import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Classroom Management System',
  description: 'ระบบจัดการคลาสเรียนออนไลน์',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
