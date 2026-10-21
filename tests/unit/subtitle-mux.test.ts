import {describe, expect, it, vi, beforeEach} from 'vite-plus/test'
import {createTranscriptProcess} from '../helpers/processTranscript.js'

vi.mock('node:fs/promises', () => ({access: vi.fn(), readFile: vi.fn(), writeFile: vi.fn().mockResolvedValue(undefined), rename: vi.fn().mockResolvedValue(undefined), unlink: vi.fn().mockResolvedValue(undefined)}))

vi.mock('@main/utils/process.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnFFmpeg: vi.fn()}
})

import {readFile, writeFile, rename, unlink} from 'node:fs/promises'
import {spawnFFmpeg} from '@main/utils/process.js'
import {postProcessSubtitleFiles, muxSubtitlesIntoVideo} from '@main/services/subtitlePostProcess.js'

const JOB_ID = 'job-1'

// Embed tracks as the subtitle phase hands them over: one language per file,
// and yt-dlp's name for the track keyed by that language.
function embed(paths: string[], languages: string[], names: ReadonlyMap<string, string> = new Map()): {path: string; lang: string; name?: string}[] {
	return paths.map((path, index) => {
		const lang = languages[index] ?? 'und'
		const name = names.get(lang)
		return {path, lang, ...(name ? {name} : {})}
	})
}

// Both English tracks of a YouTube video: the automatic caption titled apart.
function bothEnglish(names: {manual?: string; auto?: string} = {}): {path: string; lang: string; name?: string; title?: string}[] {
	return [
		{path: '/tmp/v.en.srt', lang: 'en', ...(names.manual ? {name: names.manual} : {})},
		{path: '/tmp/v.en-orig.srt', lang: 'en', ...(names.auto ? {name: names.auto} : {}), title: 'Auto-generated'}
	]
}
const YT_URL = 'https://www.youtube.com/watch?v=k1qBgIw8fAQ'

function makeFakeFFmpeg(exitCode: number) {
	return createTranscriptProcess([{close: exitCode}])
}

function makeFakeFFmpegError() {
	return createTranscriptProcess([{error: new Error('ENOENT')}])
}

beforeEach(() => {
	vi.clearAllMocks()
})

// ─── muxSubtitlesIntoVideo ───────────────────────────────────────────────────

