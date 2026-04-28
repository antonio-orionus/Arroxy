import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawnYtDlp } from '@main/utils/process';
import { classifyStderr, extractLastError, type StderrSignal } from '@main/utils/ytdlpErrors';

interface TokenLike {
  mintTokenForUrl: (url: string) => Promise<{ token: string; visitorData: string }>;
  invalidateCache: () => void;
}

// VidBee's strategy: skip the player clients that demand a PoT, so the
// non-PoT download path works without needing to mint anything.
const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari';

export interface RunYtDlpOptions {
  url: string;
  ytDlpPath: string;
  ffmpegPath: string | null;
  args: string[];
  tokenService: TokenLike;
  cookiesPath?: string;
  // 0 = first PoT mint, 1 = re-mint after botBlock, 2 = no-PoT fallback.
  // Existing callers only switched on 0 vs 1 for the "minting" vs "re-minting"
  // status string; the fallback step doesn't need a token at all.
  onAttempt?: (attempt: 0 | 1 | 2) => void;
  onSpawn?: (proc: ChildProcessWithoutNullStreams) => void;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}

export type RunYtDlpResult =
  | { kind: 'success'; stdout: string; stderr: string; usedExtractorFallback: boolean }
  | { kind: 'spawn-error'; error: Error; stdout: string; stderr: string }
  | { kind: 'exit-error'; exitCode: number; signal: StderrSignal | null; rawError: string | null; stdout: string; stderr: string };

export function isSuccess(r: RunYtDlpResult): r is Extract<RunYtDlpResult, { kind: 'success' }> {
  return r.kind === 'success';
}

function buildPotExtractorArgs(token: string, visitorData: string): string {
  const visitor = visitorData ? `;visitor_data=${visitorData}` : '';
  return `youtube:po_token=web.gvs+${token}${visitor}`;
}

type Strategy =
  | { kind: 'pot'; reMint: boolean }
  | { kind: 'fallback' };

async function runOnce(
  opts: RunYtDlpOptions,
  strategy: Strategy
): Promise<RunYtDlpResult> {
  let extractorArgs: string;

  if (strategy.kind === 'pot') {
    if (strategy.reMint) opts.tokenService.invalidateCache();
    const { token, visitorData } = await opts.tokenService.mintTokenForUrl(opts.url);
    extractorArgs = buildPotExtractorArgs(token, visitorData);
  } else {
    extractorArgs = PLAYER_CLIENT_FALLBACK;
  }

  const cookiesArgs = opts.cookiesPath ? ['--cookies', opts.cookiesPath] : [];
  const args = ['--extractor-args', extractorArgs, ...cookiesArgs, ...opts.args];

  return new Promise<RunYtDlpResult>((resolve) => {
    const proc = spawnYtDlp(opts.ytDlpPath, args, opts.ffmpegPath);
    let stdout = '';
    let stderr = '';

    opts.onSpawn?.(proc);

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString() as string;
      stdout += text;
      opts.onStdout?.(text);
    });

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString() as string;
      stderr += text;
      opts.onStderr?.(text);
    });

    proc.on('error', (error) => {
      resolve({ kind: 'spawn-error', error, stdout, stderr });
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ kind: 'success', stdout, stderr, usedExtractorFallback: strategy.kind === 'fallback' });
        return;
      }

      resolve({
        kind: 'exit-error',
        exitCode: code ?? -1,
        signal: classifyStderr(stderr),
        rawError: extractLastError(stderr),
        stdout,
        stderr
      });
    });
  });
}

// 3-attempt ladder:
//   0. PoT token  → if botBlock, retry
//   1. Re-mint PoT → if still botBlock, fall back
//   2. No PoT, player_client=default,-web,-web_safari  (final attempt)
//
// If the *first* PoT mint throws (provider unavailable, scrape broke), we
// skip the PoT path entirely and go straight to step 2. Since YouTube's
// `bevasrs.wpc` symbol gets renamed periodically, this keeps downloads
// working even when the token provider is broken.
export async function runYtDlp(opts: RunYtDlpOptions): Promise<RunYtDlpResult> {
  // Attempt 0
  opts.onAttempt?.(0);
  let result: RunYtDlpResult;
  try {
    result = await runOnce(opts, { kind: 'pot', reMint: false });
  } catch {
    // Token provider is broken — skip both PoT attempts.
    opts.onAttempt?.(2);
    return runOnce(opts, { kind: 'fallback' });
  }

  if (result.kind !== 'exit-error' || result.signal !== 'botBlock') {
    return result;
  }

  // Attempt 1 — re-mint
  opts.onAttempt?.(1);
  try {
    result = await runOnce(opts, { kind: 'pot', reMint: true });
  } catch {
    opts.onAttempt?.(2);
    return runOnce(opts, { kind: 'fallback' });
  }

  if (result.kind !== 'exit-error' || result.signal !== 'botBlock') {
    return result;
  }

  // Attempt 2 — fallback
  opts.onAttempt?.(2);
  return runOnce(opts, { kind: 'fallback' });
}
