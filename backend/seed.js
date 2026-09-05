const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');
const Student = require('./models/Student');
const MasterRecord = require('./models/MasterRecord');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config();

const questions = [];
for (let i = 1; i <= 60; i++) {
  questions.push({
    questionText: `Sample NCC Question ${i}?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4)
  });
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    await Question.deleteMany();
    await Question.insertMany(questions);
    console.log('60 Questions Seeded!');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    // Create a test student
    await Student.deleteMany();
    await MasterRecord.deleteMany();
    
    const student = await Student.create({
      name: 'Test Cadet',
      department: 'Computer Science',
      dob: new Date('2005-05-15'),
      admissionNo: 'AUS/2026/001',
      email: 'test@example.com',
      contactNo: '9876543210',
      password: hash,
      code: 99,
      status: 'r1_qualified' // qualified to test R2
    });

    await MasterRecord.create({
      studentId: student._id,
      name: student.name,
      dob: student.dob,
      age: 21,
      total: 0
    });
    console.log('Test Student and MasterRecord Seeded');

    // Create Admins
    await Admin.deleteMany();
    const adminHash = await bcrypt.hash('password123', salt);

    await Admin.insertMany([
      { username: 'cto', password: adminHash, role: 'cto', features: ['MASTER_TABLE'] },
      { username: 'raza', password: adminHash, role: 'lead_admin', features: ['ALL'] },
      { username: 'assistant1', password: adminHash, role: 'assistant', features: ['R1_SETUP', 'R1_SCORE', 'R2_START', 'R2_ATTENDANCE', 'R3_SCORE'] },
      { username: 'assistant2', password: adminHash, role: 'assistant', features: ['R3_VERIFY'] }
    ]);
    console.log('Admins seeded with default features (all pass: password123)');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
