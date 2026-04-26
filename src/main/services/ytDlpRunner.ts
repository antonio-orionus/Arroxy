import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawnYtDlp } from '@main/utils/process';
import { classifyStderr, extractLastError, friendlyMessage, type StderrSignal } from '@main/utils/ytdlpErrors';

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

export interface RunYtDlpResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  errorClass: StderrSignal | null;
  message: string | null;
  spawnError?: Error;
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
        resolve({ exitCode: null, stdout, stderr, errorClass: null, message: error.message, spawnError: error });
      });

      proc.on('close', async (code) => {
        if (code === 0) {
          resolve({ exitCode: 0, stdout, stderr, errorClass: null, message: null });
          return;
        }

        const signal = classifyStderr(stderr);

        if (signal === 'bot_block' && attemptIndex === 0) {
          opts.tokenService.invalidateCache();
          resolve(await attempt(1));
          return;
        }

        const message = signal
          ? friendlyMessage(signal)
          : (extractLastError(stderr) ?? `yt-dlp exited with code ${code ?? -1}`);
        resolve({ exitCode: code ?? -1, stdout, stderr, errorClass: signal, message });
      });
    });
  };

  return attempt(0);
}
