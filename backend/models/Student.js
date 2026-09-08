const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  dob: { type: Date, required: true },
  admissionNo: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  contactNo: { type: String, required: true },
  parentContactNo: { type: String, default: '' },
  password: { type: String, required: true },
  code: { type: Number, unique: true }, // 2-digit 10-99
  status: { 
    type: String, 
    enum: ['active', 'r1_qualified', 'r2_qualified', 'r3_qualified', 'selected', 'eliminated'],
    default: 'active'
  }
});

module.exports = mongoose.model('Student', studentSchema);
