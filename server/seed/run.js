/**
 * seed/run.js — Seed the raga collection
 *
 * Usage:  npm run seed   (from server/)
 *
 * Idempotent: upserts by raga name, so safe to re-run.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../..', '.env') });
const mongoose = require('mongoose');
const Raga = require('../models/Raga');
const ragaData = require('./ragas');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ragachakra';

async function seed() {
  console.log(`\n🎵 RagaChakra seed script`);
  console.log(`   Connecting to: ${MONGO_URI}\n`);

  await mongoose.connect(MONGO_URI);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const raga of ragaData) {
    const result = await Raga.updateOne(
      { name: raga.name },
      { $set: raga },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      const status = raga.verified === false ? '⚠️  [UNVERIFIED]' : '✅';
      console.log(`  ${status} Inserted: ${raga.name} (Prahar ${raga.prahar.join(',')})`);
      inserted++;
    } else if (result.modifiedCount > 0) {
      console.log(`  🔄 Updated:  ${raga.name}`);
      updated++;
    } else {
      skipped++;
    }
  }

  const verifiedCount = ragaData.filter((r) => r.verified !== false).length;
  const unverifiedCount = ragaData.filter((r) => r.verified === false).length;

  console.log(`\n  ─────────────────────────────────────`);
  console.log(`  Total ragas: ${ragaData.length}`);
  console.log(`  ✅ Verified (eligible for ranking): ${verifiedCount}`);
  console.log(`  ⚠️  Unverified (excluded from ranking): ${unverifiedCount}`);
  console.log(`  Inserted: ${inserted}  Updated: ${updated}  Skipped (no change): ${skipped}`);
  console.log(`  ─────────────────────────────────────\n`);

  await mongoose.disconnect();
  console.log('Seed complete.\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
