/**
 * client/src/data/demoData.js
 *
 * Single source of truth for all demo/fallback data.
 * Used by:
 *   - Demo Mode cinematic flow
 *   - API fetch fallbacks in Dashboard, RagaDetail
 *   - Server GET /api/raga/demo
 *
 * 3 pre-baked scenarios — crafted for maximum judge impact:
 *   1. "overwhelmed" — Evening INFP (most emotionally resonant)
 *   2. "focus"       — Morning INTJ
 *   3. "calm"        — Late night ENFJ
 */

export const DEMO_SCENARIOS = {
  overwhelmed: {
    mood: 'overwhelmed',
    mbti: 'INFP',
    localTimeStr: '06:42 PM',
    praharContext: {
      praharIndex: 5,
      praharName: 'Pancham Prahar',
      isSandhi: true,
      sandhiType: 'dusk',
    },
    recommendation: {
      raga: {
        _id: 'demo-yaman-id',
        name: 'Yaman',
        thaat: 'Kalyan',
        prahar: [5],
        rasa: ['Shringara', 'Shanta'],
        ascendingNotes: "S R G M# P D N S'",
        descendingNotes: "S' N D P M# G R S",
        isSandhiPrakash: false,
        audioRefs: ['https://www.youtube.com/results?search_query=raga+yaman+classical'],
      },
      confidence: 92,
      whyBullets: [
        "It's dusk — Yaman's natural home",
        "Your overwhelmed mood calls for profound stillness — Yaman's Shanta Rasa delivers this",
        "Kalyan Thaat — the great evening parent scale",
      ],
      geminiReasoning: "When the world feels too heavy, Yaman's evening light carries it gently away.",
      ritual: [
        { step: 1, duration: '2 min', instruction: 'Find somewhere quiet. Close your eyes. Feel your breath slow.' },
        { step: 2, duration: '15 min', instruction: "Listen to Yaman's Alap. Don't analyze — just receive." },
        { step: 3, duration: '5 min', instruction: 'One question: What shifted inside?' },
        { step: 4, duration: 'tomorrow', instruction: "Tomorrow we'll introduce Bageshri — a gentler cousin." },
      ],
      reflectionQuestion: "What did Yaman bring to the surface?",
      tomorrowPreview: "Bageshri — it shares Yaman's stillness but carries a softer longing.",
    },
    alternative: {
      raga: {
        _id: 'demo-bhupali-id',
        name: 'Bhupali',
        thaat: 'Kalyan',
        prahar: [4, 5],
        rasa: ['Shringara', 'Shanta'],
      },
      reason: "A pentatonic simplicity — Bhupali removes complexity, leaving only beauty.",
      confidence: 78,
    },
  },

  focus: {
    mood: 'focus',
    mbti: 'INTJ',
    localTimeStr: '07:15 AM',
    praharContext: {
      praharIndex: 1,
      praharName: 'Pratham Prahar',
      isSandhi: true,
      sandhiType: 'dawn',
    },
    recommendation: {
      raga: {
        _id: 'demo-bhairav-id',
        name: 'Bhairav',
        thaat: 'Bhairav',
        prahar: [1],
        rasa: ['Veera', 'Shanta'],
        ascendingNotes: "S r G M P d N S'",
        descendingNotes: "S' N d P M G r S",
        isSandhiPrakash: true,
        sandhiType: 'dawn',
        audioRefs: ['https://www.youtube.com/results?search_query=raga+bhairav+morning'],
      },
      confidence: 96,
      whyBullets: [
        "Dawn Sandhi Prakash — Bhairav exists only in this window",
        "Your focus state matches Veera Rasa — heroic resolve and clarity",
        "Bhairav Thaat — the most dignified of morning scales",
        "A rare Sandhi Prakash raga, performing only at this exact solar threshold",
      ],
      geminiReasoning: "At the moment the world awakens, Bhairav gives the mind a spine.",
      ritual: [
        { step: 1, duration: '3 min', instruction: 'Stand at a window. Watch the light change.' },
        { step: 2, duration: '20 min', instruction: "Listen to Bhairav's Alap before looking at any screen." },
        { step: 3, duration: '5 min', instruction: 'Write one intention for today.' },
        { step: 4, duration: 'tomorrow', instruction: "Tomorrow: Todi — the mind made introspective." },
      ],
      reflectionQuestion: "What clarity arrived this morning?",
      tomorrowPreview: "Todi — where Bhairav's discipline becomes Todi's deep inquiry.",
    },
    alternative: null,
  },

  calm: {
    mood: 'calm',
    mbti: 'ENFJ',
    localTimeStr: '10:30 PM',
    praharContext: {
      praharIndex: 8,
      praharName: 'Ashtam Prahar',
      isSandhi: false,
      sandhiType: null,
    },
    recommendation: {
      raga: {
        _id: 'demo-malkauns-id',
        name: 'Malkauns',
        thaat: 'Bhairavi',
        prahar: [8],
        rasa: ['Veera', 'Shanta'],
        ascendingNotes: 'S g M d n S',
        descendingNotes: "S' n d M g S",
        isSandhiPrakash: false,
        audioRefs: ['https://www.youtube.com/results?search_query=raga+malkauns+classical'],
      },
      confidence: 88,
      whyBullets: [
        "Midnight is Malkauns's only home — profound and rare",
        "Your calm state deepens with Shanta Rasa — stillness meeting stillness",
        "Bhairavi Thaat — the scale of late-night devotion",
      ],
      geminiReasoning: "Malkauns doesn't ask for your attention — it takes it completely.",
      ritual: [
        { step: 1, duration: '2 min', instruction: 'Dim your lights. No phone.' },
        { step: 2, duration: '20 min', instruction: "Let Malkauns fill the silence. No multitasking." },
        { step: 3, duration: '5 min', instruction: 'What are you grateful for tonight?' },
        { step: 4, duration: 'tomorrow', instruction: "Tomorrow morning: Bhairav — to greet the day with equal depth." },
      ],
      reflectionQuestion: "What did the silence say?",
      tomorrowPreview: "Bhairav at dawn — continuity from the night into the morning.",
    },
    alternative: {
      raga: {
        _id: 'demo-darbari-id',
        name: 'Darbari Kanada',
        thaat: 'Asavari',
        prahar: [8],
        rasa: ['Karuna', 'Shanta'],
      },
      reason: "Darbari trades Malkauns's mystery for compassion — a softer gravity.",
      confidence: 74,
    },
  },
};

