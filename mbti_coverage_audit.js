/**
 * mbti_coverage_audit.js
 * 
 * Runs all 16 MBTI types against all 8 prahar (+ 2 sandhi windows)
 * and reports any gaps where a type gets zero recommendations.
 * 
 * Run: node mbti_coverage_audit.js
 */

const ragas = require('./server/seed/ragas.js');
const { rankRagas } = require('./server/utils/ranking.js');

const ALL_MBTI = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
];

// Build fake prahar contexts for all 8 prahars + 2 sandhi windows
const CONTEXTS = [
  { praharIndex: 1, praharName: 'Pratham Prahar',   isSandhi: false, sandhiType: null },
  { praharIndex: 1, praharName: 'Dawn Sandhi',       isSandhi: true,  sandhiType: 'dawn' },
  { praharIndex: 2, praharName: 'Dwitiya Prahar',    isSandhi: false, sandhiType: null },
  { praharIndex: 3, praharName: 'Tritiya Prahar',    isSandhi: false, sandhiType: null },
  { praharIndex: 4, praharName: 'Chaturthi Prahar',  isSandhi: false, sandhiType: null },
  { praharIndex: 5, praharName: 'Pancham Prahar',    isSandhi: false, sandhiType: null },
  { praharIndex: 5, praharName: 'Dusk Sandhi',       isSandhi: true,  sandhiType: 'dusk' },
  { praharIndex: 6, praharName: 'Shashtham Prahar',  isSandhi: false, sandhiType: null },
  { praharIndex: 7, praharName: 'Saptam Prahar',     isSandhi: false, sandhiType: null },
  { praharIndex: 8, praharName: 'Ashtam Prahar',     isSandhi: false, sandhiType: null },
];

// Add dummy ISO strings (ranking.js doesn't use them, prahar.js uses them for display only)
const ctxWithIso = CONTEXTS.map(c => ({
  ...c,
  sunriseISO: new Date().toISOString(),
  sunsetISO: new Date().toISOString(),
}));

const verifiedRagas = ragas.filter(r => r.verified !== false);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  RagaChakra — MBTI Coverage Audit (All 16 types × 10 windows)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`  Verified ragas in seed: ${verifiedRagas.length}\n`);

const failures = [];

for (const mbti of ALL_MBTI) {
  let allGood = true;
  const results = [];
  
  for (const ctx of ctxWithIso) {
    const recs = rankRagas(verifiedRagas, ctx, mbti);
    const label = ctx.isSandhi ? `${ctx.sandhiType.toUpperCase()} SANDHI` : `Prahar ${ctx.praharIndex}`;
    
    if (recs.length === 0) {
      allGood = false;
      failures.push({ mbti, ctx: label });
      results.push(`  ❌ ${label.padEnd(20)} → 0 results`);
    } else {
      results.push(`  ✅ ${label.padEnd(20)} → Top: "${recs[0].raga.name}" (score: ${recs[0].score})`);
    }
  }
  
  const status = allGood ? '✅' : '❌';
  console.log(`${status} ${mbti}`);
  for (const r of results) {
    if (r.includes('❌')) console.log(r);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (failures.length === 0) {
  console.log('  🎉 ALL 16 MBTI TYPES GET RECOMMENDATIONS IN ALL TIME WINDOWS');
} else {
  console.log(`  ⚠️  FAILURES: ${failures.length}`);
  for (const f of failures) {
    console.log(`    - ${f.mbti} has 0 results during ${f.ctx}`);
  }
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Show the top recommendation per MBTI at each prahar for a full matrix
console.log('\n  SCORE MATRIX (dusk sandhi — most used for demo)\n');
const duskCtx = ctxWithIso.find(c => c.sandhiType === 'dusk');
console.log(`  ${'MBTI'.padEnd(6)} ${'Top Raga'.padEnd(22)} Score  Rasa`);
console.log(`  ${'─'.repeat(60)}`);
for (const mbti of ALL_MBTI) {
  const recs = rankRagas(verifiedRagas, duskCtx, mbti);
  if (recs.length > 0) {
    const r = recs[0];
    console.log(`  ${mbti.padEnd(6)} ${r.raga.name.padEnd(22)} ${String(r.score).padEnd(7)} ${r.raga.rasa.join(', ')}`);
  } else {
    console.log(`  ${mbti.padEnd(6)} ${'NO RESULT'.padEnd(22)} —`);
  }
}
