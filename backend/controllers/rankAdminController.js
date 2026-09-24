const RankCandidate = require('../models/RankCandidate');
const RankMasterRecord = require('../models/RankMasterRecord');
const RankR1Result = require('../models/RankR1Result');
const RankR2Result = require('../models/RankR2Result');
const RankR3Result = require('../models/RankR3Result');
const RankR1Activity = require('../models/RankR1Activity');
const RankSettings = require('../models/RankSettings');
const Admin = require('../models/Admin');

const getRankSettings = async () => {
  let settings = await RankSettings.findOne();
  if (!settings) {
    settings = await RankSettings.create({});
  }
  return settings;
};

// ==========================================
// R1: PHYSICAL TEST
// ==========================================

exports.setupR1 = async (req, res) => {
  try {
    const { activities } = req.body;
    await RankR1Activity.deleteMany({});
    
    const newActivities = await RankR1Activity.insertMany(
      activities.map((act, index) => ({ ...act, order: index }))
    );
    
    let settings = await getRankSettings();
    settings.r_r1_entry = true;
    await settings.save();
    
    res.json({ message: 'R1 Setup Complete', activities: newActivities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getR1Table = async (req, res) => {
  try {
    const r1Scores = await RankR1Result.find();
    const r1RankCandidateIds = r1Scores.map(s => s.candidateId);
    
    // Fetch candidates who are currently active OR who already have an R1 score
    const candidates = await RankCandidate.find({
      $or: [
        { status: 'active' },
        { _id: { $in: r1RankCandidateIds } }
      ]
    }).select('name code department status');
    
    const activities = await RankR1Activity.find().sort('order');
    
    res.json({ candidates, activities, r1Scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enterR1Score = async (req, res) => {
  try {
    // Accept single activity score to prevent frontend state race conditions
    const { candidateId, activityId, activityName, score, attendance } = req.body;
    
    let r1Result = await RankR1Result.findOne({ candidateId });
    if (!r1Result) {
      r1Result = new RankR1Result({ candidateId, activityScores: [], totalScore: 0, attendance: '' });
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
    
    const record = await RankMasterRecord.findOne({ candidateId });
    if (record) {
      record.r1 = r1Result.totalScore;
      record.total = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0);
      await record.save();
    }
    
    res.json({ message: 'Score updated', totalScore: r1Result.totalScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeR1 = async (req, res) => {
  try {
    // 1. Sync all R1 totalScores to RankMasterRecord
    const r1Results = await RankR1Result.find();
    for (let r of r1Results) {
      await RankMasterRecord.findOneAndUpdate(
        { candidateId: r.candidateId },
        { r1: r.totalScore }
      );
    }
    
    const masters = await RankMasterRecord.find();
    for (let m of masters) {
      const total = (m.r1 || 0) + (m.r2 || 0) + (m.r3 || 0);
      await RankMasterRecord.updateOne({ _id: m._id }, { $set: { total } });
    }
    
    const settings = await getRankSettings();
    settings.r_r1_result = true;
    await settings.save();
    
    res.json({ message: 'R1 Finalized and synced to Master Table' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setR1Cutoff = async (req, res) => {
  try {
    const { cutoff } = req.body;
    const settings = await getRankSettings();
    settings.r_r1Cutoff = cutoff;
    await settings.save();
    
    // Calculate cutoffs based on actual R1 results
    const results = await RankR1Result.find();
    const qualifiedIds = [];
    const eliminatedIds = [];
    
    results.forEach(r => {
      if (r.totalScore >= cutoff) {
        qualifiedIds.push(r.candidateId);
      } else {
        eliminatedIds.push(r.candidateId);
      }
    });
    
    // Update statuses
    await RankCandidate.updateMany(
      { _id: { $in: qualifiedIds }, status: 'cadet' },
      { $set: { status: 'r_r1_qualified' } }
    );
    
      // We DO NOT eliminate candidates in rank selection. They remain 'cadet' if not qualified
      // So no update to 'eliminated' is needed.
    
    res.json({ message: 'R1 Cutoff applied. Unqualified candidates remain Cadets.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// R2: WRITTEN TEST
// ==========================================

exports.startR2 = async (req, res) => {
  try {
    const settings = await getRankSettings();
    settings.r_r2_entry = true;
    await settings.save();
    res.json({ message: 'Round 2 Started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markR2Attendance = async (req, res) => {
  try {
    const { candidateId, attendance } = req.body;
    await RankR2Result.findOneAndUpdate(
      { candidateId },
      { attendance },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ message: 'Attendance marked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enterR2Score = async (req, res) => {
  try {
    const { candidateId, score } = req.body;
    
    // Upsert into RankR2Result
    await RankR2Result.findOneAndUpdate(
      { candidateId },
      { totalScore: score, completed: true },
      { upsert: true, returnDocument: 'after' }
    );

    // Sync to RankMasterRecord
    const record = await RankMasterRecord.findOne({ candidateId });
    if (record) {
      record.r2 = score;
      record.total = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0);
      await record.save();
    }

    res.json({ message: 'R2 Score saved and synced' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getR2Table = async (req, res) => {
  try {
    const r2Scores = await RankR2Result.find();
    const r2RankCandidateIds = r2Scores.map(s => s.candidateId);
    
    // Fetch candidates who are currently r1_qualified OR who already have an R2 score
    const candidates = await RankCandidate.find({
      $or: [
        { status: 'r_r1_qualified' },
        { _id: { $in: r2RankCandidateIds } }
      ]
    }).select('name department status');
    
    res.json({ candidates, r2Scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.finalizeR2 = async (req, res) => {
  try {
    // Sync R2 totalScores to RankMasterRecord
    const r2Results = await RankR2Result.find();
    for (let r of r2Results) {
      await RankMasterRecord.findOneAndUpdate(
        { candidateId: r.candidateId },
        { r2: r.totalScore }
      );
    }
    
    const masters = await RankMasterRecord.find();
    for (let m of masters) {
      const total = (m.r1 || 0) + (m.r2 || 0) + (m.r3 || 0);
      await RankMasterRecord.updateOne({ _id: m._id }, { $set: { total } });
    }
    
    const settings = await getRankSettings();
    settings.r_r2_result = true;
    await settings.save();

    res.json({ message: 'R2 Finalized and synced to Master Table' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setR2Cutoff = async (req, res) => {
  try {
    const { cutoff } = req.body;
    const settings = await getRankSettings();
    settings.r_r2Cutoff = cutoff;
    await settings.save();
    
    // Calculate cutoffs based on actual R2 results
    const results = await RankR2Result.find();
    const qualifiedIds = [];
    const eliminatedIds = [];
    
    results.forEach(r => {
      if (r.totalScore >= cutoff) {
        qualifiedIds.push(r.candidateId);
      } else {
        eliminatedIds.push(r.candidateId);
      }
    });
    
    await RankCandidate.updateMany(
      { _id: { $in: qualifiedIds }, status: 'r_r1_qualified' },
      { $set: { status: 'r_r2_qualified' } }
    );
    
    // Unqualified revert back to cadet
    await RankCandidate.updateMany(
      { _id: { $nin: qualifiedIds }, status: 'r_r1_qualified' },
      { $set: { status: 'cadet' } }
    );
    
    // No master record 'eliminated' update needed
    
    res.json({ message: 'R2 Cutoff applied. Unqualified candidates remain Cadets.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// R3: INTERVIEW & MASTER TABLE
// ==========================================

exports.startR3 = async (req, res) => {
  try {
    const settings = await getRankSettings();
    settings.r_r3_entry = true;
    await settings.save();
    res.json({ message: 'Round 3 Started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getR3Table = async (req, res) => {
  try {
    const r3Scores = await RankR3Result.find();
    const r3RankCandidateIds = r3Scores.map(s => s.candidateId);
    
    // Fetch candidates who are currently r2_qualified OR who already have an R3 score
    const candidates = await RankCandidate.find({
      $or: [
        { status: 'r_r2_qualified' },
        { _id: { $in: r3RankCandidateIds } }
      ]
    }).select('name department status');
    
    res.json({ candidates, r3Scores });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ass. 1 (Interview Desk)
exports.enterR3Score = async (req, res) => {
  try {
    const { candidateId, r3Score, attendance } = req.body;
    const updateFields = {};
    if (r3Score !== undefined) updateFields.r3Score = r3Score;
    if (attendance !== undefined) updateFields.attendance = attendance;

    await RankR3Result.findOneAndUpdate(
      { candidateId },
      { $set: updateFields },
      { upsert: true, returnDocument: 'after' }
    );

    if (r3Score !== undefined) {
      const record = await RankMasterRecord.findOne({ candidateId });
      if (record) {
        record.r3 = r3Score;
        record.total = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0);
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
    const { candidateId, hs, aCert, other } = req.body;
    
    const record = await RankMasterRecord.findOne({ candidateId });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    
    const newTotal = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0) + (hs || 0) + (aCert || 0) + (other || 0);
    
    await RankMasterRecord.findOneAndUpdate(
      { candidateId },
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
    const r3Results = await RankR3Result.find();
    for (let r of r3Results) {
      await RankMasterRecord.findOneAndUpdate(
        { candidateId: r.candidateId },
        { r3: r.r3Score }
      );
    }

    // 2. Auto-calculate total for all master records
    const masters = await RankMasterRecord.find();
    for (let m of masters) {
      const total = (m.r1 || 0) + (m.r2 || 0) + (m.r3 || 0);
      await RankMasterRecord.updateOne({ _id: m._id }, { $set: { total } });
    }
    
    // Upgrade R2 qualified to R3 qualified automatically
    await RankCandidate.updateMany(
      { status: 'r_r2_qualified' },
      { $set: { status: 'r_r3_qualified' } }
    );

    // Mark R3 as completed in settings
    const settings = await getRankSettings();
    settings.r_r3_result = true;
    await settings.save();

    res.json({ message: 'Round 3 Finalized, totals calculated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMasterTable = async (req, res) => {
  try {
    const masters = await RankMasterRecord.find().populate('candidateId', 'status buddyNo department name');
    res.json(masters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRankCandidatesTable = async (req, res) => {
  try {
    const candidates = await RankCandidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEliminated = async (req, res) => {
  try {
    const eliminatedRankCandidates = await RankCandidate.find({ status: 'eliminated' });
    const ids = eliminatedRankCandidates.map(s => s._id);

    await RankCandidate.deleteMany({ _id: { $in: ids } });
    await RankMasterRecord.deleteMany({ candidateId: { $in: ids } });
    await RankR1Result.deleteMany({ candidateId: { $in: ids } });
    await RankR2Result.deleteMany({ candidateId: { $in: ids } });
    await RankR3Result.deleteMany({ candidateId: { $in: ids } });

    res.json({ message: `Deleted ${ids.length} eliminated records completely.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CTO makes final selection
exports.finalizeSelection = async (req, res) => {
  try {
    const { studentId, status } = req.body;
    
    // Status can be 'cadet', 'promoted_cpl', 'promoted_lcpl'
    
    // Optional Quota Enforcing: We can check how many are currently promoted
    if (status !== 'cadet') {
        const currentPromotions = await RankCandidate.countDocuments({ status: { $in: ['promoted_cpl', 'promoted_lcpl'] } });
        const isCurrentlyPromoted = await RankCandidate.findOne({ _id: studentId, status: { $in: ['promoted_cpl', 'promoted_lcpl'] } });
        
        // If they are not already promoted, and we already have 6 promotions, block it.
        if (!isCurrentlyPromoted && currentPromotions >= 6) {
           return res.status(400).json({ message: 'Quota Full! Maximum 6 ranks (CPL/LCPL) can be assigned.' });
        }
    }

    // Update Master Table Checkmark Status
    await RankMasterRecord.findOneAndUpdate({ candidateId: studentId }, { $set: { status } });
    
    // Sync to RankCandidate Root Collection
    await RankCandidate.findOneAndUpdate(
      { _id: studentId }, 
      { $set: { status } }
    );
    
    res.json({ message: `Rank updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.publishFinalResults = async (req, res) => {
  try {
    // Anyone left at r3_qualified or active who wasn't promoted becomes 'cadet'
    await RankCandidate.updateMany(
      { status: { $nin: ['promoted_cpl', 'promoted_lcpl', 'absent'] } }, 
      { $set: { status: 'cadet' } }
    );
    await RankMasterRecord.updateMany(
      { status: { $nin: ['promoted_cpl', 'promoted_lcpl', 'absent'] } },
      { $set: { status: 'cadet' } }
    );
    res.json({ message: 'Final Rank Results published! Unselected candidates remain Cadets.' });
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

exports.getRankSettingsData = async (req, res) => {
  try {
    const settings = await getRankSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// STUDENT RECORD DELETION
exports.wipeAllRankCandidates = async (req, res) => {
  try {
    await RankCandidate.deleteMany({});
    await RankMasterRecord.deleteMany({});
    await RankR1Result.deleteMany({});
    await RankR2Result.deleteMany({});
    await RankR3Result.deleteMany({});
    res.json({ message: 'All student records have been wiped entirely.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRankCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const student = await RankCandidate.findById(candidateId);
    if (!student) {
      return res.status(404).json({ message: 'RankCandidate not found' });
    }
    const code = student.code;

    await RankCandidate.findByIdAndDelete(candidateId);
    await RankMasterRecord.findOneAndDelete({ code });
    await RankR1Result.findOneAndDelete({ code });
    await RankR2Result.findOneAndDelete({ code });
    await RankR3Result.findOneAndDelete({ code });

    res.json({ message: 'RankCandidate record deleted entirely.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRankCandidateProfile = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { name, department, dob, email, admissionNo, contactNo, parentContactNo } = req.body;
    
    // We explicitly do NOT include `code` or `status` in the update
    const updatedRankCandidate = await RankCandidate.findByIdAndUpdate(
      candidateId,
      { $set: { name, department, dob, email, admissionNo, contactNo, parentContactNo } },
      { new: true }
    );
    
    if (!updatedRankCandidate) {
      return res.status(404).json({ message: 'RankCandidate not found' });
    }

    // RankMasterRecord has name and department, so update those too
    await RankMasterRecord.findOneAndUpdate(
      { candidateId },
      { $set: { name, department } }
    );

    res.json({ message: 'RankCandidate profile updated successfully', student: updatedRankCandidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
