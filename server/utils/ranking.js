/**
 * ranking.js — MBTI Temperament-based Raga Ranking Engine
 *
 * Weights are derived compositionally from Keirsey's four temperaments
 * (NT/NF/SJ/SP) + an I/E modifier. No 144-pair lookup table.
 *
 * Provenance: Keirsey, D. (1998). Please Understand Me II.
 * Rasa→temperament mapping follows the documented Navarasa system;
 * the specific temperament-rasa pairing was supplied by the product team.
 *
 * TODO: Once astrology feature flag is enabled, add nakshatra re-rank
 * as a secondary pass (never a filter). See Phase 5 spec.
 */

// ── Keirsey Temperament → primary/secondary Rasa ─────────────────────────
const TEMPERAMENT_RASA = {
  NT: { primary: ['Veera'],     secondary: ['Adbhuta'] },
  NF: { primary: ['Shringara'], secondary: ['Karuna', 'Shanta'] },
  SJ: { primary: ['Shanta'],   secondary: ['Veera'] },
  SP: { primary: ['Hasya'],    secondary: ['Shringara'] },
};

const BASE_WEIGHT = {
  primary: 0.8,
  secondary: 0.5,
  other: 0.2,
};

// I/E modifier: +0.1 to these rasas for the given axis value
const IE_BOOST = {
  I: ['Shanta', 'Karuna'],
  E: ['Hasya', 'Veera'],
};

// ── Derive temperament from 4-letter MBTI type ───────────────────────────
function getTemperament(mbtiType) {
  if (!mbtiType || typeof mbtiType !== 'string') return null;
  const t = mbtiType.toUpperCase().trim();
  const NT = ['INTJ', 'INTP', 'ENTJ', 'ENTP'];
  const NF = ['INFJ', 'INFP', 'ENFJ', 'ENFP'];
  const SJ = ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'];
  const SP = ['ISTP', 'ISFP', 'ESTP', 'ESFP'];
  if (NT.includes(t)) return 'NT';
  if (NF.includes(t)) return 'NF';
  if (SJ.includes(t)) return 'SJ';
  if (SP.includes(t)) return 'SP';
  return null;
}

/**
 * Compute a 0–1 weight for a single rasa given the user's MBTI type.
 * @param {string} rasa
 * @param {string|null} mbtiType
 */
function getRasaWeight(rasa, mbtiType) {
  const temperament = getTemperament(mbtiType);
  if (!temperament) return BASE_WEIGHT.other;

  const { primary, secondary } = TEMPERAMENT_RASA[temperament];
  const ieAxis = mbtiType[0].toUpperCase(); // 'I' or 'E'
  const ieBoostRasas = IE_BOOST[ieAxis] || [];

  let weight = BASE_WEIGHT.other;
  if (primary.includes(rasa)) weight = BASE_WEIGHT.primary;
  else if (secondary.includes(rasa)) weight = BASE_WEIGHT.secondary;

  // Apply I/E modifier (capped at 1.0)
  if (ieBoostRasas.includes(rasa)) weight = Math.min(1.0, weight + 0.1);

  return weight;
}

/**
 * Compute the composite MBTI score for a raga.
 * Average of weights across all rasa the raga is tagged with.
 */
function computeMbtiScore(raga, mbtiType) {
  if (!raga.rasa || raga.rasa.length === 0) return BASE_WEIGHT.other;
  const weights = raga.rasa.map((r) => getRasaWeight(r, mbtiType));
  return weights.reduce((sum, w) => sum + w, 0) / weights.length;
}

/**
 * Filter ragas by current prahar (primary filter — cannot be overridden),
 * then rank by MBTI score.
 *
 * @param {Raga[]} ragas        — All raga documents from DB
 * @param {PraharContext} ctx   — From prahar.js getPraharContext()
 * @param {string|null} mbtiType
 * @returns {{ raga, score, reasoning }[]}  Sorted descending, top 5
 */
function rankRagas(ragas, ctx, mbtiType) {
  const { praharIndex, isSandhi, sandhiType, praharName, sunriseISO, sunsetISO } = ctx;

  // Step 1 — Filter: time is sovereign.
  const eligible = ragas.filter((raga) => {
    // Exclude unverified seed data
    if (raga.verified === false) return false;

    // Sandhi Prakash ragas are eligible only during their sandhi window
    if (raga.isSandhiPrakash) {
      return isSandhi && raga.sandhiType === sandhiType;
    }

    // Regular ragas: match if any of their prahar slots match current prahar
    return raga.prahar.includes(praharIndex);
  });

  // Step 2 — Score by MBTI (neutral 0.5 if no MBTI on file)
  const scored = eligible.map((raga) => {
    const score = computeMbtiScore(raga, mbtiType);
    return { raga, score };
  });

  // Step 3 — Sort descending
  scored.sort((a, b) => b.score - a.score);

  // Step 4 — Attach human-readable reasoning and return top 5
  return scored.slice(0, 5).map(({ raga, score }) => ({
    raga,
    score: parseFloat(score.toFixed(3)),
    reasoning: buildReasoning(raga, ctx, mbtiType),
  }));
}

function buildReasoning(raga, ctx, mbtiType) {
  const { isSandhi, sandhiType, praharName } = ctx;

  const timeLabel = isSandhi
    ? `${sandhiType === 'dawn' ? 'Dawn' : 'Dusk'} — Sandhi Prakash`
    : praharName;

  if (!mbtiType) return timeLabel;

  const temperament = getTemperament(mbtiType);
  const temperamentNames = { NT: 'Rational', NF: 'Idealist', SJ: 'Guardian', SP: 'Artisan' };
  const rasaStr = raga.rasa.join(', ');

  return `${timeLabel} · ${mbtiType} (${temperamentNames[temperament]}) → ${rasaStr}`;
}

module.exports = { rankRagas, getTemperament, getRasaWeight, computeMbtiScore };