describe('muxSubtitlesIntoVideo — ffmpeg args', () => {
	it('one sub: -y -i video -i sub -c copy -c:s srt -metadata:s:s:0 language=eng tempPath', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		expect(args[0]).toBe('-y')
		expect(args[1]).toBe('-i')
		expect(args[2]).toBe('/tmp/video.mkv')
		expect(args[3]).toBe('-i')
		expect(args[4]).toBe('/tmp/video.en.srt')
		expect(args).toContain('-c')
		expect(args).toContain('copy')
		expect(args).toContain('-c:s')
		expect(args).toContain('srt')
		expect(args).toContain('-metadata:s:s:0')
		expect(args).toContain('language=eng')
		// tempPath ends with .muxing.mkv
		expect(args[args.length - 1]).toMatch(/\.muxing\.mkv$/)
	})

	// Without explicit -map, ffmpeg's default stream selection keeps one stream
	// per type, so every subtitle track but one was dropped.
	it('two subs → maps video, audio and each sub, metadata indexed per sub', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt', '/tmp/video.ja.srt'], ['en', 'ja']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		expect(args).toEqual(['-y', '-i', '/tmp/video.mkv', '-i', '/tmp/video.en.srt', '-i', '/tmp/video.ja.srt', '-map', '0:V', '-map', '0:a?', '-map', '1', '-map', '2', '-c', 'copy', '-c:s', 'srt', '-metadata:s:s:0', 'language=eng', '-metadata:s:s:1', 'language=jpn', '/tmp/video.muxing.mkv'])
	})

	it('keepCoverArt → copies the cover out, then attaches it to the mkv and removes the copy', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(makeFakeFFmpeg(0) as never)
			.mockReturnValueOnce(makeFakeFFmpeg(0) as never)

		const result = await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mp4', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: true, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(result).toEqual({ok: true, outputPath: '/tmp/video.mkv'})
		const [[, extractArgs], [, muxArgs]] = vi.mocked(spawnFFmpeg).mock.calls
		expect(extractArgs).toEqual(['-y', '-i', '/tmp/video.mp4', '-map', '0:v', '-map', '-0:V', '-c', 'copy', '-frames:v', '1', '-f', 'image2', '-update', '1', '/tmp/video.muxing-cover.jpg'])
		expect(muxArgs).toEqual([
			'-y',
			'-i',
			'/tmp/video.mp4',
			'-i',
			'/tmp/video.en.srt',
			'-map',
			'0:V',
			'-map',
			'0:a?',
			'-map',
			'1',
			'-c',
			'copy',
			'-c:s',
			'srt',
			'-metadata:s:s:0',
			'language=eng',
			'-attach',
			'/tmp/video.muxing-cover.jpg',
			'-metadata:s:t',
			'mimetype=image/jpeg',
			'-metadata:s:t',
			'filename=cover.jpg',
			'/tmp/video.muxing.mkv'
		])
		expect(unlink).toHaveBeenCalledWith('/tmp/video.muxing-cover.jpg')
	})

	it('keepCoverArt with no cover in the video → muxes without -attach', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(makeFakeFFmpeg(234) as never)
			.mockReturnValueOnce(makeFakeFFmpeg(0) as never)

		const result = await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mp4', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: true, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(result.ok).toBe(true)
		const [, muxArgs] = vi.mocked(spawnFFmpeg).mock.calls[1]
		expect(muxArgs).not.toContain('-attach')
	})

	it('keepCoverArt and the mux spawn throws → the cover copy is still removed', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(makeFakeFFmpeg(0) as never)
			.mockImplementationOnce(() => {
				throw new Error('spawn EACCES')
			})

		await expect(muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mp4', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: true, onSpawn: vi.fn(), jobId: JOB_ID})).rejects.toThrow('spawn EACCES')
		expect(unlink).toHaveBeenCalledWith('/tmp/video.muxing-cover.jpg')
	})

	it('keepCoverArt=false → a single ffmpeg run, no cover step', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mp4', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(spawnFFmpeg).toHaveBeenCalledOnce()
		expect(vi.mocked(spawnFFmpeg).mock.calls[0][1]).not.toContain('-attach')
	})

	it('ISO 639-1 → 639-2/B: ja→jpn, zh→chi, ko→kor, ru→rus', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/v.mkv', tracks: embed(['/tmp/v.ja.srt', '/tmp/v.zh.srt', '/tmp/v.ko.srt'], ['ja', 'zh', 'ko']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		expect(args).toContain('language=jpn')
		expect(args).toContain('language=chi')
		expect(args).toContain('language=kor')
	})

	it('maps every ISO 639-1 language, not just the common ones, and 639-2/T onto /B', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)
		const langs = ['ta', 'sk', 'ms', 'is', 'cy', 'deu', 'fil', 'pt-BR']

		await muxSubtitlesIntoVideo({
			ffmpegPath: '/fake/ffmpeg',
			videoPath: '/tmp/v.mkv',
			tracks: embed(
				langs.map(lang => `/tmp/v.${lang}.srt`),
				langs
			),
			keepCoverArt: false,
			onSpawn: vi.fn(),
			jobId: JOB_ID
		})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		const tags = args.filter(arg => arg.startsWith('language='))
		// Regional and script variants keep their full tag: collapsing pt-BR or
		// zh-Hant onto one code would merge tracks the user picked apart.
		expect(tags).toEqual(['language=tam', 'language=slo', 'language=may', 'language=ice', 'language=wel', 'language=ger', 'language=fil', 'language=pt-BR'])
	})

	// The automatic caption beside a manual track of its language carries the
	// title that tells the two apart.
	it('a title set apart → it wins over the name as the title', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/v.mkv', tracks: bothEnglish(), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		const metadata = args.flatMap((arg, i) => (arg.startsWith('-metadata:s:s:') ? [`${arg} ${args[i + 1]}`] : []))
		expect(metadata).toEqual(['-metadata:s:s:0 language=eng', '-metadata:s:s:1 language=eng', '-metadata:s:s:1 title=Auto-generated'])
	})

	// yt-dlp's EmbedSubtitle writes each track's name as its title and handler
	// name, so players show "English (United Kingdom)" rather than a bare code.
	it('a named track → its name as title and handler_name, as yt-dlp embeds it', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/v.mkv', tracks: embed(['/tmp/v.en-GB.srt', '/tmp/v.ja.srt'], ['en-GB', 'ja'], new Map([['en-GB', 'English (United Kingdom)']])), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		const metadata = args.flatMap((arg, i) => (arg.startsWith('-metadata:s:s:') ? [`${arg} ${args[i + 1]}`] : []))
		expect(metadata).toEqual(['-metadata:s:s:0 language=en-GB', '-metadata:s:s:0 handler_name=English (United Kingdom)', '-metadata:s:s:0 title=English (United Kingdom)', '-metadata:s:s:1 language=jpn'])
	})

	// The automatic caption beside a manual track keeps the title that tells the
	// two apart; its name ("English (Original)") still goes in the handler name.
	it('a titled track with a name → the title as title, the name as handler_name', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/v.mkv', tracks: bothEnglish({manual: 'English', auto: 'English (Original)'}), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		const metadata = args.flatMap((arg, i) => (arg.startsWith('-metadata:s:s:') ? [`${arg} ${args[i + 1]}`] : []))
		expect(metadata).toEqual(['-metadata:s:s:0 language=eng', '-metadata:s:s:0 handler_name=English', '-metadata:s:s:0 title=English', '-metadata:s:s:1 language=eng', '-metadata:s:s:1 handler_name=English (Original)', '-metadata:s:s:1 title=Auto-generated'])
	})

	it('unknown / 3-letter lang passes through unchanged', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/v.mkv', tracks: embed(['/tmp/v.und.srt'], ['und']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		const [, args] = vi.mocked(spawnFFmpeg).mock.calls[0]
		expect(args).toContain('language=und')
	})
})

