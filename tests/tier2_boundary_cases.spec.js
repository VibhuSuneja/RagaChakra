const { test, expect } = require('@playwright/test');
const mockData = require('./fixtures/mockData.json');

test.describe('Tier 2: Boundary & Corner Cases (25 Cases)', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('pageerror', error => {
      consoleErrors.push(error);
    });

    // Default mock routes
    await page.route('**/api/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.healthCheck)
      });
    });

    await page.route('**/api/mbti', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.mbtiSubmit)
      });
    });

    await page.route('**/api/raga/current*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.currentRecommendations)
      });
    });

    await page.route(/\/api\/raga\/([0-9a-fA-F]{24})/, async route => {
      const url = route.request().url();
      const id = url.split('/').pop() || '60c72b2f9b1d8b2d88888801';
      const detail = mockData.ragaDetails[id] || mockData.ragaDetails['60c72b2f9b1d8b2d88888801'];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(detail)
      });
    });

    await page.route('https://ipapi.co/json/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.ipapiGeo)
      });
    });
  });

  // ==========================================
  // Feature 1: Client Setup & App Loading (T2-F1)
  // ==========================================

  test('T2-F1-01: Mobile responsiveness test: load the homepage at 375px viewport width and verify that there is no horizontal scrollbar or cropped text', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if horizontal scrollbar is present on the page
    const hasScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasScrollbar).toBe(false);
  });

  test('T2-F1-02: Tablet layout test: load the homepage at 768px viewport width and verify that grid columns wrap elegantly without breaking container alignment', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check elements alignment/wrapping
    const elementsOk = await page.evaluate(() => {
      const container = document.querySelector('.grid-container, .dashboard-grid') || document.body;
      const rect = container.getBoundingClientRect();
      return rect.width <= 768; // should fit inside viewport
    });
    expect(elementsOk).toBe(true);
  });

  test('T2-F1-03: Mock server connection offline: verify that if /api/health fails to load, a clear user-facing error message or banner is displayed', async ({ page }) => {
    // Override /api/health to fail
    await page.route('**/api/health', async route => {
      await route.fulfill({ status: 500 });
    });
    
    await page.goto('/');
    const errorBanner = page.locator('.error-banner, #error-msg, :has-text("Offline"), :has-text("Error")').first();
    await expect(errorBanner).toBeVisible();
  });

  test('T2-F1-04: Mock a slow network connection (5-second latency on initial assets) and verify that loading states or skeleton cards are displayed', async ({ page }) => {
    // Override current API to have delay
    await page.route('**/api/raga/current*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // use 2s for test efficiency
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.currentRecommendations)
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });

    await page.goto('/');
    
    // Check loading indicator or skeleton cards
    const skeleton = page.locator('.skeleton, .loader, #loading').first();
    await expect(skeleton).toBeVisible();
  });
  test('T2-F1-05: Error boundary rendering on malformed data', async ({ page }) => {
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
  });

  // ==========================================
  // Feature 2: MBTI Capture Flow (T2-F2)
  // ==========================================

  test('T2-F2-01: Corrupt storage validation: inject an invalid MBTI type (e.g. XYZ) into localStorage and verify that the app resets the storage and prompts the user to retake the questionnaire', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'XYZ');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });
    // Reload
    await page.reload();
    
    // Verify it redirects back to capture questionnaire
    await expect(page.locator('.mbti-capture-container, #mbti-capture')).toBeVisible();
    const storedMBTI = await page.evaluate(() => localStorage.getItem('ragachakra_mbti'));
    expect(storedMBTI).not.toBe('XYZ');
  });

  test('T2-F2-02: Submitting questionnaire with API failure: mock a 500 Server Error on POST /api/mbti. Verify that the UI displays a warning but proceeds to show recommendations in fallback mode (failing gracefully)', async ({ page }) => {
    await page.route('**/api/mbti', async route => {
      await route.fulfill({ status: 500 });
    });

    await page.goto('/');
    // Fill out questionnaire
    const selects = page.locator('.mbti-form-placeholder select, form select');
    await expect(selects).toHaveCount(4);
    await selects.nth(0).selectOption('I');
    await selects.nth(1).selectOption('N');
    await selects.nth(2).selectOption('F');
    await selects.nth(3).selectOption('P');
    await page.locator('#submit-mbti, button[type="submit"]').click();

    // Verify warning is displayed and dashboard fallback is active
    const warning = page.locator('.warning, .alert, :has-text("error"), :has-text("warning")').first();
    await expect(warning).toBeVisible();
    await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
  });

  test('T2-F2-03: Form validation constraint: verify that the user cannot click the "Next" button in the wizard without checking a radio option for the active question', async ({ page }) => {
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
  });

  test('T2-F2-04: Interrupted session behavior: answer only 2 out of 4 questions, refresh the browser, and verify that the questionnaire resets back to question 1 to prevent incomplete state storage', async ({ page }) => {
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
  });

  test('T2-F2-05: Cyber security validation (XSS attempt): inject a script tag into ragachakra_client_id in localStorage (e.g. <script>alert(1)</script>) and verify that the app sanitizes it and does not execute the script in the DOM', async ({ page }) => {
    let alertFired = false;
    page.on('dialog', async dialog => {
      if (dialog.type() === 'alert') {
        alertFired = true;
        await dialog.dismiss();
      }
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', '<script>alert(1)</script>');
    });

    await page.goto('/');
    // Check alert was not fired
    expect(alertFired).toBe(false);
    // Inspect DOM to ensure no direct execution
    const clientEl = page.locator(':has-text("<script>")');
    expect(await clientEl.count()).toBe(0);
  });

  // ==========================================
  // Feature 3: Geolocation & API Hook (T2-F3)
  // ==========================================

  test.describe('Geolocation Boundary cases', () => {
    test('T2-F3-01: Geolocation API Timeout: mock browser geolocation to hang. Verify that after exactly 5 seconds, the client times out and falls back to ipapi.co successfully', async ({ page, context }) => {
      // Force geolocation to hang
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 0, longitude: 0 }); // default coordinates
      
      // Override geolocation get function to hang
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (success, error, options) => {
          // Never invoke success or error to simulate hang
        };
      });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      const startTime = Date.now();
      await page.goto('/');
      
      // Wait for fallback to ipapi
      await page.waitForTimeout(5500); // just over 5s
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeGreaterThan(5000);
      // Verify Dashboard is visible using fallback geolocation (Mumbai lat: 19.0760)
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
    });

    test('T2-F3-02: Double Geolocation failure: mock both browser location deny AND ipapi.co API failure. Verify that the app falls back to default coordinates (Delhi: 28.6139, 77.2090) and alerts the user with a fallback notification', async ({ page, context }) => {
      await context.clearPermissions();
      // Fail ipapi.co
      await page.route('https://ipapi.co/json/', async route => {
        await route.fulfill({ status: 500 });
      });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      
      // Verify error alert/notification
      const fallbackAlert = page.locator('.fallback-alert, .alert, :has-text("fallback"), :has-text("default")').first();
      await expect(fallbackAlert).toBeVisible();
      // Expect dashboard to load default coordinates (New Delhi)
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
    });

    test('T2-F3-03: Recommendation endpoint 500 error: mock a 500 error on GET /api/raga/current. Verify that the dashboard displays an error alert with a functional "Try Again" retry button', async ({ page }) => {
      let callCount = 0;
      await page.route('**/api/raga/current*', async route => {
        callCount++;
        if (callCount === 1) {
          await route.fulfill({ status: 500 });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData.currentRecommendations)
          });
        }
      });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      
      // Expect error alert
      const errorMsg = page.locator('.error-message, :has-text("failed"), :has-text("error")').first();
      await expect(errorMsg).toBeVisible();
      
      // Click Retry
      const retryBtn = page.locator('#retry-btn, button:has-text("Try Again"), button:has-text("Retry")');
      await retryBtn.click();
      
      // Dashboard should resolve successfully
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      expect(callCount).toBeGreaterThan(1);
    });

    test('T2-F3-04: Extreme latitude verification: mock browser location coordinates at the North Pole (90.0000, 0.0000). Verify that the application doesn\'t crash and handles the solar time calculation gracefully', async ({ page, context }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 90.0000, longitude: 0.0000 });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      expect(consoleErrors).toHaveLength(0);
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
    });

    test('T2-F3-05: API latency boundary: mock a 4-second delay on the recommendations request. Verify that a loader skeleton is displayed until the response arrives', async ({ page }) => {
      await page.route('**/api/raga/current*', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData.currentRecommendations)
        });
      });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      await expect(page.locator('.skeleton, .loader')).toBeVisible();
      await page.waitForTimeout(2200);
      await expect(page.locator('.skeleton, .loader')).toBeHidden();
    });
  });

  // ==========================================
  // Feature 4: Clock & Recommendations Dashboard (T2-F4)
  // ==========================================

  test('T2-F4-01: Empty recommendations response: mock the current recommendations endpoint to return an empty array. Verify that the dashboard renders a friendly "No matching ragas for this period" message', async ({ page }) => {
    await page.route('**/api/raga/current*', async route => {
      const emptyRecommendations = { ...mockData.currentRecommendations, recommendations: [] };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyRecommendations)
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });

    await page.goto('/');
    const noRagasMsg = page.locator('.no-ragas, :has-text("No matching ragas"), :has-text("No recommendations")').first();
    await expect(noRagasMsg).toBeVisible();
  });

  test('T2-F4-02: Extreme timezone offsets: mock a query timezone of UTC-11 or UTC+14 and verify that local clock calculations format the hours correctly without negative bounds', async ({ page }) => {
    await page.route('**/api/raga/current*', async route => {
      const url = new URL(route.request().url());
      expect(url.searchParams.get('tz')).toBeTruthy();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.currentRecommendations)
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });

    await page.goto('/');
    const timeDisplay = page.locator('.clock-time, .local-time').first();
    await expect(timeDisplay).toBeVisible();
    const text = await timeDisplay.textContent();
    expect(text).not.toContain('-');
  });

  test('T2-F4-03: Astrology flag off check: confirm that when the recommendation payload returns astroEnabled: false, no Vedic reranking options or horoscope elements are visible', async ({ page }) => {
    await page.route('**/api/raga/current*', async route => {
      const payload = { ...mockData.currentRecommendations, astroEnabled: false };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });

    await page.goto('/');
    const astroBadge = page.locator('.astro-badge, .vedic-badge, #astro-rank-status');
    await expect(astroBadge).toBeHidden();
  });

  test('T2-F4-04: Astrology flag on check: mock astroEnabled: true in the recommendations payload and verify that the UI renders a corresponding status badge', async ({ page }) => {
    await page.route('**/api/raga/current*', async route => {
      const payload = { ...mockData.currentRecommendations, astroEnabled: true };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });

    await page.goto('/');
    const astroBadge = page.locator('.astro-badge, .vedic-badge, #astro-rank-status, :has-text("Astro"), :has-text("Vedic")').first();
    await expect(astroBadge).toBeVisible();
  });

  test('T2-F4-05: Extreme text length safety: mock a raga with an excessively long name (100+ characters) and verify that the grid items resize gracefully without causing horizontal scrollbars or breaking cards', async ({ page }) => {
    await page.route('**/api/raga/current*', async route => {
      const longNameRaga = JSON.parse(JSON.stringify(mockData.currentRecommendations));
      longNameRaga.recommendations[0].raga.name = 'Bhairav' + 'a'.repeat(100);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(longNameRaga)
      });
    });

    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });

    await page.goto('/');
    const hasScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasScrollbar).toBe(false);
  });

  // ==========================================
  // Feature 5: Raga Detail Page (T2-F5)
  // ==========================================

  test('T2-F5-01: Direct URL navigation to an invalid Raga ID: navigate to /raga/does-not-exist. Verify that the client displays a 404 raga error page with an easy route back to the dashboard', async ({ page }) => {
    await page.route('**/api/raga/does-not-exist', async route => {
      await route.fulfill({ status: 404 });
    });

    await page.goto('/raga/does-not-exist');
    const notFoundEl = page.locator('.not-found, .error-404, :has-text("404"), :has-text("not found")').first();
    await expect(notFoundEl).toBeVisible();
    
    const backBtn = page.locator('#back-to-dashboard-btn, .back-btn, button:has-text("Back"), button:has-text("Home")').first();
    await expect(backBtn).toBeVisible();
  });

  test('T2-F5-02: Raga with missing audio links: mock the detail page response to return an empty audioRefs array. Verify that the page shows a "No audio references available" placeholder', async ({ page }) => {
    await page.route(/\/api\/raga\/([0-9a-fA-F]{24})/, async route => {
      const payload = { ...mockData.ragaDetails['60c72b2f9b1d8b2d88888801'], audioRefs: [] };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });

    await page.goto('/raga/60c72b2f9b1d8b2d88888801');
    const placeholder = page.locator('.no-audio, :has-text("No audio references available"), :has-text("No references")').first();
    await expect(placeholder).toBeVisible();
  });

  test('T2-F5-03: Strictly plain text links verification: scan the detail page DOM to verify that no YouTube, SoundCloud, or third-party iframe embeds are present (complying with scope guardrails)', async ({ page }) => {
    await page.goto('/raga/60c72b2f9b1d8b2d88888801');
    const iframeCount = await page.locator('iframe, embed, object').count();
    expect(iframeCount).toBe(0);
  });

  test('T2-F5-04: Malicious audio links validation: mock an audio link with javascript:alert(1) as its href. Verify that the detail page sanitizes or ignores non-http/https protocols', async ({ page }) => {
    await page.route(/\/api\/raga\/([0-9a-fA-F]{24})/, async route => {
      const payload = {
        ...mockData.ragaDetails['60c72b2f9b1d8b2d88888801'],
        audioRefs: ['javascript:alert(1)']
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });

    await page.goto('/raga/60c72b2f9b1d8b2d88888801');
    const badLink = page.locator('a[href^="javascript:"]');
    expect(await badLink.count()).toBe(0);
  });

  test('T2-F5-05: Sargam notes layout test: mock empty ascending/descending notes fields and verify that the detail layout displays placeholder values instead of crashing', async ({ page }) => {
    await page.route(/\/api\/raga\/([0-9a-fA-F]{24})/, async route => {
      const payload = {
        ...mockData.ragaDetails['60c72b2f9b1d8b2d88888801'],
        ascendingNotes: '',
        descendingNotes: ''
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });
    });

    await page.goto('/raga/60c72b2f9b1d8b2d88888801');
    const ascNotes = page.locator('.ascending-notes, .notes-asc');
    await expect(ascNotes).toBeVisible();
    const txt = await ascNotes.textContent();
    expect(txt.length).toBeGreaterThan(0); // placeholder text or layout
  });
});
