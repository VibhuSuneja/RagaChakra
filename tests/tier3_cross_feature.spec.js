const { test, expect } = require('@playwright/test');
const mockData = require('./fixtures/mockData.json');

test.describe('Tier 3: Cross-Feature Interactions (6 Cases)', () => {
  let mbtiSubmitRequest = null;
  let recommendationRequests = [];

  test.beforeEach(async ({ page }) => {
    mbtiSubmitRequest = null;
    recommendationRequests = [];

    // Setup routes
    await page.route('**/api/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.healthCheck)
      });
    });

    await page.route('**/api/mbti', async route => {
      mbtiSubmitRequest = route.request();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, mbtiType: 'ISTJ' })
      });
    });

    await page.route('**/api/raga/current*', async route => {
      recommendationRequests.push(route.request());
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

  test.describe('Geolocation allowed context', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T3-01: MBTI Retake and Recommendation Sync', async ({ page }) => {
      // Precondition: user has INFP stored
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();

      // Click "Retake MBTI" or "Edit Profile"
      const retakeBtn = page.locator('#retake-mbti-btn, .retake-btn, button:has-text("Retake"), button:has-text("Edit")');
      await retakeBtn.click();

      // Complete form to ISTJ using select options
      const selects = page.locator('.mbti-form-placeholder select, form select');
      await expect(selects).toHaveCount(4);
      await selects.nth(0).selectOption('I');
      await selects.nth(1).selectOption('S');
      await selects.nth(2).selectOption('T');
      await selects.nth(3).selectOption('J');
      await page.locator('#submit-mbti, button[type="submit"]').click();

      // Verify localStorage is updated to ISTJ
      const mbti = await page.evaluate(() => localStorage.getItem('ragachakra_mbti'));
      expect(mbti).toBe('ISTJ');

      // Verify POST /api/mbti fired
      expect(mbtiSubmitRequest).toBeTruthy();
      expect(mbtiSubmitRequest.method()).toBe('POST');

      // Verify recommendation is re-fetched and updated
      expect(recommendationRequests.length).toBeGreaterThan(1);
    });

    test('T3-02: Circadian clock boundary transition updates dashboard', async ({ page }) => {
      // Install system clock mock using Playwright clock feature (supported in modern versions)
      await page.clock.install({ time: new Date('2026-07-13T17:30:00Z') });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();

      const initialRequestsCount = recommendationRequests.length;

      // Advance clock across a prahar threshold (e.g. from 17:30 to 18:30)
      await page.clock.setSystemTime(new Date('2026-07-13T18:30:00Z'));

      // Let clock handler trigger re-fetch
      await page.waitForTimeout(1000);

      // Verify a new recommendation request was triggered
      expect(recommendationRequests.length).toBeGreaterThan(initialRequestsCount);
    });

    test('T3-03: Navigating to Detail and Back preserves state', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INTJ');
        localStorage.setItem('ragachakra_client_id', 'uuid-987654');
      });

      await page.goto('/');
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();

      // Go to detail
      await page.locator('.hero-card, .recommendation-item').first().click();
      await page.waitForURL(/\/raga\/[0-9a-fA-F]{24}/);

      // Go back
      const backBtn = page.locator('#back-to-dashboard-btn, .back-btn, button:has-text("Back")');
      await backBtn.click();

      await page.waitForURL(/\/$/);
      // Verify dashboard immediately visible (skipped questionnaire, location cached, no duplicate flow)
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      await expect(page.locator('.mbti-capture-container, #mbti-capture')).toBeHidden();
      
      const mbti = await page.evaluate(() => localStorage.getItem('ragachakra_mbti'));
      expect(mbti).toBe('INTJ');
    });

    test('T3-05: Timezone mismatch adjustments', async ({ page, context }) => {
      // Set location to Tokyo but keep browser timezone
      await context.setGeolocation({ latitude: 35.6762, longitude: 139.6503 });

      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');

      expect(recommendationRequests.length).toBeGreaterThan(0);
      const lastRequest = recommendationRequests[recommendationRequests.length - 1];
      const url = new URL(lastRequest.url());
      
      expect(url.searchParams.get('lat')).toBe('35.6762');
      expect(url.searchParams.get('lng')).toBe('139.6503');
      expect(url.searchParams.get('tz')).toBeTruthy(); // matches machine local timezone (e.g. Asia/Kolkata)
    });

    test('T3-06: Database reload triggers state validation', async ({ page, context }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      await page.goto('/');
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();

      // Clear cookies but keep localStorage
      await context.clearCookies();

      // Reload
      await page.reload();

      // Verify dashboard loads immediately and questionnaire skipped
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      await expect(page.locator('.mbti-capture-container, #mbti-capture')).toBeHidden();
      
      const clientId = await page.evaluate(() => localStorage.getItem('ragachakra_client_id'));
      expect(clientId).toBe('a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });
  });

  // T3-04 has geolocation prompt denial during questionnaire
  test('T3-04: Geolocation prompts during MBTI wizard does not freeze flow', async ({ page, context }) => {
    // Clean session
    await page.evaluate(() => localStorage.clear());
    // Explicitly deny location
    await context.clearPermissions();

    await page.goto('/');
    
    // Complete questionnaire using 4 selects
    const selects = page.locator('.mbti-form-placeholder select, form select');
    await expect(selects).toHaveCount(4);
    await selects.nth(0).selectOption('I');
    await selects.nth(1).selectOption('N');
    await selects.nth(2).selectOption('F');
    await selects.nth(3).selectOption('P');
    await page.locator('#submit-mbti, button[type="submit"]').click();

    // Verify wizard is done and dashboard loads
    await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
  });
});
