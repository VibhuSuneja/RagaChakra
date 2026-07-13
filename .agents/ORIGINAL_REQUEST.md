# Original User Request

## Request — 2026-07-13T06:21:41Z

RagaChakra is a MERN-stack circadian raga recommendation engine that recommends a Hindustani classical raga to listen to right now, based on Samay theory (time-of-day prahar system), the user's MBTI temperament, and optionally Vedic astrology (feature-flagged off for v1). It is being built as an APM portfolio case study.

Working directory: `d:\personalmusic`
Integrity mode: `development` (no restrictions — use any approach that works)

---

## What's Already Built (do not re-create)

The server-side code is fully written and deps are installed:
- `server/models/Raga.js`, `server/models/User.js`
- `server/utils/prahar.js` (suncalc-based Samay theory engine)
- `server/utils/ranking.js` (Keirsey temperament composition ranking)
- `server/utils/prahar.test.js` (Jest unit tests)
- `server/routes/mbti.js`, `server/routes/raga.js`
- `server/seed/ragas.js` (22 ragas, 3 flagged unverified)
- `server/seed/run.js`, `server/index.js`
- Root `package.json`, `.env.example`, `.gitignore`

Server `package.json` scripts:
- `dev`: nodemon index.js
- `seed`: node seed/run.js
- `test`: jest --testPathPattern=utils/prahar.test.js --forceExit

Root `package.json` scripts:
- `dev`: concurrently runs `cd server && npm run dev` AND `cd client && npm run dev`
- `seed`: cd server && npm run seed
- `test`: cd server && npm test

**Remaining work**: React client (Vite), CSS design system, all UI components, hooks, and wiring everything together into a running demo.

---

## Requirements

### R1. Complete the React client
Build the full Vite + React frontend in `d:\personalmusic\client\` so that `npm run dev` (from root) starts both the Express server (port 5000) and the Vite dev server (port 5173) concurrently. The Vite config must proxy `/api` requests to `http://localhost:5000`.

### R2. Prahar clock + raga recommendation UI
The home screen must show: (a) a visual circular prahar clock (8 segments, current one highlighted in saffron), (b) the top recommended raga as a hero card displaying name, thaat, rasa tags, and the reasoning string (e.g. "Dawn — Sandhi Prakash · INFP (Idealist) → Shringara, Karuna"), and (c) a ranked list of up to 5 ragas for the current prahar below the hero card.

### R3. MBTI capture flow
If no MBTI type is stored in `localStorage` for the visiting user, show a 4-question forced-choice flow (one question per I/E, N/S, T/F, J/P axis) before showing recommendations. Store the result in `localStorage` (key: `ragachakra_mbti`) and POST it to `POST /api/mbti` with the body `{ clientId, mbtiType }`. The `clientId` is a UUID generated once and stored in `localStorage` (key: `ragachakra_client_id`).

### R4. Geolocation
On load, request browser geolocation. On denial or timeout (5s), fall back to `https://ipapi.co/json/` (HTTPS, no API key needed). Pass `lat`, `lng`, `tz` (IANA timezone), and `clientId` as query params to `GET /api/raga/current`.

### R5. Raga detail page
Clicking any raga card navigates to `/raga/:id` showing: full name, thaat, rasa tags, ascending/descending notes in sargam notation, and audio references as plain clickable anchor tags that open in a new tab. No YouTube/SoundCloud embeds — only plain text links.

### R6. Design system
Dark-mode design using these exact tokens:
- Background: `#0D0B2B` (deep indigo)
- Accent: `#E8890C` (saffron)
- Text primary: `#F5F0E8` (ivory)
- Text muted: `#9B96B0`
- Card background: `rgba(255,255,255,0.05)` with `backdrop-filter: blur(12px)` (glassmorphism)
- Fonts: `Playfair Display` (headings) + `Inter` (body) from Google Fonts
- Micro-animations: hover lift on cards (translateY -4px), smooth fade-in on page load
- Mobile responsive down to 375px — no horizontal overflow

---

## Acceptance Criteria

### App starts and loads
- [ ] `npm install` at root installs concurrently
- [ ] `npm run seed` (from root) populates MongoDB with ragas successfully
- [ ] `npm run dev` starts both server (port 5000) and client (port 5173) without errors
- [ ] `GET http://localhost:5000/api/health` returns `{"status":"ok",...}`
- [ ] Browser at `http://localhost:5173` loads without console errors

### Prahar logic is correct
- [ ] `npm test` (run from `server/` directory) passes all prahar.test.js tests
- [ ] At IST ~11:50 AM (Prahar 2 in Delhi), `GET /api/raga/current?lat=28.6139&lng=77.209&tz=Asia%2FKolkata` returns ragas from Prahar 2 (Asavari, Todi) — NOT dusk or night ragas

### MBTI flow
- [ ] On first visit (no localStorage), MBTI capture screen shows before recommendations
- [ ] After completing 4 questions, `POST /api/mbti` is called with a valid 4-letter MBTI type
- [ ] On second visit (localStorage has clientId + mbtiType), MBTI screen is skipped
- [ ] Reasoning string on raga card includes the MBTI type and temperament name

### UI completeness
- [ ] Prahar clock SVG renders with current prahar segment highlighted in saffron
- [ ] Hero raga card shows: raga name, thaat, at least one rasa tag, and reasoning text
- [ ] Raga detail page (`/raga/:id`) renders sargam notes and at least one audio ref as a clickable link
- [ ] Layout is functional at 375px width (no horizontal overflow, text readable)

### Scope guardrails
- [ ] No audio embedding (no YouTube/SoundCloud iframes or embeds)
- [ ] No astrology UI visible (feature flag is off)
- [ ] No social or gamification features added
