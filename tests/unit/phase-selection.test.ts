import { describe, expect, it } from 'vitest';
import { phasesFor } from '@main/services/phases';
import type { StartDownloadInput } from '@shared/types';

const URL = 'https://www.youtube.com/watch?v=test';
const FORMAT_ID = 'bv+ba';
const LANGS = ['en', 'ja'];

function input(overrides: Partial<StartDownloadInput> = {}): StartDownloadInput {
  return { url: URL, outputDir: '/tmp', ...overrides };
}

describe('phasesFor — strategy selection', () => {
  it('no formatId + langs → subtitle-only (single SubtitleOnlyPhase)', () => {
    const phases = phasesFor(input({ subtitleLanguages: LANGS }));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('subtitle-only');
  });

  it('formatId + no langs → video (single VideoPhase embed=false)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID }));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('video');
  });

  it('formatId + langs + mode=sidecar → video+sidecar (VideoPhase + SidecarSubsPhase)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID, subtitleLanguages: LANGS, subtitleMode: 'sidecar' }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('video');
    expect(phases[1].kind).toBe('sidecar-subs');
  });

  it('formatId + langs + mode=embed + writeAutoSubs=false → video+embed (VideoPhase embed=true)', () => {
    const phases = phasesFor(input({
      formatId: FORMAT_ID, subtitleLanguages: LANGS,
      subtitleMode: 'embed', writeAutoSubs: false,
    }));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('video+embed');
  });

  it('formatId + langs + mode=embed + writeAutoSubs=true → video+embed+auto (VideoPhase + SidecarSubsPhase)', () => {
    const phases = phasesFor(input({
      formatId: FORMAT_ID, subtitleLanguages: LANGS,
      subtitleMode: 'embed', writeAutoSubs: true,
    }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('video');
    expect(phases[1].kind).toBe('sidecar-subs');
  });

  it('empty subtitleLanguages → video (treated as no-subs regardless of mode)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID, subtitleLanguages: [], subtitleMode: 'embed' }));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('video');
  });

  it('mode=embed but no langs → video (mode is moot when nothing to embed)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID, subtitleMode: 'embed' }));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('video');
  });

  it('no formatId + no langs → video (subtitle-only needs langs)', () => {
    const phases = phasesFor(input({}));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('video');
  });

  it('no formatId + empty langs → video (empty langs is same as no langs)', () => {
    const phases = phasesFor(input({ subtitleLanguages: [] }));
    expect(phases).toHaveLength(1);
    expect(phases[0].kind).toBe('video');
  });

  it('formatId + langs + mode=subfolder → video+sidecar (subfolder is handled in arg layer, not phase layer)', () => {
    const phases = phasesFor(input({
      formatId: FORMAT_ID, subtitleLanguages: LANGS, subtitleMode: 'subfolder',
    }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('video');
    expect(phases[1].kind).toBe('sidecar-subs');
  });
});
