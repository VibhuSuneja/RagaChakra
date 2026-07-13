const { test, expect } = require('@playwright/test');
const mockData = require('./fixtures/mockData.json');

test.describe('Tier 1: Feature Coverage (25 Cases)', () => {
  let healthCheckHit = false;
  let recommendationRequest = null;
  let ipapiHit = false;
  let mbtiSubmitHit = false;
  let consoleErrors = [];

  test.beforeEach(async ({ page, context }) => {
    healthCheckHit = false;
    recommendationRequest = null;
    ipapiHit = false;
    mbtiSubmitHit = false;
    consoleErrors = [];

    // Catch console errors
    page.on('pageerror', error => {
      consoleErrors.push(error);
    });

    // Set up standard mock routes
    await page.route('**/api/health', async route => {
      healthCheckHit = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.healthCheck)
      });
    });

    await page.route('**/api/mbti', async route => {
      mbtiSubmitHit = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.mbtiSubmit)
      });
    });

    await page.route('**/api/raga/current*', async route => {
      recommendationRequest = route.request();
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
      ipapiHit = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData.ipapiGeo)
      });
    });
  });

  // ==========================================
  // Feature 1: Client Setup & App Loading (T1-F1)
  // ==========================================

  test('T1-F1-01: Verify that the application home page loads successfully without any unhandled JavaScript console errors', async ({ page }) => {
    await page.goto('/');
    expect(consoleErrors).toHaveLength(0);
    await expect(page.locator('#app-root, #root, body')).toBeVisible();
  });

  test('T1-F1-02: Check that the theme styling elements are correct (page background color is exactly #0D0B2B, and text color is ivory #F5F0E8)', async ({ page }) => {
    await page.goto('/');
    const colors = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const rootStyle = window.getComputedStyle(document.documentElement);
      // Try to find the exact background color in body or root elements
      return {
        bodyBg: bodyStyle.backgroundColor,
        bodyColor: bodyStyle.color,
        rootBg: rootStyle.backgroundColor
      };
    });
    // Check if background color contains values equivalent to #0D0B2B (rgb(13, 11, 43)) or is styled accordingly
    // Note: browsers return rgb format. rgb(13, 11, 43) is #0d0b2b, rgb(245, 240, 232) is #f5f0e8
    const isDarkBg = colors.bodyBg.includes('rgb(13, 11, 43)') || colors.bodyBg.includes('13, 11, 43') || colors.rootBg.includes('rgb(13, 11, 43)');
    const isIvoryColor = colors.bodyColor.includes('rgb(245, 240, 232)') || colors.bodyColor.includes('245, 240, 232)');
    expect(isDarkBg).toBe(true);
    expect(isIvoryColor).toBe(true);
  });

  test('T1-F1-03: Verify that the client initiates a request to the backend /api/health health check endpoint upon startup', async ({ page }) => {
    await page.goto('/');
    expect(healthCheckHit).toBe(true);
  });

  test('T1-F1-04: Confirm that the card elements utilize the required glassmorphic properties (background-color: rgba(255,255,255,0.05) and backdrop-filter: blur(12px))', async ({ page }) => {
    await page.goto('/');
    // Check styled glass-card class
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
  });

  test('T1-F1-05: Check that the custom fonts (Playfair Display for headers and Inter for body text) are declared and imported', async ({ page }) => {
    await page.goto('/');
    const fontsUsed = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2, h3, .heading');
      const body = document.querySelector('body, p, .body-text');
      return {
        headingFont: heading ? window.getComputedStyle(heading).fontFamily : '',
        bodyFont: body ? window.getComputedStyle(body).fontFamily : ''
      };
    });
    expect(fontsUsed.headingFont.toLowerCase()).toContain('playfair display');
    expect(fontsUsed.bodyFont.toLowerCase()).toContain('inter');
  });

  // ==========================================
  // Feature 2: MBTI Capture Flow (T1-F2)
  // ==========================================

  test('T1-F2-01: Verify that if the user visits with an empty localStorage, the recommendations dashboard is hidden and the MBTI questionnaire screen is shown', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await expect(page.locator('.mbti-capture-container, #mbti-capture')).toBeVisible();
    await expect(page.locator('.dashboard-container, #dashboard')).toBeHidden();
  });

  test('T1-F2-02: Check that the user is forced to answer exactly 4 binary-choice questions mapping the 4 temperament axes (I/E, N/S, T/F, J/P)', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    const selectCount = await page.locator('.mbti-form-placeholder select, form select').count();
    expect(selectCount).toBe(4);
  });

  test('T1-F2-03: Verify that completing the questionnaire writes the resulting MBTI string (e.g. INFP) to localStorage under the key ragachakra_mbti', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    
    // Complete the questionnaire
    const selects = page.locator('.mbti-form-placeholder select, form select');
    await expect(selects).toHaveCount(4);
    await selects.nth(0).selectOption('I');
    await selects.nth(1).selectOption('N');
    await selects.nth(2).selectOption('F');
    await selects.nth(3).selectOption('P');
    await page.locator('#submit-mbti, button[type="submit"]').click();

    const mbti = await page.evaluate(() => localStorage.getItem('ragachakra_mbti'));
    expect(mbti).toBeTruthy();
    expect(mbti).toHaveLength(4);
  });

  test('T1-F2-04: Verify that completing the flow generates a random UUID client ID and writes it to localStorage under ragachakra_client_id', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    const selects = page.locator('.mbti-form-placeholder select, form select');
    await expect(selects).toHaveCount(4);
    await selects.nth(0).selectOption('I');
    await selects.nth(1).selectOption('N');
    await selects.nth(2).selectOption('F');
    await selects.nth(3).selectOption('P');
    await page.locator('#submit-mbti, button[type="submit"]').click();

    const clientId = await page.evaluate(() => localStorage.getItem('ragachakra_client_id'));
    expect(clientId).toBeTruthy();
    // Validate UUID format roughly
    expect(clientId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  test('T1-F2-05: Check that on a subsequent visit (where ragachakra_mbti and ragachakra_client_id exist), the MBTI questionnaire is skipped and the recommendations dashboard displays directly', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('ragachakra_mbti', 'INFP');
      localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
    });
    await page.goto('/');
    await expect(page.locator('.mbti-capture-container, #mbti-capture')).toBeHidden();
    await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
  });

  // ==========================================
  // Feature 3: Geolocation & API Hook (T1-F3)
  // ==========================================

  test.describe('Geolocation Tests', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T1-F3-01: Verify that browser location coordinates are requested and mock coordinates (e.g. 28.6139, 77.2090) are successfully read by the frontend application', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');
      
      // Ensure recommendation request was fired and captured the coordinates
      expect(recommendationRequest).toBeTruthy();
      const url = new URL(recommendationRequest.url());
      expect(url.searchParams.get('lat')).toBe('28.6139');
      expect(url.searchParams.get('lng')).toBe('77.2090');
    });
  });

  test.describe('Geolocation Denied Tests', () => {
    test.use({
      permissions: [],
      geolocation: undefined
    });

    test('T1-F3-02: Verify that when browser geolocation is denied, the application falls back to querying https://ipapi.co/json/', async ({ page, context }) => {
      // Explicitly deny geolocation in context
      await context.clearPermissions();
      
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');
      
      // Check ipapi fetch
      expect(ipapiHit).toBe(true);
      expect(recommendationRequest).toBeTruthy();
      const url = new URL(recommendationRequest.url());
      expect(url.searchParams.get('lat')).toBe('19.076');
      expect(url.searchParams.get('lng')).toBe('72.8777');
    });
  });

  test.describe('Recommendation API Parameters', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T1-F3-03: Verify that the recommendation dashboard calls the backend endpoint GET /api/raga/current with query parameters lat, lng, tz, and clientId', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');
      
      expect(recommendationRequest).toBeTruthy();
      const url = new URL(recommendationRequest.url());
      expect(url.pathname).toContain('/api/raga/current');
      expect(url.searchParams.has('lat')).toBe(true);
      expect(url.searchParams.has('lng')).toBe(true);
      expect(url.searchParams.has('tz')).toBe(true);
      expect(url.searchParams.has('clientId')).toBe(true);
    });

    test('T1-F3-04: Verify that the user\'s current timezone string (e.g., Asia/Kolkata) is dynamically determined and sent as tz in the recommendation fetch query', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');
      
      expect(recommendationRequest).toBeTruthy();
      const url = new URL(recommendationRequest.url());
      const tz = url.searchParams.get('tz');
      expect(tz).toBeTruthy();
      // Should match standard timezone formatting or local machine timezone
      expect(tz).toContain('/');
    });

    test('T1-F3-05: Verify that when location coordinates change, the application triggers a fresh recommendation API query', async ({ page, context }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');
      
      expect(recommendationRequest).toBeTruthy();
      recommendationRequest = null; // reset

      // Simulate coordinates update
      await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 });
      
      // Let React run hooks
      await page.waitForTimeout(1000);
      
      expect(recommendationRequest).toBeTruthy();
      const url = new URL(recommendationRequest.url());
      expect(url.searchParams.get('lat')).toBe('12.9716');
      expect(url.searchParams.get('lng')).toBe('77.5946');
    });
  });

  // ==========================================
  // Feature 4: Clock & Recommendations Dashboard (T1-F4)
  // ==========================================

  test.describe('Dashboard UI & Recommendations', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T1-F4-01: Verify that the circular Prahar Clock SVG renders correctly in the DOM and contains 8 distinct segments', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');
      
      const clock = page.locator('svg.prahar-clock, #prahar-clock-svg');
      await expect(clock).toBeVisible();
      const segments = clock.locator('.prahar-segment, path.segment');
      expect(await segments.count()).toBe(8);
    });

    test('T1-F4-02: Check that the segment matching the current prahar is highlighted in saffron #E8890C', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');

      const highlightedSegment = page.locator('.prahar-segment.active, path.segment.active');
      await expect(highlightedSegment).toBeVisible();
      const fillColor = await highlightedSegment.evaluate(el => {
        return window.getComputedStyle(el).fill || el.getAttribute('fill');
      });
      // Saffron #E8890C matches rgb(232, 137, 12)
      expect(fillColor.replace(/\s+/g, '').toLowerCase()).toContain('rgb(232,137,12)');
    });

    test('T1-F4-03: Verify that the top recommended raga is displayed in a Hero Card with its name, thaat, rasa tags, and the correct composition reasoning string', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');

      const heroCard = page.locator('.hero-card, #hero-raga-card');
      await expect(heroCard).toBeVisible();
      await expect(heroCard.locator('.raga-name, h2')).toContainText('Bhairav');
      await expect(heroCard.locator('.raga-thaat, .thaat-tag')).toContainText('Bhairav');
      await expect(heroCard.locator('.raga-rasa, .rasa-tag')).toContainText('Shanta');
      await expect(heroCard.locator('.reasoning-text, .reasoning')).toContainText('Dawn — Sandhi Prakash · INFP (Idealist)');
    });

    test('T1-F4-04: Verify that up to 5 recommended ragas are listed in descending rank order below the Hero Card', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');

      // Wait for list items
      const items = page.locator('.recommendation-list .raga-card, .recommendation-item');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThanOrEqual(5);

      // Verify descending rank (mocked score order: Bhairav 0.70, Bhairavi 0.65)
      expect(count).toBeGreaterThanOrEqual(2);
      const text1 = await items.nth(0).textContent();
      const text2 = await items.nth(1).textContent();
      expect(text1).toContain('Bhairav');
      expect(text2).toContain('Bhairavi');
    });

    test('T1-F4-05: Verify that the reasoning text on the Hero Card correctly reflects the user\'s MBTI type and Keirsey temperament name (e.g., INFP (Idealist))', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');

      const reasoning = page.locator('.hero-card .reasoning-text, #hero-raga-card .reasoning');
      await expect(reasoning).toContainText('INFP (Idealist)');
    });
  });

  // ==========================================
  // Feature 5: Raga Detail Page (T1-F5)
  // ==========================================

  test.describe('Detail Page Tests', () => {
    test.use({
      geolocation: { latitude: 28.6139, longitude: 77.2090 },
      permissions: ['geolocation'],
    });

    test('T1-F5-01: Verify that clicking a recommended raga card routes the browser to /raga/:id', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/');

      const firstCard = page.locator('.hero-card, .recommendation-item').first();
      await firstCard.click();
      await page.waitForURL(/\/raga\/[0-9a-fA-F]{24}/);
      expect(page.url()).toContain('/raga/60c72b2f9b1d8b2d88888801');
    });

    test('T1-F5-02: Verify that the detail page displays the selected raga\'s name, thaat, and rasa tags', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/raga/60c72b2f9b1d8b2d88888801');

      const detailContainer = page.locator('.raga-detail-container, #raga-detail');
      await expect(detailContainer).toBeVisible();
      await expect(detailContainer.locator('.raga-name, h1')).toContainText('Bhairav');
      await expect(detailContainer.locator('.raga-thaat, .thaat-tag')).toContainText('Bhairav');
      await expect(detailContainer.locator('.raga-rasa, .rasa-tag')).toContainText('Shanta');
    });

    test('T1-F5-03: Verify that the raga\'s ascending and descending notes are displayed correctly in sargam notation', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/raga/60c72b2f9b1d8b2d88888801');

      const ascending = page.locator('.ascending-notes, .notes-asc');
      const descending = page.locator('.descending-notes, .notes-desc');
      await expect(ascending).toContainText('S r G M P d N S\'');
      await expect(descending).toContainText('S\' N d P M G r S');
    });

    test('T1-F5-04: Verify that audio references are displayed strictly as plain-text links with target="_blank"', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      await page.goto('/raga/60c72b2f9b1d8b2d88888801');

      const links = page.locator('.audio-refs-list a, .audio-link');
      const count = await links.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        expect(await link.getAttribute('target')).toBe('_blank');
        // Ensure no nested iframe embeds exist
        expect(await page.locator('iframe').count()).toBe(0);
      }
    });

    test('T1-F5-05: Verify that the detail page has a functioning "Back to Dashboard" button that restores the previous home screen state', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('ragachakra_mbti', 'INFP');
        localStorage.setItem('ragachakra_client_id', 'a8c9b9f3-8b2b-4fa1-8288-75c1a0be5349');
      });
      // Start at dashboard
      await page.goto('/');
      // Go to detail
      await page.locator('.hero-card, .recommendation-item').first().click();
      await page.waitForURL(/\/raga\/[0-9a-fA-F]{24}/);
      
      // Click back
      const backBtn = page.locator('#back-to-dashboard-btn, .back-btn, button:has-text("Back")');
      await backBtn.click();
      
      await page.waitForURL(/\/$/);
      // Ensure dashboard is visible
      await expect(page.locator('.dashboard-container, #dashboard')).toBeVisible();
    });
  });
});
