// The stream each conversion starts from, picked by the bridge's own `-f`
// selector through the app's port of yt-dlp's format selection, on real
// probes. `scripts/check-selection-parity.ts` holds that port to real yt-dlp.
import {describe, expect, it} from 'vite-plus/test'
import {planWorkflow} from 'yt-dlp-bridge'
import {probeSourceResult} from '@renderer/dev/probeSources/index.js'
import type {ProbeSourceId} from '@renderer/dev/probeSources/sources.js'
import {createFormatSorter, prepareForSort, sortFormats} from '@shared/ytdlp/formatSorter.js'
import {selectFormats} from '@shared/ytdlp/formatSelector.js'

function conversionSelector(target: string): string {
	const plan = planWorkflow({kind: 'media', url: 'https://example.com/v', output: {directory: '/out'}, audio: {convert: {target, lossy: target !== 'wav', bitrateKbps: 192}}})
	return plan.args[plan.args.indexOf('-f') + 1] ?? ''
}

function pick(probe: ProbeSourceId, target: string, without: readonly string[] = []): string | undefined {
	const selection = probeSourceResult(probe).formatSelection
	if (!selection) throw new Error(`${probe}: no yt-dlp formats`)
	const formats = selection.formats.filter(format => !without.includes(format.format_id ?? ''))
	const sorted = sortFormats(prepareForSort(formats, selection.durationSeconds), createFormatSorter([], selection.sortFields))
	return selectFormats(conversionSelector(target), sorted)?.formats[0]?.format_id
}

describe('audio conversion source on real probes', () => {
	// yt-dlp copies AAC into m4a and Opus into opus: no second lossy pass.
	it.each([
		['youtube-2014', 'm4a', '140'],
		['youtube-2014', 'opus', '251'],
		['youtube-2014', 'mp3', '251'],
		['youtube-2014', 'wav', '251'],
		['youtube-multilang', 'm4a', '140-20'],
		['youtube-multilang', 'opus', '251-20'],
		['soundcloud', 'm4a', 'hls_aac_160k'],
		['bandcamp', 'mp3', 'mp3-128']
	] as const)('%s %s → %s', (probe, target, formatId) => {
		expect(pick(probe, target)).toBe(formatId)
	})

	// libopus refuses Dolby's 5.1(side) layout; the other targets downmix it.
	it.each(['m4a', 'opus', 'mp3', 'wav'])('the Dolby trailer converts a stereo stream to %s', target => {
		expect(pick('youtube-dolby', target)).toMatch(/^(?:140|251)$/)
	})

	// A low-bitrate stream in the target codec is no better for being copied.
	it('re-encodes the best stream rather than copy a low-bitrate one', () => {
		expect(pick('youtube-2014', 'm4a', ['140', '140-drc'])).toBe('251')
	})

	// Every stereo stream, DRC ones too, comes before Dolby surround.
	it('takes a DRC stereo stream before Dolby surround', () => {
		const stereo = ['233', '234', '139', '249', '250', '140', '251']
		expect(pick('youtube-dolby', 'opus', stereo)).toBe('251-drc')
		expect(pick('youtube-dolby', 'mp3', stereo)).toMatch(/-drc$/)
	})
})
