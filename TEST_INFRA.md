# E2E Test Infra: RagaChakra

## Test Philosophy
- **Opaque-box, requirement-driven**: All tests will interact with the application via the browser interface (DOM) or standard API endpoints without depending on internal implementation details.
- **Repeatable & Independent**: Each test case must manage its own state (e.g., clear `localStorage`, mock geolocation, mock network requests where necessary) to ensure tests can run in any order or in parallel.
- **Robust Verification**: Verify edge cases, error conditions, and negative paths (like geolocation timeouts, API failures, responsive design limits) alongside happy paths.

## Feature Inventory
| # | Feature | Source (Requirement) | Tier 1 (Happy Path) | Tier 2 (Boundaries) | Tier 3 (Cross-Feature) | Tier 4 (Workloads) |
|---|---------|----------------------|:-------------------:|:------------------:|:---------------------:|:------------------:|
| 1 | Client Setup & App Loading | ORIGINAL_REQUEST §R1 | 5 cases | 5 cases | ✓ | ✓ |
| 2 | MBTI Capture Flow | ORIGINAL_REQUEST §R3 | 5 cases | 5 cases | ✓ | ✓ |
| 3 | Geolocation & API Hook | ORIGINAL_REQUEST §R4 | 5 cases | 5 cases | ✓ | ✓ |
| 4 | Clock & Recommendations Dashboard | ORIGINAL_REQUEST §R2 | 5 cases | 5 cases | ✓ | ✓ |
| 5 | Raga Detail Page | ORIGINAL_REQUEST §R5 | 5 cases | 5 cases | ✓ | ✓ |

## Test Architecture
- **Framework**: Playwright (NodeJS E2E Test Runner)
- **Target URL**: `http://localhost:5173` (Client dev server with proxy to backend on `:5000`)
- **Key Testing APIs**:
  - `page.route` / `page.waitForResponse` for API intercepting and mocking.
  - Browser contexts with `geolocation` permissions and coordinates mocked via options.
  - `page.evaluate` to read/write `localStorage`.
  - Responsive viewport resizing down to `375px` width.
- **File Structure**:
  - `tests/fixtures/`: Mock data and helper functions.
  - `tests/tier1_feature_coverage.spec.js`: Tier 1 tests.
  - `tests/tier2_boundary_cases.spec.js`: Tier 2 tests.
  - `tests/tier3_cross_feature.spec.js`: Tier 3 tests.
  - `tests/tier4_real_world.spec.js`: Tier 4 tests.
  - `playwright.config.js`: Configuration for dev server startup and headless test execution.

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 tests per feature. Validates that every required feature works under standard conditions.
- **Tier 2 (Boundary & Corner Cases)**: ≥5 tests per feature. Checks bounds, errors, and physical limits (e.g., 375px layout, location timeouts, geolocation deny).
- **Tier 3 (Cross-Feature Interactions)**: ≥5 tests. Verifies interactions between MBTI changes, geolocation updates, and clock transitions.
- **Tier 4 (Real-World Workloads)**: ≥5 tests. Evaluates complete multi-step user scenarios simulating actual APM portfolio user sessions.
- **Minimum Test Cases**: 60.
