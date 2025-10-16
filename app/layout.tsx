import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import GoogleAnalytics from '@/components/common/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ระบบจัดการคลาสเรียนออนไลน์ | Classroom Management System',
  description: 'แพลตฟอร์มครบครันสำหรับการจัดการเรียนการสอน ตั้งแต่งานมอบหมาย การให้คะแนน ไปจนถึงการติดต่อสื่อสาร ปลอดภัยด้วยระบบ JWT และ Account Lockout',
  keywords: 'classroom management, ระบบจัดการคลาสเรียน, online learning, การเรียนออนไลน์, assignment, งานมอบหมาย, grading, ให้คะแนน, education technology',
  authors: [{ name: 'Classroom Management Team' }],
  creator: 'Classroom Management System',
  publisher: 'Classroom Management System',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
    siteName: 'Classroom Management System',
    title: 'ระบบจัดการคลาสเรียนออนไลน์ | Classroom Management System',
    description: 'แพลตฟอร์มครบครันสำหรับการจัดการเรียนการสอน ตั้งแต่งานมอบหมาย การให้คะแนน ไปจนถึงการติดต่อสื่อสาร',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Classroom Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ระบบจัดการคลาสเรียนออนไลน์',
    description: 'แพลตฟอร์มครบครันสำหรับการจัดการเรียนการสอน',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <GoogleAnalytics />
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
