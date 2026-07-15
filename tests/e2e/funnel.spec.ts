import { test, expect } from '@playwright/test';

const UTM = /utm_source=nutriplaner/;

test.describe('UTM tagging', () => {
  test('nut library shop CTA carries UTM params', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /bibliothek|library/i }).click();

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
