import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { expect, test, _electron as electron } from '@playwright/test';

function buildEnv(userDataDir: string): Record<string, string> {
  const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  env.MOCK_BACKEND = '1';
  env.ELECTRON_USER_DATA = userDataDir;
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}

async function launchApp(userDataDir: string) {
  return electron.launch({
    args: [path.join(process.cwd(), 'out/main/index.js')],
    env: buildEnv(userDataDir)
  });
}

test('corrupted settings.json → app still reaches shell', async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-corrupt-settings-'));
  fs.writeFileSync(path.join(userDataDir, 'settings.json'), 'not valid json', 'utf-8');

  const app = await launchApp(userDataDir);
  const page = await app.firstWindow();

  // App must reach the shell despite corrupt settings — falls back to defaults.
  await expect(page.locator('[data-testid="app-root"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid="url-input"]')).toBeVisible();

  await app.close();
});

test('corrupted queue.json → app still reaches shell', async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-corrupt-queue-'));
  fs.writeFileSync(path.join(userDataDir, 'queue.json'), '{ broken', 'utf-8');

  const app = await launchApp(userDataDir);
  const page = await app.firstWindow();

  await expect(page.locator('[data-testid="app-root"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid="url-input"]')).toBeVisible();

  await app.close();
});

test('seeded pending queue → drawer hydrates from persisted store', async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-e2e-seeded-queue-'));

  // Write a queue.json that has one pending item — simulates an unfinished
  // download from a previous session. The app should re-hydrate it and open
  // the drawer automatically.
  const outputDir = os.tmpdir();
  const queueData = {
    items: [
      {
        id: 'test-item-1',
        url: 'https://www.youtube.com/watch?v=seeded',
        title: 'Seeded pending item',
        thumbnail: '',
        outputDir,
        formatLabel: '720p · mp4',
        status: 'pending',
        lane: 'normal',
        progressPercent: 0,
        progressDetail: null,
        lastStatus: null,
        error: null,
        finishedAt: null,
        writeM3u: true,
        job: {
          kind: 'single-format',
          extractor: 'youtube',
          extractorKey: 'Youtube',
          formatId: '22',
          preset: 'custom',
          sponsorBlock: { mode: 'off' },
          embed: {
            chapters: false,
            metadata: false,
            thumbnail: false,
            description: false,
            thumbnailSidecar: false
          }
        }
      }
    ]
  };
  fs.writeFileSync(path.join(userDataDir, 'queue.json'), JSON.stringify(queueData), 'utf-8');

  const app = await launchApp(userDataDir);
  const page = await app.firstWindow();

  await expect(page.locator('[data-testid="app-root"]')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid="drawer-body"]')).toBeVisible();
  await expect(page.locator('[data-testid="queue-card-test-item-1"]')).toHaveAttribute('data-status', 'pending');
  await expect(page.locator('[data-testid="queue-card-test-item-1"] [data-testid="queue-title"]')).toContainText('Seeded pending item');

  await app.close();
});
