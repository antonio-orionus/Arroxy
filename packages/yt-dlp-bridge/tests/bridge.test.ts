import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import type {z} from 'zod'
import {planWorkflow} from '../src/index.js'
import {loadConfig} from '../src/config.js'
import {toStructuredError} from '../src/errors.js'
import {isPathInsideWith, resolveOutputPolicy} from '../src/filesystem.js'
import {listLongFlags, UPSTREAM_OPTION_CATALOG} from '../src/option-catalog.js'
import {parseFinalPaths, parseFormats, parseJsonLines, parseProgress, parseSubtitles, parseThumbnails} from '../src/parsers.js'
import {redactArgs, redactText} from '../src/redaction.js'
import {CommandExecutionError, runCommand} from '../src/runner.js'
import {WorkflowDownloadInputSchema} from '../src/schemas.js'

type PlanInput = z.input<typeof WorkflowDownloadInputSchema>

function makePlanInput(overrides: Partial<PlanInput> = {}): PlanInput {
	const base: PlanInput = {
		url: 'https://example.com/video',
		kind: 'media',
		format: {formatSort: []},
		output: {allowOverwrite: false},
		network: {},
		selection: {matchFilters: [], breakMatchFilters: []},
		download: {retrySleep: [], downloadSections: [], downloader: [], downloaderArgs: []},
		subtitles: {},
		thumbnails: {},
		auth: {},
		postprocess: {postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []},
		sponsorblock: {},
		extractor: {extractorArgs: []}
	}

	return {
		...base,
		...overrides,
		format: {...base.format, ...overrides.format},
		output: {...base.output, ...overrides.output},
		network: {...base.network, ...overrides.network},
		selection: {...base.selection, ...overrides.selection},
		download: {...base.download, ...overrides.download},
		subtitles: {...base.subtitles, ...overrides.subtitles},
		thumbnails: {...base.thumbnails, ...overrides.thumbnails},
		auth: {...base.auth, ...overrides.auth},
		postprocess: {...base.postprocess, ...overrides.postprocess},
		sponsorblock: {...base.sponsorblock, ...overrides.sponsorblock},
		extractor: {...base.extractor, ...overrides.extractor}
	}
}

describe('source-derived option catalog', () => {
	it('contains the upstream parser-derived yt-dlp option surface', () => {
		expect(UPSTREAM_OPTION_CATALOG.source).toBe('yt_dlp.options.create_parser')
		expect(UPSTREAM_OPTION_CATALOG.optionCount).toBeGreaterThan(300)
		expect(listLongFlags()).toContain('--dump-json')
		expect(listLongFlags()).toContain('--merge-output-format')
		expect(listLongFlags()).toContain('--extractor-args')
	})
})

