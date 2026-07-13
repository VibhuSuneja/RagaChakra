# Implementation Track Execution Plan

This document details the step-by-step plan for implementing and verifying Milestones 1 to 6.

## Milestone Breakdown & Execution Flow

### Milestone 1: Client Setup & Design System
- **Objective**: Set up Vite React client, CSS design system variables, react-router-dom, proxy `/api` in `vite.config.js`.
- **Verify**: Build succeeds, Vite config exists and proxies properly, app renders home screen without console errors.

### Milestone 2: MBTI Capture Flow
- **Objective**: Design forced-choice 4-question questionnaire UI, generate/retrieve UUID client ID, save MBTI results in `localStorage`, invoke `POST /api/mbti`.
- **Verify**: Correct HTTP call, redirection, localStorage check, design system alignment.

### Milestone 3: Geolocation & API Hook
- **Objective**: Create `useGeolocation.js` hook with timeout fallback to `ipapi.co`. Connect to `GET /api/raga/current` passing lat/lng/tz/clientId.
- **Verify**: Correct coordinates/fallback API invocation, proper query params.

### Milestone 4: Clock & Recommendations Dashboard
- **Objective**: Implement circular SVG clock (highlighting current Prahar in saffron), Raga Hero Card (displaying top recommended raga & Keirsey reasoning), recommendations list.
- **Verify**: SVG rendering, dynamic highlight, dynamic reasoning string formatting, responsiveness.

### Milestone 5: Raga Detail Page
- **Objective**: Implement `/raga/:id` detail route showing thaat, rasa, sargam notes (ascending/descending), and clickable text links for audio references.
- **Verify**: Link navigation, clean render, no embedded players, responsive layout.

### Milestone 6: E2E Integration & Verification
- **Objective**: Wait for `TEST_READY.md` from E2E Testing Orchestrator, run full test suite (Tiers 1-4), fix failures. Then run Challenger-driven Tier 5 Adversarial Coverage Hardening.
- **Verify**: 100% test pass rate, no security/stability/robustness gaps.

---

## Iteration Loop (Per Milestone)
For each milestone, the following standard iteration cycle is run:
1. **Explore**: Spawn 3 Explorers to analyze codebase and provide implementation strategies.
2. **Implement**: Spawn 1 Worker to write/modify the frontend files, compile, and run unit tests.
3. **Review**: Spawn 2 Reviewers independently to verify code layout, robustness, and logic.
4. **Challenge**: Spawn 2 Challengers to perform verification.
5. **Audit**: Spawn 1 Forensic Auditor to perform integrity checks.
6. **Gate**: Verify all results (tests passing, reviewer approvals, clean auditor report). If any fail, iterate again.
