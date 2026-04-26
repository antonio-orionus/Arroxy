import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
