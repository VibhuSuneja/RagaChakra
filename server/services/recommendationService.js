/**
 * services/recommendationService.js
 *
 * The Hybrid AI Recommendation Pipeline:
 *
 *   1. Rule Engine (ranking.js) → Top 5 Candidates (deterministic, fast, reliable)
 *   2. Gemini 2.5 Flash → Picks winner, writes ritual + why-bullets + tomorrow preview
 *
 * CRITICAL DESIGN DECISION:
 *   - MBTI is used ONLY by the rule engine for candidate scoring.
 *   - MBTI is NOT sent to Gemini. This prevents hallucination and keeps
 *     recommendations consistent regardless of model behavior.
 *
 * CONFIDENCE SCORE:
 *   - Computed by backend formula, NOT by Gemini.
 *   - Formula: Prahar match (40%) + Mood/Rasa (30%) + History (20%) + Preferences (10%)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { rankRagas } = require('../utils/ranking');
const { getPraharContext } = require('../utils/prahar');

// ── Mood → Rasa mapping ───────────────────────────────────────────────────
// Maps user-facing mood labels to dominant Rasa values for scoring
const MOOD_RASA_MAP = {
  calm:      ['Shanta', 'Shringara'],
  anxious:   ['Shanta', 'Karuna'],
  tired:     ['Shanta', 'Shringara'],
  focus:     ['Veera', 'Adbhuta'],
  curious:   ['Adbhuta', 'Shringara'],
  overwhelmed: ['Shanta', 'Karuna'],
  happy:     ['Hasya', 'Shringara'],
  sad:       ['Karuna', 'Shanta'],
};

// ── Compute confidence score (backend only, no LLM) ───────────────────────
/**
 * Computes a 0–100 confidence score based on weighted signal strength.
 *
 * @param {Object} raga          - Raga document
 * @param {Object} praharContext - From getPraharContext()
 * @param {string|null} mood     - User's selected mood
 * @param {string[]|null} history - Array of raga IDs the user has listened to
 * @param {number} rawScore      - MBTI score from rule engine (0–1)
 * @returns {number} 0–100 integer
 */
function computeConfidence(raga, praharContext, mood, history = [], rawScore = 0.5) {
  // Prahar match (40%): Is this raga perfectly aligned with current time?
  const praharScore = praharContext.isSandhi
    ? (raga.isSandhiPrakash && raga.sandhiType === praharContext.sandhiType ? 1.0 : 0.3)
    : (raga.prahar?.includes(praharContext.praharIndex) ? 1.0 : 0.4);

  // Mood/Rasa match (30%): How well do the raga's rasas match the mood?
  const moodRasas = MOOD_RASA_MAP[mood?.toLowerCase()] || [];
  const ragaRasas = raga.rasa || [];
  const rasaOverlap = moodRasas.length > 0
    ? ragaRasas.filter(r => moodRasas.includes(r)).length / moodRasas.length
    : 0.5;

  // Listening history (20%): Has user explored adjacent thaats before?
  const historyBoost = history && history.length > 0 ? 0.7 : 0.4;

  // User preferences/MBTI (10%): The raw MBTI score from ranking engine
  const prefScore = Math.min(1.0, rawScore);

  const confidence = (
    praharScore * 0.40 +
    rasaOverlap * 0.30 +
    historyBoost * 0.20 +
    prefScore * 0.10
  );

  return Math.round(confidence * 100);
}

