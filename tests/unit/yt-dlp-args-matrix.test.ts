import {describe, it, expect} from 'vitest'
import type {AudioConvert, SubtitleFormat, SubtitleMode} from '@shared/types.js'
import {isAudioConvertTargetLossy} from '@shared/audioTargets.js'
import {planWorkflow, type AudioConvert as BridgeAudioConvert, type WorkflowInput} from 'yt-dlp-bridge'
import {SOURCE_PREFERRED_BEST_AUDIO_SELECTOR} from '../shared/nativeAudioSelectors.js'

const AUDIO_CONVERTS: AudioConvert[] = [{target: 'wav'}, {target: 'mp3', bitrateKbps: 128}, {target: 'mp3', bitrateKbps: 192}, {target: 'mp3', bitrateKbps: 320}, {target: 'm4a', bitrateKbps: 192}, {target: 'opus', bitrateKbps: 128}]

const FORMAT_IDS = ['137+251', '251', '22']
const SUBTITLE_LANGS_SETS: string[][] = [['en'], ['en', 'ja'], ['en-orig', 'en-j3PyPqV-e1s']]
const SUBTITLE_FORMATS: SubtitleFormat[] = ['srt', 'vtt', 'ass']
const SUBTITLE_MODES: SubtitleMode[] = ['sidecar', 'subfolder']

function adjacent(args: string[], a: string, b: string): boolean {
	for (let i = 0; i < args.length - 1; i++) if (args[i] === a && args[i + 1] === b) return true
	return false
}

function argsFor(req: WorkflowInput): string[] {
	return planWorkflow(req).args
}

function bridgeAudioConvert(input: AudioConvert): BridgeAudioConvert {
	return {...input, lossy: isAudioConvertTargetLossy(input.target)}
}

describe('planWorkflow — subtitle kind invariants', () => {
	const cases = SUBTITLE_LANGS_SETS.flatMap(langs => SUBTITLE_FORMATS.flatMap(fmt => SUBTITLE_MODES.flatMap(mode => [false, true].map(auto => ({langs, fmt, mode, auto})))))

	it.each(cases)('subtitle kind always includes --skip-download [langs=$langs|fmt=$fmt|mode=$mode|auto=$auto]', ({langs, fmt, mode, auto}) => {
		const args = argsFor({kind: 'subtitles', url: 'https://www.youtube.com/watch?v=x', output: {directory: '/tmp/out', subtitleMode: mode}, subtitles: {languages: langs, format: fmt, writeAuto: auto}})
		expect(args).toContain('--skip-download')
		expect(args).toContain('--write-subs')
		expect(adjacent(args, '--sub-langs', langs.join(','))).toBe(true)
		if (auto) expect(args).toContain('--write-auto-subs')
		// ass + auto silently downgrades to srt to allow dedupe — codified.
		const expectedFmt = auto && fmt === 'ass' ? 'srt' : fmt
		expect(adjacent(args, '--sub-format', `${expectedFmt}/best`)).toBe(true)
		expect(adjacent(args, '--convert-subs', expectedFmt)).toBe(true)
	})
})

describe('planWorkflow — video kind invariants', () => {
	// video kind: with formatId or with audioConvert (mutually exclusive
	// semantically — strategyFor wouldn't pass both, but the planner handles them).
	const formatIdCases = FORMAT_IDS.map(formatId => ({formatId, audioConvert: undefined as AudioConvert | undefined}))
	const audioConvertCases = AUDIO_CONVERTS.map(audioConvert => ({formatId: undefined as string | undefined, audioConvert}))

	it.each(formatIdCases)('formatId set + no audioConvert ⇒ -f formatId adjacent [$formatId]', ({formatId}) => {
		const args = argsFor({kind: 'media', url: 'https://www.youtube.com/watch?v=x', output: {directory: '/tmp/out'}, selection: {formatId}})
		expect(adjacent(args, '-f', formatId)).toBe(true)
		expect(args).not.toContain('-x')
		expect(args).not.toContain('--skip-download')
		expect(args).toContain('--no-write-subs')
		expect(args).toContain('--no-write-auto-subs')
	})

	it.each(audioConvertCases)('audioConvert set ⇒ -x + source-preferred bestaudio + --audio-format [target=$audioConvert.target]', ({audioConvert}) => {
		const args = argsFor({kind: 'media', url: 'https://www.youtube.com/watch?v=x', output: {directory: '/tmp/out'}, audio: {convert: bridgeAudioConvert(audioConvert)}})
		expect(adjacent(args, '-f', SOURCE_PREFERRED_BEST_AUDIO_SELECTOR)).toBe(true)
		expect(args).toContain('-x')
		expect(adjacent(args, '--audio-format', audioConvert.target)).toBe(true)
		if (audioConvert.target !== 'wav') {
			expect(adjacent(args, '--audio-quality', `${audioConvert.bitrateKbps}K`)).toBe(true)
		}
		expect(args).not.toContain('--skip-download')
	})

	it('production repro: m4a-convert + 2 subs (video+embed kind) emits embed-subs + merge-output', () => {
		const args = argsFor({kind: 'media', url: 'https://www.youtube.com/watch?v=gJYZE9UXiHk', output: {directory: '/tmp/out'}, subtitles: {embed: true, languages: ['en-j3PyPqV-e1s', 'en-orig']}})
		expect(args).toContain('--embed-subs')
		expect(args).toContain('--merge-output-format')
		expect(args).not.toContain('--skip-download')
	})
})

