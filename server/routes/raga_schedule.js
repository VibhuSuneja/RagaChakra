const express = require('express');
const router = express.Router();
const Raga = require('../models/Raga');
const User = require('../models/User');
const { getPraharContext } = require('../utils/prahar');
const { rankRagas } = require('../utils/ranking');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to get all schedule contexts for a given day
function getDailyScheduleContexts(lat, lng, now) {
  // A simplified approach: generate a context for the midpoint of each prahar
  // We can use the existing prahar calculation by testing specific times of day
  // But actually, it's easier to mock the contexts since we just want the recommendations
  
  // Actually, prahar boundaries change daily. But ranking.js only cares about
  // praharIndex and sandhi flags.
  
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
  return contexts;
}

// ── GET /api/raga/schedule ────────────────────────────────────────────────
router.get('/schedule', async (req, res) => {
  try {
    const { lat, lng, clientId } = req.query;
    
    let mbtiType = null;
    if (clientId) {
      const user = await User.findOne({ clientId }).lean();
      if (user) {
        mbtiType = user.mbtiType || null;
      }
    }
    
    const allRagas = await Raga.find({}).lean();
    const contexts = getDailyScheduleContexts();
    
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
