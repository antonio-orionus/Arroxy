import { afterEach, describe, expect, it } from 'vitest';
import { binaryInternals } from '@main/services/BinaryManager';

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!;
const originalArchDescriptor = Object.getOwnPropertyDescriptor(process, 'arch')!;

function setPlatform(platform: string, arch: string): void {
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
  Object.defineProperty(process, 'arch', { value: arch, configurable: true });
}

afterEach(() => {
  Object.defineProperty(process, 'platform', originalPlatformDescriptor);
  Object.defineProperty(process, 'arch', originalArchDescriptor);
});

describe('ytDlpAssetName', () => {
  it('win32 → yt-dlp.exe (arch ignored)', () => {
    setPlatform('win32', 'x64');
    expect(binaryInternals.ytDlpAssetName()).toBe('yt-dlp.exe');
  });

  it('darwin arm64 → yt-dlp_macos', () => {
    setPlatform('darwin', 'arm64');
    expect(binaryInternals.ytDlpAssetName()).toBe('yt-dlp_macos');
  });

  it('darwin x64 → yt-dlp_macos_legacy', () => {
    setPlatform('darwin', 'x64');
    expect(binaryInternals.ytDlpAssetName()).toBe('yt-dlp_macos_legacy');
  });

  it('linux x64 → yt-dlp_linux', () => {
    setPlatform('linux', 'x64');
    expect(binaryInternals.ytDlpAssetName()).toBe('yt-dlp_linux');
  });

  it('linux arm64 → yt-dlp_linux_aarch64', () => {
    setPlatform('linux', 'arm64');
    expect(binaryInternals.ytDlpAssetName()).toBe('yt-dlp_linux_aarch64');
  });
});

describe('ffmpegAssetName', () => {
  it('win32 x64 → ffmpeg-win32-x64', () => {
    setPlatform('win32', 'x64');
    expect(binaryInternals.ffmpegAssetName()).toBe('ffmpeg-win32-x64');
  });

  it('win32 arm64 → ffmpeg-win32-arm64', () => {
    setPlatform('win32', 'arm64');
    expect(binaryInternals.ffmpegAssetName()).toBe('ffmpeg-win32-arm64');
  });

  it('darwin arm64 → ffmpeg-darwin-arm64', () => {
    setPlatform('darwin', 'arm64');
    expect(binaryInternals.ffmpegAssetName()).toBe('ffmpeg-darwin-arm64');
  });

  it('darwin x64 → ffmpeg-darwin-x64', () => {
    setPlatform('darwin', 'x64');
    expect(binaryInternals.ffmpegAssetName()).toBe('ffmpeg-darwin-x64');
  });

  it('linux x64 → ffmpeg-linux-x64', () => {
    setPlatform('linux', 'x64');
    expect(binaryInternals.ffmpegAssetName()).toBe('ffmpeg-linux-x64');
  });

  it('linux arm64 → ffmpeg-linux-arm64', () => {
    setPlatform('linux', 'arm64');
    expect(binaryInternals.ffmpegAssetName()).toBe('ffmpeg-linux-arm64');
  });

  it('unknown platform → null', () => {
    setPlatform('freebsd', 'x64');
    expect(binaryInternals.ffmpegAssetName()).toBeNull();
  });
});

describe('denoAssetName', () => {
  it('win32 x64 → MSVC zip', () => {
    setPlatform('win32', 'x64');
    expect(binaryInternals.denoAssetName()).toBe('deno-x86_64-pc-windows-msvc.zip');
  });

  it('win32 arm64 → null (no upstream build)', () => {
    setPlatform('win32', 'arm64');
    expect(binaryInternals.denoAssetName()).toBeNull();
  });

  it('darwin arm64 → aarch64-apple-darwin zip', () => {
    setPlatform('darwin', 'arm64');
    expect(binaryInternals.denoAssetName()).toBe('deno-aarch64-apple-darwin.zip');
  });

  it('darwin x64 → x86_64-apple-darwin zip', () => {
    setPlatform('darwin', 'x64');
    expect(binaryInternals.denoAssetName()).toBe('deno-x86_64-apple-darwin.zip');
  });

  it('linux x64 → x86_64-unknown-linux-gnu zip', () => {
    setPlatform('linux', 'x64');
    expect(binaryInternals.denoAssetName()).toBe('deno-x86_64-unknown-linux-gnu.zip');
  });

  it('linux arm64 → aarch64-unknown-linux-gnu zip', () => {
    setPlatform('linux', 'arm64');
    expect(binaryInternals.denoAssetName()).toBe('deno-aarch64-unknown-linux-gnu.zip');
  });

  it('unknown platform → null', () => {
    setPlatform('freebsd', 'x64');
    expect(binaryInternals.denoAssetName()).toBeNull();
  });
});

describe('denoExecutableName', () => {
  it('win32 → deno.exe', () => {
    setPlatform('win32', 'x64');
    expect(binaryInternals.denoExecutableName()).toBe('deno.exe');
  });

  it('darwin → deno', () => {
    setPlatform('darwin', 'arm64');
    expect(binaryInternals.denoExecutableName()).toBe('deno');
  });

  it('linux → deno', () => {
    setPlatform('linux', 'x64');
    expect(binaryInternals.denoExecutableName()).toBe('deno');
  });
});
