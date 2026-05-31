import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const BASE_URL = process.env.SCENARIO_BASE_URL ?? '';

async function openScenario(page: Page, scenario: string): Promise<void> {
  await page.goto(`${BASE_URL}/?scenario=${scenario}`);
  await page.waitForSelector('[data-testid="app-root"]');
}

async function openWithParams(page: Page, params: string): Promise<void> {
  await page.goto(`${BASE_URL}/?${params}`);
  await page.waitForSelector('[data-testid="app-root"]');
}

async function waitForSplashToLeave(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="splash-overlay"]', { state: 'detached', timeout: 6_000 }).catch(() => undefined);
}

async function waitForPlaylist(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="step-playlist-items"]', { timeout: 6_000 });
}

test('scenario gallery is available in browser-mock mode', async ({ page }) => {
  await openScenario(page, 'default');

  await expect(page.getByTestId('scenario-gallery')).toBeVisible();
  await page.getByTestId('scenario-gallery-toggle').click();
  await expect(page.getByTestId('scenario-button-queue-running')).toBeVisible();
});

test('playlist cap alert follows ?playlist=n param counts', async ({ page }) => {
  await openWithParams(page, 'playlist=99');
  await waitForPlaylist(page);
  await expect(page.getByTestId('playlist-probe-limit-alert')).not.toBeVisible();

  await openWithParams(page, 'playlist=100');
  await waitForPlaylist(page);
  await expect(page.getByTestId('playlist-probe-limit-alert')).not.toBeVisible();

  await openWithParams(page, 'playlist=101');
  await waitForPlaylist(page);
  await expect(page.getByTestId('playlist-probe-limit-alert')).toBeVisible();
});

test('playlist count presets in gallery navigate to ?playlist=n', async ({ page }) => {
  await openScenario(page, 'default');
  await page.getByTestId('scenario-gallery-toggle').click();
  await expect(page.getByTestId('playlist-preset-101')).toBeVisible();
});

test('normal happy path scenarios land on their natural screens', async ({ page }) => {
  await openScenario(page, 'single-normal');
  await expect(page.getByTestId('step-formats')).toBeVisible({ timeout: 6_000 });

  await openScenario(page, 'playlist-normal');
  await expect(page.getByTestId('step-playlist-items')).toBeVisible({ timeout: 6_000 });
});

test('mockStep opens normal happy paths directly to confirm', async ({ page }) => {
  await openWithParams(page, 'scenario=single-normal&mockStep=confirm');
  await expect(page.getByTestId('step-confirm')).toBeVisible({ timeout: 6_000 });

  await openWithParams(page, 'scenario=playlist-normal&mockStep=confirm');
  await expect(page.getByTestId('step-confirm')).toBeVisible({ timeout: 6_000 });
});

test('normal happy path scenarios expose the screen picker', async ({ page }) => {
  await openScenario(page, 'single-normal');
  await page.getByTestId('scenario-gallery-toggle').click();
  await expect(page.getByTestId('scenario-button-single-normal')).toBeVisible();
  await expect(page.getByTestId('scenario-button-playlist-normal')).toBeVisible();
  await expect(page.getByTestId('mock-step-select')).toBeVisible();
});

test('probe error dropdown shows all error kinds', async ({ page }) => {
  await openScenario(page, 'default');
  await page.getByTestId('scenario-gallery-toggle').click();
  await expect(page.getByTestId('probe-error-kind-select')).toBeVisible();
});

test('update scenarios render channel-specific actions', async ({ page }) => {
  await openScenario(page, 'update-homebrew');
  await expect(page.getByTestId('update-command')).toHaveText('brew upgrade --cask arroxy');

  await openScenario(page, 'update-scoop');
  await expect(page.getByTestId('update-command')).toHaveText('scoop update arroxy');

  await openScenario(page, 'update-portable');
  await expect(page.getByTestId('update-banner').getByRole('link', { name: 'Download' })).toBeVisible();
});

test('queue scenarios hydrate drawer states', async ({ page }) => {
  for (const [scenario, status] of [
    ['queue-running', 'running'],
    ['queue-paused-active', 'paused-active'],
    ['queue-error', 'error'],
    ['queue-completed', 'done']
  ] as const) {
    await openScenario(page, scenario);
    await expect(page.getByTestId('drawer-body')).toBeVisible();
    await expect(page.getByTestId('queue-card-scenario-queue-item')).toHaveAttribute('data-status', status);
  }
});

test('screenshots - playlist cap alert across viewports', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 900 },
    { width: 1200, height: 900 }
  ]) {
    await page.setViewportSize(viewport);
    await openWithParams(page, 'playlist=101');
    await waitForPlaylist(page);
    await waitForSplashToLeave(page);
    await page.screenshot({
      path: `tests/browser/screenshots/scenario-playlist-over-limit-${viewport.width}.png`,
      fullPage: false
    });
  }
});
