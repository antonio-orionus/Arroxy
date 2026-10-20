import {audioCodecPreference, audioConversionCopies} from 'yt-dlp-bridge/audio-conversion'
import type {AudioConvertTarget} from './audioTargets.js'
import type {FormatOption} from './types.js'

// An audio stream a conversion could start from.
export interface ConversionCandidate {
	formatId: string
	acodec: string | undefined
	kbps: number | undefined
	isDrc: boolean
	// The source's own default or original track (language); absent for any other.
	track?: 'default' | 'original'
	// yt-dlp's `quality` and channel count, which its sorter ranks before the codec.
	quality?: number
	channels?: number
}

// The stream a conversion starts from, and whether yt-dlp copies it as-is
// (already in the target codec: the chosen bitrate does not apply) or
// re-encodes it.
export interface ConversionSource {
	formatId: string
	copies: boolean
	kbps: number | undefined
}

const DOLBY_CODEC = /^(?:e-?ac-?3|ec-3|ac-?3)$/

// The bridge's source chain: the default track, then the original, then any;
// within each the non-DRC master first (the DRC one when the user asks for
// it), and within that a stream that is copied before one that is
// re-encoded, then any but Dolby surround, then any at all.
export function conversionSource(candidates: readonly ConversionCandidate[], target: AudioConvertTarget, options: {preferDrc?: boolean} = {}): ConversionSource | undefined {
	const copies = (candidate: ConversionCandidate): boolean => audioConversionCopies(target, candidate.acodec)
	const notDolby = (candidate: ConversionCandidate): boolean => candidate.acodec === undefined || !DOLBY_CODEC.test(candidate.acodec)
	const preferred = (candidate: ConversionCandidate): boolean => candidate.isDrc === (options.preferDrc === true)
	const tiers = [candidates.filter(candidate => candidate.track === 'default'), candidates.filter(candidate => candidate.track === 'original'), candidates].flatMap(track => [track.filter(preferred), track].flatMap(pool => [pool.filter(copies), pool.filter(notDolby), pool]))
	const best = tiers.find(tier => tier.length > 0)?.toSorted(byYtDlpRank)[0]
	return best ? {formatId: best.formatId, copies: copies(best), kbps: best.kbps} : undefined
}

// yt-dlp's own order within a tier, for the fields an audio stream differs
// in: quality, channels, codec, then bitrate (an unknown quality reads as -1).
function byYtDlpRank(a: ConversionCandidate, b: ConversionCandidate): number {
	return (b.quality ?? -1) - (a.quality ?? -1) || (b.channels ?? 0) - (a.channels ?? 0) || audioCodecPreference(b.acodec) - audioCodecPreference(a.acodec) || (b.kbps ?? 0) - (a.kbps ?? 0)
}

// The source of a conversion the wizard set up: the stream it names (one
// language of several), else the one the source chain picks.
export function selectedConversionSource(candidates: readonly ConversionCandidate[], target: AudioConvertTarget, sourceFormatId: string | undefined): ConversionSource | undefined {
	const named = sourceFormatId === undefined ? undefined : candidates.find(candidate => candidate.formatId === sourceFormatId)
	return named ? {formatId: named.formatId, copies: audioConversionCopies(target, named.acodec), kbps: named.kbps} : conversionSource(candidates, target)
}

export function formatConversionCandidate(format: FormatOption): ConversionCandidate {
	const track = format.isDefaultAudio === true ? 'default' : format.isOriginalAudio === true ? 'original' : undefined
	return {formatId: format.formatId, acodec: format.audioCodec, kbps: format.abr, isDrc: format.isDrc === true, ...(track ? {track} : {}), ...(format.quality === undefined ? {} : {quality: format.quality}), ...(format.audioChannels === undefined ? {} : {channels: format.audioChannels})}
}
