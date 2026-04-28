// Real-world smoke runner that boots inside Electron's main process and uses
// the same services that production downloads use:
//   - HiddenWindowTokenProvider (the bevasrs.wpc scrape)
//   - TokenService            (warmUp + mint cache)
//   - BinaryManager           (real yt-dlp binary)
//   - FormatProbeService      (full 3-attempt ladder via runYtDlp)
//
// Triggered by setting ARROXY_SMOKE_URL. Skips creating the main window;
// reports to stdout; exits cleanly.

import { app } from 'electron';
import type { BinaryManager } from './services/BinaryManager';
import type { FormatProbeService } from './services/FormatProbeService';
import type { TokenService } from './services/TokenService';

interface SmokeDeps {
  url: string;
  binaryManager: BinaryManager;
  tokenService: TokenService;
  formatProbeService: FormatProbeService;
}

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// Electron's main process can buffer console.log oddly under xvfb-run; use
// a direct fd write so the report reliably reaches the parent terminal.
function out(line: string): void {
  process.stdout.write(line + '\n');
}
function pass(label: string, detail = ''): void {
  out(`  ${GREEN}PASS${RESET}  ${label}${detail ? '  ' + detail : ''}`);
}
function fail(label: string, detail: string): void {
  out(`  ${RED}FAIL${RESET}  ${label}  ${detail}`);
}

export async function runSmokeMode(deps: SmokeDeps): Promise<number> {
  const { url, binaryManager, tokenService, formatProbeService } = deps;

  out('Smoke test — Electron, real yt-dlp, real YouTube');
  out(`  url: ${url}`);
  out('');

  let failures = 0;

  // 1. Binary readiness — verifies BinaryManager's checksum/download path.
  let ytDlpPath: string;
  try {
    ytDlpPath = await binaryManager.ensureYtDlp();
    pass('yt-dlp binary ready', ytDlpPath);
  } catch (err) {
    fail('yt-dlp binary ready', err instanceof Error ? err.message : String(err));
    return 1;
  }

  // 2. PoT mint — exercises HiddenWindowTokenProvider's `bevasrs.wpc` scrape.
  //    This is the canary for "YouTube renamed the symbol."
  const mintStart = Date.now();
  try {
    const { token, visitorData } = await tokenService.mintTokenForUrl(url);
    const tokenLen = token.length;
    const vdLen = visitorData.length;
    if (tokenLen < 10) throw new Error(`suspiciously short token (${tokenLen} chars)`);
    pass('PoT mint (bevasrs.wpc scrape)', `token=${tokenLen}ch  vd=${vdLen}ch  in ${Date.now() - mintStart}ms`);
  } catch (err) {
    fail('PoT mint (bevasrs.wpc scrape)', err instanceof Error ? err.message : String(err));
    failures++;
  }

  // 3. Format probe — full 3-attempt ladder, real yt-dlp spawn, real network.
  //    On a healthy day this hits attempt 0 (PoT) and succeeds. If PoT mint
  //    failed above, the runner catches it and uses player_client fallback.
  const probeStart = Date.now();
  const probe = await formatProbeService.getFormats(url);
  if (probe.ok) {
    pass('format probe (full ladder)', `${probe.data.formats.length} formats  in ${Date.now() - probeStart}ms`);
    pass('  └ schema parses', probe.data.title || '(no title)');
  } else {
    fail('format probe (full ladder)', probe.error.message);
    failures++;
  }

  out('');
  if (failures === 0) {
    out(`${GREEN}All checks passed.${RESET}`);
  } else {
    out(`${RED}${failures} check${failures === 1 ? '' : 's'} failed.${RESET}`);
  }
  return failures === 0 ? 0 : 1;
}

export function readSmokeUrl(): string | null {
  const url = process.env.ARROXY_SMOKE_URL?.trim();
  return url ? url : null;
}

export function exitWithCode(code: number): void {
  app.exit(code);
}
