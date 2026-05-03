import { describe, expect, it } from 'vitest';
import { phasesFor } from '@main/services/phases';
import type { StartDownloadInput } from '@shared/types';

const URL = 'https://www.youtube.com/watch?v=test';
const FORMAT_ID = 'bv+ba';
const LANGS = ['en', 'ja'];

function input(overrides: Partial<StartDownloadInput> = {}): StartDownloadInput {
  return { url: URL, outputDir: '/tmp', ...overrides };
}

// phasesFor always prepends a PreflightPhase, so counts below include it.
// Kinds are checked starting at index 1.

describe('phasesFor — strategy selection', () => {
  it('no formatId + langs → preflight + subtitle-only', () => {
    const phases = phasesFor(input({ subtitleLanguages: LANGS }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('subtitle-only');
  });

  it('formatId + no langs → preflight + video (single VideoPhase embed=false)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
  });

  it('formatId + langs + mode=sidecar → preflight + video + sidecar-subs', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID, subtitleLanguages: LANGS, subtitleMode: 'sidecar' }));
    expect(phases).toHaveLength(3);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
    expect(phases[2].kind).toBe('sidecar-subs');
  });

  it('formatId + langs + mode=embed + writeAutoSubs=false → preflight + video+embed', () => {
    const phases = phasesFor(input({
      formatId: FORMAT_ID, subtitleLanguages: LANGS,
      subtitleMode: 'embed', writeAutoSubs: false,
    }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video+embed');
  });

  it('formatId + langs + mode=embed + writeAutoSubs=true → preflight + video + sidecar-subs', () => {
    const phases = phasesFor(input({
      formatId: FORMAT_ID, subtitleLanguages: LANGS,
      subtitleMode: 'embed', writeAutoSubs: true,
    }));
    expect(phases).toHaveLength(3);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
    expect(phases[2].kind).toBe('sidecar-subs');
  });

  it('empty subtitleLanguages → preflight + video (treated as no-subs regardless of mode)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID, subtitleLanguages: [], subtitleMode: 'embed' }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
  });

  it('mode=embed but no langs → preflight + video (mode is moot when nothing to embed)', () => {
    const phases = phasesFor(input({ formatId: FORMAT_ID, subtitleMode: 'embed' }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
  });

  it('no formatId + no langs → preflight + video (subtitle-only needs langs)', () => {
    const phases = phasesFor(input({}));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
  });

  it('no formatId + empty langs → preflight + video (empty langs is same as no langs)', () => {
    const phases = phasesFor(input({ subtitleLanguages: [] }));
    expect(phases).toHaveLength(2);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
  });

  it('formatId + langs + mode=subfolder → preflight + video + sidecar-subs', () => {
    const phases = phasesFor(input({
      formatId: FORMAT_ID, subtitleLanguages: LANGS, subtitleMode: 'subfolder',
    }));
    expect(phases).toHaveLength(3);
    expect(phases[0].kind).toBe('preflight');
    expect(phases[1].kind).toBe('video');
    expect(phases[2].kind).toBe('sidecar-subs');
  });
});
