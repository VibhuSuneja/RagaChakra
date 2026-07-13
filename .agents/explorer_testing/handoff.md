# RagaChakra E2E Testing Strategy & Handoff Report

This document outlines the design and plan for implementing end-to-end (E2E) testing for the RagaChakra application using Playwright. It includes the required dependencies, the configuration structure, mock data templates, and a catalog of 62 test cases spanning Tiers 1–4.

---

## 1. Playwright Installation & Configuration Plan

### Packages to Install
The testing suite requires installing the Playwright test runner as a development dependency at the project root:
```bash
npm install --save-dev @playwright/test
npx playwright install --with-deps
```

### Proposed `playwright.config.js`
Create this file in the root directory (`d:\personalmusic\playwright.config.js`) to configure dev server startup, parallel execution parameters, and browser test matrices.

```javascript
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    /* Desktop Web Browsers */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Mobile Responsive Viewport (Acceptance Criteria Requirement: 375px width) */
    {
      name: 'Mobile Chrome (iPhone SE Viewport)',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
      },
    },
  ],
  /* Concurrently spin up the client dev server and API server if not already running */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 2. Mock Data Templates

To run tests in complete isolation, mock data templates are designed to mock the backend endpoints (`GET /api/raga/current`, `GET /api/raga/:id`, and `POST /api/mbti`) and external location fetches (`ipapi.co`).

### A. Mock Current Recommendations (`GET /api/raga/current`)
#### Morning Prahar 1 & 2 Template (Bhairav & Bhairavi)
```json
{
  "localTimeStr": "07:30 AM",
  "praharContext": {
    "praharIndex": 1,
    "praharName": "Pratham Prahar",
    "isSandhi": true,
    "sandhiType": "dawn",
    "sunriseISO": "2026-07-13T00:30:00.000Z",
    "sunsetISO": "2026-07-13T13:45:00.000Z"
  },
  "mbtiType": "INFP",
  "recommendations": [
    {
      "raga": {
        "_id": "60c72b2f9b1d8b2d88888801",
        "name": "Bhairav",
        "thaat": "Bhairav",
        "prahar": [1],
        "isSandhiPrakash": true,
        "sandhiType": "dawn",
        "tetrachord": "poorvang",
        "rasa": ["Shanta", "Karuna"],
        "ascendingNotes": "S r G M P d N S'",
        "descendingNotes": "S' N d P M G r S",
        "audioRefs": [
          "Pandit Jasraj — Bhairav (Morning Concert)",
          "https://www.youtube.com/results?search_query=raga+bhairav+classical"
        ],
        "verified": true
      },
      "score": 0.700,
      "reasoning": "Dawn — Sandhi Prakash · INFP (Idealist) → Shanta, Karuna"
    },
    {
      "raga": {
        "_id": "60c72b2f9b1d8b2d88888802",
        "name": "Bhairavi",
        "thaat": "Bhairavi",
        "prahar": [1, 2],
        "isSandhiPrakash": false,
        "sandhiType": null,
        "tetrachord": "poorvang",
        "rasa": ["Karuna", "Shringara"],
        "ascendingNotes": "S r g M P d n S'",
        "descendingNotes": "S' n d P M g r S",
        "audioRefs": [
          "Ustad Bade Ghulam Ali Khan — Bhairavi Thumri",
          "https://www.youtube.com/results?search_query=raga+bhairavi+classical"
        ],
        "verified": true
      },
      "score": 0.650,
      "reasoning": "Pratham Prahar · INFP (Idealist) → Karuna, Shringara"
    }
  ],
  "astroEnabled": false
}
```

### B. Mock Raga Details (`GET /api/raga/:id`)
```json
{
  "_id": "60c72b2f9b1d8b2d88888801",
  "name": "Bhairav",
  "thaat": "Bhairav",
  "prahar": [1],
  "isSandhiPrakash": true,
  "sandhiType": "dawn",
  "tetrachord": "poorvang",
  "rasa": ["Shanta", "Karuna"],
  "ascendingNotes": "S r G M P d N S'",
  "descendingNotes": "S' N d P M G r S",
  "audioRefs": [
    "Pandit Jasraj — Bhairav (Morning Concert)",
    "https://www.youtube.com/results?search_query=raga+bhairav+classical"
  ],
  "verified": true
}
```

### C. Mock Geolocation Fallback (`https://ipapi.co/json/`)
```json
{
  "ip": "103.45.201.22",
  "city": "Mumbai",
  "region": "Maharashtra",
  "country_name": "India",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "timezone": "Asia/Kolkata"
}
```

