const Student = require('../models/Student');
const MasterRecord = require('../models/MasterRecord');
const R1Result = require('../models/R1Result');
const R2Result = require('../models/R2Result');
const R3Result = require('../models/R3Result');
const R1Activity = require('../models/R1Activity');
const Settings = require('../models/Settings');
const Admin = require('../models/Admin');

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// ==========================================
// R1: PHYSICAL TEST
// ==========================================

exports.setupR1 = async (req, res) => {
  try {
    const { activities } = req.body;
    await R1Activity.deleteMany({});
    
    const newActivities = await R1Activity.insertMany(
      activities.map((act, index) => ({ ...act, order: index }))
    );
    
    let settings = await getSettings();
    settings.r1SetupComplete = true;
    await settings.save();
    
    res.json({ message: 'R1 Setup Complete', activities: newActivities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getR1Table = async (req, res) => {
  try {
    const r1Scores = await R1Result.find();
    const r1StudentIds = r1Scores.map(s => s.studentId);
    
    // Fetch students who are currently active OR who already have an R1 score
    const students = await Student.find({
      $or: [
        { status: 'active' },
        { _id: { $in: r1StudentIds } }
      ]
    }).select('name code department status');
    
    const activities = await R1Activity.find().sort('order');
    
    res.json({ students, activities, r1Scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enterR1Score = async (req, res) => {
  try {
    // Accept single activity score to prevent frontend state race conditions
    const { studentId, activityId, activityName, score, attendance } = req.body;
    
    let r1Result = await R1Result.findOne({ studentId });
    if (!r1Result) {
      r1Result = new R1Result({ studentId, activityScores: [], totalScore: 0, attendance: '' });
    }
    
    if (activityId) {
      const existingIndex = r1Result.activityScores.findIndex(s => s.activityId && s.activityId.toString() === activityId.toString());
      if (existingIndex > -1) {
        r1Result.activityScores[existingIndex].score = Number(score);
      } else {
        r1Result.activityScores.push({ activityId, activityName, score: Number(score) });
      }
    }
    
    r1Result.totalScore = r1Result.activityScores.reduce((sum, s) => sum + Number(s.score || 0), 0);
    if (attendance !== undefined) r1Result.attendance = attendance;
    
    await r1Result.save();
    
    const record = await MasterRecord.findOne({ studentId });
    if (record) {
      record.r1 = r1Result.totalScore;
      record.total = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0) + (record.hs || 0) + (record.aCert || 0) + (record.other || 0);
      await record.save();
    }
    
    res.json({ message: 'Score updated', totalScore: r1Result.totalScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeR1 = async (req, res) => {
  try {
    // 1. Sync all R1 totalScores to MasterRecord
    const r1Results = await R1Result.find();
    for (let r of r1Results) {
      await MasterRecord.findOneAndUpdate(
        { studentId: r.studentId },
        { r1: r.totalScore }
      );
    }
    
    const masters = await MasterRecord.find();
    for (let m of masters) {
      const total = (m.r1 || 0) + (m.r2 || 0) + (m.r3 || 0) + (m.hs || 0) + (m.aCert || 0) + (m.other || 0);
      await MasterRecord.updateOne({ _id: m._id }, { $set: { total } });
    }
    
    res.json({ message: 'R1 Finalized and synced to Master Table' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setR1Cutoff = async (req, res) => {
  try {
    const { cutoff } = req.body;
    const settings = await getSettings();
    settings.r1Cutoff = cutoff;
    await settings.save();
    
    // Calculate cutoffs based on actual R1 results
    const results = await R1Result.find();
    const qualifiedIds = [];
    const eliminatedIds = [];
    
    results.forEach(r => {
      if (r.totalScore >= cutoff) {
        qualifiedIds.push(r.studentId);
      } else {
        eliminatedIds.push(r.studentId);
      }
    });
    
    // Update statuses
    await Student.updateMany(
      { _id: { $in: qualifiedIds }, status: 'active' },
      { $set: { status: 'r1_qualified' } }
    );
    
    await Student.updateMany(
      { _id: { $nin: qualifiedIds }, status: 'active' },
      { $set: { status: 'eliminated' } }
    );
    
    await MasterRecord.updateMany(
      { studentId: { $nin: qualifiedIds } },
      { $set: { status: 'eliminated' } }
    );
    
    res.json({ message: 'R1 Cutoff applied. Non-qualifiers eliminated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// R2: WRITTEN TEST
// ==========================================

exports.startR2 = async (req, res) => {
  try {
    const settings = await getSettings();
    settings.currentRound = 2;
    settings.r2Active = true;
    await settings.save();
    res.json({ message: 'Round 2 Started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markR2Attendance = async (req, res) => {
  try {
    const { studentId, attendance } = req.body;
    await R2Result.findOneAndUpdate(
      { studentId },
      { attendance },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ message: 'Attendance marked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getR2Table = async (req, res) => {
  try {
    const r2Scores = await R2Result.find();
    const r2StudentIds = r2Scores.map(s => s.studentId);
    
    // Fetch students who are currently r1_qualified OR who already have an R2 score
    const students = await Student.find({
      $or: [
        { status: 'r1_qualified' },
        { _id: { $in: r2StudentIds } }
      ]
    }).select('name department status');
    
    res.json({ students, r2Scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeR2 = async (req, res) => {
  try {
    // Sync R2 totalScores to MasterRecord
    const r2Results = await R2Result.find();
    for (let r of r2Results) {
      await MasterRecord.findOneAndUpdate(
        { studentId: r.studentId },
        { r2: r.totalScore }
      );
    }
    
    const masters = await MasterRecord.find();
    for (let m of masters) {
      const total = (m.r1 || 0) + (m.r2 || 0) + (m.r3 || 0) + (m.hs || 0) + (m.aCert || 0) + (m.other || 0);
      await MasterRecord.updateOne({ _id: m._id }, { $set: { total } });
    }
    
    res.json({ message: 'R2 Finalized and synced to Master Table' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setR2Cutoff = async (req, res) => {
  try {
    const { cutoff } = req.body;
    const settings = await getSettings();
    settings.r2Cutoff = cutoff;
    await settings.save();
    
    // Calculate cutoffs based on actual R2 results
    const results = await R2Result.find();
    const qualifiedIds = [];
    const eliminatedIds = [];
    
    results.forEach(r => {
      if (r.totalScore >= cutoff) {
        qualifiedIds.push(r.studentId);
      } else {
        eliminatedIds.push(r.studentId);
      }
    });
    
    await Student.updateMany(
      { _id: { $in: qualifiedIds }, status: 'r1_qualified' },
      { $set: { status: 'r2_qualified' } }
    );
    
    await Student.updateMany(
      { _id: { $nin: qualifiedIds }, status: 'r1_qualified' },
      { $set: { status: 'eliminated' } }
    );
    
    await MasterRecord.updateMany(
      { studentId: { $nin: qualifiedIds }, status: { $ne: 'eliminated' } },
      { $set: { status: 'eliminated' } }
    );
    
    res.json({ message: 'R2 Cutoff applied. Non-qualifiers eliminated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// R3: INTERVIEW & MASTER TABLE
// ==========================================

exports.startR3 = async (req, res) => {
  try {
    const settings = await getSettings();
    settings.currentRound = 3;
    settings.r3Active = true;
    await settings.save();
    res.json({ message: 'Round 3 Started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getR3Table = async (req, res) => {
  try {
    const r3Scores = await R3Result.find();
    const r3StudentIds = r3Scores.map(s => s.studentId);
    
    // Fetch students who are currently r2_qualified OR who already have an R3 score
    const students = await Student.find({
      $or: [
        { status: 'r2_qualified' },
        { _id: { $in: r3StudentIds } }
      ]
    }).select('name department status');
    
    res.json({ students, r3Scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ass. 1 (Interview Desk)
exports.enterR3Score = async (req, res) => {
  try {
    const { studentId, r3Score, attendance } = req.body;
    const updateFields = {};
    if (r3Score !== undefined) updateFields.r3Score = r3Score;
    if (attendance !== undefined) updateFields.attendance = attendance;

    await R3Result.findOneAndUpdate(
      { studentId },
      { $set: updateFields },
      { upsert: true, returnDocument: 'after' }
    );

    if (r3Score !== undefined) {
      const record = await MasterRecord.findOne({ studentId });
      if (record) {
        record.r3 = r3Score;
        record.total = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0) + (record.hs || 0) + (record.aCert || 0) + (record.other || 0);
        await record.save();
      }
    }

    res.json({ message: 'Interview score updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ass. 2 (Master Table Desk)
exports.verifyDocs = async (req, res) => {
  try {
    const { studentId, hs, aCert, other } = req.body;
    
    const record = await MasterRecord.findOne({ studentId });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    
    const newTotal = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0) + (hs || 0) + (aCert || 0) + (other || 0);
    
    await MasterRecord.findOneAndUpdate(
      { studentId },
      { $set: { hs, aCert, other, total: newTotal } },
      { returnDocument: 'after' }
    );
    res.json({ message: 'Documents verified and scores updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeR3 = async (req, res) => {
  try {
    // 1. Sync ONLY R3 score from r3_results to master
    const r3Results = await R3Result.find();
    for (let r of r3Results) {
      await MasterRecord.findOneAndUpdate(
        { studentId: r.studentId },
        { r3: r.r3Score }
      );
    }

    // 2. Auto-calculate total for all master records
    const masters = await MasterRecord.find();
    for (let m of masters) {
      const total = (m.r1 || 0) + (m.r2 || 0) + (m.r3 || 0) + (m.hs || 0) + (m.aCert || 0) + (m.other || 0);
      await MasterRecord.updateOne({ _id: m._id }, { $set: { total } });
    }
    
    // Upgrade R2 qualified to R3 qualified automatically
    await Student.updateMany(
      { status: 'r2_qualified' },
      { $set: { status: 'r3_qualified' } }
    );

    // Mark R3 as completed in settings
    const settings = await getSettings();
    settings.r3Completed = true;
    await settings.save();

    res.json({ message: 'Round 3 Finalized, totals calculated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMasterTable = async (req, res) => {
  try {
    const masters = await MasterRecord.find().populate('studentId', 'status code department');
    res.json(masters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentsTable = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEliminated = async (req, res) => {
  try {
    const eliminatedStudents = await Student.find({ status: 'eliminated' });
    const ids = eliminatedStudents.map(s => s._id);

    await Student.deleteMany({ _id: { $in: ids } });
    await MasterRecord.deleteMany({ studentId: { $in: ids } });
    await R1Result.deleteMany({ studentId: { $in: ids } });
    await R2Result.deleteMany({ studentId: { $in: ids } });
    await R3Result.deleteMany({ studentId: { $in: ids } });

    res.json({ message: `Deleted ${ids.length} eliminated records completely.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CTO makes final selection
exports.finalizeSelection = async (req, res) => {
  try {
    const { studentId, isSelected } = req.body;
    const status = isSelected ? 'Selected' : 'Eliminated';
    
    // Update Master Table Checkmark Status
    await MasterRecord.findOneAndUpdate({ studentId }, { $set: { status } });
    
    // Sync to Student Root Collection
    await Student.findOneAndUpdate(
      { _id: studentId }, 
      { $set: { status: isSelected ? 'selected' : 'eliminated' } }
    );
    
    res.json({ message: `Participant ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.publishFinalResults = async (req, res) => {
  try {
    // Anyone left at r3_qualified becomes eliminated
    await Student.updateMany(
      { status: 'r3_qualified' }, 
      { $set: { status: 'eliminated' } }
    );
    await MasterRecord.updateMany(
      { status: { $in: ['Pending', 'r3_qualified'] } },
      { $set: { status: 'Eliminated' } }
    );
    res.json({ message: 'Final results published! Unselected students eliminated.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ROLE MANAGEMENT (Lead Admin only)
// ==========================================
exports.getAdmins = async (req, res) => {
  try {
    // Show all admins in Role Management so Lead Admin can see CTO
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAdminFeatures = async (req, res) => {
  try {
    const { adminId, features } = req.body;
    await Admin.findByIdAndUpdate(adminId, { $set: { features } });
    res.json({ message: 'Admin features updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSettingsData = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// STUDENT RECORD DELETION
// ==========================================

exports.wipeAllStudents = async (req, res) => {
  try {
    await Student.deleteMany({});
    await MasterRecord.deleteMany({});
    await R1Result.deleteMany({});
    await R2Result.deleteMany({});
    await R3Result.deleteMany({});
    res.json({ message: 'All student records have been wiped entirely.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const code = student.code;

    await Student.findByIdAndDelete(studentId);
    await MasterRecord.findOneAndDelete({ code });
    await R1Result.findOneAndDelete({ code });
    await R2Result.findOneAndDelete({ code });
    await R3Result.findOneAndDelete({ code });

    res.json({ message: 'Student record deleted entirely.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

