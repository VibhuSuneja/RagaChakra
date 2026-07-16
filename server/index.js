require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const mbtiRoutes = require('./routes/mbti');
const ragaRoutes = require('./routes/raga');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ragachakra';

let dbConnected = false;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── DB Health Guard ───────────────────────────────────────────────────────
// Routes that need MongoDB return 503 gracefully when DB is unavailable.
// This prevents the client from receiving a hanging connection refused error.
const requireDb = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      error: 'Database unavailable. The app works in offline/demo mode.',
      offlineMode: true,
    });
  }
  next();
};

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/mbti', requireDb, mbtiRoutes);
app.use('/api/raga', requireDb, ragaRoutes);

// Health check — always responds regardless of DB state
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 404 catch-all for /api routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// ── Serve frontend in production ──────────────────────────────────────────
// Serve the built Vite frontend directly from the Node server.
// This allows for a single, easy deployment on Render (Monolith architecture).
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// ── Start Express immediately (no waiting for DB) ─────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵 RagaChakra server`);
  console.log(`   Express: http://localhost:${PORT}`);
  console.log(`   DB:      connecting in background...`);
  console.log(`   Astrology feature flag: ${process.env.ASTRO_ENABLED === 'true' ? 'ON' : 'OFF (MVP)'}\n`);
});

// ── Connect MongoDB in background ─────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    dbConnected = true;
    console.log(`   MongoDB: ✅ connected\n`);
  })
  .catch((err) => {
    dbConnected = false;
    console.warn(`   MongoDB: ⚠️  unavailable — ${err.message}`);
    console.warn(`   Running in offline/demo mode. Client fallback data is active.\n`);
    // Do NOT exit — server stays alive for the client to use
  });