describe('muxSubtitlesIntoVideo — outcomes', () => {
	it('ffmpeg exit 0 → { ok: true, outputPath }', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		const result = await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(result.ok).toBe(true)
		expect(result.outputPath).toMatch(/\.mkv$/)
	})

	it('ffmpeg non-zero exit → { ok: false }, originals preserved', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(1) as never)

		const result = await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(result.ok).toBe(false)
		expect(rename).not.toHaveBeenCalled()
		// unlink is called for tempPath cleanup only
		expect(unlink).toHaveBeenCalledWith(expect.stringContaining('.muxing.mkv'))
	})

	it('ffmpeg spawn error → { ok: false }', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpegError() as never)

		const result = await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(result.ok).toBe(false)
	})

	it('no tracks → { ok: false } without spawning ffmpeg', async () => {
		const result = await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: [], keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(result.ok).toBe(false)
		expect(spawnFFmpeg).not.toHaveBeenCalled()
	})

	it('onSpawn invoked with the ffmpeg proc', async () => {
		const fakeProc = makeFakeFFmpeg(0)
		vi.mocked(spawnFFmpeg).mockReturnValue(fakeProc as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		const onSpawn = vi.fn()
		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn, jobId: JOB_ID})

		expect(onSpawn).toHaveBeenCalledWith(fakeProc)
	})

	it('success renames tempPath to outputPath and deletes sub files', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValue(makeFakeFFmpeg(0) as never)
		vi.mocked(rename).mockResolvedValue(undefined)
		vi.mocked(unlink).mockResolvedValue(undefined)

		await muxSubtitlesIntoVideo({ffmpegPath: '/fake/ffmpeg', videoPath: '/tmp/video.mkv', tracks: embed(['/tmp/video.en.srt'], ['en']), keepCoverArt: false, onSpawn: vi.fn(), jobId: JOB_ID})

		expect(rename).toHaveBeenCalledWith(expect.stringContaining('.muxing.mkv'), '/tmp/video.mkv')
		expect(unlink).toHaveBeenCalledWith('/tmp/video.en.srt')
	})
})

// ─── postProcessSubtitleFiles ────────────────────────────────────────────────

