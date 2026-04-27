import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { runYtDlp } from '@main/services/ytDlpRunner';

vi.mock('@main/utils/process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@main/utils/process')>();
  return { ...actual, spawnYtDlp: vi.fn() };
});

import { spawnYtDlp } from '@main/utils/process';

beforeEach(() => { vi.clearAllMocks(); });

function makeFakeProcess(exitCode: number, stderr = '', stdout = '') {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: vi.fn(),
    pid: 1234
  });
  setTimeout(() => {
    if (stderr) proc.stderr.emit('data', Buffer.from(stderr));
    if (stdout) proc.stdout.emit('data', Buffer.from(stdout));
    proc.emit('close', exitCode);
  }, 5);
  return proc;
}

function makeTokenService(overrides: Array<{ token: string; visitorData: string }> = []) {
  const seq = overrides.length > 0 ? overrides : [{ token: 'tok-1', visitorData: 'vd-1' }];
  const mintTokenForUrl = vi.fn();
  for (const v of seq) mintTokenForUrl.mockResolvedValueOnce(v);
  mintTokenForUrl.mockResolvedValue(seq[seq.length - 1]);
  return { mintTokenForUrl, invalidateCache: vi.fn() };
}

const URL_ = 'https://www.youtube.com/watch?v=abc';

const RUN_OPTS = {
  url: URL_,
  ytDlpPath: '/usr/bin/yt-dlp',
  ffmpegPath: '/usr/bin/ffmpeg',
  args: ['--dump-json', '--no-playlist'] as string[]
};

describe('runYtDlp — token injection', () => {
  it('injects --extractor-args with web.gvs+token+visitor_data ahead of caller args', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', '{}') as never);
    const tokenService = makeTokenService([{ token: 'TOK', visitorData: 'VD' }]);

    await runYtDlp({ ...RUN_OPTS, tokenService });

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const idx = args.indexOf('--extractor-args');
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(args[idx + 1]).toContain('web.gvs+TOK');
    expect(args[idx + 1]).toContain('visitor_data=VD');
    expect(args).toContain('--dump-json');
  });

  it('omits visitor_data when empty', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', '{}') as never);
    const tokenService = makeTokenService([{ token: 'TOK', visitorData: '' }]);

    await runYtDlp({ ...RUN_OPTS, tokenService });

    const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1];
    const idx = args.indexOf('--extractor-args');
    expect(args[idx + 1]).not.toContain('visitor_data');
  });
});

describe('runYtDlp — clean exit', () => {
  it('resolves with exitCode 0, accumulated stdout, no error signal', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', '{"title":"Hi"}') as never);
    const tokenService = makeTokenService();

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('{"title":"Hi"}');
    expect(result.errorClass).toBeNull();
    expect(result.rawError).toBeNull();
    expect(result.spawnError).toBeUndefined();
  });

  it('streams stdout chunks to onStdout', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '', 'chunk-a') as never);
    const tokenService = makeTokenService();
    const seen: string[] = [];

    await runYtDlp({ ...RUN_OPTS, tokenService, onStdout: (s) => seen.push(s) });

    expect(seen).toEqual(['chunk-a']);
  });

  it('streams stderr chunks to onStderr', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0, '[download] 50%') as never);
    const tokenService = makeTokenService();
    const seen: string[] = [];

    await runYtDlp({ ...RUN_OPTS, tokenService, onStderr: (s) => seen.push(s) });

    expect(seen).toEqual(['[download] 50%']);
  });

  it('calls onSpawn with the spawned process so caller can kill it', async () => {
    const proc = makeFakeProcess(0);
    vi.mocked(spawnYtDlp).mockReturnValue(proc as never);
    const tokenService = makeTokenService();
    const onSpawn = vi.fn();

    await runYtDlp({ ...RUN_OPTS, tokenService, onSpawn });

    expect(onSpawn).toHaveBeenCalledTimes(1);
    expect(onSpawn).toHaveBeenCalledWith(proc);
  });
});

describe('runYtDlp — error classification', () => {
  it('returns errorClass and raw stderr error on classified failure', async () => {
    const stderr = 'ERROR: [youtube] abc: Private video';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, stderr) as never);
    const tokenService = makeTokenService();

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(result.exitCode).toBe(1);
    expect(result.errorClass).toBe('unavailable');
    expect(result.rawError).toBe('ERROR: [youtube] abc: Private video');
  });

  it('returns last ERROR: line when stderr is unrecognized', async () => {
    const stderr = 'ERROR: [youtube] abc: Unsupported URL';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, stderr) as never);
    const tokenService = makeTokenService();

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(result.errorClass).toBeNull();
    expect(result.rawError).toBe('ERROR: [youtube] abc: Unsupported URL');
  });

  it('returns null rawError when stderr is empty', async () => {
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(2) as never);
    const tokenService = makeTokenService();

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(result.exitCode).toBe(2);
    expect(result.rawError).toBeNull();
  });
});

