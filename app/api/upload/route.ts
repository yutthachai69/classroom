import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'ไม่มีไฟล์ที่จะอัปโหลด' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const savedUrls: string[] = [];

    for (const file of files as unknown as File[]) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileNameSafe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(uploadDir, fileNameSafe);
      await fs.writeFile(filePath, buffer);
      savedUrls.push(`/uploads/${fileNameSafe}`);
    }

    return NextResponse.json({ urls: savedUrls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'อัปโหลดไฟล์ไม่สำเร็จ' }, { status: 500 });
  }
}
