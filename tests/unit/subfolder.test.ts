import { describe, expect, it } from 'vitest';
import { isValidSubfolder, effectiveOutputDir, joinSubfolder } from '@shared/subfolder';

describe('isValidSubfolder', () => {
  it('accepts ordinary names', () => {
    expect(isValidSubfolder('lo-fi rips')).toBe(true);
    expect(isValidSubfolder('mix_2025')).toBe(true);
  });

  it('rejects empty/whitespace-only input', () => {
    expect(isValidSubfolder('')).toBe(false);
    expect(isValidSubfolder('   ')).toBe(false);
  });

  it('rejects . and ..', () => {
    expect(isValidSubfolder('.')).toBe(false);
    expect(isValidSubfolder('..')).toBe(false);
  });

  it('rejects forbidden filename chars', () => {
    for (const ch of '<>:"/\\|?*') {
      expect(isValidSubfolder(`bad${ch}name`)).toBe(false);
    }
  });

  it('rejects DOS reserved names regardless of case', () => {
    expect(isValidSubfolder('CON')).toBe(false);
    expect(isValidSubfolder('com1')).toBe(false);
    expect(isValidSubfolder('lpt9.txt')).toBe(false);
  });

  it('rejects names ending in . (Windows) — trailing spaces are trimmed first so they pass', () => {
    expect(isValidSubfolder('trail.')).toBe(false);
    // Trailing whitespace is trimmed before validation — accepted UX.
    expect(isValidSubfolder('trail ')).toBe(true);
  });

  it('rejects names exceeding 64 chars', () => {
    expect(isValidSubfolder('a'.repeat(65))).toBe(false);
    expect(isValidSubfolder('a'.repeat(64))).toBe(true);
  });
});

describe('joinSubfolder', () => {
  it('uses / when base contains /', () => {
    expect(joinSubfolder('/home/user', 'sub')).toBe('/home/user/sub');
  });

  it('uses \\ when base contains \\', () => {
    expect(joinSubfolder('C:\\Users\\x', 'sub')).toBe('C:\\Users\\x\\sub');
  });

  it('strips trailing separator from base before joining', () => {
    expect(joinSubfolder('/home/user/', 'sub')).toBe('/home/user/sub');
    expect(joinSubfolder('/home/user//', 'sub')).toBe('/home/user/sub');
  });

  it('returns base unchanged when sub is empty', () => {
    expect(joinSubfolder('/home/user', '')).toBe('/home/user');
  });
});

describe('effectiveOutputDir', () => {
  it('returns base when toggle is off', () => {
    expect(effectiveOutputDir('/home/user', false, 'sub')).toBe('/home/user');
  });

  it('returns base when subfolder is empty', () => {
    expect(effectiveOutputDir('/home/user', true, '')).toBe('/home/user');
    expect(effectiveOutputDir('/home/user', true, '   ')).toBe('/home/user');
  });

  it('returns base when subfolder is invalid (defensive — UI should disable continue)', () => {
    expect(effectiveOutputDir('/home/user', true, 'bad/name')).toBe('/home/user');
    expect(effectiveOutputDir('/home/user', true, 'CON')).toBe('/home/user');
  });

  it('joins valid subfolder', () => {
    expect(effectiveOutputDir('/home/user', true, 'mixes')).toBe('/home/user/mixes');
  });
});