describe('runYtDlp — bot-block retry', () => {
  const BOT_STDERR = "ERROR: [youtube] abc: Sign in to confirm you're not a bot.";

  it('re-mints token and re-spawns once on bot-block, succeeds on retry', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, BOT_STDERR) as never)
      .mockReturnValueOnce(makeFakeProcess(0, '', '{"ok":true}') as never);

    const tokenService = makeTokenService([
      { token: 'old', visitorData: 'old-vd' },
      { token: 'new', visitorData: 'new-vd' }
    ]);

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(tokenService.mintTokenForUrl).toHaveBeenCalledTimes(2);
    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);

    const retryArgs: string[] = vi.mocked(spawnYtDlp).mock.calls[1][1];
    const idx = retryArgs.indexOf('--extractor-args');
    expect(retryArgs[idx + 1]).toContain('new');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('{"ok":true}');
  });

  it('does not retry a second time when retry also bot-blocks', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, BOT_STDERR) as never)
      .mockReturnValueOnce(makeFakeProcess(1, BOT_STDERR) as never);

    const tokenService = makeTokenService();

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(2);
    expect(tokenService.invalidateCache).toHaveBeenCalledOnce();
    expect(result.errorClass).toBe('botBlock');
    expect(result.exitCode).toBe(1);
  });

  it('does not retry on non-bot-block failures', async () => {
    const ipBlockStderr = 'ERROR: [youtube] All player responses are invalid. Your IP is likely being blocked by Youtube';
    vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(1, ipBlockStderr) as never);

    const tokenService = makeTokenService();

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1);
    expect(tokenService.invalidateCache).not.toHaveBeenCalled();
    expect(result.errorClass).toBe('ipBlock');
  });

  it('calls onSpawn for both attempts so caller can track the new process', async () => {
    const proc1 = makeFakeProcess(1, BOT_STDERR);
    const proc2 = makeFakeProcess(0, '', '{}');
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(proc1 as never)
      .mockReturnValueOnce(proc2 as never);

    const tokenService = makeTokenService([
      { token: 'a', visitorData: 'a' },
      { token: 'b', visitorData: 'b' }
    ]);
    const onSpawn = vi.fn();

    await runYtDlp({ ...RUN_OPTS, tokenService, onSpawn });

    expect(onSpawn).toHaveBeenCalledTimes(2);
    expect(onSpawn).toHaveBeenNthCalledWith(1, proc1);
    expect(onSpawn).toHaveBeenNthCalledWith(2, proc2);
  });

  it('calls onAttempt before each mint with attempt index', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, BOT_STDERR) as never)
      .mockReturnValueOnce(makeFakeProcess(0) as never);

    const tokenService = makeTokenService([
      { token: 'a', visitorData: 'a' },
      { token: 'b', visitorData: 'b' }
    ]);
    const onAttempt = vi.fn();

    await runYtDlp({ ...RUN_OPTS, tokenService, onAttempt });

    expect(onAttempt).toHaveBeenNthCalledWith(1, 0);
    expect(onAttempt).toHaveBeenNthCalledWith(2, 1);
    expect(tokenService.mintTokenForUrl).toHaveBeenCalledTimes(2);
  });

  it('only retains stderr/stdout from the final attempt', async () => {
    vi.mocked(spawnYtDlp)
      .mockReturnValueOnce(makeFakeProcess(1, BOT_STDERR, 'stale-stdout') as never)
      .mockReturnValueOnce(makeFakeProcess(0, '[download] retry-progress', 'fresh-stdout') as never);

    const tokenService = makeTokenService([
      { token: 'a', visitorData: 'a' },
      { token: 'b', visitorData: 'b' }
    ]);

    const result = await runYtDlp({ ...RUN_OPTS, tokenService });

    expect(result.stdout).toBe('fresh-stdout');
    expect(result.stderr).toBe('[download] retry-progress');
  });
});

describe('runYtDlp — spawn error', () => {
  it('resolves with spawnError when proc emits error before close', async () => {
    const proc = Object.assign(new EventEmitter(), {
      stdout: new EventEmitter(),
      stderr: new EventEmitter(),
      kill: vi.fn(),
      pid: 1234
    });
    vi.mocked(spawnYtDlp).mockReturnValue(proc as never);
    const tokenService = makeTokenService();

    const promise = runYtDlp({ ...RUN_OPTS, tokenService });
    setTimeout(() => proc.emit('error', new Error('ENOENT')), 5);
    const result = await promise;

    expect(result.spawnError?.message).toBe('ENOENT');
    expect(result.exitCode).toBeNull();
  });
});
