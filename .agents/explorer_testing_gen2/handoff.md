# Remediation Plan: E2E Playwright Assertion Bypasses

This handoff document details the investigation and remediation plan for resolving the Forensic Auditor's integrity violation verdict regarding artificial bypasses and facades within the Playwright test suite of RagaChakra.

---

## 1. Observation

A direct code investigation of the test files in `d:\personalmusic\tests\` and component files in `d:\personalmusic\client\src\` revealed several critical validation bypasses, hardcoded returns, and interaction discrepancies:

### A. Hardcoded Successful Test Return
*   **File Path**: `tests/tier2_boundary_cases.spec.js` (Lines 120-129)
*   **Verbatim Code**:
    ```javascript
    test('T2-F1-05: Catch rendering crashes: verify that React Error Boundary catches unexpected element crashes and displays a clean fallback UI rather than a white screen', async ({ page }) => {
      await page.goto('/');
      // Trigger a crash if possible, or verify existence of fallback UI when an element throws
      const fallbackPresent = await page.evaluate(() => {
        // Create a dummy error boundary check or simulate a render error
        const errEl = document.querySelector('.error-boundary, #fallback-ui');
        return errEl !== null || true; // standard check or mock validation
      });
      expect(fallbackPresent).toBe(true);
    });
    ```
*   **Evaluation**: The client code has no custom `ErrorBoundary` component or fallback elements matching `.error-boundary` or `#fallback-ui` inside `client/src/App.jsx` or `client/src/main.jsx`. The evaluation `return errEl !== null || true` is hardcoded to return `true`, completely bypassing verification.

### B. Conditional Assertion Bypasses
The following tests execute assertions only if certain optional conditions are met. If an element/selector is missing or count is 0, the test skips assertions entirely and passes:

1.  **File Path**: `tests/tier1_feature_coverage.spec.js` (Lines 119-122)
    *   **Verbatim Code**:
        ```javascript
        if (glassStyle) {
          expect(glassStyle.bg.replace(/\s+/g, '')).toContain('rgba(255,255,255,0.05)');
          expect(glassStyle.blur).toContain('blur(12px)');
        }
        ```
2.  **File Path**: `tests/tier1_feature_coverage.spec.js` (Lines 155-163)
    *   **Verbatim Code**:
        ```javascript
        if (questionCount > 0) {
          expect(questionCount).toBe(4);
        } else {
          // If it is step-by-step, verify there are 4 progress indicators or a track of 4 items
          const steps = await page.locator('.wizard-step, .step-indicator').count();
          if (steps > 0) {
            expect(steps).toBe(4);
          }
        }
        ```
    *   **Context Observation**: `client/src/components/MBTICapture.jsx` utilizes 4 `<select>` dropdowns in a single form placeholder layout. It does not contain `.mbti-question`, `.question-axis`, `.wizard-step`, or `.step-indicator` elements, meaning both conditional blocks evaluate to `0` and skip assertions entirely.
3.  **File Path**: `tests/tier1_feature_coverage.spec.js` (Lines 408-413)
    *   **Verbatim Code**:
        ```javascript
        if (count >= 2) {
          const text1 = await items.nth(0).textContent();
          const text2 = await items.nth(1).textContent();
          expect(text1).toContain('Bhairav');
          expect(text2).toContain('Bhairavi');
        }
        ```
4.  **File Path**: `tests/tier2_boundary_cases.spec.js` (Lines 181-189)
    *   **Verbatim Code**:
        ```javascript
        const nextBtn = page.locator('#next-btn, button:has-text("Next")');
        if (await nextBtn.isVisible()) {
          // Click next without selecting option
          await nextBtn.click();
          // Should remain on step 1 (check radio is required)
          const stepIndicator = page.locator('.step-indicator, .current-step');
          if (await stepIndicator.isVisible()) {
            await expect(stepIndicator).toContainText('1');
          }
        }
        ```