### D. Mock MBTI Submission (`POST /api/mbti`)
```json
{
  "success": true,
  "mbtiType": "INFP"
}
```

---

## 3. Playwright Test Case Catalog (62 Cases)

### Tier 1: Feature Coverage (25 Cases — 5 Per Feature)

#### Feature 1: Client Setup & App Loading (T1-F1)
*   **T1-F1-01**: Verify that the application home page loads successfully without any unhandled JavaScript console errors.
*   **T1-F1-02**: Check that the theme styling elements are correct (page background color is exactly `#0D0B2B`, and text color is ivory `#F5F0E8`).
*   **T1-F1-03**: Verify that the client initiates a request to the backend `/api/health` health check endpoint upon startup.
*   **T1-F1-04**: Confirm that the card elements utilize the required glassmorphic properties (`background-color: rgba(255,255,255,0.05)` and `backdrop-filter: blur(12px)`).
*   **T1-F1-05**: Check that the custom fonts (`Playfair Display` for headers and `Inter` for body text) are declared and imported.

#### Feature 2: MBTI Capture Flow (T1-F2)
*   **T1-F2-01**: Verify that if the user visits with an empty `localStorage`, the recommendations dashboard is hidden and the MBTI questionnaire screen is shown.
*   **T1-F2-02**: Check that the user is forced to answer exactly 4 binary-choice questions mapping the 4 temperament axes (I/E, N/S, T/F, J/P).
*   **T1-F2-03**: Verify that completing the questionnaire writes the resulting MBTI string (e.g. `INFP`) to `localStorage` under the key `ragachakra_mbti`.
*   **T1-F2-04**: Verify that completing the flow generates a random UUID client ID and writes it to `localStorage` under `ragachakra_client_id`.
*   **T1-F2-05**: Check that on a subsequent visit (where `ragachakra_mbti` and `ragachakra_client_id` exist), the MBTI questionnaire is skipped and the recommendations dashboard displays directly.

#### Feature 3: Geolocation & API Hook (T1-F3)
*   **T1-F3-01**: Verify that browser location coordinates are requested and mock coordinates (e.g. `28.6139`, `77.2090`) are successfully read by the frontend application.
*   **T1-F3-02**: Verify that when browser geolocation is denied, the application falls back to querying `https://ipapi.co/json/`.
*   **T1-F3-03**: Verify that the recommendation dashboard calls the backend endpoint `GET /api/raga/current` with query parameters `lat`, `lng`, `tz`, and `clientId`.
*   **T1-F3-04**: Verify that the user's current timezone string (e.g., `Asia/Kolkata`) is dynamically determined and sent as `tz` in the recommendation fetch query.
*   **T1-F3-05**: Verify that when location coordinates change, the application triggers a fresh recommendation API query.

#### Feature 4: Clock & Recommendations Dashboard (T1-F4)
*   **T1-F4-01**: Verify that the circular Prahar Clock SVG renders correctly in the DOM and contains 8 distinct segments.
*   **T1-F4-02**: Check that the segment matching the current prahar is highlighted in saffron `#E8890C`.
*   **T1-F4-03**: Verify that the top recommended raga is displayed in a Hero Card with its name, thaat, rasa tags, and the correct composition reasoning string.
*   **T1-F4-04**: Verify that up to 5 recommended ragas are listed in descending rank order below the Hero Card.
*   **T1-F4-05**: Verify that the reasoning text on the Hero Card correctly reflects the user's MBTI type and Keirsey temperament name (e.g., `INFP (Idealist)`).

