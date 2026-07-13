require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const mbtiRoutes = require('./routes/mbti');
const ragaRoutes = require('./routes/raga');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ragachakra';

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/mbti', mbtiRoutes);
app.use('/api/raga', ragaRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 catch-all for /api routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// ── Database + Server ─────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`\n🎵 RagaChakra server`);
    console.log(`   MongoDB: connected`);
    app.listen(PORT, () => {
      console.log(`   Express: http://localhost:${PORT}`);
      console.log(`   Astrology feature flag: ${process.env.ASTRO_ENABLED === 'true' ? 'ON' : 'OFF (MVP)'}\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
