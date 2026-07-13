# Scope: RagaChakra Implementation Track

## Architecture
- React frontend built with Vite, routing with React Router.
- CSS styling following the custom dark-mode design system with specified colors, glassmorphic cards, Playfair Display and Inter fonts.
- Frontend communicating with Express backend (running on port 5000) using a proxy configuration in Vite.
- MBTI stored in localStorage. Location coordinates fetched from Geolocation API or ipapi.co fallback.

## Milestones
| # | Name | Scope | Dependencies | Status | Assignee ID |
|---|------|-------|-------------|--------|-------------|
| 1 | Client Setup & Design System | Initialize Vite React client, configure router, setup design system variables, configure proxy. | None | IN_PROGRESS | be3afbb8-1af0-4dca-b6c3-fc40f3bf3af7 |
| 2 | MBTI Capture Flow | Capture 4-axis MBTI type, generate client ID, store in localStorage, call POST /api/mbti. | M1 | PLANNED | TBD |
| 3 | Geolocation & API Hook | Fetch browser location (with 5s timeout fallback to ipapi.co) and query recommendations. | M1 | PLANNED | TBD |
| 4 | Clock & Recommendations Dashboard | Visual circular prahar clock SVG, Hero Card, ranked recommendations list. | M2, M3 | PLANNED | TBD |
| 5 | Raga Detail Page | Route /raga/:id, render notes, display audio references as plain clickable links. | M1 | PLANNED | TBD |
| 6 | E2E Integration & Verification | Pass 100% of E2E tests, run adversarial testing, and verify. | M4, M5 | PLANNED | TBD |

## Interface Contracts
### Client ↔ Server API
- `POST /api/mbti`: `{ clientId, mbtiType }` -> `{ success, mbtiType }`
- `GET /api/raga/current?lat=&lng=&tz=&clientId=`: Returns recommendations array of: `{ raga: { _id, name, thaat, prahar, rasa, ascendingNotes, descendingNotes, audioRefs, isSandhiPrakash, sandhiType }, score, reasoning }`
- `GET /api/raga/:id`: Returns raga object: `{ _id, name, thaat, prahar, rasa, ascendingNotes, descendingNotes, audioRefs, isSandhiPrakash, sandhiType }`
- `GET /api/health`: `{ status: "ok" }`

## Code Layout
- Frontend client folder: `client/`
  - `src/main.jsx`
  - `src/App.jsx`
  - `src/index.css`
  - `src/components/Clock.jsx`
  - `src/components/MBTICapture.jsx`
  - `src/components/RagaCard.jsx`
  - `src/components/RagaDetail.jsx`
  - `src/hooks/useGeolocation.js`
  - `vite.config.js`