#### Feature 5: Raga Detail Page (T1-F5)
*   **T1-F5-01**: Verify that clicking a recommended raga card routes the browser to `/raga/:id`.
*   **T1-F5-02**: Verify that the detail page displays the selected raga's name, thaat, and rasa tags.
*   **T1-F5-03**: Verify that the raga's ascending and descending notes are displayed correctly in sargam notation.
*   **T1-F5-04**: Verify that audio references are displayed strictly as plain-text links with `target="_blank"`.
*   **T1-F5-05**: Verify that the detail page has a functioning "Back to Dashboard" button that restores the previous home screen state.

---

### Tier 2: Boundary & Corner Cases (25 Cases — 5 Per Feature)

#### Feature 1: Client Setup & App Loading (T2-F1)
*   **T2-F1-01**: Mobile responsiveness test: load the homepage at `375px` viewport width and verify that there is no horizontal scrollbar or cropped text.
*   **T2-F1-02**: Tablet layout test: load the homepage at `768px` viewport width and verify that grid columns wrap elegantly without breaking container alignment.
*   **T2-F1-03**: Mock server connection offline: verify that if `/api/health` fails to load, a clear user-facing error message or banner is displayed.
*   **T2-F1-04**: Mock a slow network connection (5-second latency on initial assets) and verify that loading states or skeleton cards are displayed.
*   **T2-F1-05**: Catch rendering crashes: verify that React Error Boundary catches unexpected element crashes and displays a clean fallback UI rather than a white screen.

#### Feature 2: MBTI Capture Flow (T2-F2)
*   **T2-F2-01**: Corrupt storage validation: inject an invalid MBTI type (e.g. `ragachakra_mbti = "XYZ"`) into `localStorage` and verify that the app resets the storage and prompts the user to retake the questionnaire.
*   **T2-F2-02**: Submitting questionnaire with API failure: mock a `500 Server Error` on `POST /api/mbti`. Verify that the UI displays a warning but proceeds to show recommendations in fallback mode (failing gracefully).
*   **T2-F2-03**: Form validation constraint: verify that the user cannot click the "Next" button in the wizard without checking a radio option for the active question.
*   **T2-F2-04**: Interrupted session behavior: answer only 2 out of 4 questions, refresh the browser, and verify that the questionnaire resets back to question 1 to prevent incomplete state storage.
*   **T2-F2-05**: Cyber security validation (XSS attempt): inject a script tag into `ragachakra_client_id` in `localStorage` (e.g. `<script>alert(1)</script>`) and verify that the app sanitizes it and does not execute the script in the DOM.

#### Feature 3: Geolocation & API Hook (T2-F3)
*   **T2-F3-01**: Geolocation API Timeout: mock browser geolocation to hang. Verify that after exactly 5 seconds, the client times out and falls back to `ipapi.co` successfully.
*   **T2-F3-02**: Double Geolocation failure: mock both browser location deny AND `ipapi.co` API failure. Verify that the app falls back to default coordinates (Delhi: `28.6139`, `77.2090`) and alerts the user with a fallback notification.
*   **T2-F3-03**: Recommendation endpoint 500 error: mock a `500` error on `GET /api/raga/current`. Verify that the dashboard displays an error alert with a functional "Try Again" retry button.
*   **T2-F3-04**: Extreme latitude verification: mock browser location coordinates at the North Pole (`90.0000`, `0.0000`). Verify that the application doesn't crash and handles the solar time calculation gracefully.
*   **T2-F3-05**: API latency boundary: mock a 4-second delay on the recommendations request. Verify that a loader skeleton is displayed until the response arrives.