describe('planWorkflow — info-json (resume hardening)', () => {
	it('video kind w/ tempDir emits --write-info-json + infojson outtmpl', () => {
		const args = argsFor({kind: 'media', url: 'https://example.com/x', output: {directory: '/tmp/out', tempDirectory: '/tmp/out/.arroxy-temp/abc12345'}, selection: {formatId: 'hls-3217'}})
		expect(args).toContain('--write-info-json')
		expect(adjacent(args, '-o', 'infojson:/tmp/out/.arroxy-temp/abc12345/_arroxy')).toBe(true)
	})

	it('video kind w/o tempDir does NOT emit info-json flags', () => {
		const args = argsFor({kind: 'media', url: 'https://example.com/x', output: {directory: '/tmp/out'}, selection: {formatId: 'best'}})
		expect(args).not.toContain('--write-info-json')
		expect(args.some(a => a.startsWith('infojson:'))).toBe(false)
	})

	it('video kind w/ loadInfoJsonPath emits --load-info-json <path>', () => {
		const args = argsFor({kind: 'media', url: 'https://example.com/x', output: {directory: '/tmp/out', tempDirectory: '/tmp/out/.arroxy-temp/abc12345'}, selection: {formatId: 'hls-3217'}, resume: {loadInfoJsonPath: '/tmp/out/.arroxy-temp/abc12345/_arroxy.info.json'}})
		expect(adjacent(args, '--load-info-json', '/tmp/out/.arroxy-temp/abc12345/_arroxy.info.json')).toBe(true)
	})

	it('video kind w/ loadInfoJsonPath omits the URL (avoids yt-dlp warning)', () => {
		const url = 'https://example.com/x'
		const args = argsFor({kind: 'media', url, output: {directory: '/tmp/out', tempDirectory: '/tmp/out/.arroxy-temp/abc12345'}, selection: {formatId: 'hls-3217'}, resume: {loadInfoJsonPath: '/tmp/out/.arroxy-temp/abc12345/_arroxy.info.json'}})
		expect(args).not.toContain(url)
	})

	it('video kind w/o loadInfoJsonPath still passes the URL as positional', () => {
		const url = 'https://example.com/x'
		const args = argsFor({kind: 'media', url, output: {directory: '/tmp/out'}, selection: {formatId: 'best'}})
		expect(args).toContain(url)
	})

	it('video+embed kind w/ tempDir emits --write-info-json + infojson outtmpl', () => {
		const args = argsFor({kind: 'media', url: 'https://example.com/x', output: {directory: '/tmp/out', tempDirectory: '/tmp/out/.arroxy-temp/abc12345'}, subtitles: {embed: true, languages: ['en']}})
		expect(args).toContain('--write-info-json')
		expect(adjacent(args, '-o', 'infojson:/tmp/out/.arroxy-temp/abc12345/_arroxy')).toBe(true)
	})

	it('subtitle kind never emits info-json flags', () => {
		const args = argsFor({kind: 'subtitles', url: 'https://example.com/x', output: {directory: '/tmp/out'}, subtitles: {languages: ['en'], format: 'srt'}})
		expect(args).not.toContain('--write-info-json')
		expect(args).not.toContain('--load-info-json')
	})

	it('video kind w/ skipDownload + tempDir does NOT emit info-json flags', () => {
		const args = argsFor({kind: 'media', url: 'https://example.com/x', output: {directory: '/tmp/out', tempDirectory: '/tmp/out/.arroxy-temp/abc12345'}, selection: {formatId: 'best', skipDownload: true}})
		expect(args).not.toContain('--write-info-json')
	})
})

describe('planWorkflow — production repro cells (audio convert + sidecar subs)', () => {
	// The exact failure mode from the production log: audio-only preset with
	// m4a@192 convert. The sidecar subs go through a separate phase, so the
	// video-kind invocation seen here has no subtitle flags — but it MUST
	// include the audio extraction flags.
	it.each(AUDIO_CONVERTS)('video kind w/ audioConvert=$target emits -x and audio-format', audioConvert => {
		const args = argsFor({kind: 'media', url: 'https://www.youtube.com/watch?v=x', output: {directory: '/tmp/out'}, audio: {convert: bridgeAudioConvert(audioConvert)}})
		expect(args).toContain('-x')
		expect(adjacent(args, '--audio-format', audioConvert.target)).toBe(true)
	})
})
