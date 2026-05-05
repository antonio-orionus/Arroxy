import type { Preset } from '@shared/schemas';

interface PresetTraits {
  producesVideo: boolean;
  producesMedia: boolean;
}

const PRESET_TRAITS: Record<Preset, PresetTraits> = {
  'best-quality': { producesVideo: true, producesMedia: true },
  balanced: { producesVideo: true, producesMedia: true },
  'small-file': { producesVideo: true, producesMedia: true },
  'audio-only': { producesVideo: false, producesMedia: true },
  'subtitle-only': { producesVideo: false, producesMedia: false }
};

export function presetProducesVideo(preset: Preset): boolean {
  return PRESET_TRAITS[preset].producesVideo;
}

export function presetProducesMedia(preset: Preset): boolean {
  return PRESET_TRAITS[preset].producesMedia;
}
