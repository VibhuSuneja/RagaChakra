/**
 * ragas.js — Verified Raga Seed Data
 *
 * RULES:
 * 1. Only include ragas whose prahar assignment is documented in authoritative
 *    Hindustani classical sources (Bhatkhande thaat system, standard prahar charts).
 * 2. Any uncertain assignment MUST be marked `verified: false` with a `verifyNote`.
 *    Unverified ragas are excluded from all recommendations by ranking.js.
 * 3. Do NOT add a raga-time assignment not in this list without citing a source.
 *
 * Rasa assignments follow the traditional Navarasa framework.
 * Tetrachord (poorvang/uttarang) follows Bhatkhande classification:
 *   - Poorvang (Sa–Ma emphasis): day ragas
 *   - Uttarang (Pa–Sa emphasis): night ragas
 *
 * audioRefs format: plain text citation or YouTube search URL.
 * No embed APIs — ToS/licensing are out of MVP scope.
 */

const ragas = [
  // ═══════════════════════════════════════════════════════════════
  // SANDHI PRAKASH — DAWN  (Prahar 1, ±45 min around sunrise)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Bhairav',
    thaat: 'Bhairav',
    prahar: [1],
    isSandhiPrakash: true,
    sandhiType: 'dawn',
    tetrachord: 'poorvang',
    rasa: ['Shanta', 'Karuna'],
    ascendingNotes:  'S r G M P d N S\'',
    descendingNotes: 'S\' N d P M G r S',
    audioRefs: [
      'Pandit Jasraj — Bhairav (Morning Concert)',
      'https://www.youtube.com/results?search_query=raga+bhairav+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 1 — Early Morning (post-dawn sandhi to 1st quarter of day)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Bhairavi',
    thaat: 'Bhairavi',
    prahar: [1, 2],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Karuna', 'Shringara'],
    ascendingNotes:  'S r g M P d n S\'',
    descendingNotes: 'S\' n d P M g r S',
    audioRefs: [
      'Ustad Bade Ghulam Ali Khan — Bhairavi Thumri',
      'https://www.youtube.com/results?search_query=raga+bhairavi+classical',
    ],
    verified: true,
  },
  {
    name: 'Bilawal',
    thaat: 'Bilawal',
    prahar: [1, 2],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Shanta', 'Shringara'],
    ascendingNotes:  'S R G M P D N S\'',
    descendingNotes: 'S\' N D P M G R S',
    audioRefs: [
      'Pandit Bhimsen Joshi — Bilawal',
      'https://www.youtube.com/results?search_query=raga+bilawal+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 2 — Late Morning (2nd quarter of day)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Asavari',
    thaat: 'Asavari',
    prahar: [2],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Karuna', 'Shanta'],
    ascendingNotes:  'S R g M P d n S\'',
    descendingNotes: 'S\' n d P M g R S',
    audioRefs: [
      'Pandit Ulhas Kashalkar — Asavari',
      'https://www.youtube.com/results?search_query=raga+asavari+classical',
    ],
    verified: true,
  },
  {
    name: 'Todi',
    thaat: 'Todi',
    prahar: [2],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Karuna', 'Shringara'],
    ascendingNotes:  'S r g M# P d N S\'',
    descendingNotes: 'S\' N d P M# g r S',
    audioRefs: [
      'Ustad Vilayat Khan — Todi',
      'https://www.youtube.com/results?search_query=raga+todi+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 3 — Midday (3rd quarter of day)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Vrindavani Sarang',
    thaat: 'Kafi',
    prahar: [3, 4],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Hasya'],
    ascendingNotes:  'S R M P N S\'',
    descendingNotes: 'S\' N P M R S',
    audioRefs: [
      'Pandit Ravi Shankar — Vrindavani Sarang',
      'https://www.youtube.com/results?search_query=vrindavani+sarang+classical',
    ],
    verified: true,
  },
  {
    name: 'Kafi',
    thaat: 'Kafi',
    prahar: [3],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Shringara', 'Hasya'],
    ascendingNotes:  'S R g M P D n S\'',
    descendingNotes: 'S\' n D P M g R S',
    audioRefs: [
      'Pandit Kumar Gandharva — Kafi',
      'https://www.youtube.com/results?search_query=raga+kafi+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 4 — Afternoon (4th quarter of day)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Bhimpalasi',
    thaat: 'Kafi',
    prahar: [4, 5],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Karuna', 'Shringara'],
    ascendingNotes:  'S g M P n S\'',
    descendingNotes: 'S\' n D P M g R S',
    audioRefs: [
      'Pandit Bhimsen Joshi — Bhimpalasi',
      'https://www.youtube.com/results?search_query=raga+bhimpalasi+classical',
    ],
    verified: true,
  },
  {
    name: 'Bhupali',
    thaat: 'Kalyan',
    prahar: [4, 5],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Shanta'],
    ascendingNotes:  'S R G P D S\'',
    descendingNotes: 'S\' D P G R S',
    audioRefs: [
      'Kishori Amonkar — Bhupali',
      'https://www.youtube.com/results?search_query=raga+bhupali+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // SANDHI PRAKASH — DUSK  (Prahar 5, ±45 min around sunset)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Yaman',
    thaat: 'Kalyan',
    prahar: [5],
    isSandhiPrakash: true,
    sandhiType: 'dusk',
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Adbhuta'],
    ascendingNotes:  'S R G M# P D N S\'',
    descendingNotes: 'S\' N D P M# G R S',
    audioRefs: [
      'Ustad Rashid Khan — Yaman',
      'https://www.youtube.com/results?search_query=raga+yaman+classical',
    ],
    verified: true,
  },
  {
    name: 'Marwa',
    thaat: 'Marwa',
    prahar: [5],
    isSandhiPrakash: true,
    sandhiType: 'dusk',
    tetrachord: 'poorvang',
    rasa: ['Adbhuta', 'Veera', 'Bhayanak'],
    ascendingNotes:  'S r G M# D N S\'',
    descendingNotes: 'S\' N D M# G r S',
    audioRefs: [
      'Pandit Jasraj — Marwa',
      'https://www.youtube.com/results?search_query=raga+marwa+classical',
    ],
    verified: true,
  },
  {
    name: 'Puriya',
    thaat: 'Marwa',
    prahar: [5],
    isSandhiPrakash: true,
    sandhiType: 'dusk',
    tetrachord: 'poorvang',
    rasa: ['Shringara', 'Karuna'],
    ascendingNotes:  'S r G M# D N S\'',
    descendingNotes: 'S\' N D M# G r S',
    audioRefs: [
      'Ustad Amir Khan — Puriya',
      'https://www.youtube.com/results?search_query=raga+puriya+classical',
    ],
    verified: true,
  },
  {
    name: 'Shree',
    thaat: 'Purvi',
    prahar: [5],
    isSandhiPrakash: true,
    sandhiType: 'dusk',
    tetrachord: 'poorvang',
    rasa: ['Karuna', 'Veera'],
    ascendingNotes:  'S r G M# P d N S\'',
    descendingNotes: 'S\' N d P M# G r S',
    audioRefs: [
      'Pandit Bhimsen Joshi — Shree',
      'https://www.youtube.com/results?search_query=raga+shree+classical',
    ],
    verified: true,
  },
  {
    name: 'Puriya Dhanashree',
    thaat: 'Purvi',
    prahar: [5],
    isSandhiPrakash: true,
    sandhiType: 'dusk',
    tetrachord: 'poorvang',
    rasa: ['Shringara', 'Shanta'],
    ascendingNotes:  'S r G M# P d N S\'',
    descendingNotes: 'S\' N d P M# G r S',
    audioRefs: [
      'Ustad Vilayat Khan — Puriya Dhanashree',
      'https://www.youtube.com/results?search_query=puriya+dhanashree+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 5/6 — Evening (non-Sandhi, first half of night)
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Kedar',
    thaat: 'Kalyan',
    prahar: [5, 6],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Shanta'],
    ascendingNotes:  'S M G M P D S\'',
    descendingNotes: 'S\' D P M G R S',
    audioRefs: [
      'Pandit Jasraj — Kedar',
      'https://www.youtube.com/results?search_query=raga+kedar+classical',
    ],
    verified: true,
  },
  {
    name: 'Sohini',
    thaat: 'Marwa',
    prahar: [5, 6],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Karuna'],
    ascendingNotes:  'S r G M# N S\'',
    descendingNotes: 'S\' N M# G r S',
    audioRefs: [
      'Ustad Rashid Khan — Sohini',
      'https://www.youtube.com/results?search_query=raga+sohini+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 6 — First Half of Night
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Bihag',
    thaat: 'Bilawal',
    prahar: [6],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Hasya'],
    ascendingNotes:  'S G M P N S\'',
    descendingNotes: 'S\' N D P M# M G S',
    audioRefs: [
      'Pandit Bhimsen Joshi — Bihag',
      'https://www.youtube.com/results?search_query=raga+bihag+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // PRAHAR 7 — Late Night
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Darbari Kanada',
    thaat: 'Asavari',
    prahar: [7, 8],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shanta', 'Karuna', 'Veera'],
    ascendingNotes:  'S R g M P d n S\'',
    descendingNotes: 'S\' n d P M g R S',
    audioRefs: [
      'Ustad Amir Khan — Darbari Kanada (Alap)',
      'https://www.youtube.com/results?search_query=darbari+kanada+classical',
    ],
    verified: true,
  },
  {
    name: 'Bageshri',
    thaat: 'Kafi',
    prahar: [7, 8],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'poorvang',
    rasa: ['Shringara', 'Karuna'],
    ascendingNotes:  'S g M D n S\'',
    descendingNotes: 'S\' n D M g R S',
    audioRefs: [
      'Girija Devi — Bageshri Thumri',
      'https://www.youtube.com/results?search_query=raga+bageshri+classical',
    ],
    verified: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️  UNVERIFIED — excluded from recommendations until confirmed
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Yaman Kalyan',
    thaat: 'Kalyan',
    prahar: [5, 6],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara'],
    ascendingNotes:  'S R G M M# P D N S\'',
    descendingNotes: 'S\' N D P M G R S',
    audioRefs: [],
    verified: false,
    verifyNote:
      'Prahar placement disputed: some sources place with Yaman (dusk), others in first half of night. Overlap with Yaman unresolved. Exclude until source confirmed.',
  },
  {
    name: 'Hamsadhwani',
    thaat: 'Bilawal',
    prahar: [6, 7],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Adbhuta'],
    ascendingNotes:  'S R G P N S\'',
    descendingNotes: 'S\' N P G R S',
    audioRefs: [],
    verified: false,
    verifyNote:
      'Sources disagree: evening (prahar 5–6) vs first half of night (6–7). Janya of Bilawal, no komal/tivra swaras — contextualising within Bilawal thaat time range is ambiguous.',
  },
  {
    name: 'Jog',
    thaat: 'Kafi',
    prahar: [7, 8],
    isSandhiPrakash: false,
    sandhiType: null,
    tetrachord: 'uttarang',
    rasa: ['Shringara', 'Adbhuta'],
    ascendingNotes:  'S g M P n S\'',
    descendingNotes: 'S\' n D P M g S',
    audioRefs: [],
    verified: false,
    verifyNote:
      'Thaat disputed (Kafi vs Khamaj). Late-night placement broadly accepted but no single authoritative source confirms prahar 7–8 specifically.',
  },
];

module.exports = ragas;
