import { describe, expect, it } from 'vitest';
import en from '@shared/i18n/locales/en';
import es from '@shared/i18n/locales/es';
import fr from '@shared/i18n/locales/fr';
import de from '@shared/i18n/locales/de';
import ru from '@shared/i18n/locales/ru';
import uk from '@shared/i18n/locales/uk';
import ja from '@shared/i18n/locales/ja';
import zh from '@shared/i18n/locales/zh';
import hi from '@shared/i18n/locales/hi';
import { YTDLP_ERROR_KEYS, STATUS_KEY } from '@shared/schemas';
import type { LocaleResource } from '@shared/i18n/types';

const LOCALES: Record<string, LocaleResource> = { en, es, fr, de, ru, uk, ja, zh, hi };

describe('i18n contract', () => {
  it('every locale has a string for every YtdlpErrorKey', () => {
    for (const [name, resource] of Object.entries(LOCALES)) {
      const ytdlp = (resource as LocaleResource & { errors: { ytdlp: Record<string, string> } }).errors.ytdlp;
      for (const key of YTDLP_ERROR_KEYS) {
        expect(ytdlp[key], `${name} locale missing errors.ytdlp.${key}`).toBeDefined();
        expect(typeof ytdlp[key], `${name}.errors.ytdlp.${key} not string`).toBe('string');
        expect(ytdlp[key].length, `${name}.errors.ytdlp.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('every locale has a string for every StatusKey', () => {
    for (const [name, resource] of Object.entries(LOCALES)) {
      const status = (resource as LocaleResource & { status: Record<string, string> }).status;
      for (const key of Object.values(STATUS_KEY)) {
        expect(status[key], `${name} locale missing status.${key}`).toBeDefined();
      }
    }
  });

  it('non-en saveMode strings are translated (not English copies)', () => {
    const enSaveMode = (
      en as LocaleResource & {
        wizard: {
          subtitles: {
            saveMode: { heading: string; sidecar: string; embed: string; subfolder: string };
          };
        };
      }
    ).wizard.subtitles.saveMode;

    for (const [name, resource] of Object.entries(LOCALES)) {
      if (name === 'en') continue;
      const sm = (
        resource as LocaleResource & {
          wizard: {
            subtitles: {
              saveMode: { heading: string; sidecar: string; embed: string; subfolder: string };
            };
          };
        }
      ).wizard.subtitles.saveMode;
      // Heading and sidecar must differ from English. Embed/subfolder may
      // legitimately keep an English keyword in non-Latin scripts (e.g. zh
      // keeps "subtitles/" as the literal folder path), so we don't enforce
      // those — but heading and sidecar are pure UI strings.
      expect(sm.heading, `${name}.wizard.subtitles.saveMode.heading not translated`).not.toBe(enSaveMode.heading);
      expect(sm.sidecar, `${name}.wizard.subtitles.saveMode.sidecar not translated`).not.toBe(enSaveMode.sidecar);
    }
  });
});