// ── Build "Why bullets" (computed, consistent) ────────────────────────────
function buildWhyBullets(raga, praharContext, mood) {
  const bullets = [];
  const timeLabel = praharContext.isSandhi
    ? `${praharContext.sandhiType === 'dawn' ? 'Dawn' : 'Dusk'} transition (Sandhi Prakash)`
    : praharContext.praharName;

  bullets.push(`It's ${timeLabel} — ${raga.name}'s natural home`);

  const moodRasas = MOOD_RASA_MAP[mood?.toLowerCase()] || [];
  const matchedRasa = (raga.rasa || []).find(r => moodRasas.includes(r));
  if (matchedRasa && mood) {
    const rasaDescriptions = {
      Shanta: 'profound stillness and inner peace',
      Shringara: 'romantic beauty and devotional warmth',
      Karuna: 'deep compassion and gentle release',
      Veera: 'heroic resolve and focused energy',
      Adbhuta: 'wonder and expansive curiosity',
      Hasya: 'lightness, joy, and playfulness',
    };
    const desc = rasaDescriptions[matchedRasa] || matchedRasa;
    bullets.push(`Your ${mood} mood calls for ${desc} — ${raga.name}'s ${matchedRasa} Rasa delivers exactly this`);
  }

  if (raga.thaat) {
    bullets.push(`${raga.thaat} Thaat — one of the great evening parent scales`);
  }

  if (raga.isSandhiPrakash) {
    bullets.push(`A rare Sandhi Prakash raga — performs only at this exact solar threshold`);
  }

  return bullets;
}

// ── Main pipeline function ────────────────────────────────────────────────
/**
 * Full Hybrid AI Recommendation Pipeline.
 *
 * @param {Object} params
 * @param {Raga[]} params.allRagas       - All raga documents from DB
 * @param {Object} params.praharContext  - From getPraharContext()
 * @param {string|null} params.mbtiType  - For rule engine scoring ONLY
 * @param {string|null} params.mood      - User's current mood (not sent to Gemini raw)
 * @param {string[]|null} params.history - User's raga listening history IDs
 * @returns {Promise<Object>} Full recommendation payload
 */
