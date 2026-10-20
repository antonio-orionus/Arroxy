// What the Format screen lists for real probes of different sites, as text:
// one file per source under __snapshots__/probe-sources. A change to format
// mapping, grouping or profile picks shows up here as a readable diff for every
// kind of site at once. Update with `bunx vp test run --project node
// tests/unit/probe-sources.test.ts -u` after reading the diff; recapture the
// probes with `bun run probe-sources:capture`.

import {describe, expect, it} from 'vite-plus/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {DEFAULTS} from '@shared/constants.js'
import {resolveProfileSelection, type MediaSelection} from '@shared/profileSelection.js'
import type {VideoProbeResult} from '@shared/types.js'
import {selectView, type FormatSelectionView, type VideoFormatRow} from '@renderer/store/formatSelectionView.js'
import {probeSourceResult} from '@renderer/dev/probeSources/index.js'
import {PROBE_SOURCES} from '@renderer/dev/probeSources/sources.js'
import {conversionSource} from '@shared/audioConversionSource.js'
import {AUDIO_CONVERT_TARGETS} from '@shared/audioTargets.js'

const PICK_PROFILES = ['balanced', 'best-quality', 'mp4-1080', 'audio-only'] as const

function selectionFor(profileId: string, probe: VideoProbeResult): ReturnType<typeof resolveProfileSelection> {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === profileId)
	if (!profile) throw new Error(`no built-in ${profileId}`)
	if (!probe.formatSelection) throw new Error('a recorded probe always carries yt-dlp formats')
	return resolveProfileSelection({profile, formats: probe.formats, selection: probe.formatSelection, subtitles: probe.subtitles, automaticCaptions: probe.automaticCaptions, isAudioOnlySource: probe.isAudioOnlySource, nativeAudioPreference: DEFAULTS.nativeAudioPreference})
}

function pickFor(profileId: string, probe: VideoProbeResult): MediaSelection {
	return selectionFor(profileId, probe).media
}

function viewFor(probe: VideoProbeResult, pick: MediaSelection): FormatSelectionView {
	return selectView({selectedVideoFormatId: pick.videoFormatId, audioSelection: pick.audioSelection, lastConvertBitrate: 192, mediaKind: pick.kind, wizardFormats: probe.formats, profilePick: pick})
}

// Markers are icons on the chip; here they read as [names].
function chip(row: {chipLabel: string; chipTags: string[]; markers: {label: string}[]; size: string | null; isProfilePick: boolean}): string {
	return [row.chipLabel, ...row.chipTags, ...row.markers.map(view => `[${view.label}]`), row.size ?? 'no size'].join(' ') + (row.isProfilePick ? ' •' : '')
}

function table(rows: string[][]): string[] {
	const widths = rows[0].map((_, column) => Math.max(...rows.map(row => row[column].length)))
	return rows.map(row =>
		row
			.map((cell, column) => cell.padEnd(widths[column]))
			.join('  ')
			.trimEnd()
	)
}

function videoGrid(view: FormatSelectionView): string[] {
	const {columns, lines} = view.video
	if (lines.length === 0) return ['(no video)']
	const header = ['', ...columns.map(column => `${column.range} ${column.codec ?? '(codec not named)'}`)]
	const cell = (variants: VideoFormatRow[], range: string, codec: string | null): string => {
		const row = variants.find(variant => variant.range === range && variant.codec === codec)
		return row ? chip(row) + (row.hasAudio ? ' +audio' : '') : '·'
	}
	return table([header, ...lines.map(line => [line.alias ? `${line.name} ${line.alias}` : line.name, ...columns.map(column => cell(line.variants, column.range, column.codec))])])
}

// One track's streams, as the screen lists them: the picked one's, else the first.
function audioList(view: FormatSelectionView): string[] {
	const {tracks, nativeRows} = view.audio
	const shown = tracks.length > 0 ? (nativeRows.find(row => row.isProfilePick)?.track ?? tracks[0]) : null
	const lines = view.audio.lines.flatMap(line => {
		const rows = line.variants.filter(row => shown === null || row.track === shown)
		return rows.length > 0 ? [`${line.name}: ${rows.map(row => chip(row) + (row.isDrc ? ' DRC' : '')).join(' | ')}`] : []
	})
	const named = tracks.map(name => [name, ...(view.audio.trackTags[name] ?? [])].join(' · '))
	return [...(shown === null ? [] : [`tracks (${shown} shown): ${named.join(', ')}`]), ...(lines.length > 0 ? lines : ['(no separate audio)']), ...(view.audio.hasDrcTwins ? ['DRC switch shown'] : [])]
}

function describePick(probe: VideoProbeResult, pick: MediaSelection): string {
	const name = (id: string): string => {
		const format = probe.formats.find(candidate => candidate.formatId === id)
		return format ? `${format.formatId} (${format.resolution || 'no resolution'}, ${format.ext})` : id
	}
	const audio = pick.audioSelection.kind === 'native' ? name(pick.audioSelection.formatId) : pick.audioSelection.kind
	return pick.kind === 'audio' ? `audio ${audio}` : `${name(pick.videoFormatId)} + audio ${audio}`
}

