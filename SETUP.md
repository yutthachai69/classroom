# 🚀 คู่มือการติดตั้งและใช้งาน

## 📋 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Node.js
ดาวน์โหลดและติดตั้ง Node.js เวอร์ชัน 18 หรือสูงกว่า จาก [nodejs.org](https://nodejs.org/)

### 2. ติดตั้ง MongoDB

#### ใช้ MongoDB Atlas (แนะนำ - ฟรี)

1. ไปที่ [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. สมัครบัญชี (ใช้ Free Tier ได้)
3. สร้าง Cluster ใหม่
4. ใน Security > Database Access:
   - สร้าง User ใหม่
   - จดชื่อผู้ใช้และรหัสผ่านไว้
5. ใน Security > Network Access:
   - เพิ่ม IP Address หรือ Allow Access from Anywhere (0.0.0.0/0)
6. คลิก "Connect" > "Connect your application"
7. คัดลอก Connection String
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### หรือใช้ MongoDB Local

ติดตั้ง MongoDB Community Edition จาก [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### 3. ตั้งค่าโปรเจค

1. Clone หรือดาวน์โหลดโปรเจค
```bash
git clone <repository-url>
cd workload-tracker-spa
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. สร้างไฟล์ `.env.local` ในโฟลเดอร์หลัก:
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/classroom-management?retryWrites=true&w=majority

# Next Auth Secret (สร้างด้วย: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-key-here

# App URL
NEXTAUTH_URL=http://localhost:3000
```

**สำคัญ:** แทนที่:
- `your-username` = ชื่อผู้ใช้ MongoDB ของคุณ
- `your-password` = รหัสผ่าน MongoDB ของคุณ
- `cluster0.xxxxx` = ชื่อ cluster ของคุณ
- `your-random-secret-key-here` = สตริงแบบสุ่ม (ความยาว 32 ตัวอักษร)

### 4. Seed ข้อมูลทดสอบ

```bash
npm run seed
```

คำสั่งนี้จะสร้าง:
- 1 Admin: `admin / admin123`
- 2 Teachers: `teacher / teacher123`, `teacher2 / teacher123`
- 3 Students: `student1 / student123`, `student2 / student123`, `student3 / student123`
- คลาสเรียน 3 คลาส
- งาน 3 งาน
- ประกาศ 3 ประกาศ

### 5. รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

## 🎯 การใช้งาน

### สำหรับ Admin

1. เข้าสู่ระบบด้วย: `admin / admin123`
2. คุณจะเห็น Dashboard พร้อมสถิติระบบ
3. ไปที่แท็บ "จัดการครู" เพื่อเพิ่ม/แก้ไข/ลบครู
4. ไปที่แท็บ "จัดการนักเรียน" เพื่อเพิ่ม/แก้ไข/ลบนักเรียน
5. ไปที่แท็บ "จัดการคลาส" เพื่อดูคลาสทั้งหมด

### สำหรับครู

1. เข้าสู่ระบบด้วย: `teacher / teacher123`
2. สร้างคลาสเรียนใหม่:
   - คลิก "สร้างคลาสใหม่"
   - กรอกชื่อและคำอธิบาย
   - คลิก "สร้างคลาส"
3. สร้างงาน:
   - ไปที่แท็บ "งาน/การบ้าน"
   - คลิก "สร้างงานใหม่"
   - เลือกคลาส, กรอกรายละเอียด
   - คลิก "สร้างงาน"
4. สร้างประกาศ:
   - ไปที่แท็บ "ประกาศ"
   - คลิก "สร้างประกาศใหม่"
   - กรอกหัวข้อและเนื้อหา
   - คลิก "สร้างประกาศ"

### สำหรับนักเรียน

1. เข้าสู่ระบบด้วย: `student1 / student123`
2. ดูคลาสเรียน:
   - นักเรียนจะเห็นคลาสที่เข้าร่วมอยู่
3. ส่งงาน:
   - ไปที่แท็บ "งาน/การบ้าน"
   - เลือกงานที่ต้องการส่ง
   - คลิก "ส่งงาน"
   - กรอกเนื้อหา
   - คลิก "ส่งงาน"
4. ดูประกาศ:
   - ไปที่แท็บ "ประกาศ"
   - อ่านประกาศจากครู

## 🐛 แก้ไขปัญหา

### ไม่สามารถเชื่อมต่อ MongoDB

1. ตรวจสอบ Connection String ใน `.env.local`
2. ตรวจสอบว่า username/password ถูกต้อง
3. ตรวจสอบ Network Access ใน MongoDB Atlas
4. ลองใช้ "Allow Access from Anywhere" (0.0.0.0/0)

### Seed ไม่สำเร็จ

1. ตรวจสอบว่าเชื่อมต่อ MongoDB ได้
2. ลบข้อมูลเก่าใน database: `classroom-management`
3. รัน seed อีกครั้ง: `npm run seed`

### หน้าเว็บไม่แสดงผล

1. ตรวจสอบว่า server กำลังรันอยู่
2. ลองรีสตาร์ท server: กด Ctrl+C แล้วรัน `npm run dev` อีกครั้ง
3. ลองเคลียร์ cache: กด Ctrl+Shift+R ในเบราว์เซอร์

### Port 3000 ถูกใช้งานอยู่

รัน server ที่ port อื่น:
```bash
PORT=3001 npm run dev
```

## 📚 คำแนะนำเพิ่มเติม

### เปลี่ยนรหัสผ่าน

รหัสผ่านถูกเข้ารหัสด้วย bcrypt แล้ว หากต้องการเปลี่ยน:

1. ใช้ผ่าน Admin Dashboard (แก้ไขข้อมูลผู้ใช้)
2. หรือแก้ไขใน `scripts/seed.ts` แล้วรัน seed ใหม่

### Backup ข้อมูล

ใช้ MongoDB Compass หรือ mongodump:
```bash
mongodump --uri="your-connection-string" --out=./backup
```

### Deploy Production

แนะนำ: Vercel (ฟรี)

1. ไปที่ [vercel.com](https://vercel.com)
2. Import GitHub repository
3. เพิ่ม Environment Variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL ของเว็บไซต์)
4. Deploy!

## 🆘 ติดต่อ

หากมีปัญหาหรือคำถาม สามารถ:
- เปิด Issue ใน GitHub
- ติดต่อผู้พัฒนา

---

**Happy Teaching & Learning! 🎓✨**

