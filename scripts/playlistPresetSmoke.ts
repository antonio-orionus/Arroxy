// The pure half of the playlist preset smoke (smoke-playlist-presets.ts): the
// cases, the yt-dlp request each one plans, and the checks on what yt-dlp
// picked. Kept apart so tests can run the checks without a network probe.

import {isAudioConvertTargetLossy} from '../src/shared/audioTargets.js'
import {mediaIntentSpec, playlistSelectionToMediaIntent, type MediaIntentSpec} from '../src/shared/mediaIntent.js'
import {AUDIO_BITRATES, PLAYLIST_VIDEO_TIERS, playlistAudioFormatSchema, type AudioConvert, type PlaylistSelection} from '../src/shared/schemas.js'
import type {AudioConvert as BridgeAudioConvert, WorkflowInput} from 'yt-dlp-bridge'

const OUTPUT_TEMPLATE = '%(title).200B [%(id)s].%(ext)s'
const UI_REACHABLE_MP4_TIERS = ['1080', '720', '480', '360', '240', '144'] as const

interface FormatInfo {
	format_id?: string
	ext?: string
	height?: number
	vcodec?: string
	acodec?: string
}

export interface SelectedInfo extends FormatInfo {
	title?: string
	requested_formats?: FormatInfo[]
}

export interface SmokeCase {
	name: string
	selection: PlaylistSelection
}

function smokeSpec(selection: PlaylistSelection): MediaIntentSpec {
	const intent = playlistSelectionToMediaIntent(selection)
	if (!intent) throw new Error(`smoke case has no media intent: ${JSON.stringify(selection)}`)
	return mediaIntentSpec(intent)
}

export function reqFor(selection: PlaylistSelection, outputDir: string, infoJsonPath: string, url: string): WorkflowInput {
	const spec = smokeSpec(selection)
	return {
		kind: 'media',
		url,
		output: {directory: outputDir, template: OUTPUT_TEMPLATE},
		selection: {formatSelector: spec.formatSelector, formatSort: spec.formatSort, mergeOutputFormat: spec.mergeOutputFormat},
		...(spec.audioConvert ? {audio: {convert: bridgeAudioConvert(spec.audioConvert)}} : {}),
		resume: {loadInfoJsonPath: infoJsonPath}
	}
}

function bridgeAudioConvert(input: AudioConvert): BridgeAudioConvert {
	return {...input, lossy: isAudioConvertTargetLossy(input.target)}
}

export function smokeCases(): SmokeCase[] {
	const cases: SmokeCase[] = [
		...PLAYLIST_VIDEO_TIERS.map(tier => ({name: `video best ${tier}`, selection: {kind: 'video' as const, tier, codec: 'best' as const}})),
		...UI_REACHABLE_MP4_TIERS.map(tier => ({name: `video mp4 ${tier}`, selection: {kind: 'video' as const, tier, codec: 'mp4' as const}})),
		{name: 'audio best', selection: {kind: 'audio', format: 'best'}}
	]

	for (const format of playlistAudioFormatSchema.options) {
		if (format === 'best') continue
		for (const bitrateKbps of AUDIO_BITRATES) {
			cases.push({name: `audio ${format} ${bitrateKbps}K`, selection: {kind: 'audio', format, bitrateKbps}})
		}
	}

	cases.push({name: 'audio mp3 default bitrate', selection: {kind: 'audio', format: 'mp3'}})
	return cases
}

// --dump-single-json writes one line; the plan's --no-quiet (or a user's
// yt-dlp config) puts yt-dlp's own log lines on stdout before it.
export function dumpedJsonLine(stdout: string): string | undefined {
	return stdout.split('\n').findLast(line => line.startsWith('{'))
}

