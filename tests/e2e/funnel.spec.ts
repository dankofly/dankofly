import { test, expect } from '@playwright/test';

const UTM = /utm_source=nutriplaner/;

test.describe('UTM tagging', () => {
  test('nut library shop CTA carries UTM params', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /rechner|calculator/i }).first().click();

    const shopCta = page.getByRole('link', { name: /nuss-shop|2die4 shop/i }).first();
    await expect(shopCta).toBeVisible();
    const href = await shopCta.getAttribute('href');
    expect(href).toMatch(UTM);
    expect(href).toContain('utm_medium=referral');
    expect(href).toContain('utm_campaign=nut-library');
  });

  test('footer shop links carry UTM params', async ({ page }) => {
    await page.goto('/');
    const footerShopLink = page.getByRole('link', { name: /zum shop|visit shop/i });
    const href = await footerShopLink.getAttribute('href');
    expect(href).toMatch(UTM);
    expect(href).toContain('utm_campaign=footer');
  });

  test('header logo link carries UTM params', async ({ page }) => {
    await page.goto('/');
    const logoLink = page.locator('nav a[href*="2die4livefoods.com"]').first();
    const href = await logoLink.getAttribute('href');
    expect(href).toContain('utm_campaign=header-logo');
  });
});

const PLAN_FIXTURE = {
  id: 123,
  plan: {
    title: 'Test Energie Plan',
    strategy: 'Teststrategie für mehr Energie.',
    schedule: Array.from({ length: 7 }, (_, i) => ({
      day: `Tag ${i + 1}`,
      mix: ['30g Mandeln (eine Handvoll)', '5g Paranüsse (1 Nuss)'],
      focus: 'Magnesium & B-Vitamine',
      supplement: 'Trägt zur Deckung des Tagesbedarfs an Magnesium bei.',
    })),
    summary: 'Testzusammenfassung.',
  },
  context: { duration: 2, lifeStage: 'adult', language: 'de', goal: 'energy' },
};

test.describe('Shared plan permalinks', () => {
  test('renders shared plan from ?plan=<id> without form submit', async ({ page }) => {
    await page.route('**/.netlify/functions/plans*', route => {
      if (route.request().url().includes('id=123')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PLAN_FIXTURE) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    });

    await page.goto('/de/?plan=123');
    await expect(page.getByRole('heading', { name: 'Test Energie Plan' })).toBeVisible({ timeout: 10000 });
  });

  test('unknown plan id shows notice and keeps the form usable', async ({ page }) => {
    await page.route('**/.netlify/functions/plans*', route =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) })
    );

    await page.goto('/de/?plan=999999');
    await expect(page.getByText(/nicht gefunden/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /generieren|generate/i })).toBeVisible();
  });
});

test.describe('Email capture', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/.netlify/functions/plans*', route => {
      if (route.request().url().includes('id=123')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PLAN_FIXTURE) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    });
    await page.goto('/de/?plan=123');
    await expect(page.getByRole('heading', { name: 'Test Energie Plan' })).toBeVisible({ timeout: 10000 });
  });

  test('successful subscribe shows confirmation copy', async ({ page }) => {
    await page.route('**/.netlify/functions/subscribe', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
    );

    await page.getByPlaceholder('deine@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /plan \+ code senden/i }).click();
    await expect(page.getByText(/fast geschafft/i)).toBeVisible();
    await expect(page.getByText(/bestätige/i)).toBeVisible();
  });

  test('server error keeps the form editable and shows message', async ({ page }) => {
    await page.route('**/.netlify/functions/subscribe', route =>
      route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'Upstream error' }) })
    );

    await page.getByPlaceholder('deine@email.com').fill('test@example.com');
    await page.getByRole('button', { name: /plan \+ code senden/i }).click();
    await expect(page.getByText(/nicht geklappt/i)).toBeVisible();
    await expect(page.getByPlaceholder('deine@email.com')).toBeEditable();
  });
});

test.describe('One-click cart', () => {
  test('cart button links to a Shopify cart permalink with UTM', async ({ page }) => {
    await page.route('**/.netlify/functions/plans*', route => {
      if (route.request().url().includes('id=123')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PLAN_FIXTURE) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    });

    await page.goto('/de/?plan=123');
    await expect(page.getByRole('heading', { name: 'Test Energie Plan' })).toBeVisible({ timeout: 10000 });

    const cartButton = page.getByRole('link', { name: /alles in den warenkorb/i });
    await expect(cartButton).toBeVisible();
    const href = await cartButton.getAttribute('href');
    expect(href).toMatch(/^https:\/\/www\.2die4livefoods\.com\/cart\/\d+:\d+(,\d+:\d+)*\?/);
    expect(href).toContain('utm_campaign=planner-cart');
  });
});
