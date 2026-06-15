import {describe, expect, it} from 'vitest'
import {EMBED_SUBTITLE_CONTAINER_EXT, planWorkflow, type WorkflowInput} from '../src/index.js'
import {parseYtDlpOutputLine} from '../src/parsers.js'
import {redactArgs} from '../src/redaction.js'
import {SOURCE_PREFERRED_BEST_AUDIO_SELECTOR} from '../../../tests/shared/nativeAudioSelectors.js'

const URL = 'https://www.youtube.com/watch?v=test'

function adjacent(args: string[], flag: string, value: string): boolean {
	for (let index = 0; index < args.length - 1; index += 1) {
		if (args[index] === flag && args[index + 1] === value) return true
	}
	return false
}

describe('planWorkflow — probe', () => {
	it('plans auto playlist probing with flat JSON and an app-limit sentinel', () => {
		const plan = planWorkflow({kind: 'probe', url: URL})

		expect(plan.args).toEqual(['--dump-single-json', '--no-quiet', '--flat-playlist', '--playlist-end', '101', URL])
		expect(plan.facts.playlistScope).toMatchObject({ytDlpFlag: '--playlist-end', ytDlpValue: '101', requestedCount: 100, sentinel: true})
		expect(plan.facts.isMediaDownload).toBe(false)
	})

	it('plans video mode without playlist sentinel args', () => {
		const plan = planWorkflow({kind: 'probe', url: URL, selection: {playlistMode: 'video', playlistScope: {items: {kind: 'range', from: 10, to: 20}}}})

		expect(plan.args).toContain('--no-playlist')
		expect(plan.args).not.toContain('--playlist-items')
		expect(plan.args).not.toContain('--playlist-end')
		expect(plan.facts.playlistScope).toBeUndefined()
	})

	it('plans playlist mode and scoped ranges with an exclusive sentinel end', () => {
		const plan = planWorkflow({kind: 'probe', url: URL, selection: {playlistMode: 'playlist', playlistScope: {items: {kind: 'range', from: 500, to: 600}}}})

		expect(plan.args).toContain('--yes-playlist')
		expect(adjacent(plan.args, '--playlist-items', '500:601')).toBe(true)
		expect(plan.facts.playlistScope).toMatchObject({ytDlpFlag: '--playlist-items', ytDlpValue: '500:601', requestedCount: 101})
	})
})

describe('planWorkflow — media', () => {
	it('plans format id downloads with resume hardening and temp info-json output', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.tmp/job'}, selection: {formatId: '137+140'}})

		expect(plan.args).toContain('--continue')
		expect(plan.args).toContain('--http-chunk-size')
		expect(adjacent(plan.args, '-f', '137+140')).toBe(true)
		expect(adjacent(plan.args, '--paths', 'home:/out')).toBe(true)
		expect(adjacent(plan.args, '--paths', 'temp:/out/.tmp/job')).toBe(true)
		expect(adjacent(plan.args, '-o', 'infojson:/out/.tmp/job/_arroxy')).toBe(true)
		expect(plan.args.at(-1)).toBe(URL)
		expect(plan.facts.isMediaDownload).toBe(true)
	})

	it('plans load-info-json resume without passing the original URL', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.tmp/job'}, selection: {formatId: 'hls-3217'}, resume: {loadInfoJsonPath: '/out/.tmp/job/_arroxy.info.json'}})

		expect(adjacent(plan.args, '--load-info-json', '/out/.tmp/job/_arroxy.info.json')).toBe(true)
		expect(plan.args).not.toContain(URL)
	})

	it('plans format selector, sort, and merge output', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestvideo+bestaudio/best', formatSort: 'res:1080,fps', mergeOutputFormat: 'mp4'}})

		expect(adjacent(plan.args, '-f', 'bestvideo+bestaudio/best')).toBe(true)
		expect(adjacent(plan.args, '-S', 'res:1080,fps')).toBe(true)
		expect(adjacent(plan.args, '--merge-output-format', 'mp4')).toBe(true)
	})

	it('plans audio conversion and default music embed policy', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, audio: {convert: {target: 'mp3', lossy: true, bitrateKbps: 192}}})

		expect(adjacent(plan.args, '-f', SOURCE_PREFERRED_BEST_AUDIO_SELECTOR)).toBe(true)
		expect(plan.args).toContain('-x')
		expect(adjacent(plan.args, '--audio-format', 'mp3')).toBe(true)
		expect(adjacent(plan.args, '--audio-quality', '192K')).toBe(true)
		expect(plan.args).toContain('--add-metadata')
		expect(plan.args).toContain('--embed-thumbnail')
	})

	it('uses caller-supplied lossy metadata for audio embed policy', () => {
		const lossyPlan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, audio: {convert: {target: 'custom-lossy', lossy: true, bitrateKbps: 192}}})
		const losslessPlan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, audio: {convert: {target: 'mp3', lossy: false, bitrateKbps: 192}}})

		expect(lossyPlan.args).toContain('--embed-thumbnail')
		expect(losslessPlan.args).not.toContain('--embed-thumbnail')
	})

	it('omits audio quality when a lossy conversion has no bitrate', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, audio: {convert: {target: 'mp3', lossy: true}}})

		expect(adjacent(plan.args, '--audio-format', 'mp3')).toBe(true)
		expect(plan.args).not.toContain('--audio-quality')
		expect(plan.args).not.toContain('undefinedK')
	})

	it('plans skip-download without media retry or format selection', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestaudio/best', skipDownload: true}})

		expect(plan.args).toContain('--skip-download')
		expect(plan.args).not.toContain('--continue')
		expect(plan.args).not.toContain('-f')
		expect(plan.facts.isMediaDownload).toBe(false)
	})

	it('forces mkv for embedded subtitles and suppresses an mp4 merge override', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestvideo+bestaudio/best', mergeOutputFormat: 'mp4'}, subtitles: {embed: true, languages: ['en'], writeAuto: true}, embed: {thumbnail: true}})

		expect(plan.args).toContain('--embed-subs')
		expect(adjacent(plan.args, '--merge-output-format', EMBED_SUBTITLE_CONTAINER_EXT)).toBe(true)
		expect(plan.args.join(' ')).not.toMatch(/--merge-output-format mp4/)
		expect(plan.args).toContain('--write-auto-subs')
		expect(plan.args).not.toContain('--embed-thumbnail')
	})
})

