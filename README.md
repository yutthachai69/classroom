# 🎓 Classroom Management System

ระบบจัดการคลาสเรียนออนไลน์สำหรับโรงเรียน สร้างด้วย Next.js 15 + TypeScript + MongoDB

## ✨ Features

### 👥 ระบบผู้ใช้ 3 ประเภท

#### 🔐 Admin (ผู้ดูแลระบบ)
- จัดการครูทั้งหมด (เพิ่ม/แก้ไข/ลบ)
- จัดการนักเรียนทั้งหมด (เพิ่ม/แก้ไข/ลบ)
- จัดการคลาสเรียน
- ดูสถิติการใช้งานระบบ

#### 👨‍🏫 Teacher (ครู)
- สร้างและจัดการคลาสเรียน
- สร้างงาน/การบ้าน
- ตรวจงานและให้คะแนนนักเรียน
- สร้างประกาศข่าวสาร

#### 👨‍🎓 Student (นักเรียน)
- เข้าร่วมคลาสเรียน
- ส่งงาน/การบ้าน
- ดูคะแนนและข้อคิดเห็นจากครู
- อ่านประกาศจากครู

## 🚀 เริ่มต้นใช้งาน

### Prerequisites

- Node.js 18+ 
- MongoDB (Local หรือ MongoDB Atlas)

### ติดตั้ง

1. Clone โปรเจค
```bash
git clone <repository-url>
cd workload-tracker-spa
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และกรอกข้อมูล:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/classroom-management?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. Seed ข้อมูลทดสอบ
```bash
npm run seed
```

5. รันโปรเจค
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 🔑 บัญชีทดสอบ

หลังจากรัน seed script แล้ว คุณสามารถเข้าสู่ระบบด้วยบัญชีเหล่านี้:

| ประเภท | Username | Password |
|--------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher | teacher123 |
| Student | student1 | student123 |

## 📁 โครงสร้างโปรเจค

```
workload-tracker-spa/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── classes/         # Class management
│   │   ├── assignments/     # Assignment management
│   │   ├── submissions/     # Submission management
│   │   └── announcements/   # Announcement management
│   ├── admin/               # Admin Dashboard
│   ├── teacher/             # Teacher Dashboard
│   ├── student/             # Student Dashboard
│   ├── login/               # Login Page
│   └── layout.tsx           # Root Layout
├── components/              # React Components
│   ├── admin/              # Admin Components
│   ├── teacher/            # Teacher Components
│   ├── student/            # Student Components
│   └── common/             # Shared Components
├── context/                # React Context
│   └── AppContext.tsx      # App State Management
├── lib/                    # Libraries & Utilities
│   ├── mongodb.ts          # MongoDB Connection
│   ├── types.ts            # TypeScript Types
│   └── utils.ts            # Utility Functions
└── scripts/               # Scripts
    └── seed.ts            # Database Seeding
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Alerts**: SweetAlert2
- **Authentication**: Custom (bcryptjs)
- **File Processing**: XLSX, PapaParse

## 📊 Database Collections

- **users**: ข้อมูลผู้ใช้ (Admin, Teacher, Student)
- **classes**: ข้อมูลคลาสเรียน
- **assignments**: ข้อมูลงาน/การบ้าน
- **submissions**: ข้อมูลการส่งงาน
- **announcements**: ข้อมูลประกาศ

## 🎨 Design System

### Colors
- Primary: Green (#10B981)
- Secondary: Blue (#3B82F6)
- Success: Green (#059669)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font: Inter (Google Fonts)
- Headings: 24px, 20px, 18px
- Body: 16px, 14px
- Captions: 12px

## 📱 Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1440px

## 🔒 Security Features

- Password hashing (bcryptjs)
- Session management (localStorage)
- User type validation
- Input sanitization
- Error handling

## 📝 Development

### Available Scripts

- `npm run dev` - รัน development server
- `npm run build` - Build สำหรับ production
- `npm run start` - รัน production server
- `npm run lint` - ตรวจสอบ code ด้วย ESLint
- `npm run seed` - Seed ข้อมูลทดสอบ

## 🤝 Contributing

เปิดรับ Pull Requests และ Issues ทุกรูปแบบ!

## 📄 License

MIT License

## 👨‍💻 Author

Created with ❤️ for Thai Schools
