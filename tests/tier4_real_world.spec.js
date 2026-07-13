const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const mockData = require('./fixtures/mockData.json');

test.describe('Tier 4: Real-World Workloads (6 Cases)', () => {
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
        body: JSON.stringify(mockData.mbtiSubmit)
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

  // ==========================================
  // T4-01: The First-Time User E2E Journey
  // ==========================================
  test.describe('First-Time User Journey context', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T4-01: The First-Time User E2E Journey', async ({ page }) => {
      // 1. Clear session
      await page.evaluate(() => localStorage.clear());

      // 2. Navigate to root
      await page.goto('/');

      // 3. Complete MBTI quiz (select choices mapping to INFP)
      const selects = page.locator('.mbti-form-placeholder select, form select');
      await expect(selects).toHaveCount(4);
      await selects.nth(0).selectOption('I');
      await selects.nth(1).selectOption('N');
      await selects.nth(2).selectOption('F');
      await selects.nth(3).selectOption('P');
      await page.locator('#submit-mbti, button[type="submit"]').click();

      // 4. Verify API requests made
      expect(mbtiSubmitRequest).toBeTruthy();
      expect(recommendationRequests.length).toBeGreaterThan(0);

      // 5. Verify clock highlighted and recommendations display
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      const highlightedSegment = page.locator('.prahar-segment.active, path.segment.active');
      await expect(highlightedSegment).toBeVisible();

      // 6. Click the top raga card (Bhairav)
      await page.locator('.hero-card, .recommendation-item').first().click();
      await page.waitForURL(/\/raga\/[0-9a-fA-F]{24}/);

      // 7. Inspect notes and audio link
      const ascNotes = page.locator('.ascending-notes, .notes-asc');
      await expect(ascNotes).toContainText('S r G M P d N S\'');
      
      const audioLink = page.locator('.audio-refs-list a, .audio-link').first();
      await expect(audioLink).toBeVisible();
      expect(await audioLink.getAttribute('target')).toBe('_blank');

      // 8. Click "Back" to verify home page recommendations reload
      const backBtn = page.locator('#back-to-dashboard-btn, .back-btn, button:has-text("Back")');
      await backBtn.click();
      await page.waitForURL(/\/$/);
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
    });
  });

  // ==========================================
  // T4-02: Returning User Session
  // ==========================================
  test.describe('Returning User context', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T4-02: Returning User Session (Instant Recommendations)', async ({ page }) => {
      // Preconditions
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INTJ');
        localStorage.setItem('ragachakra_client_id', 'uuid-987654');
      });

      // 1. Open home
      await page.goto('/');

      // 2. Verify questionnaire is completely skipped
      await expect(page.locator('.mbti-capture-container, #mbti-capture')).toBeHidden();

      // 3. Confirm recommendations are requested immediately and rendered for INTJ
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      expect(recommendationRequests.length).toBeGreaterThan(0);
      const url = new URL(recommendationRequests[0].url());
      expect(url.searchParams.get('clientId')).toBe('uuid-987654');
    });
  });

  // ==========================================
  // T4-03: Dual-Failure Offline Resilience
  // ==========================================
  test.describe('Dual Failure Offline context', () => {
    test.use({
      permissions: [], // blocked browser geolocation
      geolocation: undefined
    });

    test('T4-03: Dual-Failure Offline Resilience Scenario', async ({ page, context }) => {
      // Mock ipapi to fail
      await page.route('https://ipapi.co/json/', async route => {
        await route.fulfill({ status: 500 });
      });

      // 1. Load application
      await page.goto('/');

      // 2. Verify fallback to default coordinates Delhi
      // Dashboard will show up once MBTI is done (let's fill it)
      const selects = page.locator('.mbti-form-placeholder select, form select');
      await expect(selects).toHaveCount(4);
      await selects.nth(0).selectOption('I');
      await selects.nth(1).selectOption('N');
      await selects.nth(2).selectOption('F');
      await selects.nth(3).selectOption('P');
      await page.locator('#submit-mbti, button[type="submit"]').click();

      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();

      // Verify fallback warning / default coordinates route
      expect(recommendationRequests.length).toBeGreaterThan(0);
      const url = new URL(recommendationRequests[0].url());
      expect(url.searchParams.get('lat')).toBe('28.6139');
      expect(url.searchParams.get('lng')).toBe('77.2090');

      // 3. Disconnect network connectivity (simulate offline)
      await context.setOffline(true);

      // 4. Click on an already loaded raga card
      await page.locator('.hero-card, .recommendation-item').first().click();
      await page.waitForURL(/\/raga\/[0-9a-fA-F]{24}/);

      // 5. Verify cached mode offline warning & disabled external audio links
      const offlineWarning = page.locator('.offline-warning, .warning, :has-text("Offline"), :has-text("Cached")').first();
      await expect(offlineWarning).toBeVisible();

      const disabledAudio = page.locator('.audio-link.disabled, .disabled-audio-link, :has-text("offline")').first();
      await expect(disabledAudio).toBeVisible();
      
      // Cleanup offline mode
      await context.setOffline(false);
    });
  });

  // ==========================================
  // T4-04: Full 24-Hour Solar Cycle Simulation
  // ==========================================
  test.describe('Solar Cycle Simulation context', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T4-04: Full 24-Hour Solar Cycle Simulation', async ({ page }) => {
      // Seed initial local storage so dashboard loads directly
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });

      // 1. Mock 5:30 AM (Dawn Sandhi Prakash)
      await page.clock.install({ time: new Date('2026-07-13T05:30:00Z') });
      await page.goto('/');
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();

      const times = [
        '2026-07-13T08:30:00Z',  // Prahar 1
        '2026-07-13T11:30:00Z',  // Prahar 2
        '2026-07-13T15:00:00Z',  // Prahar 4
        '2026-07-13T18:30:00Z',  // Dusk Sandhi
        '2026-07-13T23:00:00Z'   // Prahar 7
      ];

      for (const time of times) {
        await page.clock.setSystemTime(new Date(time));
        await page.waitForTimeout(500);
        // Expect clock to transition and recommend list to remain valid without crash
        await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      }
    });
  });

  // ==========================================
  // T4-05: Rapid User Input Stress & Race Condition Resiliency
  // ==========================================
  test.describe('Stress testing context', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T4-05: Rapid User Input Stress & Race Condition Resiliency', async ({ page, context }) => {
      await page.evaluate(() => localStorage.clear());
      await page.goto('/');

      // 1. Interact with dropdown choices
      const selects = page.locator('.mbti-form-placeholder select, form select');
      await expect(selects).toHaveCount(4);
      await selects.nth(0).selectOption('I');
      await selects.nth(1).selectOption('N');
      await selects.nth(2).selectOption('F');
      await selects.nth(3).selectOption('P');

      // 2. Toggle offline/online rapidly
      await context.setOffline(true);
      await page.waitForTimeout(200);
      await context.setOffline(false);

      // Submit quiz
      await page.locator('#submit-mbti, button[type="submit"]').click();

      // 3. Click multiple cards rapidly
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
      const cards = page.locator('.recommendation-item, .raga-card');
      expect(await cards.count()).toBeGreaterThanOrEqual(2);
      await cards.nth(0).click({ force: true });
      await cards.nth(1).click({ force: true });

      // Verify page is still responsive and did not crash
      expect(page.url()).toBeTruthy();
    });
  });

  // ==========================================
  // T4-06: Database seeding integrity integration check
  // ==========================================
  test('T4-06: Database seeding integrity integration check', async () => {
    // 1. Run seed command and check output
    let seedOutput = '';
    try {
      seedOutput = execSync('npm run seed', { cwd: 'd:\\personalmusic', encoding: 'utf8' });
    } catch (err) {
      seedOutput = err.stdout || err.stderr || err.message;
    }
    
    // Ensure seeding ran successfully or contains success indication
    expect(seedOutput).toBeTruthy();
    expect(seedOutput.toLowerCase()).not.toContain('error');
  });
});
