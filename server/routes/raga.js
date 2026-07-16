/**
 * routes/raga.js
 *
 * GET /api/raga/current?lat=&lng=&tz=&clientId=
 *   Returns ranked raga recommendations for the user's current prahar + MBTI.
 *   Astrology re-rank: FEATURE FLAGGED (ASTRO_ENABLED in .env).
 *
 * GET /api/raga/:id
 *   Returns a single raga document by MongoDB _id.
 */

const express = require('express');
const router = express.Router();
const Raga = require('../models/Raga');
const User = require('../models/User');
const { getPraharContext } = require('../utils/prahar');
const { rankRagas } = require('../utils/ranking');

// ── GET /api/raga/current ─────────────────────────────────────────────────
router.get('/current', async (req, res) => {
  try {
    const { lat, lng, tz, clientId } = req.query;

    // Validate location
    const latF = parseFloat(lat);
    const lngF = parseFloat(lng);
    if (isNaN(latF) || isNaN(lngF)) {
      return res.status(400).json({
        error: 'lat and lng query params are required and must be numeric.',
      });
    }

    // Compute current prahar from actual sunrise/sunset
    const now = new Date();
    const praharContext = getPraharContext({ lat: latF, lng: lngF, now });

    // Fetch user's MBTI (if clientId provided and user exists)
    let mbtiType = null;
    if (clientId) {
      const user = await User.findOne({ clientId }).lean();
      if (user) {
        mbtiType = user.mbtiType || null;
        // Store latest location while we're here (fire-and-forget)
        User.updateOne(
          { clientId },
          {
            $set: {
              'lastKnownLatLong.lat': latF,
              'lastKnownLatLong.lng': lngF,
              ...(tz ? { timezone: tz } : {}),
            },
          }
        ).catch(() => {}); // non-blocking
      }
    }

    // Fetch all ragas; ranking.js handles the filter + sort
    const allRagas = await Raga.find({}).lean();
    const recommendations = rankRagas(allRagas, praharContext, mbtiType);

    // Build a human-readable local time string
    const localTimeStr = now.toLocaleTimeString('en-IN', {
      timeZone: tz || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    });

    res.json({
      localTimeStr,
      praharContext,
      mbtiType,
      recommendations,
      // Feature-flag status visible to client for conditional UI
      astroEnabled: process.env.ASTRO_ENABLED === 'true',
    });
  } catch (err) {
    console.error('GET /api/raga/current error:', err);
    res.status(500).json({ error: 'Server error computing recommendation.' });
  }
});

// ── GET /api/raga/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const raga = await Raga.findById(req.params.id).lean();
    if (!raga) {
      return res.status(404).json({ error: 'Raga not found.' });
    }
    res.json(raga);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid raga ID format.' });
    }
    console.error('GET /api/raga/:id error:', err);
    res.status(500).json({ error: 'Server error fetching raga.' });
  }
});

// ── GET /api/raga/schedule ────────────────────────────────────────────────
router.get('/schedule/daily', async (req, res) => {
  try {
    const { clientId } = req.query;
    
    let mbtiType = null;
    if (clientId) {
      const user = await User.findOne({ clientId }).lean();
      if (user) mbtiType = user.mbtiType || null;
    }
    
    const allRagas = await Raga.find({}).lean();
    const contexts = [
      { praharIndex: 1, praharName: 'Pratham Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 2, praharName: 'Dwitiya Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 3, praharName: 'Tritiya Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 4, praharName: 'Chaturthi Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 5, praharName: 'Pancham Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 6, praharName: 'Shashtham Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 7, praharName: 'Saptam Prahar', isSandhi: false, sandhiType: null },
      { praharIndex: 8, praharName: 'Ashtam Prahar', isSandhi: false, sandhiType: null },
    ];
    
    const schedule = contexts.map(ctx => {
      const recs = rankRagas(allRagas, ctx, mbtiType);
      return {
        prahar: ctx,
        recommendation: recs.length > 0 ? recs[0] : null
      };
    });
    
    res.json({ schedule });
  } catch (err) {
    console.error('GET /api/raga/schedule error:', err);
    res.status(500).json({ error: 'Server error computing schedule.' });
  }
});

// ── GET /api/raga/ai/explain ──────────────────────────────────────────────
const { GoogleGenerativeAI } = require('@google/generative-ai');
router.get('/ai/explain', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { ragaName, mbti, timeLabel } = req.query;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.write('data: ' + JSON.stringify({ error: 'Gemini API key not configured' }) + '\n\n');
    return res.end();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert in both Hindustani Classical Music and Jungian psychology. 
Explain why the raga ${ragaName} is the perfect recommendation for an ${mbti} personality type during ${timeLabel}.
Keep it poetic, insightful, and concise (max 3 sentences). Emphasize how the emotional quality (Rasa) of the raga matches the cognitive functions or temperament of the ${mbti}. Do NOT use markdown.`;

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write('data: ' + JSON.stringify({ text: chunkText }) + '\n\n');
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI Explain error:', err);
    res.write('data: ' + JSON.stringify({ error: 'Failed to generate explanation' }) + '\n\n');
    res.end();
  }
});

module.exports = router;
