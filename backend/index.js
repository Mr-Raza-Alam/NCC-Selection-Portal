require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testRoutes = require('./routes/testRoutes');
const participantRoutes = require('./routes/participantRoutes');
const testConfigRoutes = require('./routes/testConfig');
const questionsRoutes = require('./routes/questions');
const settingsRoutes = require('./routes/settings');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/participants', participantRoutes);

// New Routes
app.use('/api/admin/test-config', testConfigRoutes);
app.use('/api/admin/questions', questionsRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Public Route for Landing Page Broadcast
app.get('/api/public/schedule', async (req, res) => {
  try {
    const TestConfig = require('./models/TestConfig');
    const config = await TestConfig.findOne();
    if (!config) {
      return res.json({ windowStart: null, windowEnd: null });
    }
    res.json({ windowStart: config.windowStart, windowEnd: config.windowEnd });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public Route for Broadcast Settings
app.get('/api/public/broadcast', async (req, res) => {
  try {
    const Settings = require('./models/Settings');
    const settings = await Settings.findOne();
    if (!settings) {
      return res.json({ broadcastMessage: '', broadcastTarget: 'none' });
    }
    res.json({ broadcastMessage: settings.broadcastMessage, broadcastTarget: settings.broadcastTarget });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('NCC Selection API is running...');
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (Local)`));
}

module.exports = app;