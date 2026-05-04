import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_PLATFORM = Object.getOwnPropertyDescriptor(process, 'platform')!;
const ORIGINAL_EXEC_PATH = Object.getOwnPropertyDescriptor(process, 'execPath')!;
const ORIGINAL_PORTABLE_ENV = process.env.PORTABLE_EXECUTABLE_FILE;

function setPlatform(value: NodeJS.Platform): void {
  Object.defineProperty(process, 'platform', { value, configurable: true });
}

function setExecPath(value: string): void {
  Object.defineProperty(process, 'execPath', { value, configurable: true });
}

describe('detectInstallChannel', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.PORTABLE_EXECUTABLE_FILE;
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', ORIGINAL_PLATFORM);
    Object.defineProperty(process, 'execPath', ORIGINAL_EXEC_PATH);
    if (ORIGINAL_PORTABLE_ENV === undefined) {
      delete process.env.PORTABLE_EXECUTABLE_FILE;
    } else {
      process.env.PORTABLE_EXECUTABLE_FILE = ORIGINAL_PORTABLE_ENV;
    }
    vi.restoreAllMocks();
  });

  it('detects scoop from a user-scope execPath on win32', async () => {
    setPlatform('win32');
    setExecPath('C:\\Users\\me\\scoop\\apps\\arroxy\\current\\Arroxy.exe');
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('scoop');
  });

  it('detects scoop from a global-scope execPath on win32', async () => {
    setPlatform('win32');
    setExecPath('C:\\ProgramData\\scoop\\apps\\arroxy\\current\\Arroxy.exe');
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('scoop');
  });

  it('falls back to direct on win32 when execPath is a normal NSIS install', async () => {
    setPlatform('win32');
    setExecPath('C:\\Users\\me\\AppData\\Local\\Programs\\Arroxy\\Arroxy.exe');
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('direct');
  });

  it('detects portable on win32 when PORTABLE_EXECUTABLE_FILE is set', async () => {
    setPlatform('win32');
    setExecPath('C:\\Users\\me\\Downloads\\Arroxy-portable.exe');
    process.env.PORTABLE_EXECUTABLE_FILE = 'C:\\Users\\me\\Downloads\\Arroxy-portable.exe';
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('portable');
  });

  it('scoop wins over portable detection (scoop installs do not set PORTABLE_EXECUTABLE_FILE in practice)', async () => {
    setPlatform('win32');
    setExecPath('C:\\Users\\me\\scoop\\apps\\arroxy\\current\\Arroxy.exe');
    process.env.PORTABLE_EXECUTABLE_FILE = 'whatever';
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('scoop');
  });

  it('detects homebrew on darwin when Caskroom directory exists for the given app name', async () => {
    setPlatform('darwin');
    vi.doMock('node:fs', () => ({
      default: { existsSync: (p: string) => p === '/opt/homebrew/Caskroom/arroxy' }
    }));
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('homebrew');
    vi.doUnmock('node:fs');
  });

  it('uses the supplied app name (not a hardcoded brand) for darwin Caskroom lookup', async () => {
    setPlatform('darwin');
    vi.doMock('node:fs', () => ({
      default: { existsSync: (p: string) => p === '/opt/homebrew/Caskroom/foobar' }
    }));
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('foobar')).toBe('homebrew');
    expect(detectInstallChannel('arroxy')).toBe('direct');
    vi.doUnmock('node:fs');
  });

  it('falls back to direct on darwin when no Caskroom directory exists', async () => {
    setPlatform('darwin');
    vi.doMock('node:fs', () => ({ default: { existsSync: () => false } }));
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('direct');
    vi.doUnmock('node:fs');
  });

  it('returns direct on linux when not running under Flatpak', async () => {
    setPlatform('linux');
    vi.doMock('node:fs', () => ({ default: { existsSync: () => false } }));
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('direct');
    vi.doUnmock('node:fs');
  });

  it('detects flatpak on linux when /.flatpak-info exists', async () => {
    setPlatform('linux');
    vi.doMock('node:fs', () => ({
      default: { existsSync: (p: string) => p === '/.flatpak-info' }
    }));
    const { detectInstallChannel } = await import('@main/installChannel');
    expect(detectInstallChannel('arroxy')).toBe('flatpak');
    vi.doUnmock('node:fs');
  });
});
