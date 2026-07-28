const { test, expect } = require('@playwright/test');

test.describe('Example Playwright Tests', () => {
  test('should navigate to example.com and verify title', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Verify the page title
    await expect(page).toHaveTitle(/Example Domain/);
    
    // Verify the h1 heading exists and contains expected text
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Example Domain');
    
    // Verify the "More information" link exists
    const link = page.locator('a');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://iana.org/domains/example');
  });

  test('should check page content and paragraph text', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Verify paragraph text is present
    const paragraph = page.locator('p').first();
    await expect(paragraph).toContainText('This domain is for use in documentation examples');
  });
});
