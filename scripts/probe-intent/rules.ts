// Rules for whether a download profile's picks match what the user asked
// for, judged from a probe's raw yt-dlp data, never from Arroxy's own output.
// Parity checks prove Arroxy and yt-dlp agree; these prove the answer is the
// one the user wanted. `tests/unit/probe-intent.test.ts` runs them on every
// recorded probe, and `sample-probe-intent.ts` on fresh videos. Each rule
// returns what is wrong, one line per violation.

import {BUILTIN_DOWNLOAD_PROFILES} from '../../src/shared/downloadProfiles.js'
import {resolveProfileSelection, type ProfileSelection} from '../../src/shared/profileSelection.js'
import {planSubtitleTracks} from '../../src/shared/subtitleTracks.js'
import type {DownloadProfile, VideoProbeResult} from '../../src/shared/types.js'
import {tierHeightOf} from '../../src/shared/videoTier.js'

export interface RawFormat {
	format_id: string
	ext?: string
	vcodec?: string
	acodec?: string
	width?: number
	height?: number
	language?: string
	format_note?: string
}

export function rawFormats(info: unknown): RawFormat[] {
	const formats = typeof info === 'object' && info !== null && 'formats' in info && Array.isArray(info.formats) ? (info.formats as unknown[]) : []
	return formats.filter((format): format is RawFormat => typeof format === 'object' && format !== null && 'format_id' in format && typeof format.format_id === 'string')
}

const isStoryboard = (format: RawFormat): boolean => format.ext === 'mhtml'
const hasVideo = (format: RawFormat): boolean => format.vcodec !== 'none' && !isStoryboard(format)
const isAudioOnly = (format: RawFormat): boolean => format.vcodec === 'none' && format.acodec !== undefined && format.acodec !== 'none'
const isUpscaled = (format: RawFormat): boolean => format.format_id.endsWith('-sr')
const isH264 = (format: RawFormat): boolean => /^(?:avc1|h264)/i.test(format.vcodec ?? '')
// The tier a stream sits in, as profiles and the Format screen name it (GLOSSARY: Tier).
// A stream that names its height alone is labelled by it, as the app labels it.
const tierOf = (format: RawFormat): number | null => (format.height ? tierHeightOf(format.width ?? format.height, format.height) : null)
// A stream meets a tier when its row names that tier, as the app judges it.
const meetsTier = (format: RawFormat, tier: number): boolean => tierOf(format) === tier

const VIDEO_PROFILES = BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.media.kind === 'video-audio')

function pick(profile: DownloadProfile, probe: VideoProbeResult): ProfileSelection {
	if (!probe.formatSelection) throw new Error('a recorded probe always carries yt-dlp formats')
	return resolveProfileSelection({profile, formats: probe.formats, selection: probe.formatSelection, subtitles: probe.subtitles, automaticCaptions: probe.automaticCaptions, isAudioOnlySource: probe.isAudioOnlySource, nativeAudioPreference: 'compatible'})
}

// Each rule returns what is wrong on one probe, one line per violation.
type Rule = (probe: VideoProbeResult, raw: RawFormat[]) => string[]

