'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ url, size = 200, className = '' }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        const qrCodeUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [url, size]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {qrCodeDataUrl && (
        <>
          <img
            src={qrCodeDataUrl}
            alt="QR Code"
            className="border border-gray-200 rounded-lg"
          />
          <p className="mt-2 text-sm text-gray-600 text-center max-w-xs">
            สแกน QR Code เพื่อเข้าถึงเว็บไซต์
          </p>
          <p className="text-xs text-gray-500 mt-1 break-all">
            {url}
          </p>
        </>
      )}
    </div>
  );
}
