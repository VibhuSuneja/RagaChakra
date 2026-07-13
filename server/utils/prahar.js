/**
 * prahar.js — Samay Theory Engine
 *
 * Computes the current Hindustani prahar (1–8) from actual sunrise/sunset
 * times using suncalc. Prahars are not fixed 3-hour blocks — each day-quarter
 * and night-quarter stretches or compresses with the actual solar cycle.
 *
 * Sandhi Prakash window: ±SANDHI_WINDOW_MINUTES around actual sunrise/sunset.
 */

const SunCalc = require('suncalc');

// Classical Sandhi Prakash window (minutes either side of sunrise/sunset)
const SANDHI_WINDOW_MINUTES = 45;
const SANDHI_WINDOW_MS = SANDHI_WINDOW_MINUTES * 60 * 1000;

const PRAHAR_NAMES = {
  1: 'Pratham Prahar',   // 1st — dawn / early morning
  2: 'Dwitiya Prahar',   // 2nd — late morning
  3: 'Tritiya Prahar',   // 3rd — midday
  4: 'Chaturthi Prahar', // 4th — afternoon
  5: 'Pancham Prahar',   // 5th — dusk / early evening
  6: 'Shashtham Prahar', // 6th — first half of night
  7: 'Saptam Prahar',    // 7th — late night
  8: 'Ashtam Prahar',    // 8th — pre-dawn
};

/**
 * Returns the prahar context for a given location and moment.
 *
 * @param {object} params
 * @param {number} params.lat  — latitude (decimal degrees)
 * @param {number} params.lng  — longitude (decimal degrees)
 * @param {Date}   [params.now] — defaults to new Date()
 * @returns {PraharContext}
 *
 * @typedef {object} PraharContext
 * @property {number}          praharIndex  1–8
 * @property {string}          praharName   Human-readable name
 * @property {boolean}         isSandhi     true if within Sandhi Prakash window
 * @property {'dawn'|'dusk'|null} sandhiType
 * @property {string}          sunriseISO   ISO string of today's sunrise
 * @property {string}          sunsetISO    ISO string of today's sunset
 */
function getPraharContext({ lat, lng, now = new Date() }) {
  const todayTimes = SunCalc.getTimes(now, lat, lng);
  const sunrise = todayTimes.sunrise;
  const sunset = todayTimes.sunset;

  const nowMs = now.getTime();
  const sunriseMs = sunrise.getTime();
  const sunsetMs = sunset.getTime();

  // ── Sandhi Prakash checks (take priority over prahar computation) ──────────
  const nearSunrise = Math.abs(nowMs - sunriseMs) <= SANDHI_WINDOW_MS;
  const nearSunset = Math.abs(nowMs - sunsetMs) <= SANDHI_WINDOW_MS;

  if (nearSunrise) {
    return _ctx(1, true, 'dawn', sunrise, sunset);
  }
  if (nearSunset) {
    return _ctx(5, true, 'dusk', sunrise, sunset);
  }

  // ── Daytime: sunrise → sunset, split into 4 equal quarters ──────────────
  if (nowMs >= sunriseMs && nowMs < sunsetMs) {
    const dayDuration = sunsetMs - sunriseMs;
    const fraction = (nowMs - sunriseMs) / dayDuration;

    let idx;
    if (fraction < 0.25) idx = 1;
    else if (fraction < 0.50) idx = 2;
    else if (fraction < 0.75) idx = 3;
    else idx = 4;

    return _ctx(idx, false, null, sunrise, sunset);
  }

  // ── Nighttime: sunset → next sunrise, split into 4 equal quarters ────────
  let nightStartMs, nextSunriseMs;

  if (nowMs < sunriseMs) {
    // After midnight but before today's sunrise → use yesterday's sunset
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yTimes = SunCalc.getTimes(yesterday, lat, lng);
    nightStartMs = yTimes.sunset.getTime();
    nextSunriseMs = sunriseMs; // today's sunrise
  } else {
    // After today's sunset
    nightStartMs = sunsetMs;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmTimes = SunCalc.getTimes(tomorrow, lat, lng);
    nextSunriseMs = tmTimes.sunrise.getTime();
  }

  const nightDuration = nextSunriseMs - nightStartMs;
  const fraction = (nowMs - nightStartMs) / nightDuration;

  let idx;
  if (fraction < 0.25) idx = 5;
  else if (fraction < 0.50) idx = 6;
  else if (fraction < 0.75) idx = 7;
  else idx = 8;

  return _ctx(idx, false, null, sunrise, sunset);
}

function _ctx(praharIndex, isSandhi, sandhiType, sunrise, sunset) {
  return {
    praharIndex,
    praharName: PRAHAR_NAMES[praharIndex],
    isSandhi,
    sandhiType,
    sunriseISO: sunrise.toISOString(),
    sunsetISO: sunset.toISOString(),
  };
}

module.exports = { getPraharContext, SANDHI_WINDOW_MINUTES };