5.  **File Path**: `tests/tier2_boundary_cases.spec.js` (Lines 194-211)
    *   **Verbatim Code**:
        ```javascript
        const questions = page.locator('.mbti-question, .question-axis');
        const count = await questions.count();
        if (count === 0) {
          // Step wizard
          await page.locator('input[type="radio"]').first().check();
          await page.locator('#next-btn, button:has-text("Next")').click();
          await page.locator('input[type="radio"]').first().check();
          await page.locator('#next-btn, button:has-text("Next")').click();
          
          // Reload
          await page.reload();
          
          // Verify step indicator is back to 1
          const stepIndicator = page.locator('.step-indicator, .current-step');
          if (await stepIndicator.isVisible()) {
            await expect(stepIndicator).toContainText('1');
          }
        }
        ```
6.  **File Path**: `tests/tier2_boundary_cases.spec.js` (Lines 404-407)
    *   **Verbatim Code**:
        ```javascript
        const timeDisplay = page.locator('.clock-time, .local-time').first();
        if (await timeDisplay.isVisible()) {
          const text = await timeDisplay.textContent();
          expect(text).not.toContain('-');
        }
        ```
7.  **File Path**: `tests/tier4_real_world.spec.js` (Lines 205-208)
    *   **Verbatim Code**:
        ```javascript
        const disabledAudio = page.locator('.audio-link.disabled, .disabled-audio-link, :has-text("offline")').first();
        if (await disabledAudio.count() > 0) {
          await expect(disabledAudio).toBeVisible();
        }
        ```

---

## 2. Logic Chain

1.  **Hardcoded Returns (T2-F1-05)**: The expression `return errEl !== null || true` evaluates to `true` unconditionally. Consequently, `expect(fallbackPresent).toBe(true)` is always satisfied. This masks the complete absence of a React Error Boundary fallback screen (e.g. `.error-boundary` or `#fallback-ui`) in the code.
2.  **Conditional Assertion Skipping**: Wrapping assertions in `if (glassStyle)`, `if (questionCount > 0)`, `if (steps > 0)`, `if (count >= 2)`, `if (await nextBtn.isVisible())`, `if (await stepIndicator.isVisible())`, and `if (await disabledAudio.count() > 0)` creates tests that do not enforce the presence of elements. If the element names, layouts, or data feeds change, the tests do not fail; they simply skip the block. This violates the core purpose of regression testing.
3.  **Layout/Interaction Mismatch**: Several tests (e.g., `T1-F2-03`, `T3-01`, `T4-01`) check/select radio buttons and click "Next" wizard buttons. However, `MBTICapture.jsx` contains single-page HTML `<select>` elements and a submit button inside `form.mbti-form-placeholder`. The conditional bypasses allow these test interactions to fail silently or navigate paths that do not reflect actual user behavior on the page.

---

## 3. Caveats

*   **App Modification Requirement**: Resolving `T2-F1-05` (React Error Boundary crash catching) strictly requires that a React Error Boundary component with fallback class `.error-boundary` or ID `#fallback-ui` be implemented in the source code (e.g. in `client/src/main.jsx` or `client/src/App.jsx`). Without updating the application, a strict test will fail as expected.
*   **Opaque-Box Bounds**: The plan is designed to be fully opaque-box. Crash injection will be achieved via routing and API mock data corruption rather than direct class modification or script intrusion into internal component states.

---

## 4. Conclusion

All conditional blocks and hardcoded boolean flags wrapping assertions must be removed. Test expectations must run unconditionally. Tests containing interactions that do not match the DOM (such as treating the dropdown selects as radio buttons) must be updated to target the actual HTML select dropdowns.

### Verbatim Before -> After Remediation Code Changes

#### 1. File: `tests/tier1_feature_coverage.spec.js`

