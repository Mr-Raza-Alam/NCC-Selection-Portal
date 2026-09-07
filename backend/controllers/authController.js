const Student = require('../models/Student');
const MasterRecord = require('../models/MasterRecord');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate unique 2 digit code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;
  while (!isUnique) {
    code = Math.floor(Math.random() * 401) + 100; // 100 to 500 (3-digit chest number)
    const existing = await Student.findOne({ code });
    if (!existing) isUnique = true;
  }
  return code;
};

exports.registerParticipant = async (req, res) => {
  try {
    const { name, department, dob, admissionNo, email, contactNo, password } = req.body;

    const existingStudent = await Student.findOne({ admissionNo });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this Admission No already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const code = await generateUniqueCode();

    const student = await Student.create({
      name, department, dob, admissionNo, email, contactNo, password: hashedPassword, code
    });

    // Calculate Age relative to Selection Date (7th Sept 2026)
    const selectionDate = new Date('2026-09-07');
    const dobDate = new Date(dob);
    let age = selectionDate.getFullYear() - dobDate.getFullYear();
    const m = selectionDate.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && selectionDate.getDate() < dobDate.getDate())) {
      age--;
    }

    // Create empty Master Record
    await MasterRecord.create({
      studentId: student._id,
      name: student.name,
      dob: student.dob,
      age: age
    });

    const token = jwt.sign({ id: student._id, role: 'participant' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      code: student.code,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginParticipant = async (req, res) => {
  try {
    const { code, password } = req.body;

    const student = await Student.findOne({ code });

    if (student && (await bcrypt.compare(password, student.password))) {
      const token = jwt.sign({ id: student._id, role: 'participant' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({
        _id: student._id,
        name: student.name,
        code: student.code,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Trim username to handle mobile auto-spaces
    const trimmedUsername = username.trim();

    const admin = await Admin.findOne({ username: trimmedUsername });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = jwt.sign(
        { id: admin._id, role: admin.role, features: admin.features },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      return res.json({ role: admin.role, features: admin.features, username: admin.username, token });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