#### Feature 4: Clock & Recommendations Dashboard (T2-F4)
*   **T2-F4-01**: Empty recommendations response: mock the current recommendations endpoint to return an empty array. Verify that the dashboard renders a friendly "No matching ragas for this period" message.
*   **T2-F4-02**: Extreme timezone offsets: mock a query timezone of UTC-11 or UTC+14 and verify that local clock calculations format the hours correctly without negative bounds.
*   **T2-F4-03**: Astrology flag off check: confirm that when the recommendation payload returns `astroEnabled: false`, no Vedic reranking options or horoscope elements are visible.
*   **T2-F4-04**: Astrology flag on check: mock `astroEnabled: true` in the recommendations payload and verify that the UI renders a corresponding status badge.
*   **T2-F4-05**: Extreme text length safety: mock a raga with an excessively long name (100+ characters) and verify that the grid items resize gracefully without causing horizontal scrollbars or breaking cards.

#### Feature 5: Raga Detail Page (T2-F5)
*   **T2-F5-01**: Direct URL navigation to an invalid Raga ID: navigate to `/raga/does-not-exist`. Verify that the client displays a 404 raga error page with an easy route back to the dashboard.
*   **T2-F5-02**: Raga with missing audio links: mock the detail page response to return an empty `audioRefs` array. Verify that the page shows a "No audio references available" placeholder.
*   **T2-F5-03**: Strictly plain text links verification: scan the detail page DOM to verify that no YouTube, SoundCloud, or third-party iframe embeds are present (complying with scope guardrails).
*   **T2-F5-04**: Malicious audio links validation: mock an audio link with `javascript:alert(1)` as its href. Verify that the detail page sanitizes or ignores non-http/https protocols.
*   **T2-F5-05**: Sargam notes layout test: mock empty ascending/descending notes fields and verify that the detail layout displays placeholder values instead of crashing.

---

### Tier 3: Cross-Feature Interactions (6 Cases)

*   **T3-01: MBTI Retake and Recommendation Sync**
    *   *Preconditions*: User has initial MBTI stored (`INFP`) and is viewing recommendations.
    *   *Actions*: Click "Retake MBTI" or "Edit Profile", complete the wizard selecting options that yield `ISTJ` (Guardian).
    *   *Expected*: `localStorage` updates, `POST /api/mbti` fires, and the dashboard recommendations instantly re-fetch and update to show ragas suited for the `ISTJ` temperament.
*   **T3-02: Circadian clock boundary transition updates dashboard**
    *   *Preconditions*: Client is loaded and displaying recommendations.
    *   *Actions*: Advance the mock browser system clock across a prahar threshold (e.g. from 17:30 Prahar 4 to 18:30 Dusk Sandhi Prakash).
    *   *Expected*: The SVG clock highlights the new dusk segment, a fresh request to `/api/raga/current` is triggered, and recommendations update to show dusk ragas like Yaman or Marwa.
*   **T3-03: Navigating to Detail and Back preserves state**
    *   *Preconditions*: MBTI questionnaire completed (`INTJ`), browser geolocation allowed, and recommendations loaded on home screen.
    *   *Actions*: Click a recommended Raga card to navigate to `/raga/:id`, inspect notes, then click the "Back" button to return.
    *   *Expected*: The home page loads immediately without displaying the MBTI flow again, the geolocation coordinates are cached, and recommendations load for `INTJ` instantly.
*   **T3-04: Geolocation prompts during MBTI wizard does not freeze flow**
    *   *Preconditions*: User visits application for the first time.
    *   *Actions*: Trigger browser geolocation popup while the user is actively answering Question 2 of the MBTI wizard. Deny location permissions.
    *   *Expected*: The location request falls back to `ipapi.co` in the background, and the user is allowed to complete the questionnaire without any wizard interface lockups or errors.
*   **T3-05: Timezone mismatch adjustments**
    *   *Preconditions*: Browser location coordinates are set to Tokyo (`35.6762`, `139.6503`), but browser timezone is set to `Asia/Kolkata`.
    *   *Actions*: Load recommendations dashboard.
    *   *Expected*: The app correctly prioritizes the geolocation coordinates and passes `tz=Asia/Kolkata` to calculate solar times, showing Tokyo-aligned recommendations mapped to Indian standard local time formatting.
