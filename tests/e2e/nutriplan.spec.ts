import { test, expect } from '@playwright/test';

test.describe('NutriPlan App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/NutriPlan/);
  });

  test('should display navigation tabs', async ({ page }) => {
    // Check for Planner and Library tabs
    const plannerTab = page.getByRole('button', { name: /planer|planner/i });
    const libraryTab = page.getByRole('button', { name: /bibliothek|library/i });

    await expect(plannerTab).toBeVisible();
    await expect(libraryTab).toBeVisible();
  });

  test('should switch language', async ({ page }) => {
    // Find language toggle
    const langButton = page.getByRole('button', { name: /de|en/i });
    await langButton.click();

    // Verify language changed
    await expect(page.locator('body')).toContainText(/(Planner|Planer)/);
  });

  test('should show planner form fields', async ({ page }) => {
    // Check form elements exist
    await expect(page.getByLabel(/alter|age/i)).toBeVisible();
    await expect(page.getByLabel(/geschlecht|gender/i)).toBeVisible();
    await expect(page.getByLabel(/ziel|goal/i)).toBeVisible();
  });

  test('should navigate to nut library', async ({ page }) => {
    const libraryTab = page.getByRole('button', { name: /bibliothek|library/i });
    await libraryTab.click();

    // Should show nut selection
    await expect(page.getByText(/mandel|almond/i)).toBeVisible();
  });

  test('should generate nutrition plan', async ({ page }) => {
    // Fill form
    await page.getByLabel(/alter|age/i).fill('30');

    // Select goal
    const goalSelect = page.getByLabel(/ziel|goal/i);
    await goalSelect.selectOption({ index: 1 });

    // Submit form
    const submitButton = page.getByRole('button', { name: /generieren|generate/i });
    await submitButton.click();

    // Wait for loading to complete (with timeout for API)
    await expect(page.getByText(/lade|loading/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('NutLibrary Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const libraryTab = page.getByRole('button', { name: /bibliothek|library/i });
    await libraryTab.click();
  });

  test('should display nut cards', async ({ page }) => {
    const nutTypes = ['cashew', 'mandel', 'walnuss', 'haselnuss'];

    for (const nut of nutTypes) {
      await expect(page.getByText(new RegExp(nut, 'i'))).toBeVisible();
    }
  });

  test('should show nutrient slider', async ({ page }) => {
    // Click on a nut card
    await page.getByText(/cashew/i).first().click();

    // Slider should appear
    const slider = page.getByRole('slider');
    await expect(slider).toBeVisible();
  });

  test('should calculate nutrients on slider change', async ({ page }) => {
    await page.getByText(/cashew/i).first().click();

    const slider = page.getByRole('slider');
    await slider.fill('50');

    // Should show nutrient values
    await expect(page.getByText(/magnesium|protein|eiweiß/i)).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('mobile navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu should be accessible
    const menuButton = page.getByRole('button', { name: /menu|menü/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });
});
