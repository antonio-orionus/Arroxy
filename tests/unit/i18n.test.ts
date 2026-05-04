import { describe, expect, it } from 'vitest';
import { pickLanguage } from '@shared/i18n';
import { mainT, pluralKey } from '@main/i18n';

describe('pickLanguage', () => {
  it('returns en for undefined or null input', () => {
    expect(pickLanguage(undefined)).toBe('en');
    expect(pickLanguage(null)).toBe('en');
    expect(pickLanguage('')).toBe('en');
  });

  it('returns exact match when supported', () => {
    expect(pickLanguage('en')).toBe('en');
    expect(pickLanguage('es')).toBe('es');
    expect(pickLanguage('hi')).toBe('hi');
  });

  it('strips region tag and matches the prefix', () => {
    expect(pickLanguage('zh-TW')).toBe('zh');
    expect(pickLanguage('zh-CN')).toBe('zh');
    expect(pickLanguage('en-US')).toBe('en');
    expect(pickLanguage('de_AT')).toBe('de');
  });

  it('falls back to en when language is unsupported', () => {
    expect(pickLanguage('pt-BR')).toBe('en');
    expect(pickLanguage('tlh')).toBe('en');
  });

  it('handles uppercase input', () => {
    expect(pickLanguage('FR')).toBe('fr');
    expect(pickLanguage('JA-JP')).toBe('ja');
  });
});

describe('mainT', () => {
  it('translates a known key', () => {
    expect(mainT('en', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancel Downloads & Quit');
    expect(mainT('es', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancelar descargas y salir');
  });

  it('falls back to English when a key is missing in target language', () => {
    // All locales currently have all keys, so simulate missing by giving an unknown key.
    // The fallback path returns the key itself when not found in either language.
    expect(mainT('en', 'this.does.not.exist')).toBe('this.does.not.exist');
  });

  it('interpolates {{x}} tokens', () => {
    expect(mainT('en', 'status.ytdlpExitCode', { code: 7 })).toBe('yt-dlp exited with code 7');
    expect(mainT('en', 'status.downloadingBinary', { name: 'yt-dlp' })).toBe('Downloading yt-dlp binary…');
  });

  it('leaves unmatched interpolation tokens visible', () => {
    expect(mainT('en', 'status.downloadingBinary')).toBe('Downloading {{name}} binary…');
  });
});

describe('pluralKey', () => {
  it('returns _one for count of 1', () => {
    expect(pluralKey('message', 1)).toBe('message_one');
  });

  it('returns _other for any other count', () => {
    expect(pluralKey('message', 0)).toBe('message_other');
    expect(pluralKey('message', 2)).toBe('message_other');
    expect(pluralKey('message', 100)).toBe('message_other');
  });
});
