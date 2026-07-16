require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const { standardLimiter } = require('./middleware/rateLimiter');
const { requireDb, setDbConnected } = require('./middleware/dbGuard');

const mbtiRoutes = require('./routes/mbti');
const ragaRoutes = require('./routes/raga');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ragachakra';

// ── Security Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); // Prevent oversized payloads
app.use(standardLimiter); // 60 req/min standard rate limit

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/mbti', requireDb, mbtiRoutes);
app.use('/api/raga', requireDb, ragaRoutes);

// ── Health check — always responds regardless of DB state ─────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: require('./middleware/dbGuard').getDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 catch-all for /api routes ────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// ── Serve frontend in production (optional) ──────────────────────────────
if (process.env.SERVE_FRONTEND === 'true') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'RagaChakra API — visit the Vercel frontend.' });
  });
}

// ── Start Express immediately (DB connects in background) ─────────────────
app.listen(PORT, () => {
  console.log(`\n🎵 RagaChakra`);
  console.log(`   Express:  http://localhost:${PORT}`);
  console.log(`   DB:       connecting in background...`);
  console.log(`   Astrology: ${process.env.ASTRO_ENABLED === 'true' ? 'ON' : 'OFF (MVP)'}\n`);
});

// ── Connect MongoDB in background ─────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    setDbConnected(true);
    console.log(`   MongoDB: ✅ connected\n`);
  })
  .catch((err) => {
    setDbConnected(false);
    console.warn(`   MongoDB: ⚠️  unavailable — ${err.message}`);
    console.warn(`   Running in offline/demo mode. Client fallback data is active.\n`);
  });
