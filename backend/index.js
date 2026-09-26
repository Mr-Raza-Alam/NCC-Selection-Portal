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
const rankAuthRoutes = require('./routes/rankAuthRoutes');
const rankAdminRoutes = require('./routes/rankAdminRoutes');

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://ncc-selection-portal.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Explicitly handle all OPTIONS requests as a fallback for Vercel Serverless
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'https://ncc-selection-portal.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/rank-auth', rankAuthRoutes);
app.use('/api/rank-admin', rankAdminRoutes);
app.use('/api/rank-test', require('./routes/rankTestRoutes'));

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
      return res.json({ 
        enrollment: { broadcastMessage: '', broadcastTarget: 'none' },
        rank: { broadcastMessage: '', broadcastTarget: 'none' }
      });
    }
    res.json({ 
      enrollment: { broadcastMessage: settings.broadcastMessage || '', broadcastTarget: settings.broadcastTarget || 'none' },
      rank: { broadcastMessage: settings.rank_broadcastMessage || '', broadcastTarget: settings.rank_broadcastTarget || 'none' }
    });
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