const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ncc_selection_db');

const seedAdmins = async () => {
  try {
    // Clear existing admins
    await Admin.deleteMany({});
    console.log('Cleared existing admins');

    const admins = [
      {
        username: 'Sangarsh Mishra',
        password: await bcrypt.hash('mishra123', 10),
        role: 'cto',
        features: ['STUDENT_TABLE'] // CTO features are hardcoded based on role
      },
      {
        username: 'Ravi Kumar',
        password: await bcrypt.hash('ravi456', 10),
        role: 'assistant',
        features: ['R1_SETUP', 'R1_SCORE', 'R2_START', 'R2_ATTENDANCE', 'R3_SCORE'] // Ass.1
      },
      {
        username: 'Mallika Thapa',
        password: await bcrypt.hash('thapa654', 10),
        role: 'assistant',
        features: ['R3_VERIFY'] // Ass.2
      },
      {
        username: 'Raza Alam',
        password: await bcrypt.hash('alam321', 10),
        role: 'lead_admin',
        features: ['ALL'] // Lead Admin
      }
    ];

    await Admin.insertMany(admins);
    console.log('Successfully seeded 4 admins');
    process.exit();
  } catch (error) {
    console.error('Error seeding admins:', error);
    process.exit(1);
  }
};

seedAdmins();