// The stream each conversion starts from and whether yt-dlp copies it, as
// the wizard predicts it for a conversion that names no stream.
function conversionSources(probe: VideoProbeResult): string[] {
	const selection = probe.formatSelection
	if (!selection) return []
	const picks = AUDIO_CONVERT_TARGETS.flatMap(({target}) => {
		const source = conversionSource(selection, target)
		return source ? [`${target} ← ${source.formatId} ${source.copies ? `copy${source.kbps ? ` ${Math.round(source.kbps)} kbps` : ''}` : 're-encode'}`] : []
	})
	return picks.length > 0 ? [`convert from: ${picks.join(' · ')}`] : []
}

function render(id: string): string {
	const source = PROBE_SOURCES.find(candidate => candidate.id === id)
	const probe = probeSourceResult(source?.id ?? 'vk')
	const balanced = pickFor('balanced', probe)
	const view = viewFor(probe, balanced)
	const subtitles = Object.keys(probe.subtitles)
	const captions = Object.keys(probe.automaticCaptions)
	return [
		`${id}: ${source?.shows ?? ''}`,
		`${probe.title} · ${probe.duration ?? '?'} s · card says "${view.currentResolutionLabel}" · ${probe.formats.length} formats${probe.isAudioOnlySource ? ' · audio-only site' : ''}`,
		'',
		'Video (picked for Balanced 720p •):',
		...videoGrid(view),
		'',
		'Audio:',
		...audioList(view),
		...(view.audio.convertTargets.length > 0 ? [`convert: ${view.audio.convertTargets.join(', ')}`] : []),
		...conversionSources(probe),
		'',
		'Profile picks:',
		...PICK_PROFILES.map(profileId => {
			const {media, notices} = selectionFor(profileId, probe)
			return `${profileId}: ${describePick(probe, media)}${notices.length > 0 ? ` (notices: ${notices.map(notice => JSON.stringify(notice)).join(', ')})` : ''}`
		}),
		'',
		`Subtitles: ${subtitles.length > 0 ? subtitles.join(', ') : 'none'}`,
		`Auto captions: ${captions.length > 0 ? captions.join(', ') : 'none'}`,
		''
	].join('\n')
}

describe('Format screen for real probes of different sites', () => {
	for (const {id} of PROBE_SOURCES) {
		it(id, async () => {
			await expect(render(id)).toMatchFileSnapshot(`__snapshots__/probe-sources/${id}.txt`)
		})
	}
})

describe('AI-upscaled streams on a real probe', () => {
	const probe = probeSourceResult('youtube-2007')
	const pick = (aiUpscaled?: 'allow'): string => {
		const best = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === 'best-quality')
		if (best?.media.kind !== 'video-audio') throw new Error('best-quality is a video profile')
		const profile = {...best, media: {...best.media, ...(aiUpscaled ? {aiUpscaled} : {})}}
		if (!probe.formatSelection) throw new Error('a recorded probe always carries yt-dlp formats')
		return resolveProfileSelection({profile, formats: probe.formats, selection: probe.formatSelection, subtitles: {}, automaticCaptions: {}, isAudioOnlySource: false, nativeAudioPreference: 'compatible'}).media.videoFormatId
	}

	it('are skipped by default, also for profiles saved before the choice existed', () => {
		expect(pick()).toBe('397')
	})

	it('are picked when the profile allows them', () => {
		expect(pick('allow')).toBe('399-sr')
	})
})

describe('audio language on a real probe with AI dubs', () => {
	it("opens on the source's own default language, not the first one listed", () => {
		const probe = probeSourceResult('youtube-autodub')
		const view = selectView({selectedVideoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: probe.formats})
		expect(view.audio.tracks[0]).not.toBe(view.audio.defaultTrack)
		expect(view.audio.defaultTrack).toMatch(/original/i)
	})
})

describe('tiers on real probes', () => {
	it('takes a widescreen 1280x640 trailer as 720p, with no "closest to profile" notice', () => {
		const {media, notices} = selectionFor('balanced', probeSourceResult('youtube-dolby'))
		expect(media.videoFormatId).not.toBe('')
		expect(notices).toEqual([])
	})

	it('says nothing about the tier for a stream the site gives no size for', () => {
		expect(selectionFor('balanced', probeSourceResult('bitchute')).notices).toEqual([])
	})

	it("picks the copy the site rates higher at one height: Twitch's landscape clip, not its portrait crop", () => {
		expect(selectionFor('balanced', probeSourceResult('twitch-clip')).media.videoFormatId).toBe('720')
	})
})

// With nothing picked, every chip is the copy yt-dlp would take of identical
// streams: the last listed (Vimeo's fastly_skyfire CDN, TikTok's -1 copies).
describe('identical copies on real probes', () => {
	const rows = (id: 'vimeo' | 'tiktok'): string[] => selectView({selectedVideoFormatId: '', audioSelection: {kind: 'none'}, lastConvertBitrate: 192, mediaKind: 'video', wizardFormats: probeSourceResult(id).formats}).video.rows.map(row => row.formatId)

	it('vimeo', () => {
		expect(rows('vimeo')).toEqual(['hls-fastly_skyfire-2644', 'hls-fastly_skyfire-1526', 'hls-fastly_skyfire-794', 'hls-fastly_skyfire-407'])
	})

	it('tiktok', () => {
		expect(rows('tiktok')).toEqual(['bytevc1_720p_336791-1', 'bytevc1_540p_309336-1', 'h264_540p_344464-1', 'download'])
	})
})
