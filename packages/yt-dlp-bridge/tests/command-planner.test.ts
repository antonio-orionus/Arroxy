import {describe, expect, it} from 'vite-plus/test'
import {DEFAULT_DOWNLOAD_RETRY_POLICY, DEFAULT_SOCKET_TIMEOUT_SECONDS, EMBED_SUBTITLE_CONTAINER_EXT, INFO_JSON_DOWNLOAD_RETRY_POLICY, planWorkflow, type WorkflowInput} from '../src/index.js'
import {parseYtDlpOutputLine} from '../src/parsers.js'
import {redactArgs} from '../src/redaction.js'
import {audioConversionSourceSelector as bridgeConversionSelector} from '../src/audio-conversion.js'
import {audioConversionSourceSelector} from '../../../tests/shared/nativeAudioSelectors.js'

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

	// A --load-info-json attempt replays format URLs minted at probe time. When
	// those URLs are dead, every retry hits the same dead host, so the retry
	// budget buys nothing — the caller's re-extraction fallback is the only real
	// recovery. Fail fast into it instead of burning ~7 minutes first.
	it('plans a fast-fail retry budget for the load-info-json attempt', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.tmp/job'}, selection: {formatId: 'hls-3217'}, resume: {loadInfoJsonPath: '/out/.tmp/job/_arroxy.info.json'}})

		expect(adjacent(plan.args, '--retries', String(INFO_JSON_DOWNLOAD_RETRY_POLICY.retries))).toBe(true)
		expect(adjacent(plan.args, '--socket-timeout', String(INFO_JSON_DOWNLOAD_RETRY_POLICY.socketTimeout))).toBe(true)
	})

	// Only the connect-level levers are cut. The caller gates its re-extraction
	// fallback on the transfer not having started, so a run that is already
	// moving bytes has nothing to fail fast into and keeps the full fragment
	// budget it had before.
	it('keeps the default fragment budget on the load-info-json attempt', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.tmp/job'}, selection: {formatId: 'hls-3217'}, resume: {loadInfoJsonPath: '/out/.tmp/job/_arroxy.info.json'}})

		expect(adjacent(plan.args, '--fragment-retries', String(DEFAULT_DOWNLOAD_RETRY_POLICY.fragmentRetries))).toBe(true)
		expect(adjacent(plan.args, '--retry-sleep', DEFAULT_DOWNLOAD_RETRY_POLICY.retrySleep)).toBe(true)
	})

	// `socketTimeout` is optional on the published interface, so a policy that
	// predates it must still plan a concrete flag rather than 'undefined'.
	it('falls back to the default socket timeout when a caller policy omits it', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatId: 'hls-3217'}}, {downloadRetryPolicy: {retries: 2, fragmentRetries: 2, retrySleep: 'fragment:0'}})

		expect(adjacent(plan.args, '--socket-timeout', String(DEFAULT_SOCKET_TIMEOUT_SECONDS))).toBe(true)
	})

	it('plans the full retry budget when no info-json is replayed', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out', tempDirectory: '/out/.tmp/job'}, selection: {formatId: 'hls-3217'}})

		expect(adjacent(plan.args, '--retries', String(DEFAULT_DOWNLOAD_RETRY_POLICY.retries))).toBe(true)
		expect(adjacent(plan.args, '--socket-timeout', String(DEFAULT_DOWNLOAD_RETRY_POLICY.socketTimeout))).toBe(true)
	})

	it('plans format selector, sort, and merge output', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestvideo+bestaudio/best', formatSort: 'res:1080,fps', mergeOutputFormat: 'mp4'}})

		expect(adjacent(plan.args, '-f', 'bestvideo+bestaudio/best')).toBe(true)
		expect(adjacent(plan.args, '-S', 'res:1080,fps')).toBe(true)
		expect(adjacent(plan.args, '--merge-output-format', 'mp4')).toBe(true)
	})

	it('plans audio conversion and default music embed policy', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, audio: {convert: {target: 'mp3', lossy: true, bitrateKbps: 192}}})

		expect(adjacent(plan.args, '-f', audioConversionSourceSelector('mp3'))).toBe(true)
		expect(plan.args).toContain('-x')
		expect(adjacent(plan.args, '--audio-format', 'mp3')).toBe(true)
		expect(adjacent(plan.args, '--audio-quality', '192K')).toBe(true)
		expect(plan.args).toContain('--add-metadata')
		expect(plan.args).toContain('--embed-thumbnail')
	})

	describe('audio conversion source', () => {
		const NON_DRC = "[format_id!~=?'(?i)(?:^|[-_\\s])drc(?:$|[-_\\s])'][format_note!~=?'(?i)\\bdrc\\b']"
		const NON_DOLBY = "[acodec!~=?'^(?:e-?ac-?3|ec-3|ac-?3)$']"
		const COPY_FLOOR = '[abr>=?96]'
		const AAC = `[acodec~='(?i)^(?:aac|mp4a(?:\\.40\\.(?:[1-6]|23|29|39|42))?)$']${COPY_FLOOR}`
		const DEFAULT_TRACK = '[language_preference>0]'
		const ORIGINAL_TRACK = "[format_note~='(?i)\\boriginal\\b']"

		function conversionSelector(target: string, formatId?: string): string {
			const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, ...(formatId ? {selection: {formatId}} : {}), audio: {convert: {target, lossy: target !== 'wav', bitrateKbps: 192}}})
			return plan.args[plan.args.indexOf('-f') + 1] ?? ''
		}

		// yt-dlp copies a source already in the target codec (aac into m4a, opus
		// into opus) and re-encodes anything else: a second lossy pass. So the
		// source track's stream in the target codec goes first, then any other
		// stream of that track, before another track's.
		it('looks for a stream in the target codec first, in the source track, then anywhere', () => {
			expect(conversionSelector('m4a').split('/')).toEqual([
				...[DEFAULT_TRACK, ORIGINAL_TRACK].flatMap(track => [`${AAC}${NON_DRC}`, `${NON_DOLBY}${NON_DRC}`, AAC, NON_DOLBY, NON_DRC, ''].map(filters => `bestaudio${track}${filters}`)),
				...[`${AAC}${NON_DRC}`, `${NON_DOLBY}${NON_DRC}`, AAC, NON_DOLBY, NON_DRC, ''].map(filters => `bestaudio${filters}`),
				'best'
			])
		})

		it.each([
			['aac', AAC],
			['m4a', AAC],
			['opus', `[acodec~='(?i)^opus$']${COPY_FLOOR}`],
			['mp3', `[acodec~='(?i)^(?:mp3|mp4a\\.40\\.34)$']${COPY_FLOOR}`],
			['vorbis', `[acodec~='(?i)^vorbis$']${COPY_FLOOR}`],
			['flac', `[acodec~='(?i)^flac$']${COPY_FLOOR}`],
			['alac', `[acodec~='(?i)^alac$']${COPY_FLOOR}`]
		])('%s copies a source already in its codec: %s first', (target, codecFilter) => {
			expect(conversionSelector(target).split('/')[0]).toBe(`bestaudio${DEFAULT_TRACK}${codecFilter}${NON_DRC}`)
		})

		// WAV decodes every source alike, and an unknown or mapped target
		// ("aac>m4a/mp3") has no one codec to look for.
		it.each(['wav', 'aac>m4a/mp3'])('%s has no codec to look for', target => {
			expect(conversionSelector(target).split('/')).toEqual([...[DEFAULT_TRACK, ORIGINAL_TRACK].flatMap(track => [`${NON_DOLBY}${NON_DRC}`, NON_DOLBY, NON_DRC, ''].map(filters => `bestaudio${track}${filters}`)), ...[`${NON_DOLBY}${NON_DRC}`, NON_DOLBY, NON_DRC, ''].map(filters => `bestaudio${filters}`), 'best'])
		})

		// `~=?` also passes a stream with no note at all, so every stream of a
		// site that writes none would count as the original track.
		it('takes only a stream whose note says original as the original track', () => {
			for (const target of ['m4a', 'opus', 'mp3', 'wav']) expect(conversionSelector(target)).not.toContain('format_note~=?')
		})

		// The caller's own selector (its native-audio preference) wins: the
		// conversion only changes what happens to the stream it picks.
		it("uses the caller's format selector as is", () => {
			const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestaudio[acodec^=ec-3]/bestaudio/best'}, audio: {convert: {target: 'best', lossy: true}}})
			expect(adjacent(plan.args, '-f', 'bestaudio[acodec^=ec-3]/bestaudio/best')).toBe(true)
			expect(plan.args.filter(arg => arg === '-f')).toHaveLength(1)
			expect(adjacent(plan.args, '--audio-format', 'best')).toBe(true)
			expect(plan.args).not.toContain('--audio-quality')
			const sorted = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestaudio/best', formatSort: 'acodec:opus'}, audio: {convert: {target: 'best', lossy: true}}})
			expect(adjacent(sorted.args, '-S', 'acodec:opus')).toBe(true)
		})

		it('is the exported audioConversionSourceSelector, so a caller can run the same selection', () => {
			for (const target of ['m4a', 'opus', 'mp3', 'wav']) expect(conversionSelector(target)).toBe(bridgeConversionSelector(target))
		})

		it("puts the caller's stream ahead of the chain", () => {
			expect(conversionSelector('opus', '251-es')).toBe(`251-es/${conversionSelector('opus')}`)
		})
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

	it('plans a lossless container change for an exact format id', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatId: '399+251', mergeOutputFormat: 'webm/mkv', remuxVideo: 'webm>webm/mkv'}})

		expect(adjacent(plan.args, '-f', '399+251')).toBe(true)
		expect(adjacent(plan.args, '--merge-output-format', 'webm/mkv')).toBe(true)
		expect(adjacent(plan.args, '--remux-video', 'webm>webm/mkv')).toBe(true)
		expect(plan.args).not.toContain('--recode-video')
	})

	it('plans remux after a format selector', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestvideo*+bestaudio/best', mergeOutputFormat: 'mp4', remuxVideo: 'mp4'}})

		expect(adjacent(plan.args, '--merge-output-format', 'mp4')).toBe(true)
		expect(adjacent(plan.args, '--remux-video', 'mp4')).toBe(true)
	})

	it('lets embedded subtitles override a requested remux', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatId: '399+251', mergeOutputFormat: 'mp4', remuxVideo: 'mp4'}, subtitles: {embed: true, languages: ['en']}})

		expect(adjacent(plan.args, '--merge-output-format', EMBED_SUBTITLE_CONTAINER_EXT)).toBe(true)
		expect(plan.args).not.toContain('--remux-video')
		expect(plan.args.join(' ')).not.toMatch(/--merge-output-format mp4/)
	})

	it('plans a time-range section download through ffmpeg', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatId: '137+140'}, downloadSections: ['*220-435']})

		expect(adjacent(plan.args, '--download-sections', '*220-435')).toBe(true)
		expect(plan.args).not.toContain('--force-keyframes-at-cuts')
		expect(plan.facts.dependencies.required.map(dependency => dependency.name)).toContain('ffmpeg')
		expect(plan.facts.sideEffects).toContain('cut media to the requested sections')
	})

	it('repeats --download-sections per range and forces keyframes for an exact cut', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, downloadSections: ['*0-10', '*20-inf'], forceKeyframesAtCuts: true})

		expect(adjacent(plan.args, '--download-sections', '*0-10')).toBe(true)
		expect(adjacent(plan.args, '--download-sections', '*20-inf')).toBe(true)
		expect(plan.args).toContain('--force-keyframes-at-cuts')
		expect(plan.facts.risks.join(' ')).toMatch(/re-encod/i)
	})

	it('turns chapters off explicitly, since yt-dlp embeds them with metadata otherwise', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, embed: {chapters: false, metadata: true}})
		expect(plan.args).toContain('--no-embed-chapters')
		expect(plan.args).not.toContain('--embed-chapters')
	})

	it('leaves chapters to yt-dlp when SponsorBlock marks segments as chapters, or when unspecified', () => {
		const marked = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, embed: {chapters: false}, sponsorBlock: {mode: 'mark', categories: ['sponsor']}})
		expect(marked.args).not.toContain('--no-embed-chapters')
		expect(planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}}).args).not.toContain('--no-embed-chapters')
	})

	it('ignores forceKeyframesAtCuts without sections', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, downloadSections: [], forceKeyframesAtCuts: true})

		expect(plan.args).not.toContain('--download-sections')
		expect(plan.args).not.toContain('--force-keyframes-at-cuts')
	})
})