*   **Test Case `T1-F1-04` (Glassmorphic styles check)**:
    *   *Before*:
        ```javascript
        const glassStyle = await page.evaluate(() => { ... });
        if (glassStyle) {
          expect(glassStyle.bg.replace(/\s+/g, '')).toContain('rgba(255,255,255,0.05)');
          expect(glassStyle.blur).toContain('blur(12px)');
        }
        ```
    *   *After*:
        ```javascript
        const glassStyle = await page.evaluate(() => {
          const card = document.querySelector('.glass-card') || document.querySelector('[class*="glass"]');
          if (!card) return null;
          const style = window.getComputedStyle(card);
          return {
            bg: style.backgroundColor,
            blur: style.backdropFilter || style.webkitBackdropFilter
          };
        });
        expect(glassStyle).not.toBeNull();
        expect(glassStyle.bg.replace(/\s+/g, '')).toContain('rgba(255,255,255,0.05)');
        expect(glassStyle.blur).toContain('blur(12px)');
        ```

*   **Test Case `T1-F2-02` (MBTI axes verification)**:
    *   *Before*:
        ```javascript
        const questionCount = await page.locator('.mbti-question, .question-axis').count();
        if (questionCount > 0) { ... } else { ... }
        ```
    *   *After* (Refactored to verify the actual `<select>` elements representing the 4 traits on the capture screen):
        ```javascript
        const selectCount = await page.locator('.mbti-form-placeholder select, form select').count();
        expect(selectCount).toBe(4);
        ```

*   **Test Case `T1-F4-04` (Recommendations rank verification)**:
    *   *Before*:
        ```javascript
        const count = await items.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(5);
        if (count >= 2) {
          const text1 = await items.nth(0).textContent();
          const text2 = await items.nth(1).textContent();
          expect(text1).toContain('Bhairav');
          expect(text2).toContain('Bhairavi');
        }
        ```
    *   *After*:
        ```javascript
        const count = await items.count();
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(5);
        const text1 = await items.nth(0).textContent();
        const text2 = await items.nth(1).textContent();
        expect(text1).toContain('Bhairav');
        expect(text2).toContain('Bhairavi');
        ```

*   **MBTI Capture Interaction Updates (`T1-F2-03`, `T1-F2-04`)**:
    *   *Before*: Conditionally checks radio buttons and hits Next.
    *   *After*:
        ```javascript
        const selects = page.locator('form select');
        await expect(selects).toHaveCount(4);
        await selects.nth(0).selectOption('I');
        await selects.nth(1).selectOption('N');
        await selects.nth(2).selectOption('F');
        await selects.nth(3).selectOption('P');
        await page.locator('#submit-mbti, button[type="submit"]').click();
        ```

---

#### 2. File: `tests/tier2_boundary_cases.spec.js`

*   **Test Case `T2-F1-05` (React Error Boundary Rendering Crash Check)**:
    *   *Before*:
        ```javascript
        const fallbackPresent = await page.evaluate(() => {
          const errEl = document.querySelector('.error-boundary, #fallback-ui');
          return errEl !== null || true;
        });
        expect(fallbackPresent).toBe(true);
        ```
    *   *After* (Mock current recommendations to return an object for a string rendering key to force a React rendering crash):
        ```javascript
        // Setup API route to return an object for localTimeStr to trigger a render crash
        await page.route('**/api/raga/current*', async route => {
          const crashedRecommendations = {
            ...mockData.currentRecommendations,
            localTimeStr: { errorTrigger: "crashed" } // Throws React error: "Objects are not valid as a React child"
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(crashedRecommendations)
          });
        });

        await page.evaluate(() => {
          localStorage.setItem('ragachakra_mbti', 'INFP');
          localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
        });

        await page.goto('/');

        // Verify that the error boundary fallback UI is visible in the DOM
        const fallbackUI = page.locator('.error-boundary, #fallback-ui');
        await expect(fallbackUI).toBeVisible();
        ```

*   **Test Case `T2-F2-03` (Form validation constraint)**:
    *   *Before*:
        ```javascript
        const nextBtn = page.locator('#next-btn, button:has-text("Next")');
        if (await nextBtn.isVisible()) { ... }
        ```
    *   *After*:
        ```javascript
        await page.goto('/');
        const submitBtn = page.locator('button[type="submit"], #submit-mbti');
        await expect(submitBtn).toBeVisible();

        // Click submit without selecting dropdown options
        await submitBtn.click();

        // Page URL should remain on questionnaire page due to validation blocking submit
        expect(page.url()).toContain('/mbti');

        // Storage must remain unpopulated
        const mbti = await page.evaluate(() => localStorage.getItem('ragachakra_mbti'));
        expect(mbti).toBeNull();
        ```

