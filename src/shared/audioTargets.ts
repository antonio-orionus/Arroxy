// Single registry for audio-convert targets. The lossy flag drives bitrate-strip
// enablement in the wizard and the auto-embed policy in `embedPolicy.ts`.
// `AudioConvertTarget` is defined here (not in schemas.ts) so the zod schema can
// build its enum from this list without a circular import.

export type AudioConvertTarget = 'mp3' | 'm4a' | 'opus' | 'wav';

export interface AudioConvertTargetSpec {
  target: AudioConvertTarget;
  lossy: boolean;
}

export const AUDIO_CONVERT_TARGETS = [
  { target: 'mp3', lossy: true },
  { target: 'm4a', lossy: true },
  { target: 'opus', lossy: true },
  { target: 'wav', lossy: false }
] as const satisfies readonly AudioConvertTargetSpec[];

export const isLossyTarget = (t: AudioConvertTarget): boolean => AUDIO_CONVERT_TARGETS.find((s) => s.target === t)?.lossy ?? false;
