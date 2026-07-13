/**
 * prahar.test.js — Unit tests for the Samay Theory engine
 *
 * Run: npm test (from server/)
 *
 * Key assertions:
 * - Dawn sandhi correctly fires ±45 min around actual sunrise
 * - Dusk sandhi correctly fires ±45 min around actual sunset
 * - Day prahars 1–4 hit correct time fractions
 * - Post-midnight (before sunrise) is night prahar 7 or 8
 */

const { getPraharContext, SANDHI_WINDOW_MINUTES } = require('./prahar');

// New Delhi: lat 28.6139, lng 77.2090
// Approximate sunrise ≈ 05:30 IST, sunset ≈ 19:10 IST (summer)
const LAT = 28.6139;
const LNG = 77.209;

// Helper: build a Date for a given IST time on a fixed date
// (IST = UTC+5:30)
function makeIST(hour, minute, second = 0) {
  // 2025-06-21 (solstice — extreme case for sunrise/sunset spread)
  return new Date(Date.UTC(2025, 5, 21, hour - 5, minute - 30, second));
}

describe('Sandhi Prakash window', () => {
  test('should return dawn sandhi slightly before sunrise', () => {
    // 05:15 IST — ~15 min before a typical June sunrise (~05:27)
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(5, 15) });
    expect(ctx.isSandhi).toBe(true);
    expect(ctx.sandhiType).toBe('dawn');
    expect(ctx.praharIndex).toBe(1);
  });

  test('should return dawn sandhi slightly after sunrise', () => {
    // 05:50 IST — ~23 min after sunrise
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(5, 50) });
    expect(ctx.isSandhi).toBe(true);
    expect(ctx.sandhiType).toBe('dawn');
  });

  test('should NOT return sandhi 60 min after sunrise', () => {
    // 06:30 IST — outside ±45 min window
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(6, 30) });
    expect(ctx.isSandhi).toBe(false);
    expect(ctx.sandhiType).toBeNull();
  });

  test('should return dusk sandhi near sunset', () => {
    // ~19:10 IST is June sunset in Delhi; test 19:00 IST
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(19, 0) });
    expect(ctx.isSandhi).toBe(true);
    expect(ctx.sandhiType).toBe('dusk');
    expect(ctx.praharIndex).toBe(5);
  });
});

describe('Day prahar assignment', () => {
  test('Prahar 2 — late morning (well past sandhi)', () => {
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(9, 0) });
    expect(ctx.isSandhi).toBe(false);
    expect(ctx.praharIndex).toBe(2);
  });

  test('Prahar 3 — midday', () => {
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(12, 30) });
    expect(ctx.isSandhi).toBe(false);
    expect(ctx.praharIndex).toBe(3);
  });

  test('Prahar 4 — afternoon', () => {
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(16, 30) });
    expect(ctx.isSandhi).toBe(false);
    expect(ctx.praharIndex).toBe(4);
  });
});

describe('Night prahar assignment', () => {
  test('Prahar 6 — first half of night', () => {
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(22, 0) });
    expect(ctx.isSandhi).toBe(false);
    expect([6, 7]).toContain(ctx.praharIndex); // depends on exact sunset
  });

  test('Prahar 7/8 — post-midnight pre-dawn', () => {
    // 03:00 IST — after midnight, before sunrise
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(3, 0) });
    expect(ctx.isSandhi).toBe(false);
    expect([7, 8]).toContain(ctx.praharIndex);
  });
});

describe('Return shape', () => {
  test('always returns all required fields', () => {
    const ctx = getPraharContext({ lat: LAT, lng: LNG, now: makeIST(10, 0) });
    expect(ctx).toHaveProperty('praharIndex');
    expect(ctx).toHaveProperty('praharName');
    expect(ctx).toHaveProperty('isSandhi');
    expect(ctx).toHaveProperty('sandhiType');
    expect(ctx).toHaveProperty('sunriseISO');
    expect(ctx).toHaveProperty('sunsetISO');
  });
});
