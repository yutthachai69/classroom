'use client';

import { useState } from 'react';
import QRCodeGenerator from '@/components/common/QRCodeGenerator';
import Button from '@/components/common/Button';
import { Download, Copy, QrCode } from 'lucide-react';

export default function QRPage() {
  const [url, setUrl] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');

  const handleGenerate = () => {
    if (url.trim()) {
      setGeneratedUrl(url.trim());
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      alert('คัดลอก URL เรียบร้อยแล้ว!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownloadQR = async () => {
    if (!generatedUrl) return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.getContext('2d');
      
      // Import QRCode dynamically
      const QRCode = (await import('qrcode')).default;
      const qrCodeUrl = await QRCode.toDataURL(generatedUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = qrCodeUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            สร้าง QR Code สำหรับเว็บไซต์
          </h1>
          <p className="text-lg text-gray-600">
            สร้าง QR Code เพื่อให้ผู้ใช้เข้าถึงเว็บไซต์ได้ง่ายขึ้น
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ใส่ URL ของเว็บไซต์
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL ของเว็บไซต์
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-domain.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!url.trim()}
                  className="w-full"
                >
                  สร้าง QR Code
                </Button>

                {generatedUrl && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">URL ที่สร้างแล้ว:</h3>
                    <p className="text-sm text-gray-600 break-all mb-3">{generatedUrl}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCopyUrl}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        คัดลอก
                      </Button>
                      <Button
                        onClick={handleDownloadQR}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        ดาวน์โหลด
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Display */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                QR Code
              </h2>
              
              {generatedUrl ? (
                <div className="flex justify-center">
                  <QRCodeGenerator
                    url={generatedUrl}
                    size={250}
                    className="p-4 bg-white border border-gray-200 rounded-lg"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">QR Code จะแสดงที่นี่</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            วิธีใช้งาน QR Code
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">พิมพ์ URL</h3>
              <p className="text-sm text-gray-600">
                ใส่ URL ของเว็บไซต์ที่ต้องการสร้าง QR Code
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">สร้าง QR Code</h3>
              <p className="text-sm text-gray-600">
                กดปุ่มสร้าง QR Code เพื่อสร้างภาพ QR Code
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">แชร์หรือพิมพ์</h3>
              <p className="text-sm text-gray-600">
                ดาวน์โหลดหรือพิมพ์ QR Code เพื่อแชร์ให้ผู้ใช้
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
