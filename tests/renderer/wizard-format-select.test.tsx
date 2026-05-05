// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@renderer/store/useAppStore';
import type { FormatOption } from '@shared/types';

const FORMATS: FormatOption[] = [
  {
    formatId: '137',
    label: '1080p | mp4 | 30fps',
    ext: 'mp4',
    resolution: '1080p',
    fps: 30,
    filesize: 800_000_000,
    isVideoOnly: true,
    isAudioOnly: false
  },
  {
    formatId: '22',
    label: '720p | mp4 | 30fps',
    ext: 'mp4',
    resolution: '720p',
    fps: 30,
    filesize: 400_000_000,
    isVideoOnly: false,
    isAudioOnly: false
  },
  {
    formatId: '140',
    label: 'm4a 128kbps',
    ext: 'm4a',
    resolution: 'audio only',
    abr: 128,
    isVideoOnly: false,
    isAudioOnly: true
  },
  {
    formatId: '249',
    label: 'opus 64kbps',
    ext: 'opus',
    resolution: 'audio only',
    abr: 64,
    isVideoOnly: false,
    isAudioOnly: true
  }
];

beforeEach(() => {
  useAppStore.setState({
    wizardFormats: FORMATS,
    selectedVideoFormatId: '',
    audioSelection: { kind: 'none' },
    activePreset: null
  });
});

describe('wizard slice — invariant: video + convert audio is unreachable', () => {
  it('switching from audio-only to a video format while audio is convert resets audio to best native', () => {
    useAppStore.setState({
      selectedVideoFormatId: '',
      audioSelection: { kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320 },
      activePreset: 'audio-only'
    });

    useAppStore.getState().setSelectedVideoFormatId('22');

    const { selectedVideoFormatId, audioSelection, activePreset } = useAppStore.getState();
    expect(selectedVideoFormatId).toBe('22');
    expect(audioSelection).toEqual({ kind: 'native', formatId: '140' });
    expect(activePreset).toBeNull();
  });

  it('switching to video while audio is wav-convert also resets to best native', () => {
    useAppStore.setState({
      selectedVideoFormatId: '',
      audioSelection: { kind: 'convert-lossless', target: 'wav' }
    });

    useAppStore.getState().setSelectedVideoFormatId('137');

    expect(useAppStore.getState().audioSelection).toEqual({ kind: 'native', formatId: '140' });
  });

  it('falls back to {kind: none} when no native audio formats exist', () => {
    useAppStore.setState({
      wizardFormats: FORMATS.filter((f) => !f.isAudioOnly),
      selectedVideoFormatId: '',
      audioSelection: { kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192 }
    });

    useAppStore.getState().setSelectedVideoFormatId('22');

    expect(useAppStore.getState().audioSelection).toEqual({ kind: 'none' });
  });

  it('switching between video formats does not touch a native audio selection', () => {
    useAppStore.setState({
      selectedVideoFormatId: '22',
      audioSelection: { kind: 'native', formatId: '249' }
    });

    useAppStore.getState().setSelectedVideoFormatId('137');

    expect(useAppStore.getState().audioSelection).toEqual({ kind: 'native', formatId: '249' });
  });

  it('selecting convert audio while a video is selected clears the video to audio-only', () => {
    useAppStore.setState({
      selectedVideoFormatId: '22',
      audioSelection: { kind: 'native', formatId: '140' },
      activePreset: null
    });

    useAppStore.getState().setAudioSelection({ kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192 });

    const { selectedVideoFormatId, audioSelection, activePreset } = useAppStore.getState();
    expect(selectedVideoFormatId).toBe('');
    expect(audioSelection).toEqual({ kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192 });
    expect(activePreset).toBe('audio-only');
  });

  it('selecting native audio while a video is selected does NOT clear the video', () => {
    useAppStore.setState({
      selectedVideoFormatId: '22',
      audioSelection: { kind: 'none' },
      activePreset: null
    });

    useAppStore.getState().setAudioSelection({ kind: 'native', formatId: '140' });

    expect(useAppStore.getState().selectedVideoFormatId).toBe('22');
  });
});
