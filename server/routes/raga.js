/**
 * routes/raga.js — Thin router only.
 * All logic lives in controllers/ragaController.js
 * All AI pipeline lives in services/recommendationService.js
 */

const express = require('express');
const router = express.Router();
const { aiLimiter } = require('../middleware/rateLimiter');

const {
  recommend,
  recommendValidation,
  reflect,
  reflectValidation,
  getCurrentLegacy,
  getRagaById,
  getDailySchedule,
  aiExplain,
  getDemoScenario,
} = require('../controllers/ragaController');

// ── Demo Endpoint (No DB, No Gemini) ──────────────────────────────────────
router.get('/demo', getDemoScenario);

// ── New Hybrid AI Recommendation Endpoint ─────────────────────────────────
router.post('/recommend', recommendValidation, recommend);

// ── New Reflection Endpoint ───────────────────────────────────────────────
router.post('/reflect', reflectValidation, reflect);

// ── Legacy Endpoint (backward compat — keep for any existing clients) ─────
router.get('/current', getCurrentLegacy);

// ── Daily Schedule ────────────────────────────────────────────────────────
router.get('/schedule/daily', getDailySchedule);

// ── AI Explain (streaming SSE) ────────────────────────────────────────────
router.get('/ai/explain', aiLimiter, aiExplain);

// ── Single Raga by ID — MUST be last (catches :id param) ─────────────────
router.get('/:id', getRagaById);

module.exports = router;