export const RULES: Record<string, Rule> = {
	'every real stream reaches the Format screen': (probe, raw) => {
		const mapped = new Set(probe.formats.map(format => format.formatId))
		return raw.filter(format => (hasVideo(format) || isAudioOnly(format)) && !mapped.has(format.format_id)).map(format => `${format.format_id} is not listed`)
	},

	'an audio stream keeps its language': (probe, raw) =>
		probe.formats.flatMap(format => {
			const language = raw.find(candidate => candidate.format_id === format.formatId)?.language
			return format.isAudioOnly && language && format.audioLanguage !== language ? [`${format.formatId} is ${language}, listed as ${format.audioLanguage ?? 'no language'}`] : []
		}),

	'asking for a language plans every track of it the video lists': probe => {
		const maps = {subtitles: probe.subtitles, automaticCaptions: probe.automaticCaptions}
		const listed = [...Object.keys(probe.subtitles).map(key => ({key, auto: false})), ...Object.keys(probe.automaticCaptions).map(key => ({key, auto: true}))]
		return listed.flatMap(({key, auto}) => {
			const language = key.split('-')[0] ?? key
			const plan = planSubtitleTracks({kind: 'languages', languages: [language], source: auto ? 'auto-only' : 'manual-only'}, maps)
			return plan.tracks.some(track => track.key === key) ? [] : [`"${language}" misses the ${auto ? 'caption' : 'uploaded track'} ${key} (missing: ${plan.missing.join(', ') || 'none'})`]
		})
	},

	'a video profile picks video when the video has some, and says so when it has none': (probe, raw) => {
		const videoExists = raw.some(hasVideo)
		return VIDEO_PROFILES.flatMap(profile => {
			const {media, notices} = pick(profile, probe)
			const saysNoVideo = notices.some(notice => notice.kind === 'no-video')
			if (videoExists && (saysNoVideo || !media.videoFormatId)) return [`${profile.id} picks no video`]
			if (!videoExists && !saysNoVideo) return [`${profile.id} does not say the video has no picture`]
			return []
		})
	},

	'a video-only pick comes with sound': (probe, raw) => {
		if (!raw.some(isAudioOnly)) return []
		return VIDEO_PROFILES.flatMap(profile => {
			const {media} = pick(profile, probe)
			const video = raw.find(format => format.format_id === media.videoFormatId)
			return video?.acodec === 'none' && media.audioSelection.kind === 'none' ? [`${profile.id} picks ${video.format_id} with no sound`] : []
		})
	},

	'Best available picks the top tier': (probe, raw) => {
		const best = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'best-quality')
		if (!best) throw new Error('best-quality built-in missing')
		const tiers = raw.filter(format => hasVideo(format) && !isUpscaled(format)).map(tierOf)
		if (tiers.length === 0 || tiers.some(tier => tier === null)) return []
		const top = Math.max(...tiers.map(Number))
		const picked = raw.find(format => format.format_id === pick(best, probe).media.videoFormatId)
		const tier = picked ? tierOf(picked) : null
		return tier === top ? [] : [`picks ${picked?.format_id ?? 'nothing'} (${tier ?? '?'}p) under ${top}p`]
	},

	'a tiered profile picks its tier, or says what it picked instead': (probe, raw) =>
		VIDEO_PROFILES.flatMap(profile => {
			if (profile.media.kind !== 'video-audio' || profile.media.tier === 'best') return []
			const wanted = Number(profile.media.tier)
			const smartTv = profile.media.goal === 'smart-tv'
			const {media, notices} = pick(profile, probe)
			const picked = raw.find(format => format.format_id === media.videoFormatId)
			if (!picked) return []
			const pickedTier = tierOf(picked)
			const fellBack = notices.some(notice => notice.kind === 'video-tier-fallback')
			// A stream the site gives no size for says nothing about the tier, so
			// it is no pick for a size limit while sized streams exist.
			if (pickedTier === null) return raw.some(format => hasVideo(format) && tierOf(format) !== null) ? [`${profile.id} picks ${picked.format_id}, of unknown size, over sized streams`] : []
			const takeable = raw.some(format => hasVideo(format) && !isUpscaled(format) && meetsTier(format, wanted) && (!smartTv || isH264(format)))
			const onTier = meetsTier(picked, wanted)
			if (!onTier && takeable) return [`${profile.id} picks ${pickedTier}p though a ${wanted}p stream it can take exists`]
			if (!onTier && !fellBack) return [`${profile.id} picks ${pickedTier}p and says nothing`]
			if (onTier && fellBack) return [`${profile.id} picks ${wanted}p yet says it fell back`]
			return []
		}),

	'Smart TV picks H.264 when there is any, and says so when there is none': (probe, raw) => {
		if (!raw.some(hasVideo)) return []
		const anyH264 = raw.some(format => hasVideo(format) && isH264(format))
		const codecsNamed = raw.filter(hasVideo).every(format => format.vcodec !== undefined)
		return VIDEO_PROFILES.flatMap(profile => {
			if (profile.media.kind !== 'video-audio' || profile.media.goal !== 'smart-tv') return []
			const {media, notices} = pick(profile, probe)
			const picked = raw.find(format => format.format_id === media.videoFormatId)
			const saysUnavailable = notices.some(notice => notice.kind === 'mp4-unavailable')
			if (anyH264 && picked && !isH264(picked)) return [`${profile.id} picks ${picked.vcodec ?? 'an unnamed codec'} though H.264 exists`]
			if (picked && isH264(picked) && saysUnavailable) return [`${profile.id} picks H.264 yet says MP4 is unavailable`]
			if (codecsNamed && !anyH264 && !saysUnavailable) return [`${profile.id} has no H.264 to take and says nothing`]
			return []
		})
	},

	'the original audio language is picked when the video has several': (probe, raw) => {
		const original = raw.find(format => isAudioOnly(format) && /\boriginal\b/i.test(format.format_note ?? ''))?.language
		const languages = new Set(raw.filter(isAudioOnly).map(format => format.language))
		if (!original || languages.size < 2) return []
		return BUILTIN_DOWNLOAD_PROFILES.flatMap(profile => {
			const {audioSelection} = pick(profile, probe).media
			if (audioSelection.kind !== 'native') return []
			const language = raw.find(format => format.format_id === audioSelection.formatId)?.language
			return language === original ? [] : [`${profile.id} picks ${language ?? 'no language'} audio over the original ${original}`]
		})
	}
}
