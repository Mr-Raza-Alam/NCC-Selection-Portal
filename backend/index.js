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

app.get('/', (req, res) => {
  res.send('NCC Selection API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));