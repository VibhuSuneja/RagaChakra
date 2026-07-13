# RagaChakra Orchestration Plan

## Overview
This plan outlines the orchestration strategy for completing the RagaChakra MERN application frontend client and integrating it with the existing backend.

## Tracks
We will run two parallel tracks:
1. **E2E Testing Track**: Build and execute a comprehensive opaque-box test suite covering Tiers 1-4.
2. **Implementation Track**: Develop the Vite+React client and all required UI/UX features, and integrate them with the backend.

## Implementation Milestones
- **Milestone 1: Client Setup & Design System**
  - Initialize React + Vite project in `client/`
  - Setup routing (React Router) and proxies (Vite config to port 5000)
  - Configure CSS design system with the required tokens (`#0D0B2B`, `#E8890C`, etc.) and Google Fonts.
- **Milestone 2: MBTI Capture Flow**
  - Forced-choice 4-axis question form when `localStorage` has no MBTI.
  - Generate clientId (UUID) and save both to `localStorage`.
  - POST to `/api/mbti`.
- **Milestone 3: Geolocation & API hook**
  - Prompt browser geolocation with 5s timeout.
  - Fallback to HTTPS `https://ipapi.co/json/`.
  - Query recommendations from `/api/raga/current` with lat, lng, tz, and clientId.
- **Milestone 4: Clock & Recommendations Dashboard**
  - Render circular prahar clock SVG with 8 segments, saffron highlight.
  - Render Hero Card with top recommendation and reasoning.
  - Render list of top 5 recommendations.
  - Add micro-animations (hover lift, fade-in).
- **Milestone 5: Raga Detail Page**
  - Navigates to `/raga/:id`.
  - Displays full info: name, thaat, rasas, sargam notes, audio references (plain clickable anchor tags).
- **Milestone 6: E2E Integration & Verification**
  - Integrate with the E2E testing runner.
  - Pass 100% of E2E tests (Tiers 1-4).
  - Adversarial Testing (Tier 5) coverage hardening.

## E2E Testing Track Plan
- **Milestone 1: Test Infra & Feature Inventory**
  - Build the E2E testing framework/infrastructure.
  - Set up category-partition boundary value analysis.
- **Milestone 2: Tiers 1-4 Test Case Creation**
  - Tier 1: Feature Coverage (5+ per feature)
  - Tier 2: Boundary/Corner Cases (5+ per feature)
  - Tier 3: Cross-Feature Combinations (pairwise)
  - Tier 4: Real-world Workloads
- **Milestone 3: Publish TEST_READY.md**
  - Complete the suite and expose the runner command.

## Verification & Audits
- Each milestone implemented by the worker will go through peer review by Reviewer subagents.
- Challenger subagents will run empirical checks.
- A Forensic Auditor will audit the implementation to verify integrity.
