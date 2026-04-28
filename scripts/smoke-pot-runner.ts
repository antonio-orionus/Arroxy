// Wrapper for `bun run smoke:pot`.
//
// Resolves the smoke URL (env > file), runs `electron-vite build`, then
// invokes Electron with ARROXY_SMOKE_URL set so `src/main/smoke.ts` runs the
// real PoT mint + 3-attempt ladder against live YouTube and exits.
//
// On Linux without DISPLAY we wrap with `xvfb-run`; on macOS/Windows we just
// invoke electron directly.

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveSmokeUrl } from './smoke-shared';

function fail(message: string): never {
  console.error(`smoke:pot — ${message}`);
  process.exit(1);
}

function run(cmd: string, args: string[], envOverrides: NodeJS.ProcessEnv = {}): Promise<number> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      env: { ...process.env, ...envOverrides }
    });
    proc.on('error', (err) => {
      console.error(err.message);
      resolve(127);
    });
    proc.on('close', (code) => resolve(code ?? -1));
  });
}

async function main(): Promise<void> {
  let url: string;
  try {
    url = resolveSmokeUrl();
  } catch (err) {
    fail(err instanceof Error ? err.message : String(err));
  }

  // Build the Electron bundles first.
  const buildBin = join('node_modules', '.bin', 'electron-vite');
  if (!existsSync(buildBin)) fail(`electron-vite not found at ${buildBin}; run \`bun install\`.`);
  const buildCode = await run(buildBin, ['build']);
  if (buildCode !== 0) fail(`electron-vite build failed with code ${buildCode}`);

  const electronBin = join('node_modules', '.bin', 'electron');
  if (!existsSync(electronBin)) fail(`electron not found at ${electronBin}`);

  // On Linux without an X display, use xvfb-run.
  const needsXvfb = process.platform === 'linux' && !process.env.DISPLAY;
  const cmd = needsXvfb ? 'xvfb-run' : electronBin;
  const args = needsXvfb
    ? ['-a', electronBin, '--no-sandbox', '.']
    : process.platform === 'linux'
      ? ['--no-sandbox', '.']
      : ['.'];

  // Use a dedicated userData dir so we don't contend with a running
  // `bun run dev` instance for the single-instance lock.
  const isolatedUserData = mkdtempSync(join(tmpdir(), 'arroxy-smoke-'));

  let code: number;
  try {
    code = await run(cmd, args, {
      ARROXY_SMOKE_URL: url,
      ELECTRON_USER_DATA: isolatedUserData,
    });
  } finally {
    try { rmSync(isolatedUserData, { recursive: true, force: true }); } catch { /* ignore */ }
  }
  process.exit(code);
}

void main();
