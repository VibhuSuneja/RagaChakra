const mongoose = require('mongoose');

const VALID_RASAS = [
  'Shringara', 'Hasya', 'Karuna', 'Raudra',
  'Veera', 'Bhayanak', 'Bibhatsa', 'Adbhuta', 'Shanta',
];

const VALID_MBTI = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
];

const RagaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    thaat: { type: String, required: true, trim: true },

    // Array of prahar indices (1–8) when this raga is traditionally performed.
    // A raga may span multiple prahars.
    prahar: {
      type: [{ type: Number, min: 1, max: 8 }],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one prahar index required.',
      },
    },

    // Sandhi Prakash: true if the raga is specifically tied to the
    // dawn/dusk transition window (not a general prahar assignment).
    isSandhiPrakash: { type: Boolean, default: false },
    sandhiType: {
      type: String,
      enum: ['dawn', 'dusk', null],
      default: null,
    },

    // Poorvang (lower Sa–Ma tetrachord) or Uttarang (upper Ma–Sa tetrachord).
    // Poorvang ragas dominate the day; Uttarang dominate the night.
    // Source: Bhatkhande's thaat classification.
    tetrachord: {
      type: String,
      enum: ['poorvang', 'uttarang', 'both'],
      default: 'both',
    },

    // Navarasa tags — only from the verified enum above.
    rasa: {
      type: [{ type: String, enum: VALID_RASAS }],
      default: [],
    },

    // Sargam notation (e.g. "S R G M P D N S'")
    ascendingNotes:  { type: String, default: '' },
    descendingNotes: { type: String, default: '' },

    /**
     * MBTI affinity — weights derived compositionally from Keirsey temperament.
     * These are computed at runtime by ranking.js; this field stores any
     * hand-overrides for specific type-raga pairs only.
     *
     * TODO (Post-MVP): Populate specific overrides once research team
     * provides validated pair data. Currently unused in ranking; ranking.js
     * computes weights algorithmically.
     */
    mbtiAffinity: [
      {
        type: { type: String, enum: VALID_MBTI },
        weight: { type: Number, min: 0, max: 1 },
      },
    ],

    /**
     * Nakshatra affinity — FEATURE FLAGGED (ASTRO_ENABLED).
     * Seeded as empty []. Do not populate until validated Jyotish sources
     * are reviewed by a domain expert.
     *
     * TODO: Supply nakshatra → raga affinity data from Jyotish sources.
     */
    nakshatraAffinity: [
      {
        nakshatra: { type: String },
        weight: { type: Number, min: 0, max: 1 },
      },
    ],

    /**
     * Audio references — plain citation strings or search URLs.
     * No embed APIs in MVP (avoids ToS/licensing complications).
     * Format: "Artist — Recording label (Year)" or search URL.
     */
    audioRefs: [{ type: String }],

    // Seed data provenance flag.
    // If false, this raga is excluded from all recommendations until
    // the prahar assignment is verified against authoritative sources.
    verified: { type: Boolean, default: true },
    verifyNote: { type: String, default: '' },
  },
  { timestamps: true }
);

RagaSchema.index({ prahar: 1, isSandhiPrakash: 1 });

module.exports = mongoose.model('Raga', RagaSchema);