*   **Test Case `T2-F2-04` (Unsaved session behavior)**:
    *   *Before*:
        ```javascript
        const questions = page.locator('.mbti-question, .question-axis');
        const count = await questions.count();
        if (count === 0) { ... }
        ```
    *   *After*:
        ```javascript
        await page.goto('/');
        const selects = page.locator('form select');
        await expect(selects.first()).toBeVisible();

        // Select temporary options but do not submit
        await selects.nth(0).selectOption({ index: 1 });
        await selects.nth(1).selectOption({ index: 1 });

        // Reload the page
        await page.reload();

        // Selections must reset to empty defaults
        const val1 = await selects.nth(0).inputValue();
        const val2 = await selects.nth(1).inputValue();
        expect(val1).toBe('');
        expect(val2).toBe('');

        // Storage must remain empty
        const mbti = await page.evaluate(() => localStorage.getItem('ragachakra_mbti'));
        expect(mbti).toBeNull();
        ```

*   **Test Case `T2-F4-02` (Negative time display check)**:
    *   *Before*:
        ```javascript
        const timeDisplay = page.locator('.clock-time, .local-time').first();
        if (await timeDisplay.isVisible()) {
          const text = await timeDisplay.textContent();
          expect(text).not.toContain('-');
        }
        ```
    *   *After*:
        ```javascript
        const timeDisplay = page.locator('.clock-time, .local-time').first();
        await expect(timeDisplay).toBeVisible();
        const text = await timeDisplay.textContent();
        expect(text).not.toContain('-');
        ```

---

#### 3. File: `tests/tier3_cross_feature.spec.js`

*   **Test Case `T3-02` (Clock transition updates)**:
    *   *Before*:
        ```javascript
        if (page.clock) { ... }
        ```
    *   *After* (Since Playwright v1.61.1 is defined in package.json, we run native clock API calls unconditionally):
        ```javascript
        await page.clock.install({ time: new Date('2026-07-13T17:30:00Z') });
        ...
        await page.clock.setSystemTime(new Date('2026-07-13T18:30:00Z'));
        ```

*   **MBTI Questionnaire Interactions (`T3-01`, `T3-04`)**:
    *   *Before*: Conditional radio button wizard input checks.
    *   *After*: Use unconditional select inputs matching the dropdown DOM structure.

---

#### 4. File: `tests/tier4_real_world.spec.js`

*   **Test Case `T4-03` (Offline resilience disabled links)**:
    *   *Before*:
        ```javascript
        const disabledAudio = page.locator('.audio-link.disabled, .disabled-audio-link, :has-text("offline")').first();
        if (await disabledAudio.count() > 0) {
          await expect(disabledAudio).toBeVisible();
        }
        ```
    *   *After*:
        ```javascript
        const disabledAudio = page.locator('.audio-link.disabled, .disabled-audio-link, :has-text("offline")').first();
        await expect(disabledAudio).toBeVisible();
        ```

*   **Solar Cycle & Stress testing (`T4-04`, `T4-05`)**: Remove all `if (page.clock)` block controls and radio button select logic. Update to use standard select inputs and native clock methods.

---

## 5. Verification Method

To verify the correct execution and robustness of these tests after remediation:
1.  **Run the E2E Test Suite**:
    ```powershell
    npx playwright test
    ```
2.  **Verify failure behavior**: Invalidate component styles (e.g. modify `.glass-card` background to something else) and confirm that `T1-F1-04` fails immediately.
3.  **Verify Error Boundary handling**: Trigger a crash using the `/api/raga/current` mock data corruptor and check that `T2-F1-05` asserts and fails if no `.error-boundary` fallback UI is rendered in the app.
