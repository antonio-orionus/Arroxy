import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawnYtDlp } from '@main/utils/process';
import { classifyStderr, extractLastError, type StderrSignal } from '@main/utils/ytdlpErrors';

interface TokenLike {
  mintTokenForUrl: (url: string) => Promise<{ token: string; visitorData: string }>;
  invalidateCache: () => void;
}

export interface RunYtDlpOptions {
  url: string;
  ytDlpPath: string;
  ffmpegPath: string | null;
  args: string[];
  tokenService: TokenLike;
  onAttempt?: (attempt: 0 | 1) => void;
  onSpawn?: (proc: ChildProcessWithoutNullStreams) => void;
  onStdout?: (chunk: string) => void;
  onStderr?: (chunk: string) => void;
}

export type RunYtDlpResult =
  | { kind: 'success'; stdout: string; stderr: string }
  | { kind: 'spawn-error'; error: Error; stdout: string; stderr: string }
  | { kind: 'exit-error'; exitCode: number; signal: StderrSignal | null; rawError: string | null; stdout: string; stderr: string };

export function isSuccess(r: RunYtDlpResult): r is Extract<RunYtDlpResult, { kind: 'success' }> {
  return r.kind === 'success';
}

function buildExtractorArgs(token: string, visitorData: string): string {
  const visitor = visitorData ? `;visitor_data=${visitorData}` : '';
  return `youtube:po_token=web.gvs+${token}${visitor}`;
}

export async function runYtDlp(opts: RunYtDlpOptions): Promise<RunYtDlpResult> {
  const attempt = async (attemptIndex: 0 | 1): Promise<RunYtDlpResult> => {
    opts.onAttempt?.(attemptIndex);
    const { token, visitorData } = await opts.tokenService.mintTokenForUrl(opts.url);
    const args = ['--extractor-args', buildExtractorArgs(token, visitorData), ...opts.args];

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

      proc.on('close', async (code) => {
        if (code === 0) {
          resolve({ kind: 'success', stdout, stderr });
          return;
        }

        const signal = classifyStderr(stderr);

        if (signal === 'botBlock' && attemptIndex === 0) {
          opts.tokenService.invalidateCache();
          resolve(await attempt(1));
          return;
        }

        resolve({
          kind: 'exit-error',
          exitCode: code ?? -1,
          signal,
          rawError: extractLastError(stderr),
          stdout,
          stderr
        });
      });
    });
  };

  return attempt(0);
}
