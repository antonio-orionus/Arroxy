import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openScenario(page: Page, scenario: string): Promise<void> {
  await page.goto(`/?scenario=${scenario}`);
  await page.waitForSelector('[data-testid="app-root"]');
}

test('queue drawer scenario states hydrate without walking a fake download', async ({ page }) => {
  for (const [scenario, status] of [
    ['queue-running', 'running'],
    ['queue-paused-active', 'paused-active'],
    ['queue-paused-held', 'paused-held'],
    ['queue-error', 'error'],
    ['queue-completed', 'done'],
    ['queue-cancelled', 'cancelled']
  ] as const) {
    await openScenario(page, scenario);
    await expect(page.getByTestId('drawer-body')).toBeVisible();
    await expect(page.getByTestId('queue-card-scenario-queue-item')).toHaveAttribute('data-status', status);
  }
});

test('"Clear completed" button appears for completed scenario items', async ({ page }) => {
  await openScenario(page, 'queue-completed');

  await expect(page.getByTestId('btn-clear-completed')).toBeVisible();
  await expect(page.getByTestId('queue-card-scenario-queue-item')).toHaveAttribute('data-status', 'done');
});

test('"Clear completed" removes terminal scenario items and keeps drawer open', async ({ page }) => {
  await openScenario(page, 'queue-completed');

  await page.getByTestId('btn-clear-completed').click();

  await expect(page.getByTestId('drawer-body')).toBeVisible();
  await expect(page.getByTestId('queue-card-scenario-queue-item')).toHaveCount(0);
  await expect(page.getByTestId('btn-clear-completed')).not.toBeVisible();
  await expect(page.getByTestId('drawer-body')).toContainText('Downloads you queue');
});

test('screenshot — Clear button in drawer header for completed scenario', async ({ page }) => {
  await openScenario(page, 'queue-completed');

  const drawer = page.getByTestId('smart-drawer');
  const box = await drawer.boundingBox();
  if (!box) {
    throw new Error('Expected smart drawer bounding box before queue-clear-button screenshot capture');
  }
  await page.screenshot({
    path: 'tests/browser/screenshots/queue-clear-button.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });
  await expect(page.getByTestId('btn-clear-completed')).toBeVisible();
});