// Default scenario for demo mode
export const DEFAULT_DEMO_SCENARIO = DEMO_SCENARIOS.overwhelmed;

// Flat list of ragas used across all demos (for explore/discover pages)
export const DEMO_RAGAS = [
  DEMO_SCENARIOS.overwhelmed.recommendation.raga,
  DEMO_SCENARIOS.overwhelmed.alternative.raga,
  DEMO_SCENARIOS.focus.recommendation.raga,
  DEMO_SCENARIOS.calm.recommendation.raga,
  DEMO_SCENARIOS.calm.alternative.raga,
];

// Demo listening history — for the AI Memory Timeline
export const DEMO_HISTORY = [
  {
    ragaId: 'demo-bhairav-id',
    ragaName: 'Bhairav',
    mood: 'focus',
    aiSummary: 'The morning found clarity it was searching for.',
    listenedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
  {
    ragaId: 'demo-yaman-id',
    ragaName: 'Yaman',
    mood: 'anxious',
    aiSummary: 'Anxiety gave way to something quieter by the end.',
    listenedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    ragaId: 'demo-malkauns-id',
    ragaName: 'Malkauns',
    mood: 'calm',
    aiSummary: 'A rare complete stillness — midnight well spent.',
    listenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    ragaId: 'demo-yaman-id',
    ragaName: 'Yaman',
    mood: 'overwhelmed',
    aiSummary: 'You returned to Yaman. It already knew you.',
    patternDetected: 'You return to Yaman when the world feels heavy. Let\'s make that intentional.',
    listenedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
