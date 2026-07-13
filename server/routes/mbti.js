/**
 * routes/mbti.js
 *
 * POST /api/mbti
 *   Body: { clientId: string, mbtiType: string }
 *   Creates or updates user document with the MBTI type.
 *   Also accepts lat/lng/timezone for a single-request convenience.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

const VALID_MBTI = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
];

router.post('/', async (req, res) => {
  try {
    const { clientId, mbtiType, lat, lng, timezone } = req.body;

    if (!clientId || typeof clientId !== 'string') {
      return res.status(400).json({ error: 'clientId is required.' });
    }

    const type = (mbtiType || '').toUpperCase().trim();
    if (!VALID_MBTI.includes(type)) {
      return res.status(400).json({ error: `Invalid MBTI type: "${mbtiType}". Must be one of the 16 standard types.` });
    }

    const update = { mbtiType: type };
    if (timezone) update.timezone = timezone;
    if (lat != null && lng != null) {
      update['lastKnownLatLong.lat'] = parseFloat(lat);
      update['lastKnownLatLong.lng'] = parseFloat(lng);
    }

    const user = await User.findOneAndUpdate(
      { clientId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, mbtiType: user.mbtiType });
  } catch (err) {
    console.error('POST /api/mbti error:', err);
    res.status(500).json({ error: 'Server error saving MBTI type.' });
  }
});

module.exports = router;
