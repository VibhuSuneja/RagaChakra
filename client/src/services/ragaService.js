/**
 * services/ragaService.js
 * All API calls to the RagaChakra backend.
 * Uses VITE_API_URL env var for deployment, empty string for local dev.
 */

const BASE = (() => {
  const raw = import.meta.env.VITE_API_URL || '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
})();

const getClientId = () => {
  let id = localStorage.getItem('ragachakra_client_id');
  if (!id) {
    // Generate a simple UUID-like ID for anonymous identity
    id = 'rc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('ragachakra_client_id', id);
  }
  return id;
};

// ── POST /api/raga/recommend — Hybrid AI recommendation ───────────────────
export async function fetchRecommendation({ lat, lng, tz, mood } = {}) {
  const res = await fetch(`${BASE}/api/raga/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: lat ?? 28.6139,
      lng: lng ?? 77.2090,
      tz: tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      clientId: getClientId(),
      mood: mood || null,
    }),
  });
  if (!res.ok) throw new Error(`Recommendation failed: ${res.status}`);
  return res.json();
}

// ── POST /api/raga/reflect — Process reflection through Gemini ────────────
export async function submitReflection({ ragaId, ragaName, reflectionText, mood }) {
  const res = await fetch(`${BASE}/api/raga/reflect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ragaId,
      ragaName,
      reflectionText,
      mood,
      clientId: getClientId(),
    }),
  });
  if (!res.ok) throw new Error(`Reflection failed: ${res.status}`);
  return res.json();
}

// ── GET /api/raga/current — Legacy endpoint (still works) ─────────────────
export async function fetchCurrentRaga(lat, lng, tz, clientId) {
  const params = new URLSearchParams({ lat, lng, tz: tz || '', clientId: clientId || '' });
  const res = await fetch(`${BASE}/api/raga/current?${params}`);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// ── GET /api/raga/:id ─────────────────────────────────────────────────────
export async function fetchRagaById(id) {
  const res = await fetch(`${BASE}/api/raga/${id}`);
  if (!res.ok) throw new Error(`Raga not found: ${res.status}`);
  return res.json();
}

// ── POST /api/mbti — Save MBTI type ──────────────────────────────────────
export async function saveMbti(mbtiType, { lat, lng, timezone } = {}) {
  const res = await fetch(`${BASE}/api/mbti`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: getClientId(),
      mbtiType,
      lat, lng, timezone,
    }),
  });
  if (!res.ok) throw new Error(`MBTI save failed: ${res.status}`);
  return res.json();
}

// ── GET /api/health ───────────────────────────────────────────────────────
export async function fetchHealth() {
  const res = await fetch(`${BASE}/api/health`);
  return res.json();
}
