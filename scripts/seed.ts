import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const dbName = process.env.MONGODB_DB || 'classroom_system';
    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);

    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('classes').deleteMany({});
    await db.collection('assignments').deleteMany({});
    await db.collection('submissions').deleteMany({});
    await db.collection('announcements').deleteMany({});

    // Create users
    console.log('Creating users...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    
    console.log('Testing password hashes:');
    console.log('Admin test:', await bcrypt.compare('admin123', adminPassword));
    console.log('Teacher test:', await bcrypt.compare('teacher123', teacherPassword));
    console.log('Student test:', await bcrypt.compare('student123', studentPassword));

    const usersResult = await db.collection('users').insertMany([
      {
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        userType: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'teacher',
        password: teacherPassword,
        firstName: 'John',
        lastName: 'Smith',
        userType: 'teacher',
        teacherId: 'TCH001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'teacher2',
        password: teacherPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        userType: 'teacher',
        teacherId: 'TCH002',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'student1',
        password: studentPassword,
        firstName: 'Alice',
        lastName: 'Brown',
        userType: 'student',
        studentId: 'STD001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'student2',
        password: studentPassword,
        firstName: 'Bob',
        lastName: 'Wilson',
        userType: 'student',
        studentId: 'STD002',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'student3',
        password: studentPassword,
        firstName: 'Charlie',
        lastName: 'Davis',
        userType: 'student',
        studentId: 'STD003',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [admin, teacher1, teacher2, student1, student2, student3] = Object.values(
      usersResult.insertedIds
    );

    console.log('Users created:', usersResult.insertedCount);

    // Create classes
    console.log('Creating classes...');
    const classesResult = await db.collection('classes').insertMany([
      {
        name: 'คณิตศาสตร์ ม.1',
        description: 'คณิตศาสตร์พื้นฐาน สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1',
        classCode: 'MATH01',
        teacherId: teacher1,
        students: [student1, student2],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'วิทยาศาสตร์ ม.2',
        classCode: 'SCI02',
        description: 'วิทยาศาสตร์ทั่วไป ชีววิทยา ฟิสิกส์ เคมี',
        teacherId: teacher1,
        students: [student1, student3],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'ภาษาอังกฤษ ม.1',
        description: 'ภาษาอังกฤษพื้นฐาน Reading, Writing, Listening, Speaking',
        classCode: 'ENG01',
        teacherId: teacher2,
        students: [student2, student3],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [class1, class2, class3] = Object.values(classesResult.insertedIds);

    console.log('Classes created:', classesResult.insertedCount);

    // Create assignments
    console.log('Creating assignments...');
    const assignmentsResult = await db.collection('assignments').insertMany([
      {
        title: 'แบบฝึกหัดบทที่ 1: จำนวนเต็ม',
        description: 'ทำแบบฝึกหัดหน้า 15-20 ทุกข้อ',
        classId: class1,
        teacherId: teacher1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        points: 100,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'โครงงานวิทยาศาสตร์',
        description: 'ทำโครงงานวิทยาศาสตร์ในหัวข้อที่สนใจ ส่งเป็นกลุ่ม 3-4 คน',
        classId: class2,
        teacherId: teacher1,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        points: 50,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'English Essay: My Family',
        description: 'Write an essay about your family (minimum 200 words)',
        classId: class3,
        teacherId: teacher2,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        points: 30,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [assignment1, assignment2, assignment3] = Object.values(
      assignmentsResult.insertedIds
    );

    console.log('Assignments created:', assignmentsResult.insertedCount);

    // Create submissions
    console.log('Creating submissions...');
    const submissionsResult = await db.collection('submissions').insertMany([
      {
        assignmentId: assignment1,
        studentId: student1,
        content:
          'ข้อ 1: 5 + 3 = 8\nข้อ 2: 12 - 7 = 5\nข้อ 3: 4 × 6 = 24\n... (ทำครบทุกข้อ)',
        attachments: [],
        grade: 95,
        feedback: 'ทำได้ดีมาก! มีความเข้าใจเรื่องจำนวนเต็มเป็นอย่างดี',
        submittedAt: new Date(),
        gradedAt: new Date(),
      },
    ]);

    console.log('Submissions created:', submissionsResult.insertedCount);

    // Create announcements
    console.log('Creating announcements...');
    const announcementsResult = await db.collection('announcements').insertMany([
      {
        title: 'ประกาศสอบกลางภาค',
        content:
          'สอบกลางภาควิชาคณิตศาสตร์\nวันที่: 15 พฤศจิกายน 2567\nเวลา: 9:00-11:00 น.\nห้องสอบ: 301\n\nขอให้นักเรียนทุกคนมาสอบตรงเวลา พร้อมอุปกรณ์การเขียน',
        classId: class1,
        teacherId: teacher1,
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'กิจกรรมทัศนศึกษา',
        content:
          'พาไปทัศนศึกษาที่พิพิธภัณฑ์วิทยาศาสตร์\nวันที่: 20 พฤศจิกายน 2567\nเวลา: 8:00-16:00 น.\nค่าใช้จ่าย: 300 บาท\n\nกรุณาชำระเงินภายในวันที่ 10 พฤศจิกายน',
        classId: class2,
        teacherId: teacher1,
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Welcome to English Class!',
        content:
          'Welcome everyone to our English class!\n\nWe will focus on:\n- Reading comprehension\n- Writing skills\n- Conversation practice\n- Vocabulary building\n\nLooking forward to a great semester!',
        classId: class3,
        teacherId: teacher2,
        comments: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('Announcements created:', announcementsResult.insertedCount);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Demo accounts:');
    console.log('Admin: username: admin, password: admin123');
    console.log('Teacher: username: teacher, password: teacher123');
    console.log('Student: username: student1, password: student123');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();