export function parseSelectedInfo(stdout: string): SelectedInfo | null {
	const json = dumpedJsonLine(stdout)
	if (json === undefined) return null
	try {
		const parsed: unknown = JSON.parse(json)
		if (!isRecord(parsed)) return null
		const selected: SelectedInfo = {title: readString(parsed.title), format_id: readString(parsed.format_id), ext: readString(parsed.ext), height: readNumber(parsed.height), vcodec: readString(parsed.vcodec), acodec: readString(parsed.acodec)}
		if (Array.isArray(parsed.requested_formats)) {
			selected.requested_formats = parsed.requested_formats.filter(isRecord).map(f => ({format_id: readString(f.format_id), ext: readString(f.ext), height: readNumber(f.height), vcodec: readString(f.vcodec), acodec: readString(f.acodec)}))
		}
		return selected
	} catch {
		return null
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

function readNumber(value: unknown): number | undefined {
	return typeof value === 'number' ? value : undefined
}

function selectedVideo(info: SelectedInfo): FormatInfo | null {
	const requested = info.requested_formats?.find(f => f.vcodec !== undefined && f.vcodec !== 'none')
	if (requested) return requested
	return info.vcodec !== undefined && info.vcodec !== 'none' ? info : null
}

function selectedAudio(info: SelectedInfo): FormatInfo | null {
	const requested = info.requested_formats?.find(f => f.acodec !== undefined && f.acodec !== 'none')
	if (requested) return requested
	return info.acodec !== undefined && info.acodec !== 'none' ? info : null
}

function assertArgValue(args: string[], flag: string, expected: string): string | null {
	const idx = args.indexOf(flag)
	if (idx < 0) return `missing ${flag}`
	return args[idx + 1] === expected ? null : `${flag} expected ${expected}, got ${args[idx + 1] ?? '<missing>'}`
}

export function validate(caseDef: SmokeCase, args: string[], info: SelectedInfo): string[] {
	const failures: string[] = []
	if (caseDef.selection.kind === 'video') {
		const video = selectedVideo(info)
		if (!video) {
			failures.push('yt-dlp selected no video stream')
			return failures
		}
		if (caseDef.selection.tier !== 'best' && video.height !== undefined && video.height > Number(caseDef.selection.tier)) {
			failures.push(`height ${video.height} exceeds requested cap ${caseDef.selection.tier}`)
		}
		if (caseDef.selection.codec === 'mp4') {
			if (info.ext !== 'mp4') failures.push(`merged ext expected mp4, got ${info.ext ?? '<missing>'}`)
			if (video.vcodec === undefined || !/^(avc|h264)/i.test(video.vcodec)) failures.push(`video codec expected H.264/AVC preference, got ${video.vcodec ?? '<missing>'}`)
		}
		return [...failures, ...planFailures(smokeSpec(caseDef.selection), args)]
	}

	// Smoke cases cover media selections only; a subtitles batch has no stream to inspect.
	if (caseDef.selection.kind !== 'audio') return [`unsupported smoke selection: ${caseDef.selection.kind}`]
	const audio = selectedAudio(info)
	const video = selectedVideo(info)
	if (!audio) failures.push('yt-dlp selected no audio stream')
	if (video) failures.push(`audio preset selected a video stream (${video.format_id ?? video.vcodec ?? 'unknown'})`)
	return [...failures, ...planFailures(smokeSpec(caseDef.selection), args)]
}

// The argv has to carry what the plan promises. Expectations come from the
// spec reqFor planned from, never a copy of it, so they move with the plan.
// A converted pick's `-f` is the bridge's own (its conversion source), so only
// a selector the spec names is checked.
function planFailures(spec: MediaIntentSpec, args: string[]): string[] {
	const convert = spec.audioConvert
	const checks = [
		spec.formatSelector === undefined ? null : assertArgValue(args, '-f', spec.formatSelector),
		spec.formatSort === undefined ? null : assertArgValue(args, '-S', spec.formatSort),
		spec.mergeOutputFormat === undefined ? null : assertArgValue(args, '--merge-output-format', spec.mergeOutputFormat),
		...(convert ? [args.includes('-x') ? null : 'missing -x', assertArgValue(args, '--audio-format', convert.target), 'bitrateKbps' in convert ? assertArgValue(args, '--audio-quality', `${convert.bitrateKbps}K`) : null] : [args.includes('-x') ? 'unplanned -x' : null])
	]
	return checks.filter((s): s is string => s !== null)
}

export function describeSelection(info: SelectedInfo): string {
	const video = selectedVideo(info)
	const audio = selectedAudio(info)
	const parts = [`ext=${info.ext ?? '?'}`, video ? `v=${video.vcodec ?? '?'}@${video.height ?? '?'}p` : 'v=none', audio ? `a=${audio.acodec ?? '?'}` : 'a=none']
	return parts.join('  ')
}
