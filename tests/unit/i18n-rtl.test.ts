import { describe, it, expect } from 'vitest';
import { isRtl, RTL_LANGS } from '@shared/i18n/rtl';

describe('isRtl', () => {
  it('returns true for RTL languages', () => {
    expect(isRtl('ar')).toBe(true);
    expect(isRtl('ps')).toBe(true);
  });

  it('returns false for LTR languages', () => {
    expect(isRtl('en')).toBe(false);
    expect(isRtl('fr')).toBe(false);
    expect(isRtl('zh')).toBe(false);
  });

  it('RTL_LANGS set matches isRtl', () => {
    for (const lang of RTL_LANGS) {
      expect(isRtl(lang)).toBe(true);
    }
  });
});
