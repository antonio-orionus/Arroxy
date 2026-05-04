import { test, expect } from '@playwright/test';

// All tests use the renderer dev server with browserMock.ts.
// The mock's queue.load() returns [] (no persistence), so these tests
// exercise the UI by completing a full download flow and then verifying
// the "Clear completed" button and drawer behavior.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="app-root"]');
});

async function addToQueue(page: import('@playwright/test').Page) {
  // Step 1: enter URL
  await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=test123');
  await page.getByTestId('btn-find-formats').click();

  // Step 2: wait for formats and click Continue
  await page.waitForSelector('[data-testid="step-formats"]', { timeout: 5_000 });
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 3: confirm folder
  await page.waitForSelector('[data-testid="step-folder"]', { timeout: 2_000 });
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 4: queue the download
  await page.waitForSelector('[data-testid="step-confirm"]', { timeout: 2_000 });
}

async function completeOneDownload(page: import('@playwright/test').Page) {
  await addToQueue(page);
  await page.getByTestId('btn-download-now').click();

  // Wait for download to complete (mock takes ~5s)
  await page.waitForFunction(
    () => {
      const items = document.querySelectorAll('[data-status="done"]');
      return items.length > 0;
    },
    { timeout: 15_000, polling: 500 }
  );
}

test('drawer opens automatically when item is added to queue', async ({ page }) => {
  await addToQueue(page);
  await page.getByTestId('btn-add-to-queue').click();

  // Drawer should be open (visible)
  await expect(page.getByTestId('drawer-body')).toBeVisible();
});

test('"Clear completed" button is absent when queue is empty', async ({ page }) => {
  await expect(page.getByTestId('btn-clear-completed')).not.toBeVisible();
});

test('"Clear completed" button appears after a download finishes', async ({ page }) => {
  // Button should not exist initially
  await expect(page.getByTestId('btn-clear-completed')).not.toBeVisible();

  await completeOneDownload(page);

  await expect(page.getByTestId('btn-clear-completed')).toBeVisible();
});

test('"Clear completed" button removes done items from queue', async ({ page }) => {
  await completeOneDownload(page);

  // Verify done item is present
  await expect(page.locator('[data-status="done"]')).toHaveCount(1);

  await page.getByTestId('btn-clear-completed').click();

  // Done item should be gone
  await expect(page.locator('[data-status="done"]')).toHaveCount(0);

  // Button should disappear too
  await expect(page.getByTestId('btn-clear-completed')).not.toBeVisible();
});

test('"Clear completed" does not close the drawer', async ({ page }) => {
  await completeOneDownload(page);

  const drawer = page.getByTestId('drawer-body');
  await expect(drawer).toBeVisible();

  await page.getByTestId('btn-clear-completed').click();

  // Drawer stays open
  await expect(drawer).toBeVisible();
});

test('queue shows empty state message after clearing all completed items', async ({ page }) => {
  await completeOneDownload(page);

  await page.getByTestId('btn-clear-completed').click();

  // Empty state message should appear
  await expect(page.getByTestId('drawer-body')).toContainText('Downloads you queue');
});

test('screenshot — Clear button in drawer header after completed download', async ({ page }) => {
  await completeOneDownload(page);

  const drawer = page.getByTestId('smart-drawer');
  const box = await drawer.boundingBox();
  if (box) {
    await page.screenshot({
      path: 'tests/browser/screenshots/queue-clear-button.png',
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
  }
  await expect(page.getByTestId('btn-clear-completed')).toBeVisible();
});