describe('planWorkflow — subtitles', () => {
	it('plans sidecar subtitle downloads', () => {
		const plan = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en', 'ja'], format: 'vtt'}})

		expect(plan.args).toContain('--skip-download')
		expect(adjacent(plan.args, '--sub-langs', 'en,ja')).toBe(true)
		expect(adjacent(plan.args, '--sub-format', 'vtt/best')).toBe(true)
		expect(adjacent(plan.args, '--convert-subs', 'vtt')).toBe(true)
		expect(adjacent(plan.args, '-o', '/out/%(title).200B.%(ext)s')).toBe(true)
		expect(plan.facts.effectiveSubtitleFormat).toBe('vtt')
	})

	it('coerces automatic ASS subtitles to SRT and supports subfolder output', () => {
		const plan = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out', subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'ass', writeAuto: true}})

		expect(adjacent(plan.args, '--sub-format', 'srt/best')).toBe(true)
		expect(adjacent(plan.args, '--convert-subs', 'srt')).toBe(true)
		expect(adjacent(plan.args, '-o', '/out/subtitles/%(title).200B.%(ext)s')).toBe(true)
		expect(plan.facts.effectiveSubtitleFormat).toBe('srt')
	})
})

describe('redactArgs', () => {
	it('redacts extractor secrets, proxy credentials, cookies, passwords, and signed URLs', () => {
		const args = ['--extractor-args', 'youtube:po_token=web.gvs+secret;visitor_data=visitor', '--proxy', 'http://user:pass@proxy.example:8080', '--cookies', '/tmp/cookies.txt', '--password=secret', 'https://example.com/video?X-Amz-Signature=abc&x=1']

		expect(redactArgs(args)).toEqual(['--extractor-args', 'youtube:po_token=[REDACTED];visitor_data=[REDACTED]', '--proxy', 'http://***:***@proxy.example:8080/', '--cookies', '[REDACTED]', '--password=[REDACTED]', 'https://example.com/video?X-Amz-Signature=[REDACTED]&x=1'])
		expect(args[1]).toContain('secret')
	})
})

describe('parseYtDlpOutputLine', () => {
	it('parses output lifecycle events', () => {
		expect(parseYtDlpOutputLine('[download] Destination: /tmp/video.mp4')).toEqual({kind: 'destination', path: '/tmp/video.mp4'})
		expect(parseYtDlpOutputLine('[download] /tmp/video.mp4 has already been downloaded')).toEqual({kind: 'already-downloaded', path: '/tmp/video.mp4'})
		expect(parseYtDlpOutputLine('[Merger] Merging formats into "/tmp/video.mkv"')).toEqual({kind: 'merge', path: '/tmp/video.mkv'})
		expect(parseYtDlpOutputLine('[MoveFiles] Moving file "/tmp/a.part" to "/tmp/a.mp4"')).toEqual({kind: 'move', from: '/tmp/a.part', to: '/tmp/a.mp4'})
	})

	it('parses status and progress events', () => {
		expect(parseYtDlpOutputLine('Sleeping 2.6 seconds')).toEqual({kind: 'sleep', seconds: 3})
		expect(parseYtDlpOutputLine('[SponsorBlock] Fetching SponsorBlock segments')).toEqual({kind: 'sponsorblock-fetch'})
		expect(parseYtDlpOutputLine('Unable to communicate with SponsorBlock API: down. Retrying (2/5)')).toEqual({kind: 'sponsorblock-retry', attempt: 2, total: 5})
		expect(parseYtDlpOutputLine('[ExtractAudio] Destination: /tmp/audio.mp3')).toEqual({kind: 'postprocess', phase: 'extractingAudio'})
		expect(parseYtDlpOutputLine('[download]  42.0% of 10.00MiB at 1.00MiB/s ETA 00:05')).toEqual({kind: 'progress', percent: 42, raw: '[download]  42.0% of 10.00MiB at 1.00MiB/s ETA 00:05'})
	})
})

describe('type compatibility examples', () => {
	it('accepts nested generic request shapes', () => {
		const request: WorkflowInput = {kind: 'media', url: URL, output: {directory: '/out', template: '%(title)s.%(ext)s'}, selection: {formatSelector: 'bestvideo+bestaudio/best'}, sponsorBlock: {mode: 'mark', categories: ['sponsor']}}

		expect(planWorkflow(request).args).toContain('--sponsorblock-mark')
	})
})
