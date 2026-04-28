// Real-world smoke test for the yt-dlp invocation paths this app uses.
//
// Unlike the unit tests in `tests/` (which mock spawnYtDlp), this script
// hits real YouTube through the real yt-dlp binary. Run it manually before
// tagging a release, or whenever you suspect YouTube has shifted under us.
//
// Usage:
//   bun run smoke
//   bun run smoke -- --url https://www.youtube.com/watch?v=...
//   bun run smoke -- --cookies /path/to/cookies.txt
//   bun run smoke -- --yt-dlp /custom/path/to/yt-dlp
//
// What it covers:
//   1. Default extractor (no flags) — what yt-dlp does on its own today.
//   2. Player-client fallback — the no-PoT path our 3-attempt ladder ends on.
//   3. (Optional) Cookies passthrough — when --cookies is supplied.
//
// What it does NOT cover:
//   - The PoT mint path (HiddenWindowTokenProvider). That requires an Electron
//     runtime; run `bun run dev` and inspect logs for that path.

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ytDlpInfoSchema } from '../src/shared/schemas';
import { resolveSmokeUrl } from './smoke-shared';

const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari';

interface CliArgs {
  url?: string;
  cookies?: string;
  ytDlpPath?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') args.url = argv[++i];
    else if (a === '--cookies') args.cookies = argv[++i];
    else if (a === '--yt-dlp') args.ytDlpPath = argv[++i];
    else if (a === '-h' || a === '--help') {
      console.log('Usage: bun run smoke [-- --url X --cookies file --yt-dlp path]');
      console.log('URL falls back to youtube-urls.local.txt (gitignored).');
      process.exit(0);
    }
  }
  return args;
}

function findYtDlp(override?: string): string {
  if (override) {
    if (!existsSync(override)) throw new Error(`yt-dlp not at ${override}`);
    return override;
  }
  const ytDlpName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  // Linux/macOS userData root is `~/.config/arroxy`; Windows uses %APPDATA%/Arroxy.
  // BinaryManager stores binaries under <userData>/runtime-cache/binaries/.
  const userDataLinux = join(homedir(), '.config', 'arroxy');
  const userDataMac = join(homedir(), 'Library', 'Application Support', 'Arroxy');
  const userDataWin = process.env.APPDATA ? join(process.env.APPDATA, 'Arroxy') : '';
  const candidates = [
    process.env.YT_DLP_PATH,
    join(userDataLinux, 'runtime-cache', 'binaries', ytDlpName),
    join(userDataMac, 'runtime-cache', 'binaries', ytDlpName),
    userDataWin ? join(userDataWin, 'runtime-cache', 'binaries', ytDlpName) : null,
    '/opt/homebrew/bin/yt-dlp',
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
  ].filter((p): p is string => Boolean(p));

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // Last resort: bare command — relies on $PATH.
  return process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
}

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

function runYtDlp(binary: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const proc = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (c: Buffer) => { stdout += c.toString(); });
    proc.stderr.on('data', (c: Buffer) => { stderr += c.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      resolve({ exitCode: code ?? -1, stdout, stderr, durationMs: Date.now() - start });
    });
  });
}

interface StrategyReport {
  name: string;
  passed: boolean;
  durationMs: number;
  formatCount?: number;
  title?: string;
  error?: string;
  schemaIssue?: string;
}

async function runStrategy(
  name: string,
  binary: string,
  url: string,
  extractorArgs: string | null,
  cookiesPath?: string
): Promise<StrategyReport> {
  const args: string[] = ['--dump-json', '--no-playlist', '--no-warnings'];
  if (extractorArgs) args.push('--extractor-args', extractorArgs);
  if (cookiesPath) args.push('--cookies', cookiesPath);
  args.push(url);

  const r = await runYtDlp(binary, args);

  if (r.exitCode !== 0) {
    return {
      name,
      passed: false,
      durationMs: r.durationMs,
      error: r.stderr.trim().split('\n').pop() ?? `exit ${r.exitCode}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(r.stdout);
  } catch (e) {
    return {
      name,
      passed: false,
      durationMs: r.durationMs,
      error: `JSON parse failed: ${(e as Error).message}`,
    };
  }

  const schemaResult = ytDlpInfoSchema.safeParse(parsed);
  if (!schemaResult.success) {
    return {
      name,
      passed: false,
      durationMs: r.durationMs,
      schemaIssue: schemaResult.error.issues[0]?.message ?? 'unknown schema issue',
    };
  }

  return {
    name,
    passed: true,
    durationMs: r.durationMs,
    formatCount: schemaResult.data.formats?.length ?? 0,
    title: schemaResult.data.title ?? '(no title)',
  };
}

function printReport(report: StrategyReport): void {
  const tag = report.passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`  ${tag}  ${report.name}  (${report.durationMs}ms)`);
  if (report.passed) {
    console.log(`         title: ${report.title}`);
    console.log(`         formats: ${report.formatCount}`);
  } else if (report.schemaIssue) {
    console.log(`         schema mismatch: ${report.schemaIssue}`);
  } else {
    console.log(`         ${report.error}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const binary = findYtDlp(args.ytDlpPath);
  const url = resolveSmokeUrl(args.url);

  console.log('Smoke test — real YouTube, real yt-dlp');
  console.log(`  binary: ${binary}`);
  console.log(`  url:    ${url}`);
  if (args.cookies) console.log(`  cookies: ${args.cookies}`);
  console.log('');

  const reports: StrategyReport[] = [];
  reports.push(await runStrategy('default extractor', binary, url, null, args.cookies));
  reports.push(await runStrategy('player_client fallback', binary, url, PLAYER_CLIENT_FALLBACK, args.cookies));

  for (const r of reports) printReport(r);

  const failed = reports.filter((r) => !r.passed);
  console.log('');
  if (failed.length === 0) {
    console.log(`\x1b[32mAll ${reports.length} strategies passed.\x1b[0m`);
    process.exit(0);
  }
  console.log(`\x1b[31m${failed.length}/${reports.length} strategies failed.\x1b[0m`);
  process.exit(1);
}

main().catch((err: unknown) => {
  console.error('Smoke test crashed:', err instanceof Error ? err.message : err);
  process.exit(2);
});
