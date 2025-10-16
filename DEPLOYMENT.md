# 🚀 คู่มือการ Deploy Classroom Management System

## 📋 สิ่งที่ต้องเตรียมก่อน Deploy

### 1. **Domain และ Hosting**
- ซื้อ domain name (เช่น `classroom-management.com`)
- เลือก hosting provider (แนะนำ: Vercel, Netlify, หรือ AWS)

### 2. **Environment Variables**
สร้างไฟล์ `.env.local` และ `.env.production`:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classroom_system
MONGODB_DB=classroom_system

# JWT Secret (สร้างด้วย: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=24h

# Environment
NODE_ENV=production

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Search Console
GOOGLE_SITE_VERIFICATION=your-verification-code

# Security
CORS_ORIGIN=https://your-domain.com
```

### 3. **MongoDB Atlas Setup**
1. สร้างบัญชีที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. สร้าง cluster ใหม่
3. สร้าง database user
4. ตั้งค่า Network Access (เพิ่ม IP 0.0.0.0/0 สำหรับ production)
5. Copy connection string มาใส่ใน `MONGODB_URI`

## 🚀 วิธีการ Deploy

### **Option 1: Vercel (แนะนำ)**

1. **ติดตั้ง Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login และ Deploy:**
```bash
vercel login
vercel --prod
```

3. **ตั้งค่า Environment Variables ใน Vercel Dashboard:**
   - ไปที่ Project Settings > Environment Variables
   - เพิ่มทุกตัวแปรจาก `.env.production`

### **Option 2: Netlify**

1. **Build โปรเจกต์:**
```bash
npm run build
```

2. **Deploy ผ่าน Netlify Dashboard:**
   - ลากโฟลเดอร์ `out` ไปที่ Netlify
   - หรือเชื่อมต่อ GitHub repository

3. **ตั้งค่า Environment Variables:**
   - ไปที่ Site Settings > Environment Variables

### **Option 3: Docker (สำหรับ VPS)**

1. **สร้าง Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. **สร้าง docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
```

3. **Deploy:**
```bash
docker-compose up -d
```

## 🔧 การตั้งค่าเพิ่มเติม

### 1. **Custom Domain**
- เชื่อมต่อ domain กับ hosting provider
- ตั้งค่า DNS records
- เปิดใช้ SSL Certificate (HTTPS)

### 2. **Google Analytics & Search Console**
1. สร้าง Google Analytics account
2. เพิ่ม GA Tracking ID ใน environment variables
3. สร้าง Google Search Console
4. Verify domain ownership
5. Submit sitemap: `https://your-domain.com/sitemap.xml`

### 3. **Monitoring & Logging**
- ตั้งค่า uptime monitoring (เช่น UptimeRobot)
- ตั้งค่า error tracking (เช่น Sentry)
- ตั้งค่า log aggregation (เช่น LogRocket)

### 4. **Backup Strategy**
```bash
# MongoDB Backup Script
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)

# Database Cleanup Script (รันทุกวัน)
npm run cleanup-lockouts
```

## 📱 การเข้าถึงเว็บไซต์

### 1. **ผ่าน Google Search**
- ระบบจะปรากฏใน Google เมื่อมี SEO ที่ดี
- ใช้คำค้นหา: "ระบบจัดการคลาสเรียน", "classroom management"

### 2. **QR Code**
- เข้าไปที่ `/qr` เพื่อสร้าง QR Code
- แชร์ QR Code ให้ผู้ใช้สแกน

### 3. **Direct URL**
- แจก URL โดยตรง: `https://your-domain.com`
- สร้าง Short URL: `https://bit.ly/your-short-url`

### 4. **Social Media**
- แชร์ใน Facebook, Line, Twitter
- สร้างโปสเตอร์หรือบัตรเชิญ

## 🔒 การรักษาความปลอดภัย

### 1. **Production Security Checklist**
- [ ] ใช้ HTTPS เท่านั้น
- [ ] ตั้งค่า JWT_SECRET ที่แข็งแกร่ง
- [ ] เปิดใช้ MongoDB Authentication
- [ ] ตั้งค่า CORS ที่เหมาะสม
- [ ] เปิดใช้ Rate Limiting
- [ ] ตั้งค่า Security Headers

### 2. **Regular Maintenance**
```bash
# รันทุกสัปดาห์
npm run cleanup-lockouts

# รันทุกเดือน
npm audit
npm update

# รันทุก 3 เดือน
# เปลี่ยน JWT_SECRET
# อัพเดท dependencies
```

## 📊 การติดตามผล

### 1. **Google Analytics**
- ดูจำนวนผู้ใช้ที่เข้าเว็บไซต์
- ติดตาม conversion rate
- วิเคราะห์ user behavior

### 2. **Google Search Console**
- ดูจำนวนการค้นหาใน Google
- ติดตาม keyword rankings
- ตรวจสอบ technical issues

### 3. **Application Logs**
- ตรวจสอบ error logs
- ติดตาม security events
- วิเคราะห์ performance

## 🆘 Troubleshooting

### ปัญหาที่พบบ่อย:

1. **เว็บไซต์ไม่โหลด:**
   - ตรวจสอบ environment variables
   - ตรวจสอบ MongoDB connection
   - ดู logs ใน hosting dashboard

2. **Login ไม่ได้:**
   - ตรวจสอบ JWT_SECRET
   - ตรวจสอบ user data ใน database
   - ดู security logs

3. **Performance ช้า:**
   - ตรวจสอบ MongoDB indexes
   - เปิดใช้ caching
   - ใช้ CDN

## 📞 การสนับสนุน

หากมีปัญหาการ deploy สามารถติดต่อได้ที่:
- Email: support@your-domain.com
- Line: @your-line-id
- Facebook: Your Facebook Page

---

**🎉 ขอให้การ Deploy สำเร็จ!**
