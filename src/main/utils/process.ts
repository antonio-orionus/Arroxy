import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';

export function spawnYtDlp(
  binaryPath: string,
  args: string[],
  ffmpegPath: string | null
): ChildProcessWithoutNullStreams {
  const env = { ...process.env };

  if (ffmpegPath) {
    const ffmpegDir = path.dirname(ffmpegPath);
    env.PATH = ffmpegDir + path.delimiter + (env.PATH ?? '');
  }

  return spawn(binaryPath, args, { env, windowsHide: true, detached: process.platform !== 'win32' });
}

export function splitStderrLines(text: string): string[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