*   **T3-06: Database reload triggers state validation**
    *   *Preconditions*: User has logged in and completed MBTI.
    *   *Actions*: Clear cookies but keep `localStorage`. Perform a page reload.
    *   *Expected*: Client identifies the client UUID in `localStorage`, skips the MBTI flow, fetches location, and displays recommended ragas correctly.

---

### Tier 4: Real-World Workloads (6 Cases)

*   **T4-01: The First-Time User E2E Journey**
    *   *Preconditions*: Clean session (no localStorage, fresh database).
    *   *Actions*:
        1. Navigate to `http://localhost:5173`.
        2. Accept browser geolocation (mocked to New Delhi: `28.6139`, `77.2090`).
        3. Complete the MBTI quiz (select choices mapping to `INFP`).
        4. Verify that `POST /api/mbti` and `GET /api/raga/current` requests are made.
        5. Verify that the circular clock is highlighted and recommendations display.
        6. Click the top raga card (e.g. Yaman) to open the details view.
        7. Inspect sargam notes and click the plain text link.
        8. Click "Back" to verify home page recommendations reload.
*   **T4-02: Returning User Session (Instant Recommendations)**
    *   *Preconditions*: `localStorage` contains `ragachakra_mbti = "INTJ"` and `ragachakra_client_id = "uuid-987654"`.
    *   *Actions*:
        1. Open `http://localhost:5173`.
        2. Verify the MBTI questionnaire is completely skipped.
        3. Allow geolocation coordinates to load.
        4. Confirm recommendations are requested immediately and rendered for `INTJ`.
*   **T4-03: Dual-Failure Offline Resilience Scenario**
    *   *Preconditions*: Geolocation permission blocked, `ipapi.co` mock fails with 500 error.
    *   *Actions*:
        1. Load application.
        2. Verify that the app falls back to default coordinates (Delhi).
        3. Complete MBTI.
        4. Disconnect network connectivity (simulate offline mode in browser).
        5. Click on an already loaded raga card.
        6. Verify that the app displays a "Cached Mode — Offline" warning, allows checking notes on the detail page, but disables external audio links with an explanatory tooltip.
*   **T4-04: Full 24-Hour Solar Cycle Simulation**
    *   *Preconditions*: App is loaded and kept open in a browser instance.
    *   *Actions*:
        1. Mock system time to 5:30 AM (Dawn Sandhi Prakash). Verify clock displays Dawn and recommends Bhairav.
        2. Advance time to 8:30 AM (Prahar 1). Verify clock highlights Pratham Prahar and recommends Bhairavi.
        3. Advance time to 11:30 AM (Prahar 2). Verify clock highlights Dwitiya Prahar and recommends Asavari/Todi.
        4. Advance time to 3:00 PM (Prahar 4). Verify clock highlights Chaturthi Prahar and recommends Bhimpalasi.
        5. Advance time to 6:30 PM (Dusk Sandhi Prakash). Verify clock highlights Dusk and recommends Yaman.
        6. Advance time to 11:00 PM (Prahar 7). Verify clock highlights Saptam Prahar and recommends Darbari Kanada.
    *   *Expected*: The clock segment transitions automatically and the recommendations re-fetch matching ragas for each phase without crashes.
*   **T4-05: Rapid User Input Stress & Race Condition Resiliency**
    *   *Preconditions*: Clean session.
    *   *Actions*:
        1. Navigate to the page.
        2. Double-click MBTI wizard choices rapidly.
        3. Trigger geolocation request and toggle internet connection from online to offline to online within 2 seconds.
        4. Click multiple cards in the recommended list simultaneously.
    *   *Expected*: The application queue manages requests sequentially, does not fire duplicate requests, does not crash the React engine, and resolves to a valid state.
*   **T4-06: Database seeding integrity integration check**
    *   *Preconditions*: Running local MongoDB instance.
    *   *Actions*:
        1. Run `npm run seed` command from the root shell.
        2. Verify seed script outputs successful insertion logs.
        3. Launch the client and verify that the current recommendations match the seeded data (e.g. Bhairav for morning, Yaman for evening) without manual overrides.