describe('planWorkflow — output directories in -o', () => {
	// yt-dlp reads -o as a template: an unescaped `%%` collapses and `%(e)s`
	// becomes a field. The directory is literal; only the template is not.
	const DIR = '/out/100%% b%(e)s'
	const ESCAPED = '/out/100%%%% b%%(e)s'

	it('escapes % in the subtitle directory', () => {
		const sidecar = planWorkflow({kind: 'subtitles', url: URL, output: {directory: DIR}, subtitles: {languages: ['en'], format: 'srt'}})
		const subfolder = planWorkflow({kind: 'subtitles', url: URL, output: {directory: DIR, subtitleMode: 'subfolder'}, subtitles: {languages: ['en'], format: 'srt'}})

		expect(adjacent(sidecar.args, '-o', `${ESCAPED}/%(title).200B.%(ext)s`)).toBe(true)
		expect(adjacent(subfolder.args, '-o', `${ESCAPED}/subtitles/%(title).200B.%(ext)s`)).toBe(true)
		expect(sidecar.facts.output?.directory).toBe(DIR)
	})

	it('escapes % in a media directory without a temp folder', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: DIR, template: '%(id)s.%(ext)s'}, selection: {formatId: '18'}})

		expect(adjacent(plan.args, '-o', `${ESCAPED}/%(id)s.%(ext)s`)).toBe(true)
	})

	it('escapes % in the info-json path but leaves --paths literal', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: DIR, tempDirectory: `${DIR}/.tmp`}, selection: {formatId: '18'}, resume: {infoJsonBaseName: '50% done'}})

		expect(adjacent(plan.args, '--paths', `home:${DIR}`)).toBe(true)
		expect(adjacent(plan.args, '--paths', `temp:${DIR}/.tmp`)).toBe(true)
		expect(adjacent(plan.args, '-o', `infojson:${ESCAPED}/.tmp/50%% done`)).toBe(true)
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

	it('requests manual subtitles unless auto-only is asked for', () => {
		const manualFirst = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en'], format: 'srt', writeAuto: true}})
		const manualOnly = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en'], format: 'srt', writeAuto: false}})

		expect(manualFirst.args).toContain('--write-subs')
		expect(manualFirst.args).toContain('--write-auto-subs')
		expect(manualOnly.args).toContain('--write-subs')
		expect(manualOnly.args).not.toContain('--write-auto-subs')
	})

	it('asks yt-dlp for automatic captions only when autoOnly is set', () => {
		const plan = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en'], format: 'srt', autoOnly: true}})

		expect(plan.args).toContain('--write-auto-subs')
		expect(plan.args).not.toContain('--write-subs')
		expect(adjacent(plan.args, '--sub-langs', 'en')).toBe(true)
	})

	it('treats autoOnly as automatic captions for the ASS to SRT coercion', () => {
		const plan = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en'], format: 'ass', autoOnly: true}})

		expect(adjacent(plan.args, '--sub-format', 'srt/best')).toBe(true)
		expect(plan.facts.effectiveSubtitleFormat).toBe('srt')
	})

	it('drops manual subtitles from an embedded-subtitles media download when autoOnly is set', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatSelector: 'bestvideo+bestaudio/best'}, subtitles: {embed: true, languages: ['en'], autoOnly: true}})

		expect(plan.args).toContain('--embed-subs')
		expect(plan.args).toContain('--write-auto-subs')
		expect(plan.args).not.toContain('--write-subs')
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
		expect(parseYtDlpOutputLine('[ExtractAudio] Destination: /tmp/audio.mp3')).toEqual({kind: 'postprocess', phase: 'extractingAudio', path: '/tmp/audio.mp3'})
		expect(parseYtDlpOutputLine("[download] Got error: (<HTTPSConnection(host='rr3---sn-txhxooxu-n5il.googlevideo.com', port=443) at 0x2b188eaab90>, 'Connection to rr3---sn-txhxooxu-n5il.googlevideo.com timed out. (connect timeout=20.0)'). Retrying (1/20)...")).toEqual({kind: 'transfer-retry', attempt: 1, total: 20})
		expect(parseYtDlpOutputLine('[download] Got error: read timed out. Retrying (3/20)...')).toEqual({kind: 'transfer-retry', attempt: 3, total: 20})
		expect(parseYtDlpOutputLine('[youtube] abc: Downloading webpage')).toEqual({kind: 'progress', raw: '[youtube] abc: Downloading webpage'})
	})

	// FFmpegVideoConvertorPP announces its output mid-sentence, unlike
	// ExtractAudio's bare `Destination:` line.
	it('takes the destination from a remux or convert line', () => {
		const path = '/tmp/My Vidéo — 東京 😂.mkv'
		expect(parseYtDlpOutputLine(`[VideoRemuxer] Remuxing video from mp4 to mkv; Destination: ${path}`)).toEqual({kind: 'postprocess', phase: 'convertingVideo', path})
		expect(parseYtDlpOutputLine(`[VideoConvertor] Converting video from mp4 to mkv; Destination: ${path}`)).toEqual({kind: 'postprocess', phase: 'convertingVideo', path})
		expect(parseYtDlpOutputLine('[VideoRemuxer] Not remuxing media file "/tmp/a.mkv"; already is in target format mkv')).toEqual({kind: 'postprocess', phase: 'convertingVideo'})
	})

	// A `--download-sections` job hands the transfer to ffmpeg, whose banner
	// prints the googlevideo URL. Its URL-encoded commas (`met=1792423725%2C`)
	// once read as a percent, which pinned the row at 100% from the first second.
	it('leaves ffmpeg output lines as plain output', () => {
		const ffmpegInput =
			"Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'https://rr4---sn-ixh7yn7e.googlevideo.com/videoplayback?expire=1792445325&ei=LTfWar_aMbuK0u8Pvv6BmQo&ip=203.0.113.7&id=o-REDACTED&itag=401&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=810&met=1792423725%2C&mh=3w&mm=18%2C29&mn=sn-ixh7yn7e%2Csn-aj5go5-53&ms=aub%2Crdu&mv=m&mvi=4&pl=24&rms=aub%2Caub&gcr=dk&initcwndbps=4261500&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=252854527&dur=233.900&lmt=1782655386027359&mt=1792423316&fvip=5&keepalive=yes&fexp=51565115%2C52184236&c=VISIONOS&txp=5532534&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=REDACTED%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=REDACTED%3D':"
		expect(parseYtDlpOutputLine(ffmpegInput)).toEqual({kind: 'progress', raw: ffmpegInput})
		const ffmpegSummary = '[out#0/mp4 @ 0x600003b452c0] video:120257KiB audio:1797KiB subtitle:0KiB other streams:0KiB global headers:0KiB muxing overhead: 0.050264%'
		expect(parseYtDlpOutputLine(ffmpegSummary)).toEqual({kind: 'progress', raw: ffmpegSummary})
	})
})

describe('type compatibility examples', () => {
	it('accepts nested generic request shapes', () => {
		const request: WorkflowInput = {kind: 'media', url: URL, output: {directory: '/out', template: '%(title)s.%(ext)s'}, selection: {formatSelector: 'bestvideo+bestaudio/best'}, sponsorBlock: {mode: 'mark', categories: ['sponsor']}}

		expect(planWorkflow(request).args).toContain('--sponsorblock-mark')
	})
})
