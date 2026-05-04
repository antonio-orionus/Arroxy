import path from 'node:path';
import { expect, test, _electron as electron } from '@playwright/test';

test('launches the desktop app shell', async () => {
  const env: Record<string, string> = Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));

  env.MOCK_BACKEND = '1';
  env.ELECTRON_USER_DATA = path.join(process.cwd(), '.electron-user-data', 'e2e');
  delete env.ELECTRON_RUN_AS_NODE;

  const app = await electron.launch({
    args: [path.join(process.cwd(), 'out/main/index.js')],
    env
  });

  const page = await app.firstWindow();
  await expect(page.getByRole('heading', { name: 'Arroxy' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Download' })).toBeVisible();

  await app.close();
});
