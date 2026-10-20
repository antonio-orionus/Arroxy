// Single registry for audio-convert targets. The lossy flag drives bitrate-strip
// enablement in the wizard.
// `AudioConvertTarget` is defined here (not in schemas.ts) so the zod schema can
// build its enum from this list without a circular import.

export type AudioConvertTarget = 'mp3' | 'm4a' | 'opus' | 'wav'

export interface AudioConvertTargetSpec {
	target: AudioConvertTarget
	lossy: boolean
}

export const AUDIO_CONVERT_TARGETS = [
	{target: 'mp3', lossy: true},
	{target: 'm4a', lossy: true},
	{target: 'opus', lossy: true},
	{target: 'wav', lossy: false}
] as const satisfies readonly AudioConvertTargetSpec[]

// `best` (extract, keep the codec) is no chip of its own, and keeps a lossy
// codec in almost every case (Opus, AAC, MP3), so it counts as lossy.
export function isAudioConvertTargetLossy(target: AudioConvertTarget | 'best'): boolean {
	return target === 'best' || AUDIO_CONVERT_TARGETS.some(spec => spec.target === target && spec.lossy)
}
