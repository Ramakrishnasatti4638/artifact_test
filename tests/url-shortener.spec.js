// @ts-check
const { test, expect, request } = require('@playwright/test');

// ─── Reset helper ────────────────────────────────────────────────────────────
async function resetServer(page) {
  await page.request.delete('http://localhost:4000/api/__reset');
}

// ─── Page Object ─────────────────────────────────────────────────────────────
class URLShortenerPage {
  constructor(page) {
    this.page        = page;
    this.urlInput    = page.getByPlaceholder('https://example.com/long-url');
    this.aliasInput  = page.getByPlaceholder('my-link');
    this.shortenBtn  = page.getByRole('button', { name: 'Shorten' });
    this.resultBox   = page.locator('#result');
    this.errorBox    = page.locator('#error');
    this.linksBody   = page.locator('#linksBody');
    this.totalLinks  = page.locator('#totalLinks');
    this.totalClicks = page.locator('#totalClicks');
  }

  async goto() {
    await this.page.goto('/');
  }

  async shorten(url, alias = '') {
    await this.urlInput.fill(url);
    if (alias) await this.aliasInput.fill(alias);
    else await this.aliasInput.fill('');
    await this.shortenBtn.click();
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('URL Shortener – UI', () => {

  // Fresh server state before every test
  test.beforeEach(async ({ page }) => {
    await resetServer(page);
    await page.goto('/');
  });

  // ── 1. Homepage ────────────────────────────────────────────────────────────
  test('homepage loads with correct title and empty stats', async ({ page }) => {
    await expect(page).toHaveTitle('URL Shortener');
    await expect(page.getByRole('heading', { name: '🔗 URL Shortener' })).toBeVisible();
    const app = new URLShortenerPage(page);
    await expect(app.totalLinks).toHaveText('0');
    await expect(app.totalClicks).toHaveText('0');
  });

  // ── 2. Empty table ─────────────────────────────────────────────────────────
  test('shows "No links yet" row when table is empty', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await expect(app.linksBody.getByText('No links yet')).toBeVisible();
  });

  // ── 3. Shorten valid URL ───────────────────────────────────────────────────
  test('shortens a valid URL and shows result box', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('https://www.example.com/some/long/path');

    await expect(app.resultBox).toBeVisible();
    await expect(app.resultBox).toContainText('Short URL:');
    await expect(page.locator('#shortLink')).toContainText('/go/');
  });

  // ── 4. Stats update ────────────────────────────────────────────────────────
  test('stats update after shortening a URL', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('https://playwright.dev');

    await expect(app.totalLinks).toHaveText('1');
    await expect(app.totalClicks).toHaveText('0');
  });

  // ── 5. Link appears in table ───────────────────────────────────────────────
  test('shortened link appears in the links table', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('https://github.com');

    await expect(app.linksBody).toContainText('https://github.com');
    await expect(app.linksBody).not.toContainText('No links yet');
  });

  // ── 6. Custom alias ────────────────────────────────────────────────────────
  test('shortens with a custom alias', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('https://nodejs.org', 'node-home');

    await expect(page.locator('#shortLink')).toContainText('/go/node-home');
    await expect(app.linksBody).toContainText('node-home');
  });

  // ── 7. Empty URL error ─────────────────────────────────────────────────────
  test('shows error for an empty URL submission', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shortenBtn.click();

    await expect(app.errorBox).toBeVisible();
    await expect(app.errorBox).toContainText('Please enter a URL.');
  });

  // ── 8. Invalid URL error ───────────────────────────────────────────────────
  test('shows error for an invalid URL', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('not-a-valid-url');

    await expect(app.errorBox).toBeVisible();
    await expect(app.errorBox).toContainText('Invalid URL');
  });

  // ── 9. Duplicate alias error ───────────────────────────────────────────────
  test('shows error when alias is already taken', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('https://example.com', 'dup-alias');
    await expect(app.resultBox).toBeVisible();

    await app.shorten('https://another.com', 'dup-alias');

    await expect(app.errorBox).toBeVisible();
    await expect(app.errorBox).toContainText('Alias already in use');
  });

  // ── 10. Multiple URLs ──────────────────────────────────────────────────────
  test('can shorten multiple URLs and table shows all of them', async ({ page }) => {
    const app = new URLShortenerPage(page);

    await app.shorten('https://one.example.com', 'link-one');
    await expect(app.resultBox).toBeVisible();

    await app.shorten('https://two.example.com', 'link-two');
    await expect(app.resultBox).toBeVisible();

    await expect(app.totalLinks).toHaveText('2');
    await expect(app.linksBody).toContainText('https://one.example.com');
    await expect(app.linksBody).toContainText('https://two.example.com');
  });

  // ── 11. Delete link ────────────────────────────────────────────────────────
  test('delete button removes the link from the table', async ({ page }) => {
    const app = new URLShortenerPage(page);
    await app.shorten('https://delete-me.example.com', 'bye-link');
    await expect(app.linksBody).toContainText('bye-link');

    // Click the Delete button in the row that contains 'bye-link'
    await page.locator('#linksBody tr', { hasText: 'bye-link' })
              .getByRole('button', { name: 'Delete' })
              .click();

    await expect(app.linksBody).not.toContainText('bye-link');
    await expect(app.totalLinks).toHaveText('0');
  });

  // ── 12. Copy button ────────────────────────────────────────────────────────
  test('Copy button changes label to "Copied!" then reverts', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    // Override clipboard.writeText so it never rejects in headless mode
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: (text) => Promise.resolve(),
          readText:  ()     => Promise.resolve(''),
        },
        writable: true,
      });
    });

    await page.reload();
    const app = new URLShortenerPage(page);
    await app.shorten('https://copy-test.example.com', 'copy-me');
    await expect(app.resultBox).toBeVisible();

    const copyBtn = page.locator('#copyBtn');
    await copyBtn.click();

    await expect(copyBtn).toHaveText('Copied!');
    // Reverts back after ~1.5 s
    await expect(copyBtn).toHaveText('Copy', { timeout: 4000 });
  });

});