---

## 4. Handoff Report Sections

### 1. Observation
- **Root Directory Structure**:
  - Contains `.agents/` folder, `server/` folder, `PROJECT.md`, `TEST_INFRA.md`, and `package.json`.
  - The `client/` folder does not exist yet (to be built by the Implementer agent).
- **Backend Setup**:
  - `server/package.json` includes dependencies like `express`, `mongoose`, `suncalc`, and `cors`, and devDependencies like `jest` and `nodemon`.
  - `server/routes/mbti.js` expects `clientId` and `mbtiType` on body payload, and optionally reads `lat`/`lng`/`timezone`. It uses `User.findOneAndUpdate` to store or update users.
  - `server/routes/raga.js` computes recommended ragas based on solar times (via `suncalc`) and MBTI temperament rankings (derived compositionally using Keirsey temperaments NT, NF, SJ, SP).
  - Seed file `server/seed/ragas.js` seeds 22 ragas, including 3 unverified ragas (`Yaman Kalyan`, `Hamsadhwani`, `Jog`) that should be filtered out by the recommendation engine.

### 2. Logic Chain
- Since the client React application is not yet built, the testing strategy must serve as a design contract.
- Playwright was chosen as the E2E framework because it easily supports:
  - Network interception via `page.route` to mock APIs (`/api/raga/current`, `/api/mbti`, etc.) allowing repeatable testing without real DB queries.
  - Viewport overrides (`375px`) to test mobile responsiveness.
  - Timezone/geolocation simulation directly in the browser context configuration.
- To cover the five distinct features under happy paths (Tier 1) and boundaries (Tier 2), we mapped 5 cases to each feature in each tier (50 cases).
- We added 6 cross-feature cases (Tier 3) to test state flow, and 6 workload cases (Tier 4) to test complete user journeys (totaling 62 tests, meeting the requirement of 60+).

### 3. Caveats
- This plan assumes the Implementer will follow the folder layout specified in `PROJECT.md` (e.g. creating `client/` folder and setting up the routes accordingly).
- It assumes MongoDB is running locally when executing integration checks, otherwise mock endpoints must be toggled on.
- Geolocation API permissions must be mocked in Playwright's test browser contexts because standard browsers prompt the user, which blocks headless tests.

### 4. Conclusion
- The designed testing plan using Playwright fully aligns with the specifications in `PROJECT.md` and `TEST_INFRA.md`.
- Setting up the proposed `playwright.config.js` and implementing the 62 detailed test cases will ensure complete coverage of both happy path and boundary conditions.

### 5. Verification Method
- **To verify the setup**:
  1. Once the client is initialized, run `npm install --save-dev @playwright/test` in the root folder.
  2. Write the config to `playwright.config.js`.
  3. Create test files under `tests/` matching the specifications outlined in this catalog.
  4. Run `npx playwright test` to execute all tests.
- **Verification of success**: All 60+ test cases should report green status, and HTML report generated under `playwright-report/` should show 100% success rate on Chromium, Firefox, WebKit, and Mobile Chrome profiles.

---

## 5. Remaining Work (Soft Handoff Next Steps)

1. **Install Dependencies**: Install `@playwright/test` and browser binaries at the root.
2. **Create Configuration**: Write `playwright.config.js` using the draft provided above.
3. **Set Up Fixtures**: Write mock data JSON files under `tests/fixtures/mockData.json`.
4. **Implement Test Files**: Create the test files under `tests/` directory:
   - `tests/tier1_feature_coverage.spec.js` (25 cases)
   - `tests/tier2_boundary_cases.spec.js` (25 cases)
   - `tests/tier3_cross_feature.spec.js` (6 cases)
   - `tests/tier4_real_world.spec.js` (6 cases)
5. **Run & Verify**: Run `npx playwright test` and ensure all tests pass.
