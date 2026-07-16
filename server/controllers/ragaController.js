/**
 * controllers/ragaController.js
 *
 * Thin handlers — all business logic lives in services/recommendationService.js
 * Routes import these and wire them up.
 */

const Raga = require('../models/Raga');
const User = require('../models/User');
const { getPraharContext } = require('../utils/prahar');
const { getRecommendation, processReflection } = require('../services/recommendationService');
const { body, query, validationResult } = require('express-validator');

// ── Validation rules ──────────────────────────────────────────────────────
const recommendValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a valid latitude'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('lng must be a valid longitude'),
  body('clientId').isString().trim().notEmpty().withMessage('clientId is required'),
  body('mood').optional().isString().trim()
    .customSanitizer(v => v.replace(/[<>"'&]/g, '')), // strip HTML only
  body('tz').optional().isString().trim(),
];

const reflectValidation = [
  body('ragaId').isString().notEmpty(),
  body('ragaName').isString().notEmpty().customSanitizer(v => v.replace(/[<>"'&]/g, '')),
  body('reflectionText').isString().isLength({ max: 1000 }),
  body('mood').optional().isString().customSanitizer(v => v.replace(/[<>"'&]/g, '')),
  body('clientId').isString().notEmpty(),
];

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid request', details: errors.array() });
  }
  return null;
}

// ── POST /api/raga/recommend ──────────────────────────────────────────────
async function recommend(req, res) {
  const validError = handleValidationErrors(req, res);
  if (validError) return;

  try {
    const { lat, lng, tz, clientId, mood } = req.body;
    const latF = parseFloat(lat);
    const lngF = parseFloat(lng);

    const now = new Date();
    const praharContext = getPraharContext({ lat: latF, lng: lngF, now });

    // Fetch user for MBTI (used by rule engine only)
    let mbtiType = null;
    let history = [];
    if (clientId) {
      const user = await User.findOne({ clientId }).lean();
      if (user) {
        mbtiType = user.mbtiType || null;
        history = (user.listeningHistory || []).map(h => h.ragaId?.toString()).filter(Boolean);

        // Fire-and-forget: update location and mood
        User.updateOne(
          { clientId },
          {
            $set: {
              'lastKnownLatLong.lat': latF,
              'lastKnownLatLong.lng': lngF,
              ...(tz ? { timezone: tz } : {}),
              ...(mood ? { currentMood: mood } : {}),
            },
          }
        ).catch(() => {});
      }
    }

    const allRagas = await Raga.find({ verified: { $ne: false } }).lean();
    const result = await getRecommendation({ allRagas, praharContext, mbtiType, mood, history });

    const localTimeStr = now.toLocaleTimeString('en-IN', {
      timeZone: tz || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    });

    res.json({
      ...result,
      localTimeStr,
      astroEnabled: process.env.ASTRO_ENABLED === 'true',
    });
  } catch (err) {
    console.error('[ragaController.recommend]', err);
    res.status(500).json({ error: 'Server error computing recommendation.' });
  }
}

// ── POST /api/raga/reflect ────────────────────────────────────────────────
async function reflect(req, res) {
  const validError = handleValidationErrors(req, res);
  if (validError) return;

  try {
    const { ragaId, ragaName, reflectionText, mood, clientId } = req.body;

    // Fetch recent history for pattern detection
    let recentHistory = [];
    if (clientId) {
      const user = await User.findOne({ clientId })
        .select('listeningHistory')
        .lean();
      if (user?.listeningHistory?.length > 0) {
        recentHistory = user.listeningHistory
          .slice(-5)
          .map(h => ({
            ragaName: h.ragaName || 'Unknown',
            mood: h.mood || null,
            reflectionText: h.reflectionText || '',
          }));
      }
    }

    const result = await processReflection({ ragaName, reflectionText, mood, recentHistory });

    // Save this reflection to user history
    if (clientId) {
      User.updateOne(
        { clientId },
        {
          $push: {
            listeningHistory: {
              $each: [{
                ragaId,
                ragaName,
                mood: mood || null,
                reflectionText,
                aiSummary: result.summary,
                listenedAt: new Date(),
              }],
              $slice: -100, // keep last 100 entries
            },
          },
        },
        { upsert: false }
      ).catch(() => {});
    }

    res.json(result);
  } catch (err) {
    console.error('[ragaController.reflect]', err);
    res.status(500).json({ error: 'Server error processing reflection.' });
  }
}

// ── GET /api/raga/current (legacy — kept for backward compat) ─────────────
async function getCurrentLegacy(req, res) {
  try {
    const { lat, lng, tz, clientId } = req.query;
    const latF = parseFloat(lat);
    const lngF = parseFloat(lng);
    if (isNaN(latF) || isNaN(lngF)) {
      return res.status(400).json({ error: 'lat and lng query params are required and must be numeric.' });
    }
    const now = new Date();
    const praharContext = getPraharContext({ lat: latF, lng: lngF, now });

    let mbtiType = null;
    if (clientId) {
      const user = await User.findOne({ clientId }).lean();
      if (user) {
        mbtiType = user.mbtiType || null;
        User.updateOne({ clientId }, {
          $set: {
            'lastKnownLatLong.lat': latF,
            'lastKnownLatLong.lng': lngF,
            ...(tz ? { timezone: tz } : {}),
          },
        }).catch(() => {});
      }
    }

    const { rankRagas } = require('../utils/ranking');
    const allRagas = await Raga.find({}).lean();
    const recommendations = rankRagas(allRagas, praharContext, mbtiType);

    const localTimeStr = now.toLocaleTimeString('en-IN', {
      timeZone: tz || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    });

    res.json({ localTimeStr, praharContext, mbtiType, recommendations, astroEnabled: process.env.ASTRO_ENABLED === 'true' });
  } catch (err) {
    console.error('[ragaController.getCurrentLegacy]', err);
    res.status(500).json({ error: 'Server error computing recommendation.' });
  }
}

// ── GET /api/raga/:id ─────────────────────────────────────────────────────
async function getRagaById(req, res) {
  try {
    const raga = await Raga.findById(req.params.id).lean();
    if (!raga) return res.status(404).json({ error: 'Raga not found.' });
    res.json(raga);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid raga ID format.' });
    console.error('[ragaController.getRagaById]', err);
    res.status(500).json({ error: 'Server error fetching raga.' });
  }
}

// ── GET /api/raga/schedule/daily ──────────────────────────────────────────
async function getDailySchedule(req, res) {
  try {
    const { clientId } = req.query;
    let mbtiType = null;
    if (clientId) {
      const user = await User.findOne({ clientId }).lean();
      if (user) mbtiType = user.mbtiType || null;
    }
    const { rankRagas } = require('../utils/ranking');
    const allRagas = await Raga.find({}).lean();
    const contexts = [1,2,3,4,5,6,7,8].map(i => ({
      praharIndex: i, praharName: `Prahar ${i}`, isSandhi: false, sandhiType: null,
    }));
    const schedule = contexts.map(ctx => ({
      prahar: ctx,
      recommendation: (() => { const r = rankRagas(allRagas, ctx, mbtiType); return r[0] || null; })(),
    }));
    res.json({ schedule });
  } catch (err) {
    console.error('[ragaController.getDailySchedule]', err);
    res.status(500).json({ error: 'Server error computing schedule.' });
  }
}

// ── GET /api/raga/ai/explain (streaming SSE) ──────────────────────────────
async function aiExplain(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Sanitize inputs — strip dangerous chars only
  const ragaName = (req.query.ragaName || '').replace(/[<>"'&]/g, '').slice(0, 60);
  const timeLabel = (req.query.timeLabel || '').replace(/[<>"'&]/g, '').slice(0, 80);
  // mood used for context — NOT mbti
  const mood = (req.query.mood || '').replace(/[<>"'&]/g, '').slice(0, 40);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.write('data: ' + JSON.stringify({ error: 'Gemini API key not configured' }) + '\n\n');
    return res.end();
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are RagaChakra, a poetic AI companion for Indian Classical Music.
Explain why ${ragaName} is the perfect raga for ${timeLabel}${mood ? ` when feeling ${mood}` : ''}.
Write 2 sentences maximum. Be poetic and specific to this raga's Rasa and tradition. Do NOT use markdown.`;

    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      res.write('data: ' + JSON.stringify({ text: chunk.text() }) + '\n\n');
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[ragaController.aiExplain]', err);
    res.write('data: ' + JSON.stringify({ error: 'Failed to generate explanation' }) + '\n\n');
    res.end();
  }
}

// ── GET /api/raga/demo (Offline/Fail-safe Demo Mode) ──────────────────────
async function getDemoScenario(req, res) {
  const { scenario } = req.query;
  const scenarios = {
    overwhelmed: {
      recommendation: {
        raga: { name: 'Yaman', thaat: 'Kalyan', rasa: ['Shringara', 'Shanta'], prahar: [5] },
        confidence: 92,
        whyBullets: [
          "It's dusk — Yaman's natural home",
          "Your overwhelmed mood calls for profound stillness",
          "Kalyan Thaat — the great evening parent scale"
        ],
        geminiReasoning: "When the world feels too heavy, Yaman's evening light carries it gently away.",
        ritual: [
          { step: 1, duration: '2 min', instruction: 'Find somewhere quiet. Close your eyes. Feel your breath slow.' },
          { step: 2, duration: '15 min', instruction: "Listen to Yaman's Alap. Don't analyze — just receive." },
          { step: 3, duration: '5 min', instruction: 'One question: What shifted inside?' }
        ],
        reflectionQuestion: "What did Yaman bring to the surface?",
        tomorrowPreview: "Bageshri — it shares Yaman's stillness but carries a softer longing."
      },
      praharContext: { praharName: 'Pancham Prahar', isSandhi: true, sandhiType: 'dusk' }
    }
    // Note: Kept simple on server. Client demoData.js has full payload for local bypass.
  };

  const data = scenarios[scenario] || scenarios['overwhelmed'];
  res.json(data);
}

module.exports = {
  recommend,
  recommendValidation,
  reflect,
  reflectValidation,
  getCurrentLegacy,
  getRagaById,
  getDailySchedule,
  aiExplain,
  getDemoScenario,
};