async function getRecommendation({ allRagas, praharContext, mbtiType, mood, history = [] }) {
  // Step 1: Rule Engine — deterministic, always works, no network call
  const candidates = rankRagas(allRagas, praharContext, mbtiType);

  if (candidates.length === 0) {
    return { error: 'No ragas found for this time period.', candidates: [] };
  }

  const topCandidate = candidates[0];
  const alternativeCandidate = candidates[1] || null;

  // Step 2: Compute confidence (backend, not Gemini)
  const confidence = computeConfidence(
    topCandidate.raga,
    praharContext,
    mood,
    history,
    topCandidate.score
  );

  // Step 3: Build why-bullets (computed, consistent)
  const whyBullets = buildWhyBullets(topCandidate.raga, praharContext, mood);

  // Step 4: Gemini — ONLY for ritual generation and poetic reasoning
  // MBTI is NOT included in this prompt. It already shaped the candidate list.
  let ritual = null;
  let geminiReasoning = null;
  let tomorrowPreview = null;
  let alternativeReason = null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const timeLabel = praharContext.isSandhi
        ? `${praharContext.sandhiType} Sandhi Prakash transition`
        : praharContext.praharName;

      const alternativeContext = alternativeCandidate
        ? `Alternative raga: ${alternativeCandidate.raga.name} (${alternativeCandidate.raga.thaat} Thaat, ${(alternativeCandidate.raga.rasa || []).join('/')}).`
        : '';

      const prompt = `You are RagaChakra, an AI Ritual Companion for Indian Classical Music.

Context:
- Current time: ${timeLabel}
- Recommended Raga: ${topCandidate.raga.name} (${topCandidate.raga.thaat} Thaat)
- Raga's emotional quality: ${(topCandidate.raga.rasa || []).join(', ')} Rasa
- User's current mood: ${mood || 'unspecified'}
- Ascending scale: ${topCandidate.raga.ascendingNotes || 'classical'}
${alternativeContext}

Respond ONLY with this exact JSON structure, no markdown, no explanation:
{
  "geminiReasoning": "A single poetic sentence (max 20 words) explaining why this raga is perfect right now.",
  "ritual": [
    { "step": 1, "duration": "2 min", "instruction": "Close your eyes. Feel your breath slow." },
    { "step": 2, "duration": "15 min", "instruction": "Listen to the Alap of ${topCandidate.raga.name}. Let the notes arrive." },
    { "step": 3, "duration": "5 min", "instruction": "One question: What did you feel?" },
    { "step": 4, "duration": "tomorrow", "instruction": "We'll introduce [NEXT_RAGA] — [WHY]." }
  ],
  "reflectionQuestion": "A single introspective question, 10 words max.",
  "tomorrowPreview": "Name of the next raga and one sentence on why it follows naturally.",
  "alternativeReason": "If alternative exists: one sentence on how it differs emotionally."
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Safely parse — if Gemini returns bad JSON, we fall back to computed data
      try {
        const parsed = JSON.parse(text);
        ritual = parsed.ritual || null;
        geminiReasoning = parsed.geminiReasoning || null;
        tomorrowPreview = parsed.tomorrowPreview || null;
        alternativeReason = parsed.alternativeReason || null;
      } catch {
        // Gemini returned non-JSON — fallback to rule-engine reasoning
        geminiReasoning = topCandidate.reasoning;
      }
    } catch (err) {
      // Gemini timed out or errored — recommendation still works (rule engine is safe)
      console.warn('[recommendationService] Gemini unavailable, using rule-engine fallback:', err.message);
      geminiReasoning = topCandidate.reasoning;
    }
  } else {
    // No API key — offline mode, rule engine only
    geminiReasoning = topCandidate.reasoning;
  }

  // Default ritual if Gemini didn't return one
  if (!ritual) {
    ritual = [
      { step: 1, duration: '2 min', instruction: 'Close your eyes. Feel your breath slow.' },
      { step: 2, duration: '15 min', instruction: `Listen to ${topCandidate.raga.name}. Let the notes arrive.` },
      { step: 3, duration: '5 min', instruction: 'One question: What surfaced?' },
    ];
  }

  return {
    recommendation: {
      raga: topCandidate.raga,
      confidence,
      whyBullets,
      geminiReasoning,
      ritual,
      reflectionQuestion: `What did ${topCandidate.raga.name} bring to the surface?`,
      tomorrowPreview,
    },
    alternative: alternativeCandidate ? {
      raga: alternativeCandidate.raga,
      reason: alternativeReason || `A softer emotional tone — ${(alternativeCandidate.raga.rasa || []).join('/')} instead.`,
      confidence: computeConfidence(alternativeCandidate.raga, praharContext, mood, history, alternativeCandidate.score),
    } : null,
    allCandidates: candidates,
    praharContext,
  };
}

// ── Reflection processing pipeline ───────────────────────────────────────
/**
 * Processes a user's reflection entry through Gemini.
 * Returns: summary, next suggestion, pattern detection.
 *
 * @param {Object} params
 * @param {string} params.ragaName        - Raga they just listened to
 * @param {string} params.reflectionText  - User's free-text reflection
 * @param {string} params.mood            - Mood before the ritual
 * @param {Array}  params.recentHistory   - Last 5 sessions [{ragaName, mood, reflectionText}]
 * @returns {Promise<Object>} { summary, nextSuggestion, patternDetected }
 */
async function processReflection({ ragaName, reflectionText, mood, recentHistory = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      summary: `You spent time with ${ragaName} today. That matters.`,
      nextSuggestion: null,
      patternDetected: null,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const historyContext = recentHistory.length > 0
      ? `Recent sessions: ${recentHistory.map(h => `${h.ragaName} (${h.mood})`).join(', ')}.`
      : '';

    const prompt = `You are RagaChakra, an empathetic AI companion.

The user just completed a ${ragaName} ritual.
Their mood before: ${mood || 'unspecified'}
Their reflection: "${reflectionText}"
${historyContext}

Respond ONLY with this exact JSON, no markdown:
{
  "summary": "A warm, personal 1-2 sentence summary of what they experienced. Sound like Calm or Headspace.",
  "nextSuggestion": "One raga name that would naturally follow tomorrow, or null.",
  "patternDetected": "If you notice a pattern across recent sessions, describe it in one sentence. Otherwise null."
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    try {
      return JSON.parse(text);
    } catch {
      return {
        summary: `You spent meaningful time with ${ragaName}. Something shifted.`,
        nextSuggestion: null,
        patternDetected: null,
      };
    }
  } catch (err) {
    console.warn('[recommendationService] Gemini reflection error:', err.message);
    return {
      summary: `A moment with ${ragaName}. Worth remembering.`,
      nextSuggestion: null,
      patternDetected: null,
    };
  }
}

module.exports = { getRecommendation, processReflection, computeConfidence, MOOD_RASA_MAP };
