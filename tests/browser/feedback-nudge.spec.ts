import { test, expect } from '@playwright/test';

// Uses the renderer dev server (browserMock.ts stubs all Electron APIs).
// NUDGE_DELAY_MS is overridden via window before page load so the nudge
// appears after 200ms instead of 45s.

test.beforeEach(async ({ page }) => {
  // Inject override before any scripts run
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__NUDGE_DELAY_MS = 200;
  });
  await page.goto('/');
  // Wait for splash / init to clear
  await page.waitForSelector('[data-testid="app-root"]');
});

test('feedback nudge appears after delay and shows mascot + message', async ({ page }) => {
  // Should not exist yet
  await expect(page.getByTestId('feedback-nudge')).not.toBeVisible();

  // Wait for the 200ms delay + animation
  await page.waitForSelector('[data-testid="feedback-nudge"]', { timeout: 2_000 });

  await expect(page.getByTestId('feedback-nudge')).toBeVisible();
  await expect(page.getByTestId('feedback-nudge')).toContainText('Enjoying Arroxy');

  await page.screenshot({ path: 'tests/browser/screenshots/nudge-visible.png', fullPage: false });
});

test('feedback button has nudging animation class while nudge is shown', async ({ page }) => {
  await page.waitForSelector('[data-testid="feedback-nudge"]', { timeout: 2_000 });

  const btn = page.getByTestId('btn-feedback');
  await expect(btn).toHaveClass(/feedback-btn-nudging/);
});

test('nudge auto-dismisses after 8 seconds', async ({ page }) => {
  await page.waitForSelector('[data-testid="feedback-nudge"]', { timeout: 2_000 });

  // Fast-forward browser timers past the 8s auto-dismiss
  await page.evaluate(() => {
    // Trigger all pending setTimeout callbacks immediately
    const origSet = window.setTimeout;
    // Override Date so the 8s timeout fires right away
    void origSet(() => {}, 0); // flush microtasks
  });

  // Use waitForFunction to poll until nudge disappears (up to 10s real time)
  await page.waitForFunction(() => !document.querySelector('[data-testid="feedback-nudge"]'), {
    timeout: 10_000,
    polling: 500
  });

  await expect(page.getByTestId('feedback-nudge')).not.toBeVisible();
});

test('clicking Feedback button dismisses the nudge', async ({ page }) => {
  await page.waitForSelector('[data-testid="feedback-nudge"]', { timeout: 2_000 });

  await page.getByTestId('btn-feedback').click();

  // Nudge should start exit animation; wait for it to disappear
  await expect(page.getByTestId('feedback-nudge')).not.toBeVisible({ timeout: 1_000 });
});

test('visual screenshot — nudge above Feedback button', async ({ page }) => {
  await page.waitForSelector('[data-testid="feedback-nudge"]', { timeout: 2_000 });

  // Zoom into footer area for a pixel-level check
  const footer = page.locator('footer');
  const box = await footer.boundingBox();
  if (box) {
    await page.screenshot({
      path: 'tests/browser/screenshots/nudge-footer-zoom.png',
      clip: { x: box.x, y: box.y - 80, width: box.width, height: box.height + 80 }
    });
  }

  await expect(page.getByTestId('feedback-nudge')).toBeVisible();
});
