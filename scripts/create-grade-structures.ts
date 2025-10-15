import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

async function createGradeStructures() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const dbName = process.env.MONGODB_DB || 'classroom_system';
    const db = client.db(dbName);
    console.log(`Using database: ${dbName}`);

    // Get all classes
    const classes = await db.collection('classes').find({}).toArray();
    console.log(`Found ${classes.length} classes`);

    for (const cls of classes) {
      console.log(`\nProcessing class: ${cls.name} (${cls._id})`);

      // Check if grade structure already exists
      const existingStructure = await db.collection('gradeStructures').findOne({
        classId: cls._id,
        isActive: true,
      });

      if (existingStructure) {
        console.log(`Grade structure already exists for ${cls.name}`);
        continue;
      }

      // Create grade structure for this class
      const gradeStructure = {
        classId: cls._id,
        className: cls.name,
        teacherId: cls.teacherId,
        name: `โครงสร้างคะแนน ${cls.name}`,
        description: `โครงสร้างคะแนนสำหรับคลาส ${cls.name}`,
        totalPoints: 100,
        categories: [
          {
            _id: new ObjectId(),
            name: 'งานก่อนกลางภาค',
            description: 'งานและแบบฝึกหัดก่อนสอบกลางภาค',
            weight: 25,
            maxPoints: 25,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: new ObjectId(),
            name: 'สอบกลางภาค',
            description: 'การสอบกลางภาค',
            weight: 20,
            maxPoints: 20,
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: new ObjectId(),
            name: 'งานหลังกลางภาค',
            description: 'งานและแบบฝึกหัดหลังสอบกลางภาค',
            weight: 25,
            maxPoints: 25,
            order: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: new ObjectId(),
            name: 'สอบปลายภาค',
            description: 'การสอบปลายภาค',
            weight: 30,
            maxPoints: 30,
            order: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('gradeStructures').insertOne(gradeStructure);
      console.log(`Created grade structure for ${cls.name}: ${result.insertedId}`);
    }

    console.log('\n✅ Grade structures created successfully!');
  } catch (error) {
    console.error('Error creating grade structures:', error);
  } finally {
    await client.close();
  }
}

createGradeStructures().catch(console.error);
