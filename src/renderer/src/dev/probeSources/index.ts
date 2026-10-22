// Captured probes (see sources.ts) as the probe results the app would build
// from them, through the app's own format and subtitle mapping. The browser
// mock's "Source:" scenarios and the source snapshot test both read these.

import type {VideoProbeResult} from '@shared/types.js'
import {siteForExtractor} from '@shared/sites/index.js'
import {isAudioOnlyVideo} from '@shared/ytdlp/extractorPredicates.js'
import {mapFormats} from '@shared/ytdlp/formatMapping.js'
import {formatSelectionSource} from '@shared/ytdlp/selectableFormat.js'
import {sanitizeSubtitleMap} from '@shared/ytdlp/subtitleMap.js'
import {infoDictSchema} from 'yt-dlp-bridge/info'
import {PROBE_SOURCES, type ProbeSourceId} from './sources.js'
import archive from './archive.json' with {type: 'json'}
import bitchute from './bitchute.json' with {type: 'json'}
import dailymotion from './dailymotion.json' with {type: 'json'}
import facebook from './facebook.json' with {type: 'json'}
import instagram from './instagram.json' with {type: 'json'}
import soundcloud from './soundcloud.json' with {type: 'json'}
import streamable from './streamable.json' with {type: 'json'}
import tiktok from './tiktok.json' with {type: 'json'}
import vk from './vk.json' with {type: 'json'}
import youtube2005 from './youtube-2005.json' with {type: 'json'}
import youtube2007 from './youtube-2007.json' with {type: 'json'}
import youtube2010 from './youtube-2010.json' with {type: 'json'}
import youtube2014 from './youtube-2014.json' with {type: 'json'}
import youtube8kHdr from './youtube-8k-hdr.json' with {type: 'json'}
import youtubeMultilang from './youtube-multilang.json' with {type: 'json'}
import youtubeShort from './youtube-short.json' with {type: 'json'}
import youtubeAutodub from './youtube-autodub.json' with {type: 'json'}
import youtubeVr from './youtube-vr.json' with {type: 'json'}
import youtubePremium from './youtube-premium.json' with {type: 'json'}
import youtubeAgeRestricted from './youtube-age-restricted.json' with {type: 'json'}
import youtubeDolby from './youtube-dolby.json' with {type: 'json'}
import youtubeMusic from './youtube-music.json' with {type: 'json'}
import youtubePodcast from './youtube-podcast.json' with {type: 'json'}
import twitchClip from './twitch-clip.json' with {type: 'json'}
import bandcamp from './bandcamp.json' with {type: 'json'}
import vimeo from './vimeo.json' with {type: 'json'}
import peertube from './peertube.json' with {type: 'json'}
import odysee from './odysee.json' with {type: 'json'}

// `lookedUpSizes`: sizes the capture asked the site's servers for, as the app does.
const FIXTURES: Record<ProbeSourceId, {info: unknown; lookedUpSizes?: Record<string, number>}> = {
	'youtube-multilang': youtubeMultilang,
	'youtube-8k-hdr': youtube8kHdr,
	'youtube-2014': youtube2014,
	'youtube-2010': youtube2010,
	'youtube-2007': youtube2007,
	'youtube-2005': youtube2005,
	'youtube-short': youtubeShort,
	'youtube-autodub': youtubeAutodub,
	'youtube-vr': youtubeVr,
	'youtube-premium': youtubePremium,
	'youtube-age-restricted': youtubeAgeRestricted,
	'youtube-dolby': youtubeDolby,
	'youtube-music': youtubeMusic,
	'youtube-podcast': youtubePodcast,
	'twitch-clip': twitchClip,
	bandcamp,
	dailymotion,
	vk,
	archive,
	streamable,
	bitchute,
	soundcloud,
	tiktok,
	instagram,
	vimeo,
	peertube,
	odysee,
	facebook
}

const PROBE_SOURCE_IDS = PROBE_SOURCES.map(source => source.id)

export function isProbeSourceId(value: string): value is ProbeSourceId {
	return (PROBE_SOURCE_IDS as readonly string[]).includes(value)
}

export function probeSourceResult(id: ProbeSourceId): VideoProbeResult {
	const fixture = FIXTURES[id]
	const info = infoDictSchema.parse(fixture.info)
	if (info._type !== 'video') throw new Error(`Probe source ${id} is not a single video`)
	const extractor = info.extractor ?? ''
	const site = siteForExtractor(extractor)
	const formats = mapFormats(info.formats ?? [], {durationSeconds: info.duration, ...(fixture.lookedUpSizes ? {lookedUpSizes: new Map(Object.entries(fixture.lookedUpSizes))} : {})})
	return {
		kind: 'video',
		videoId: info.id ?? null,
		extractor,
		extractorKey: info.extractor_key ?? '',
		webpageUrl: info.webpage_url ?? '',
		isAudioOnlySource: isAudioOnlyVideo(extractor, formats),
		formats,
		formatSelection: formatSelectionSource(info, '_format_sort_fields' in info ? info._format_sort_fields : undefined),
		title: info.title ?? '',
		thumbnail: info.thumbnail ?? '',
		...(info.duration === undefined ? {} : {duration: Math.round(info.duration)}),
		chapters: [],
		subtitles: sanitizeSubtitleMap(info.subtitles, {isAutomaticCaptions: false, site}),
		automaticCaptions: sanitizeSubtitleMap(info.automatic_captions, {isAutomaticCaptions: true, site}),
		isLive: info.is_live === true,
		hasDrm: info.has_drm === true,
		...(info.age_limit !== undefined && info.age_limit > 0 ? {ageLimit: info.age_limit} : {})
	}
}