describe('argv generation', () => {
	it('builds metadata args without shell interpolation', () => {
		const args = planWorkflow({kind: 'inspect', inspect: 'metadata', url: 'https://example.com/watch?v=abc'}, {configFiles: {mode: 'disabled'}}).args

		expect(args).toEqual(['--ignore-config', '--no-warnings', '--dump-json', 'https://example.com/watch?v=abc'])
	})

	it('builds default probe args without extractor overrides', () => {
		const args = planWorkflow({kind: 'probe', url: 'https://youtu.be/abc'}, {configFiles: {mode: 'disabled'}}).args

		expect(args).toEqual(['--ignore-config', '--dump-single-json', '--no-quiet', '--flat-playlist', '--playlist-end', '101', 'https://youtu.be/abc'])
	})

	it('emits requested YouTube player client args for probe enrichment', () => {
		const args = planWorkflow({kind: 'probe', url: 'https://youtu.be/abc', selection: {playlistMode: 'video'}, extractor: {youtube: {playerClient: ['web_embedded']}}}, {configFiles: {mode: 'disabled'}}).args

		expect(args).toEqual(['--ignore-config', '--dump-single-json', '--no-quiet', '--flat-playlist', '--no-playlist', '--extractor-args', 'youtube:player_client=web_embedded', 'https://youtu.be/abc'])
	})

	it('emits requested YouTube player client args for media downloads', () => {
		const args = planWorkflow({kind: 'media', url: 'https://youtu.be/abc', output: {directory: '/tmp/out'}, selection: {formatId: '337+380'}, extractor: {youtube: {playerClient: ['default', 'web_embedded']}}}, {configFiles: {mode: 'disabled'}}).args

		expect(args).toContain('--extractor-args')
		expect(args[args.indexOf('--extractor-args') + 1]).toBe('youtube:player_client=default,web_embedded')
		expect(args.at(-1)).toBe('https://youtu.be/abc')
	})

	it('builds audio download args with extraction and safe output policy', () => {
		const config = loadConfig({YTDLP_MCP_OUTPUT_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test')})
		const args = planWorkflow(makePlanInput({kind: 'audio'}), {config, configFiles: {mode: 'disabled'}}).args

		expect(args).toContain('--extract-audio')
		expect(args).toContain('--no-overwrites')
		expect(args).toContain('--paths')
		expect(args.at(-1)).toBe('https://example.com/video')
	})

	it('rejects input-provided auth file sources unless server policy allows them', () => {
		const input = {kind: 'inspect' as const, inspect: 'metadata' as const, url: 'https://example.com/watch?v=abc', responseFormat: 'json' as const, flatPlaylist: false, limit: 50, offset: 0, auth: {cookiesFile: path.join(os.tmpdir(), 'cookies.txt')}, network: {}}

		expect(() => planWorkflow(input, {configFiles: {mode: 'disabled'}})).toThrow(/auth\.cookiesFile/)
		expect(planWorkflow(input, {config: loadConfig({YTDLP_MCP_COOKIES_FILE: input.auth.cookiesFile}), configFiles: {mode: 'disabled'}}).args).toContain(input.auth.cookiesFile)
	})
})

describe('filesystem policy', () => {
	it('rejects parent-directory traversal in relative output templates', () => {
		const config = loadConfig({YTDLP_MCP_OUTPUT_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test')})
		expect(() => resolveOutputPolicy(config, {outputTemplate: '../outside.%(ext)s'})).toThrow(/parent-directory traversal/)
		expect(() => resolveOutputPolicy(config, {outputTemplate: '..\\outside.%(ext)s'})).toThrow(/parent-directory traversal/)
	})

	it('checks path containment with Windows path semantics', () => {
		expect(isPathInsideWith(path.win32, 'C:\\downloads', 'C:\\downloads\\video.mp4')).toBe(true)
		expect(isPathInsideWith(path.win32, 'C:\\downloads', 'C:\\other\\video.mp4')).toBe(false)
	})

	it('resolves managed roots and archive files under configured roots', () => {
		const config = loadConfig({YTDLP_MCP_OUTPUT_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test', 'downloads'), YTDLP_MCP_TEMP_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test', 'temp')})
		const policy = resolveOutputPolicy(config, {outputRoot: 'playlist', tempRoot: 'job-1'})
		const args = planWorkflow(makePlanInput({output: {outputRoot: 'playlist', tempRoot: 'job-1'}, selection: {matchFilters: [], breakMatchFilters: [], downloadArchive: 'archive.txt'}}), {config, configFiles: {mode: 'disabled'}}).args
		const archiveIndex = args.indexOf('--download-archive')
		expect(archiveIndex).toBeGreaterThan(-1)

		expect(policy.outputRoot).toBe(path.join(config.outputRoot, 'playlist'))
		expect(policy.tempRoot).toBe(path.join(config.tempRoot, 'job-1'))
		expect(args[archiveIndex + 1]).toBe(path.join(policy.outputRoot, 'archive.txt'))
	})

	it('treats blank env vars as unset', () => {
		const config = loadConfig({
			YTDLP_MCP_YTDLP_PATH: '',
			YTDLP_PATH: 'yt-dlp-custom',
			YTDLP_MCP_OUTPUT_ROOT: '',
			YTDLP_MCP_TEMP_ROOT: '',
			YTDLP_MCP_TIMEOUT_MS: '',
			YTDLP_MCP_MAX_OUTPUT_BYTES: '',
			YTDLP_MCP_COOKIES_FILE: '',
			YTDLP_MCP_COOKIES_FROM_BROWSER: '',
			YTDLP_MCP_JS_RUNTIMES: '',
			YTDLP_MCP_ALLOW_CONFIG_FILES: ' true ',
			YTDLP_MCP_ENABLE_EXPERT: ' ON '
		})

		expect(config.ytdlpPath).toBe('yt-dlp-custom')
		expect(config.outputRoot).toBe(path.join(os.homedir(), 'Downloads', 'yt-dlp-mcp'))
		expect(config.tempRoot).toBe(path.join(os.tmpdir(), 'yt-dlp-mcp'))
		expect(config.allowConfigFiles).toBe(true)
		expect(config.enableExpertMode).toBe(true)
		expect(config.defaultTimeoutMs).toBe(15 * 60 * 1000)
		expect(config.maxOutputBytes).toBe(4 * 1024 * 1024)
		expect(config.cookiesFile).toBeUndefined()
		expect(config.cookiesFromBrowser).toBeUndefined()
		expect(config.jsRuntimes).toEqual(['deno', 'node', 'bun', 'quickjs'])
	})

	it('rejects temp roots outside the configured temp root', () => {
		const config = loadConfig({YTDLP_MCP_OUTPUT_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test', 'downloads'), YTDLP_MCP_TEMP_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test', 'temp')})

		expect(() => resolveOutputPolicy(config, {tempRoot: path.dirname(config.tempRoot)})).toThrow(/tempRoot/)
	})
})

describe('runner', () => {
	it('reports timeout even when the terminated child exits zero', async () => {
		await expect(runCommand(process.execPath, ['-e', "process.on('SIGTERM', () => process.exit(0)); setInterval(() => {}, 1000)"], {timeoutMs: 50, maxOutputBytes: 1024})).rejects.toMatchObject({result: {exitCode: 124}})
	})
})

describe('redaction', () => {
	it('redacts secret args and signed URL query parameters', () => {
		expect(redactArgs(['--password', 'secret', '--cookies', '/tmp/cookies.txt'])).toEqual(['--password', '[REDACTED]', '--cookies', '[REDACTED]'])
		expect(redactText('https://example.com/video?X-Amz-Signature=secret&x=1')).toContain('X-Amz-Signature=[REDACTED]')
	})
})

describe('structured parsers', () => {
	it('parses JSON lines and reports invalid lines', () => {
		const parsed = parseJsonLines('{"id":"a"}\nnot-json\n{"id":"b"}')
		expect(parsed.items).toEqual([{id: 'a'}, {id: 'b'}])
		expect(parsed.parseErrors).toHaveLength(1)
	})

	it('parses common yt-dlp list/progress outputs', () => {
		expect(parseFormats('ID  EXT RESOLUTION | NOTE\n137 mp4 1920x1080 30fps | video only')).toMatchObject([{formatId: '137', extension: 'mp4', resolution: '1920x1080', fps: 30}])
		expect(parseSubtitles('Available subtitles for id:\nLanguage Name Formats\nen English vtt, ttml')).toMatchObject([{language: 'en', source: 'manual'}])
		expect(parseThumbnails('ID Width Height URL\n0 1280 720 https://example.com/thumb.jpg')).toMatchObject([{id: '0', url: 'https://example.com/thumb.jpg'}])
		expect(parseProgress('[download]  42.0% of 10.00MiB at 1.00MiB/s ETA 00:05')).toMatchObject([{phase: 'download', percent: 42}])
		expect(parseFinalPaths('[download] done\n/tmp/video.mp4').paths).toEqual(['/tmp/video.mp4'])
	})
})

describe('planner dependency inference', () => {
	it('requires ffmpeg and ffprobe for audio extraction', () => {
		const config = loadConfig({YTDLP_MCP_YTDLP_PATH: process.execPath, YTDLP_MCP_OUTPUT_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test'), YTDLP_MCP_TIMEOUT_MS: '1000'})
		const plan = planWorkflow(makePlanInput({kind: 'audio'}), {config})
		const requiredDependencies = plan.facts.dependencies.required

		expect(requiredDependencies.map(dependency => dependency.name)).toEqual(expect.arrayContaining(['yt-dlp', 'ffmpeg', 'ffprobe']))
		expect(requiredDependencies.find(dependency => dependency.name === 'ffmpeg')?.requiredFor.join(' ')).toMatch(/audio extraction/)
		expect(requiredDependencies.find(dependency => dependency.name === 'ffmpeg')?.requiredFor.join(' ')).not.toMatch(/audio\/video merge/)
	})

	it('explains multiple ffmpeg requirements in one plan', () => {
		const config = loadConfig({YTDLP_MCP_YTDLP_PATH: process.execPath, YTDLP_MCP_OUTPUT_ROOT: path.join(os.tmpdir(), 'yt-dlp-bridge-test'), YTDLP_MCP_TIMEOUT_MS: '1000'})
		const plan = planWorkflow(
			makePlanInput({format: {format: '137+140', formatSort: [], mergeOutputFormat: 'mp4'}, subtitles: {convertSubs: 'srt'}, thumbnails: {convertThumbnails: 'jpg'}, postprocess: {postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: ['sponsor'], usePostprocessor: []}}),
			{config}
		)
		const reasons = plan.facts.dependencies.required.find(dependency => dependency.name === 'ffmpeg')?.requiredFor.join('\n') ?? ''

		expect(reasons).toMatch(/audio\/video merge/)
		expect(reasons).toMatch(/remux requested/)
		expect(reasons).toMatch(/subtitle conversion/)
		expect(reasons).toMatch(/thumbnail conversion/)
		expect(reasons).toMatch(/chapter or SponsorBlock/)
	})

	it('only reports optional challenge runtimes when PO-token fetching can run', () => {
		const explicitTokenPlan = planWorkflow(makePlanInput({extractor: {extractorArgs: [], youtube: {fetchPot: 'never', poToken: ['web.gvs+token']}}}))
		const fetchPlan = planWorkflow(makePlanInput({extractor: {extractorArgs: [], youtube: {fetchPot: 'auto'}}}))

		expect(explicitTokenPlan.facts.dependencies.optional.map(dependency => dependency.name)).not.toEqual(expect.arrayContaining(['deno', 'node']))
		expect(fetchPlan.facts.dependencies.optional.map(dependency => dependency.name)).toEqual(expect.arrayContaining(['deno', 'node']))
	})
})

describe('workflow planning surface', () => {
	it('plans postprocess facts without taking over runtime execution', () => {
		const plan = planWorkflow({kind: 'postprocess', inputFile: '/tmp/source.webm', output: {}, postprocess: {extractAudio: true, postprocessorArgs: [], parseMetadata: [], replaceInMetadata: [], removeChapters: [], usePostprocessor: []}, sponsorblock: {}, format: {formatSort: []}, auth: {}, network: {}})

		expect(plan.args).toEqual([])
		expect(plan.facts.dependencies.required.map(dependency => dependency.name)).toEqual(expect.arrayContaining(['ffmpeg', 'ffprobe']))
		expect(plan.facts.sideEffects).toContain('extract or convert audio')
	})

	it('plans expert raw argv as an explicit escape hatch', () => {
		const plan = planWorkflow({kind: 'expert', args: ['--dump-json'], url: 'https://example.com/video', dryRun: true, output: {}})

		expect(plan.args).toEqual(['--simulate', '--dump-json', 'https://example.com/video'])
		expect(plan.redactedArgs).toEqual(plan.args)
		expect(plan.facts.risks.join(' ')).toMatch(/Expert args/)
	})

	it('treats omitted expert dryRun as simulated with no side effects', () => {
		const plan = planWorkflow({kind: 'expert', args: ['--dump-json'], url: 'https://example.com/video'})

		expect(plan.args).toEqual(['--simulate', '--dump-json', 'https://example.com/video'])
		expect(plan.facts.isMediaDownload).toBe(false)
		expect(plan.facts.sideEffects).toEqual([])
	})
})

describe('structured error adapter', () => {
	it('classifies command stderr through ytdlp-errors', () => {
		const error = new CommandExecutionError('failed', {command: 'yt-dlp', args: ['https://example.com'], stdout: '', stderr: 'ERROR: Unsupported URL: https://example.com', exitCode: 1, durationMs: 10})

		expect(toStructuredError(error)).toMatchObject({kind: 'unsupportedUrl', retryable: false, exitCode: 1})
	})
})
