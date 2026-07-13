# Plan - E2E Testing Track

## Objective
Establish a comprehensive opaque-box E2E test suite for RagaChakra to verify correctness and robustness across 5 primary features and 4 tiers of testing.

## Features to Test
1. **Client Setup & App Loading**
2. **MBTI Capture Flow**
3. **Geolocation & API Hook**
4. **Clock & Recommendations Dashboard**
5. **Raga Detail Page**

## Test Tiers and Minimum Counts
- **Tier 1: Feature Coverage**: 5+ tests per feature (Total: 25+ tests)
- **Tier 2: Boundary & Corner Cases**: 5+ tests per feature (Total: 25+ tests)
- **Tier 3: Cross-Feature Combinations**: 5+ pairwise tests
- **Tier 4: Real-world Workloads**: 5+ full user scenarios
- **Total Minimum Cases**: 60 test cases

## Milestone & Tasks
1. **Milestone 1: Test Infra Definition**
   - Create `TEST_INFRA.md` outlining philosophy, inventory, and architecture.
   - Write this `plan.md` and initial `progress.md`.
2. **Milestone 2: Test Suite Initialization**
   - Choose Playwright as the E2E test framework.
   - Install `@playwright/test` and generate configuration.
   - Define test helper functions (mocking geolocation, mock APIs, local storage access).
3. **Milestone 3: Write Tier 1 & Tier 2 Test Cases**
   - Implement 25+ Tier 1 test cases covering happy paths for all 5 features.
   - Implement 25+ Tier 2 test cases covering edge cases (timeout, deny, invalid inputs, responsive layout).
4. **Milestone 4: Write Tier 3 & Tier 4 Test Cases**
   - Implement 5+ Tier 3 tests for cross-feature flow.
   - Implement 5+ Tier 4 tests for real-world end-to-end user journeys.
5. **Milestone 5: Verification & Publishing**
   - Run compilation check of the tests.
   - Publish `TEST_READY.md` containing the runner details and coverage checklist.
   - Run Forensic Auditor to verify.

## Coordination Plan
- Spawn `teamwork_preview_explorer` to analyze any existing dependencies and server structure, and design the test scripts.
- Spawn `teamwork_preview_worker` to install Playwright and write the test cases.
- Spawn `teamwork_preview_reviewer` to review the test cases for completeness and requirement alignment.
- Spawn `teamwork_preview_auditor` to audit integrity.
