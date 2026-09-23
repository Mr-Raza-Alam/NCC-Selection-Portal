const RankCandidate = require('../models/RankCandidate');
const RankMasterRecord = require('../models/RankMasterRecord');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerRankCandidate = async (req, res) => {
  try {
    const { regimentalNo, name, email, mobileNo, semester, password } = req.body;

    // 1. Find the pre-registered cadet uploaded by Lead Admin
    const cadet = await RankCandidate.findOne({ regimentalNo });

    if (!cadet) {
      return res.status(400).json({ message: 'No pre-registration record found for this Regimental No. Please contact Admin.' });
    }

    // 2. Cross-verify the name strictly (case-insensitive for safety)
    if (cadet.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(400).json({ message: 'Name does not match the official records for this Regimental No.' });
    }

    // 3. Check if they already registered
    if (cadet.isRegistered) {
      return res.status(400).json({ message: 'This cadet has already registered. Please login.' });
    }

    // 4. Hash the new password and update their profile
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    cadet.email = email;
    cadet.mobileNo = mobileNo;
    cadet.semester = semester;
    cadet.password = hashedPassword;
    cadet.isRegistered = true;

    await cadet.save();

    // 5. Create empty Rank Master Record
    await RankMasterRecord.create({
      candidateId: cadet._id,
      name: cadet.name,
      department: cadet.department
    });

    // 6. Generate Token
    const token = jwt.sign({ id: cadet._id, role: 'rank_candidate' }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      _id: cadet._id,
      name: cadet.name,
      buddyNo: cadet.buddyNo,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginRankCandidate = async (req, res) => {
  try {
    const { regimentalNo, password } = req.body;

    const cadet = await RankCandidate.findOne({ regimentalNo });

    if (!cadet || !cadet.isRegistered) {
        return res.status(401).json({ message: 'Invalid credentials or not registered yet' });
    }

    if (await bcrypt.compare(password, cadet.password)) {
      const token = jwt.sign({ id: cadet._id, role: 'rank_candidate' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({
        _id: cadet._id,
        name: cadet.name,
        buddyNo: cadet.buddyNo,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRankProfile = async (req, res) => {
  try {
    const cadet = await RankCandidate.findById(req.user.id).select('-password');
    if (!cadet) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const r1 = await require('../models/RankR1Result').findOne({ candidateId: cadet._id });
    const r2 = await require('../models/RankR2Result').findOne({ candidateId: cadet._id });
    const r3 = await require('../models/RankR3Result').findOne({ candidateId: cadet._id });
    const settings = await require('../models/RankSettings').findOne();

    const profileData = {
      ...cadet.toObject(),
      r1Score: r1 ? r1.totalScore : null,
      r2Score: r2 ? r2.totalScore : null,
      r3Score: r3 ? r3.r3Score : null,
      r1Completed: settings ? settings.r1Completed : false,
      r2Completed: settings ? settings.r2Completed : false,
      r3Completed: settings ? settings.r3Completed : false,
    };
    
    // We should also get the RankSettings for testWindow (if rank has one, or use main config)
    const testConfig = await require('../models/TestConfig').findOne();
    if (testConfig) {
       profileData.testWindowStart = testConfig.windowStart;
       profileData.testWindowEnd = testConfig.windowEnd;
    }

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
