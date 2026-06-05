import fs from 'node:fs';
import path from 'node:path';
import { expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import { buildFixtureElectronEnv, ensureHostEmbeddedBinaries, ensureYtDlpPath, fixtureUrl, type DenyProxy, type FixtureServer, type FixtureServerRequest } from './fixtureHarness.js';

let fixtureRuntimePromise: Promise<string> | null = null;

export async function prepareFixtureRuntime(): Promise<string> {
  fixtureRuntimePromise ??= (async () => {
    await ensureHostEmbeddedBinaries();
    return ensureYtDlpPath();
  })().catch((error) => {
    fixtureRuntimePromise = null;
    throw error;
  });
  return fixtureRuntimePromise;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseInfoJson(stdout: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(stdout.trim());
  if (!isRecord(parsed)) throw new Error('yt-dlp did not return a JSON object');
  return parsed;
}

export function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string') throw new Error(`Expected string field ${key}`);
  return value;
}

export function recordArrayField(record: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const value = record[key];
  if (!Array.isArray(value)) throw new Error(`Expected array field ${key}`);
  const invalidIndex = value.findIndex((entry) => !isRecord(entry));
  if (invalidIndex !== -1) {
    throw new Error(`Expected record[] field ${key}; index ${invalidIndex} was ${typeof value[invalidIndex]}`);
  }
  return value as Record<string, unknown>[];
}

export function listFilesRecursive(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFilesRecursive(absolutePath);
    if (entry.isFile()) return [absolutePath];
    return [];
  });
}

export async function clickContinue(page: Page): Promise<void> {
  await page.getByRole('button', { name: /continue/i }).click();
}

async function clickStepButtonIfPresent(page: Page, testId: string, buttonName: string | RegExp, timeout = 5_000): Promise<boolean> {
  const step = page.getByTestId(testId);
  try {
    await step.waitFor({ state: 'visible', timeout });
  } catch {
    return false;
  }
  await step.getByRole('button', { name: buttonName }).click();
  return true;
}

async function writeClipboard(app: ElectronApplication, text: string): Promise<void> {
  await app.evaluate(({ clipboard }, value) => {
    clipboard.writeText(value);
  }, text);
}

export async function launchFixtureApp(ytDlpPath: string, input: { userDataDir: string; fixtureServer: FixtureServer; denyProxy: DenyProxy }): Promise<{ app: ElectronApplication; page: Page }> {
  const app = await electron.launch({
    args: [path.join(process.cwd(), 'out', 'main', 'index.js')],
    env: buildFixtureElectronEnv({ userDataDir: input.userDataDir, fixtureServer: input.fixtureServer, denyProxy: input.denyProxy, ytDlpPath })
  });
  const page = await app.firstWindow();
  await expect(page.locator('[data-testid="app-root"]')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('[data-testid="url-input"]')).toBeVisible();
  return { app, page };
}

export async function startBulkFromClipboard(page: Page, app: ElectronApplication, rawUrls: string): Promise<void> {
  await page.locator('[data-testid="btn-bulk-download"]').click();
  await expect(page.locator('[data-testid="bulk-url-dialog"]')).toBeVisible();
  await writeClipboard(app, rawUrls);
  const bulkTextarea = page.locator('[data-testid="bulk-url-textarea"]');
  await bulkTextarea.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+V' : 'Control+V');
}

export async function prepareSingleConfirm(page: Page, videoId: string, subtitleChoice: 'skip' | 'continue' = 'skip'): Promise<void> {
  await page.locator('[data-testid="url-input"]').fill(fixtureUrl(videoId));
  await page.locator('[data-testid="btn-find-formats"]').click();
  await expect(page.locator('[data-testid="step-formats"]')).toBeVisible({ timeout: 60_000 });
  await clickContinue(page);

  if (subtitleChoice === 'continue') {
    const subtitles = page.getByTestId('step-subtitles');
    await subtitles.waitFor({ state: 'visible', timeout: 5_000 });
    await subtitles.getByRole('button', { name: /continue/i }).click();
  } else {
    await clickStepButtonIfPresent(page, 'step-subtitles', 'Skip for this video');
  }

  await clickStepButtonIfPresent(page, 'step-sponsorblock', /continue/i);
  await clickStepButtonIfPresent(page, 'step-output', /continue/i);
  await page.waitForSelector('[data-testid="step-folder"]', { timeout: 5_000 });
  await page
    .getByTestId('step-folder')
    .getByRole('button', { name: /continue/i })
    .click();
  await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible();
}

export async function preparePlaylistConfirm(page: Page, playlistUrl: string): Promise<void> {
  await page.locator('[data-testid="url-input"]').fill(playlistUrl);
  await page.locator('[data-testid="btn-find-formats"]').click();
  await expect(page.locator('[data-testid="step-playlist-items"]')).toBeVisible({ timeout: 60_000 });
  await clickContinue(page);
  await expect(page.locator('[data-testid="step-playlist-presets"]')).toBeVisible();
  await clickContinue(page);
  await clickStepButtonIfPresent(page, 'step-sponsorblock', /continue/i);
  await clickStepButtonIfPresent(page, 'step-output', /continue/i);
  await page.waitForSelector('[data-testid="step-folder"]', { timeout: 5_000 });
  await page
    .getByTestId('step-folder')
    .getByRole('button', { name: /continue/i })
    .click();
  await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible();
}

export function queueCardByTitle(page: Page, title: string) {
  return page.locator('[data-testid^="queue-card-"]').filter({ hasText: title }).first();
}

export async function expectQueueStatus(page: Page, title: string, status: string, timeout = 60_000): Promise<void> {
  await expect(queueCardByTitle(page, title)).toHaveAttribute('data-status', status, { timeout });
}

export function mediaFiles(outputDir: string, extension: string): string[] {
  return listFilesRecursive(outputDir).filter((name) => name.endsWith(extension));
}

function mp4Files(outputDir: string): string[] {
  return mediaFiles(outputDir, '.mp4');
}

export function expectMp4Count(outputDir: string, count: number): void {
  const files = mp4Files(outputDir);
  expect(files).toHaveLength(count);
  for (const fileName of files) {
    expect(fs.statSync(fileName).size).toBeGreaterThan(200_000);
  }
}

export function expectNoMp4For(outputDir: string, videoId: string): void {
  expect(mp4Files(outputDir).some((fileName) => fileName.includes(videoId))).toBe(false);
}

export function isMediaRequestFor(videoId: string, request: FixtureServerRequest): request is Extract<FixtureServerRequest, { kind: 'media' }> {
  return request.kind === 'media' && request.videoId === videoId;
}