describe('postProcessSubtitleFiles', () => {
	it('.srt: reads, dedupes, writes back if content changed', async () => {
		const original = '1\n00:00:00,000 --> 00:00:01,000\nhello\n\n2\n00:00:00,500 --> 00:00:01,500\nhello\nworld\n'
		const parsed = '1\n00:00:00,000 --> 00:00:01,500\nhello\nworld'
		vi.mocked(readFile).mockResolvedValue(original)

		await postProcessSubtitleFiles(['/tmp/video.en.srt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})

		expect(readFile).toHaveBeenCalledWith('/tmp/video.en.srt', 'utf8')
		// dedupeSrt will produce different content → writeFile should be called
		expect(writeFile).toHaveBeenCalledWith('/tmp/video.en.srt', expect.any(String), 'utf8')
		void parsed
	})

	it('.vtt: reads, dedupes, writes back if content changed', async () => {
		const original = 'WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nhello\n\n00:00:00.500 --> 00:00:01.500\nhello world\n'
		vi.mocked(readFile).mockResolvedValue(original)

		await postProcessSubtitleFiles(['/tmp/video.en.vtt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})

		expect(readFile).toHaveBeenCalledWith('/tmp/video.en.vtt', 'utf8')
		expect(writeFile).toHaveBeenCalled()
	})

	it('unknown extension → skipped silently, no read/write', async () => {
		await postProcessSubtitleFiles(['/tmp/video.en.ass'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})

		expect(readFile).not.toHaveBeenCalled()
		expect(writeFile).not.toHaveBeenCalled()
	})

	it('content unchanged → writeFile not called', async () => {
		// A single non-duplicate SRT cue — dedupe output equals input
		const content = '1\n00:00:00,000 --> 00:00:01,000\nhello'
		vi.mocked(readFile).mockResolvedValue(content)

		await postProcessSubtitleFiles(['/tmp/video.en.srt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})

		expect(writeFile).not.toHaveBeenCalled()
	})

	it('read error → logged and swallowed, never throws', async () => {
		vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'))

		await expect(postProcessSubtitleFiles(['/tmp/missing.srt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})).resolves.toBeUndefined()
	})

	it('shouldAbort() true before file → that file is skipped', async () => {
		vi.mocked(readFile).mockResolvedValue('content')

		await postProcessSubtitleFiles(['/tmp/video.en.srt', '/tmp/video.ja.srt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => true})

		expect(readFile).not.toHaveBeenCalled()
	})

	// Rolling-cue dedupe is YouTube-only (it rewrites text and would corrupt
	// legitimate phrase repeats elsewhere), but the timing-only overlap pass is
	// safe everywhere and must still run.
	it('non-YouTube source → no rolling dedupe, overlaps still clamped', async () => {
		const overlapping = '1\n00:00:00,000 --> 00:00:03,000\nalpha\n\n2\n00:00:01,000 --> 00:00:04,000\nbeta\n'
		vi.mocked(readFile).mockResolvedValue(overlapping)

		await postProcessSubtitleFiles(['/tmp/video.en.srt'], {extractor: 'vimeo', url: 'https://vimeo.com/12345', jobId: JOB_ID, shouldAbort: () => false})

		const [, written] = vi.mocked(writeFile).mock.calls[0]
		// Both cues survive with their text intact — only the first end moved.
		expect(written).toContain('alpha')
		expect(written).toContain('beta')
		expect(written).toContain('00:00:00,000 --> 00:00:01,000')
	})

	// A job does not always carry a usable extractor (a mixed bulk batch
	// resolves to an empty one), so the URL is the fallback fingerprint.
	it('empty extractor + YouTube URL → still treated as YouTube', async () => {
		const rolling = '1\n00:00:00,000 --> 00:00:01,000\nhello\n\n2\n00:00:00,500 --> 00:00:01,500\nhello world\n'
		vi.mocked(readFile).mockResolvedValue(rolling)
		await postProcessSubtitleFiles(['/tmp/video.en.srt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})
		const [, viaExtractor] = vi.mocked(writeFile).mock.calls[0]

		vi.clearAllMocks()
		vi.mocked(readFile).mockResolvedValue(rolling)
		await postProcessSubtitleFiles(['/tmp/video.en.srt'], {extractor: '', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})
		const [, viaUrl] = vi.mocked(writeFile).mock.calls[0]

		expect(viaUrl).toBe(viaExtractor)
	})

	it('processes multiple files', async () => {
		vi.mocked(readFile).mockResolvedValue('1\n00:00:00,000 --> 00:00:01,000\nhello')

		await postProcessSubtitleFiles(['/tmp/video.en.srt', '/tmp/video.ja.srt'], {extractor: 'youtube', url: YT_URL, jobId: JOB_ID, shouldAbort: () => false})

		expect(readFile).toHaveBeenCalledTimes(2)
	})
})

// ─── resolveConvertedSubtitlePaths ───────────────────────────────────────────
