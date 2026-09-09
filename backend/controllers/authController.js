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
    const { name, department, dob, admissionNo, email, contactNo, parentContactNo, password } = req.body;

    const existingStudent = await Student.findOne({ admissionNo });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this Admission No already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const code = await generateUniqueCode();

    const student = await Student.create({
      name, department, dob, admissionNo, email, contactNo, parentContactNo, password: hashedPassword, code
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

exports.verifyDetails = async (req, res) => {
  try {
    const { admissionNo, dob, contactNo } = req.body;
    if (!admissionNo || !dob || !contactNo) {
      return res.status(400).json({ message: 'Please provide admissionNo, dob, and contactNo' });
    }

    const student = await Student.findOne({ admissionNo, contactNo });
    if (!student) {
      return res.status(400).json({ message: 'Details do not match. Please check and try again.' });
    }

    // Compare Dates (ignore time)
    const dbDob = new Date(student.dob).toISOString().split('T')[0];
    const inputDob = new Date(dob).toISOString().split('T')[0];

    if (dbDob !== inputDob) {
      return res.status(400).json({ message: 'Details do not match. Please check and try again.' });
    }

    res.json({ success: true, studentId: student._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;
    if (!studentId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Invalid request or password too short' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Student.findByIdAndUpdate(studentId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
