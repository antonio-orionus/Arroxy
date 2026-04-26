import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_PLATFORM = Object.getOwnPropertyDescriptor(process, 'platform')!;
const ORIGINAL_EXEC_PATH = Object.getOwnPropertyDescriptor(process, 'execPath')!;

function setPlatform(value: NodeJS.Platform): void {
  Object.defineProperty(process, 'platform', { value, configurable: true });
}

function setExecPath(value: string): void {
  Object.defineProperty(process, 'execPath', { value, configurable: true });
}

describe('installChannel runtime detection', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', ORIGINAL_PLATFORM);
    Object.defineProperty(process, 'execPath', ORIGINAL_EXEC_PATH);
    vi.restoreAllMocks();
  });

  it('detects scoop from a user-scope execPath on win32', async () => {
    setPlatform('win32');
    setExecPath('C:\\Users\\me\\scoop\\apps\\arroxy\\current\\Arroxy.exe');
    const { installChannel } = await import('@main/installChannel');
    expect(installChannel).toBe('scoop');
  });

  it('detects scoop from a global-scope execPath on win32', async () => {
    setPlatform('win32');
    setExecPath('C:\\ProgramData\\scoop\\apps\\arroxy\\current\\Arroxy.exe');
    const { installChannel } = await import('@main/installChannel');
    expect(installChannel).toBe('scoop');
  });

  it('falls back to direct on win32 when execPath is a normal NSIS install', async () => {
    setPlatform('win32');
    setExecPath('C:\\Users\\me\\AppData\\Local\\Programs\\Arroxy\\Arroxy.exe');
    const { installChannel } = await import('@main/installChannel');
    expect(installChannel).toBe('direct');
  });

  it('detects homebrew on darwin when Caskroom directory exists', async () => {
    setPlatform('darwin');
    vi.doMock('node:fs', () => ({
      default: { existsSync: (p: string) => p === '/opt/homebrew/Caskroom/arroxy' }
    }));
    const { installChannel } = await import('@main/installChannel');
    expect(installChannel).toBe('homebrew');
    vi.doUnmock('node:fs');
  });

  it('falls back to direct on darwin when no Caskroom directory exists', async () => {
    setPlatform('darwin');
    vi.doMock('node:fs', () => ({ default: { existsSync: () => false } }));
    const { installChannel } = await import('@main/installChannel');
    expect(installChannel).toBe('direct');
    vi.doUnmock('node:fs');
  });

  it('returns direct on linux', async () => {
    setPlatform('linux');
    const { installChannel } = await import('@main/installChannel');
    expect(installChannel).toBe('direct');
  });
});
