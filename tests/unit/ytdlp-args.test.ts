import {EventEmitter} from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest'
import {YtDlp, type YtDlpRequest} from '@main/services/YtDlp.js'
import {resolveE2eHarnessMode, type E2eHarnessMode} from '@main/e2eHarness.js'
import {EMBED_SUBTITLE_CONTAINER_EXT, type AudioConvert, type PlaylistScope, type ProbePlaylistMode, type SponsorBlockPlan, type SubtitleFormat, type SubtitleMode} from 'yt-dlp-bridge'
import {redactArgs} from 'yt-dlp-bridge/redaction'
import type {DependencySource} from '@shared/types.js'
import {SOURCE_PREFERRED_BEST_AUDIO_SELECTOR} from '../shared/nativeAudioSelectors.js'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'

const URL = 'https://www.youtube.com/watch?v=test'
const OUTPUT_DIR = '/downloads'
const tempRoots: string[] = []

function makeFakeProcess(exitCode = 0) {
	const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
	setTimeout(() => proc.emit('close', exitCode), 10)
	return proc
}

function makeYtDlp(opts: {settings?: Record<string, unknown>; token?: string; visitorData?: string; e2eMode?: E2eHarnessMode; ytDlpSource?: DependencySource | null} = {}) {
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: opts.token ?? 'tok', visitorData: opts.visitorData ?? 'vd'}), invalidateCache: vi.fn()}
	const ytDlpSource = opts.ytDlpSource === undefined ? ({kind: 'managed', channel: 'stable', provider: 'github', url: 'https://github.com/yt-dlp/yt-dlp/releases/download/2026.06.12/yt-dlp_linux'} satisfies DependencySource) : opts.ytDlpSource
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), getLastDiagnostic: vi.fn().mockReturnValue({source: ytDlpSource})}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: opts.settings ?? {}, single: {}, playlist: {}})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never, {e2eMode: opts.e2eMode})
}

function getArgs(callIndex = 0): string[] {
	return vi.mocked(spawnYtDlp).mock.calls[callIndex][1]
}

function probeRequest(overrides: {playlistMode?: ProbePlaylistMode; playlistScope?: PlaylistScope} = {}): YtDlpRequest {
	const selection = overrides.playlistMode || overrides.playlistScope ? {playlistMode: overrides.playlistMode, playlistScope: overrides.playlistScope} : undefined
	return {kind: 'probe', url: URL, ...(selection ? {selection} : {})}
}

function mediaRequest(
	overrides: {
		url?: string
		outputDir?: string
		tempDir?: string
		outputTemplate?: string
		formatId?: string
		formatSelector?: string
		formatSort?: string
		mergeOutputFormat?: string
		skipDownload?: boolean
		audioConvert?: AudioConvert
		subtitleLanguages?: string[]
		writeAutoSubs?: boolean
		sponsorBlock?: SponsorBlockPlan
		embedChapters?: boolean
		embedMetadata?: boolean
		embedThumbnail?: boolean
		writeDescription?: boolean
		writeThumbnail?: boolean
		loadInfoJsonPath?: string
		playerClient?: string[]
	} = {}
): YtDlpRequest {
	const outputDir = overrides.outputDir ?? OUTPUT_DIR
	return {
		kind: 'media',
		url: overrides.url ?? URL,
		output: {directory: outputDir, ...(overrides.tempDir ? {tempDirectory: overrides.tempDir} : {}), ...(overrides.outputTemplate ? {template: overrides.outputTemplate} : {})},
		selection: {formatId: overrides.formatId, formatSelector: overrides.formatSelector, formatSort: overrides.formatSort, mergeOutputFormat: overrides.mergeOutputFormat, skipDownload: overrides.skipDownload},
		...(overrides.audioConvert ? {audio: {convert: overrides.audioConvert}} : {}),
		...(overrides.subtitleLanguages !== undefined ? {subtitles: {embed: true, languages: overrides.subtitleLanguages, writeAuto: overrides.writeAutoSubs}} : {}),
		...(overrides.sponsorBlock ? {sponsorBlock: overrides.sponsorBlock} : {}),
		embed: {chapters: overrides.embedChapters, metadata: overrides.embedMetadata, thumbnail: overrides.embedThumbnail, description: overrides.writeDescription, thumbnailSidecar: overrides.writeThumbnail},
		...(overrides.loadInfoJsonPath ? {resume: {loadInfoJsonPath: overrides.loadInfoJsonPath}} : {}),
		...(overrides.playerClient ? {extractor: {youtube: {playerClient: overrides.playerClient}}} : {})
	}
}

function subtitleRequest(overrides: {outputDir?: string; outputTemplate?: string; subtitleLanguages?: string[]; subtitleMode?: SubtitleMode; subtitleFormat?: SubtitleFormat; writeAutoSubs?: boolean} = {}): YtDlpRequest {
	return {
		kind: 'subtitles',
		url: URL,
		output: {directory: overrides.outputDir ?? OUTPUT_DIR, ...(overrides.outputTemplate ? {template: overrides.outputTemplate} : {}), ...(overrides.subtitleMode ? {subtitleMode: overrides.subtitleMode} : {})},
		subtitles: {languages: overrides.subtitleLanguages ?? ['en'], format: overrides.subtitleFormat ?? 'srt', writeAuto: overrides.writeAutoSubs}
	}
}

function lossyAudio(target: 'mp3' | 'm4a' | 'opus', bitrateKbps: number): AudioConvert {
	return {target, lossy: true, bitrateKbps}
}

function wavAudio(): AudioConvert {
	return {target: 'wav', lossy: false}
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: process.execPath, version: '24.16.0'}, output: 'v24.16.0'})
	vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcess(0) as never)
})

afterEach(() => {
	for (const root of tempRoots.splice(0)) {
		fs.rmSync(root, {recursive: true, force: true})
	}
})

function makePluginRoot(): string {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-ytdlp-plugin-parent-'))
	const root = path.join(parent, 'yt-dlp-plugins')
	tempRoots.push(parent)
	fs.mkdirSync(path.join(root, 'yt_dlp_plugins'), {recursive: true})
	return root
}

describe('redactArgs', () => {
	it('redacts PO token, visitor data, and proxy credentials without changing real spawn args', () => {
		const args = ['--extractor-args', 'youtube:po_token=web.gvs+secret-token;visitor_data=secret-visitor', '--proxy', 'http://user:pass@proxy.example:8080', 'https://www.youtube.com/watch?v=test']

		const redacted = redactArgs(args)

		expect(redacted).toEqual(['--extractor-args', 'youtube:po_token=[REDACTED];visitor_data=[REDACTED]', '--proxy', 'http://***:***@proxy.example:8080/', 'https://www.youtube.com/watch?v=test'])
		expect(args[1]).toContain('secret-token')
	})

	it('keeps non-sensitive extractor args visible', () => {
		expect(redactArgs(['--extractor-args', 'youtube:player_client=default,-web,-web_safari'])).toEqual(['--extractor-args', 'youtube:player_client=default,-web,-web_safari'])
	})
})

describe('YtDlp — E2E harness args', () => {
	it('prepends deterministic plugin args and --newline for download runs only in gated E2E mode', async () => {
		const pluginRoot = makePluginRoot()
		const e2eMode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: pluginRoot}, {isPackaged: false})

		await makeYtDlp({e2eMode}).run(mediaRequest())

		expect(getArgs().slice(0, 5)).toEqual(['--ignore-config', '--plugin-dirs', path.dirname(pluginRoot), '--no-cache-dir', '--newline'])
	})

	it('uses harness-only fast media retry args for download runs in gated E2E mode', async () => {
		const pluginRoot = makePluginRoot()
		const e2eMode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: pluginRoot}, {isPackaged: false})

		await makeYtDlp({e2eMode}).run(mediaRequest())

		const args = getArgs()
		expect(args[args.indexOf('--retries') + 1]).toBe('1')
		expect(args[args.indexOf('--fragment-retries') + 1]).toBe('1')
		expect(args[args.indexOf('--retry-sleep') + 1]).toBe('fragment:0')
	})

	it('prepends deterministic plugin args without --newline for probe runs', async () => {
		const pluginRoot = makePluginRoot()
		const e2eMode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: pluginRoot}, {isPackaged: false})

		await makeYtDlp({e2eMode}).run({kind: 'probe', url: URL})

		expect(getArgs().slice(0, 4)).toEqual(['--ignore-config', '--plugin-dirs', path.dirname(pluginRoot), '--no-cache-dir'])
		expect(getArgs()).not.toContain('--newline')
	})
})

describe('YtDlp — probe args', () => {
	it('default (auto): --dump-single-json --flat-playlist + cap, no playlist flag', async () => {
		await makeYtDlp().run({kind: 'probe', url: URL})
		const args = getArgs()
		expect(args).toContain('--dump-single-json')
		expect(args).toContain('--no-quiet')
		expect(args).toContain('--flat-playlist')
		expect(args).not.toContain('--yes-playlist')
		expect(args).not.toContain('--no-playlist')
		expect(args).toContain('--playlist-end')
		expect(args[args.indexOf('--playlist-end') + 1]).toBe('101')
		expect(args[args.length - 1]).toBe(URL)
	})

	it("playlistMode='video': adds --no-playlist, drops --playlist-end (single-video resolution)", async () => {
		await makeYtDlp().run(probeRequest({playlistMode: 'video'}))
		const args = getArgs()
		expect(args).toContain('--no-playlist')
		expect(args).not.toContain('--yes-playlist')
		expect(args).not.toContain('--playlist-end')
	})

	it("playlistMode='playlist': adds --yes-playlist + sentinel --playlist-end 101", async () => {
		await makeYtDlp().run(probeRequest({playlistMode: 'playlist'}))
		const args = getArgs()
		expect(args).toContain('--yes-playlist')
		expect(args).not.toContain('--no-playlist')
		expect(args).toContain('--playlist-end')
		expect(args[args.indexOf('--playlist-end') + 1]).toBe('101')
	})

	it('settings.playlistProbeLimit overrides default --playlist-end', async () => {
		await makeYtDlp({settings: {playlistProbeLimit: 250}}).run({kind: 'probe', url: URL})
		const args = getArgs()
		expect(args[args.indexOf('--playlist-end') + 1]).toBe('251')
	})

	it('playlist scope first count maps to --playlist-items with a sentinel', async () => {
		await makeYtDlp().run(probeRequest({playlistScope: {items: {kind: 'first', count: 50}}}))
		const args = getArgs()
		expect(args).toContain('--playlist-items')
		expect(args[args.indexOf('--playlist-items') + 1]).toBe('1:51')
		expect(args).not.toContain('--playlist-end')
	})

	it('playlist scope range maps to --playlist-items with an exclusive sentinel end', async () => {
		await makeYtDlp().run(probeRequest({playlistScope: {items: {kind: 'range', from: 500, to: 600}}}))
		const args = getArgs()
		expect(args).toContain('--playlist-items')
		expect(args[args.indexOf('--playlist-items') + 1]).toBe('500:601')
		expect(args).not.toContain('--playlist-end')
	})

	it("playlistMode='video' ignores playlist scope args", async () => {
		await makeYtDlp().run(probeRequest({playlistMode: 'video', playlistScope: {items: {kind: 'range', from: 10, to: 20}}}))
		const args = getArgs()
		expect(args).toContain('--no-playlist')
		expect(args).not.toContain('--playlist-items')
		expect(args).not.toContain('--playlist-end')
		expect(args).not.toContain('--dateafter')
	})
})

describe('YtDlp — outputTemplate', () => {
	it('video kind: outputTemplate replaces default %(title)s.%(ext)s', async () => {
		await makeYtDlp().run(mediaRequest({outputTemplate: '01 - %(title)s.%(ext)s'}))
		const args = getArgs()
		const oArg = args[args.indexOf('-o') + 1]
		expect(oArg).toBe(`${OUTPUT_DIR}/01 - %(title)s.%(ext)s`)
	})

	it('subtitle kind: outputTemplate honored', async () => {
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt', outputTemplate: '07 - %(title)s.%(ext)s'}))
		const args = getArgs()
		const oArg = args[args.indexOf('-o') + 1]
		expect(oArg).toBe(`${OUTPUT_DIR}/07 - %(title)s.%(ext)s`)
	})

	it('video kind: tempDir + outputTemplate keeps -o template-only', async () => {
		await makeYtDlp().run(mediaRequest({tempDir: '/tmp/dl', outputTemplate: '02 - %(title)s.%(ext)s'}))
		const args = getArgs()
		expect(args[args.indexOf('-o') + 1]).toBe('02 - %(title)s.%(ext)s')
		expect(args).toContain('--paths')
	})

	it('video kind: omitting outputTemplate keeps default %(title).200B.%(ext)s', async () => {
		await makeYtDlp().run(mediaRequest())
		const args = getArgs()
		expect(args[args.indexOf('-o') + 1]).toBe(`${OUTPUT_DIR}/%(title).200B.%(ext)s`)
	})
})

describe('YtDlp — video args', () => {
	it('no formatId → no -f, includes --no-write-subs --no-write-auto-subs', async () => {
		await makeYtDlp().run(mediaRequest())
		const args = getArgs()
		expect(args).toContain('--no-write-subs')
		expect(args).toContain('--no-write-auto-subs')
		expect(args).not.toContain('-f')
	})

	it('with formatId → -f <id>', async () => {
		await makeYtDlp().run(mediaRequest({formatId: 'bv+ba'}))
		const args = getArgs()
		const fIdx = args.indexOf('-f')
		expect(fIdx).toBeGreaterThan(-1)
		expect(args[fIdx + 1]).toBe('bv+ba')
	})

	it('with formatSelector → -f <selector>, formatId ignored', async () => {
		await makeYtDlp().run(mediaRequest({formatId: '137', formatSelector: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]'}))
		const args = getArgs()
		const fIdx = args.indexOf('-f')
		expect(fIdx).toBeGreaterThan(-1)
		expect(args[fIdx + 1]).toBe('bestvideo[height<=1080]+bestaudio/best[height<=1080]')
		expect(args).not.toContain('137')
	})

	it('skipDownload → --skip-download present, no -f', async () => {
		await makeYtDlp().run(mediaRequest({formatSelector: 'bestaudio/best', skipDownload: true}))
		const args = getArgs()
		expect(args).toContain('--skip-download')
		expect(args).not.toContain('-f')
	})

	it('kind=video → --continue present (resume any leftover .part)', async () => {
		await makeYtDlp().run(mediaRequest())
		expect(getArgs()).toContain('--continue')
	})

	it('kind=video with skipDownload=true → no --continue (nothing to resume)', async () => {
		await makeYtDlp().run(mediaRequest({skipDownload: true}))
		expect(getArgs()).not.toContain('--continue')
	})

	it('output template contains outputDir, url is last', async () => {
		await makeYtDlp().run(mediaRequest())
		const args = getArgs()
		const oIdx = args.indexOf('-o')
		expect(oIdx).toBeGreaterThan(-1)
		expect(args[oIdx + 1]).toContain(OUTPUT_DIR)
		expect(args[args.length - 1]).toBe(URL)
	})
})

describe('YtDlp — audio convert args', () => {
	it('mp3 192K → source-preferred bestaudio selector, -x, --audio-format mp3, --audio-quality 192K', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: lossyAudio('mp3', 192)}))
		const args = getArgs()
		expect(args[args.indexOf('-f') + 1]).toBe(SOURCE_PREFERRED_BEST_AUDIO_SELECTOR)
		expect(args).toContain('-x')
		expect(args[args.indexOf('--audio-format') + 1]).toBe('mp3')
		expect(args[args.indexOf('--audio-quality') + 1]).toBe('192K')
	})

	it('wav → no --audio-quality', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: wavAudio()}))
		const args = getArgs()
		expect(args[args.indexOf('--audio-format') + 1]).toBe('wav')
		expect(args).not.toContain('--audio-quality')
	})

	it('mp3 → auto-embeds thumbnail + metadata when toggles unset', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: lossyAudio('mp3', 192)}))
		const args = getArgs()
		expect(args).toContain('--embed-thumbnail')
		expect(args[args.indexOf('--convert-thumbnails') + 1]).toBe('jpg')
		expect(args).toContain('--add-metadata')
	})

	it('wav → auto-metadata yes, auto-thumbnail no (incompatible)', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: wavAudio()}))
		const args = getArgs()
		expect(args).toContain('--add-metadata')
		expect(args).not.toContain('--embed-thumbnail')
	})

	it('explicit embedThumbnail=false overrides auto-embed for music format', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: lossyAudio('mp3', 192), embedThumbnail: false, embedMetadata: false}))
		const args = getArgs()
		expect(args).not.toContain('--embed-thumbnail')
		expect(args).not.toContain('--add-metadata')
	})

	it('opus 128K threads bitrate correctly', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: lossyAudio('opus', 128)}))
		const args = getArgs()
		expect(args[args.indexOf('--audio-format') + 1]).toBe('opus')
		expect(args[args.indexOf('--audio-quality') + 1]).toBe('128K')
	})

	it('m4a 256K threads bitrate correctly', async () => {
		await makeYtDlp().run(mediaRequest({audioConvert: lossyAudio('m4a', 256)}))
		const args = getArgs()
		expect(args[args.indexOf('--audio-format') + 1]).toBe('m4a')
		expect(args[args.indexOf('--audio-quality') + 1]).toBe('256K')
	})

	it('audioConvert overrides any provided formatId', async () => {
		await makeYtDlp().run(mediaRequest({formatId: 'bv+ba', audioConvert: lossyAudio('mp3', 192)}))
		const args = getArgs()
		expect(args[args.indexOf('-f') + 1]).toBe(SOURCE_PREFERRED_BEST_AUDIO_SELECTOR)
		expect(args.filter(a => a === '-f').length).toBe(1)
	})
})

describe('YtDlp — video+embed args', () => {
	it('--continue present', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: ['en']}))
		expect(getArgs()).toContain('--continue')
	})

	it('with subs → embed subtitle flags and bridge embed container', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: ['en', 'ja'], writeAutoSubs: false}))
		const args = getArgs()
		expect(args).toContain('--write-subs')
		expect(args).toContain('--embed-subs')
		expect(args[args.indexOf('--sub-langs') + 1]).toBe('en,ja')
		expect(args[args.indexOf('--merge-output-format') + 1]).toBe(EMBED_SUBTITLE_CONTAINER_EXT)
		expect(args[args.indexOf('--compat-options') + 1]).toBe('no-keep-subs')
		expect(args).toContain('--sleep-subtitles')
		expect(args).not.toContain('--write-auto-subs')
	})

	it('writeAutoSubs=true → adds --write-auto-subs', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: ['en'], writeAutoSubs: true}))
		expect(getArgs()).toContain('--write-auto-subs')
	})

	it('empty subs array → falls back to no-subs branch', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: []}))
		const args = getArgs()
		expect(args).toContain('--no-write-subs')
		expect(args).toContain('--no-write-auto-subs')
		expect(args).not.toContain('--embed-subs')
	})
})

describe('YtDlp — subtitle args', () => {
	it('baseline: skip-download, write-subs, sub-langs, sleep, sub-format, convert-subs', async () => {
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'vtt'}))
		const args = getArgs()
		expect(args).toContain('--skip-download')
		expect(args).toContain('--no-playlist')
		expect(args).toContain('--write-subs')
		expect(args[args.indexOf('--sub-langs') + 1]).toBe('en')
		expect(args).toContain('--sleep-subtitles')
		expect(args[args.indexOf('--sub-format') + 1]).toBe('vtt/best')
		expect(args[args.indexOf('--convert-subs') + 1]).toBe('vtt')
		expect(args).not.toContain('--write-auto-subs')
	})

	it('writeAutoSubs=true → adds --write-auto-subs', async () => {
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt', writeAutoSubs: true}))
		expect(getArgs()).toContain('--write-auto-subs')
	})

	it('subtitleMode=subfolder → output path under <dir>/subtitles/', async () => {
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt', subtitleMode: 'subfolder'}))
		const args = getArgs()
		expect(args[args.indexOf('-o') + 1]).toContain(`${OUTPUT_DIR}/subtitles`)
	})

	it('subtitleMode=sidecar → output path is directly in outputDir (no subfolder)', async () => {
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt', subtitleMode: 'sidecar'}))
		const oArg = getArgs()[getArgs().indexOf('-o') + 1]
		expect(oArg).not.toContain('/subtitles')
		expect(oArg).toContain(OUTPUT_DIR)
	})

	it('ass + writeAutoSubs → coerced to srt in args, effectiveSubtitleFormat=srt on result', async () => {
		const result = await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'ass', writeAutoSubs: true}))
		const args = getArgs()
		expect(args[args.indexOf('--sub-format') + 1]).toBe('srt/best')
		expect(args[args.indexOf('--convert-subs') + 1]).toBe('srt')
		expect(result.kind).toBe('success')
		if (result.kind === 'success') expect(result.effectiveSubtitleFormat).toBe('srt')
	})

	it('ass without writeAutoSubs → no coercion', async () => {
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'ass', writeAutoSubs: false}))
		const args = getArgs()
		expect(args[args.indexOf('--sub-format') + 1]).toBe('ass/best')
		expect(args[args.indexOf('--convert-subs') + 1]).toBe('ass')
	})
})

describe('YtDlp — cookies injection', () => {
	it("cookiesMode='file'+valid path → --cookies <path>", async () => {
		const ytDlp = makeYtDlp({settings: {cookiesMode: 'file', cookiesPath: '/home/u/cookies.txt'}})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		const idx = args.indexOf('--cookies')
		expect(idx).toBeGreaterThan(-1)
		expect(args[idx + 1]).toBe('/home/u/cookies.txt')
		expect(args).not.toContain('--cookies-from-browser')
	})

	it("cookiesMode='off' → no --cookies even with path", async () => {
		const ytDlp = makeYtDlp({settings: {cookiesMode: 'off', cookiesPath: '/home/u/cookies.txt'}})
		await ytDlp.run({kind: 'probe', url: URL})
		expect(getArgs()).not.toContain('--cookies')
	})

	it("cookiesMode='file'+empty path → no --cookies", async () => {
		const ytDlp = makeYtDlp({settings: {cookiesMode: 'file', cookiesPath: '   '}})
		await ytDlp.run({kind: 'probe', url: URL})
		expect(getArgs()).not.toContain('--cookies')
	})

	it("cookiesMode='browser'+browser → --cookies-from-browser <browser>, no --cookies", async () => {
		const ytDlp = makeYtDlp({settings: {cookiesMode: 'browser', cookiesBrowser: 'firefox'}})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		const idx = args.indexOf('--cookies-from-browser')
		expect(idx).toBeGreaterThan(-1)
		expect(args[idx + 1]).toBe('firefox')
		expect(args).not.toContain('--cookies')
	})

	it("cookiesMode='browser'+missing browser → no cookies args", async () => {
		const ytDlp = makeYtDlp({settings: {cookiesMode: 'browser'}})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		expect(args).not.toContain('--cookies')
		expect(args).not.toContain('--cookies-from-browser')
	})

	it('cookies appear before request-specific args (after extractor-args block)', async () => {
		const ytDlp = makeYtDlp({settings: {cookiesMode: 'file', cookiesPath: '/cookies.txt'}})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		const cookiesIdx = args.indexOf('--cookies')
		const dumpJsonIdx = args.indexOf('--dump-single-json')
		expect(cookiesIdx).toBeGreaterThan(-1)
		expect(cookiesIdx).toBeLessThan(dumpJsonIdx)
	})
})

describe('YtDlp — output embed flags', () => {
	it('embedChapters=true → --embed-chapters present', async () => {
		await makeYtDlp().run(mediaRequest({embedChapters: true}))
		expect(getArgs()).toContain('--embed-chapters')
	})

	it('embedChapters=false → no --embed-chapters', async () => {
		await makeYtDlp().run(mediaRequest({embedChapters: false}))
		expect(getArgs()).not.toContain('--embed-chapters')
	})

	it('embedChapters undefined → no --embed-chapters', async () => {
		await makeYtDlp().run(mediaRequest())
		expect(getArgs()).not.toContain('--embed-chapters')
	})

	it('sponsorBlock.mode=mark + embedChapters=false → no --embed-chapters (setting fully owns the flag)', async () => {
		await makeYtDlp().run(mediaRequest({embedChapters: false, sponsorBlock: {mode: 'mark', categories: ['sponsor']}}))
		expect(getArgs()).not.toContain('--embed-chapters')
	})

	it('sponsorBlock.mode=mark + embedChapters undefined → no --embed-chapters', async () => {
		await makeYtDlp().run(mediaRequest({sponsorBlock: {mode: 'mark', categories: ['sponsor']}}))
		expect(getArgs()).not.toContain('--embed-chapters')
	})

	it('sponsorBlock.mode=mark + embedChapters=true → --embed-chapters present', async () => {
		await makeYtDlp().run(mediaRequest({embedChapters: true, sponsorBlock: {mode: 'mark', categories: ['sponsor']}}))
		expect(getArgs()).toContain('--embed-chapters')
	})

	it('embedMetadata=true → --add-metadata present', async () => {
		await makeYtDlp().run(mediaRequest({embedMetadata: true}))
		expect(getArgs()).toContain('--add-metadata')
	})

	it('embedMetadata=false → no --add-metadata', async () => {
		await makeYtDlp().run(mediaRequest({embedMetadata: false}))
		expect(getArgs()).not.toContain('--add-metadata')
	})

	it('embedMetadata undefined → no --add-metadata', async () => {
		await makeYtDlp().run(mediaRequest())
		expect(getArgs()).not.toContain('--add-metadata')
	})

	it('embedThumbnail=true on kind=video → --embed-thumbnail and --convert-thumbnails jpg', async () => {
		await makeYtDlp().run(mediaRequest({embedThumbnail: true}))
		const args = getArgs()
		expect(args).toContain('--embed-thumbnail')
		expect(args[args.indexOf('--convert-thumbnails') + 1]).toBe('jpg')
	})

	it('embedThumbnail=false on kind=video → no thumbnail flags', async () => {
		await makeYtDlp().run(mediaRequest({embedThumbnail: false}))
		expect(getArgs()).not.toContain('--embed-thumbnail')
		expect(getArgs()).not.toContain('--convert-thumbnails')
	})

	it('embedThumbnail=true on kind=video+embed with subs → flags absent (MKV-forced)', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: ['en'], embedThumbnail: true}))
		expect(getArgs()).not.toContain('--embed-thumbnail')
		expect(getArgs()).not.toContain('--convert-thumbnails')
	})

	it('embedThumbnail=true on kind=video+embed with empty subs → flags PRESENT (no MKV-force)', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: [], embedThumbnail: true}))
		const args = getArgs()
		expect(args).toContain('--embed-thumbnail')
		expect(args[args.indexOf('--convert-thumbnails') + 1]).toBe('jpg')
	})
})

describe('YtDlp — SponsorBlock args', () => {
	function expectNoSponsorBlockArgs(args: string[]): void {
		expect(args).not.toContain('--sponsorblock-mark')
		expect(args).not.toContain('--sponsorblock-remove')
	}

	it('mark mode adds --sponsorblock-mark without implying chapter embedding', async () => {
		await makeYtDlp().run(mediaRequest({sponsorBlock: {mode: 'mark', categories: ['sponsor', 'selfpromo']}}))

		const args = getArgs()
		expect(args).toContain('--sponsorblock-mark')
		expect(args[args.indexOf('--sponsorblock-mark') + 1]).toBe('sponsor,selfpromo')
		expect(args).not.toContain('--sponsorblock-remove')
		expect(args).not.toContain('--embed-chapters')
	})

	it('remove mode adds --sponsorblock-remove without implying chapter embedding', async () => {
		await makeYtDlp().run(mediaRequest({sponsorBlock: {mode: 'remove', categories: ['sponsor', 'intro', 'outro']}}))

		const args = getArgs()
		expect(args).toContain('--sponsorblock-remove')
		expect(args[args.indexOf('--sponsorblock-remove') + 1]).toBe('sponsor,intro,outro')
		expect(args).not.toContain('--sponsorblock-mark')
		expect(args).not.toContain('--embed-chapters')
	})

	it('off mode reaches YtDlp as no sponsorBlock config', async () => {
		await makeYtDlp().run(mediaRequest())

		expectNoSponsorBlockArgs(getArgs())
	})

	it('empty categories omit SponsorBlock args', async () => {
		await makeYtDlp().run(mediaRequest({sponsorBlock: {mode: 'mark', categories: []}}))

		expectNoSponsorBlockArgs(getArgs())
	})
})

describe('YtDlp — sidecar flags', () => {
	it('writeDescription=true on kind=video → --write-description present', async () => {
		await makeYtDlp().run(mediaRequest({writeDescription: true}))
		expect(getArgs()).toContain('--write-description')
	})

	it('writeDescription=false on kind=video → no --write-description', async () => {
		await makeYtDlp().run(mediaRequest({writeDescription: false}))
		expect(getArgs()).not.toContain('--write-description')
	})

	it('writeDescription undefined on kind=video → no --write-description', async () => {
		await makeYtDlp().run(mediaRequest())
		expect(getArgs()).not.toContain('--write-description')
	})

	it('writeThumbnail=true on kind=video → --write-thumbnail present', async () => {
		await makeYtDlp().run(mediaRequest({writeThumbnail: true}))
		expect(getArgs()).toContain('--write-thumbnail')
	})

	it('writeThumbnail=false on kind=video → no --write-thumbnail', async () => {
		await makeYtDlp().run(mediaRequest({writeThumbnail: false}))
		expect(getArgs()).not.toContain('--write-thumbnail')
	})

	it('writeThumbnail undefined on kind=video → no --write-thumbnail', async () => {
		await makeYtDlp().run(mediaRequest())
		expect(getArgs()).not.toContain('--write-thumbnail')
	})

	it('writeDescription=true on kind=video+embed → --write-description present', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: ['en'], writeDescription: true}))
		expect(getArgs()).toContain('--write-description')
	})

	it('writeThumbnail=true on kind=video+embed → --write-thumbnail present', async () => {
		await makeYtDlp().run(mediaRequest({subtitleLanguages: ['en'], writeThumbnail: true}))
		expect(getArgs()).toContain('--write-thumbnail')
	})

	it('both sidecar flags true on kind=video → both flags present', async () => {
		await makeYtDlp().run(mediaRequest({writeDescription: true, writeThumbnail: true}))
		const args = getArgs()
		expect(args).toContain('--write-description')
		expect(args).toContain('--write-thumbnail')
	})
})

describe('YtDlp — extractor-args shape', () => {
	it('PoT (kind=video): youtube:po_token=web.gvs+<token>;visitor_data=<vd>', async () => {
		const ytDlp = makeYtDlp({token: 'MYTOKEN', visitorData: 'MYVISITOR'})
		await ytDlp.run(mediaRequest())
		const args = getArgs()
		const i = args.indexOf('--extractor-args')
		expect(i).toBeGreaterThanOrEqual(0)
		expect(args[i + 1]).toBe('youtube:po_token=web.gvs+MYTOKEN;visitor_data=MYVISITOR')
	})

	it('empty visitorData (kind=video) → omits ;visitor_data= segment', async () => {
		const ytDlp = makeYtDlp({token: 'MYTOKEN', visitorData: ''})
		await ytDlp.run(mediaRequest())
		const args = getArgs()
		const i = args.indexOf('--extractor-args')
		expect(i).toBeGreaterThanOrEqual(0)
		expect(args[i + 1]).toBe('youtube:po_token=web.gvs+MYTOKEN')
		expect(args[i + 1]).not.toContain('visitor_data')
	})

	// Regression guard: visitor_data passed to YouTube tab extractor silently
	// caps playlist enumeration at 100 entries (single innertube page),
	// regardless of --playlist-end. Playlist-capable probes stay PoT-free before
	// the first spawn; explicit single-video probes can safely use PoT because
	// they do not enumerate YouTube tabs.
	it('probe (YouTube, playlistMode=auto): no --extractor-args (bypasses PoT to avoid visitor_data tab cap)', async () => {
		const ytDlp = makeYtDlp({token: 'MYTOKEN', visitorData: 'MYVISITOR'})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		expect(args).not.toContain('--extractor-args')
	})

	it('probe (YouTube, playlistMode=playlist): no --extractor-args (bypasses PoT to avoid visitor_data tab cap)', async () => {
		const ytDlp = makeYtDlp({token: 'MYTOKEN', visitorData: 'MYVISITOR'})
		await ytDlp.run(probeRequest({playlistMode: 'playlist'}))
		const args = getArgs()
		expect(args).not.toContain('--extractor-args')
	})

	it('probe (YouTube, playlistMode=video): uses manual PoT extractor args', async () => {
		const ytDlp = makeYtDlp({token: 'MYTOKEN', visitorData: 'MYVISITOR'})
		await ytDlp.run(probeRequest({playlistMode: 'video'}))
		const args = getArgs()
		const i = args.indexOf('--extractor-args')
		expect(i).toBeGreaterThanOrEqual(0)
		expect(args[i + 1]).toBe('youtube:po_token=web.gvs+MYTOKEN;visitor_data=MYVISITOR')
	})

	it('media with explicit YouTube player_client keeps PoT and client extractor args', async () => {
		const ytDlp = makeYtDlp({token: 'MYTOKEN', visitorData: 'MYVISITOR'})
		await ytDlp.run(mediaRequest({formatId: '337+380', playerClient: ['default', 'web_embedded']}))
		const extractorArgs = getArgs().flatMap((arg, index, args) => (arg === '--extractor-args' ? [args[index + 1]] : []))
		expect(extractorArgs).toContain('youtube:po_token=web.gvs+MYTOKEN;visitor_data=MYVISITOR')
		expect(extractorArgs).toContain('youtube:player_client=default,web_embedded')
	})
})

describe('YtDlp — limit-rate', () => {
	it('settings.limitRate set + kind=video → --limit-rate <value>', async () => {
		const ytDlp = makeYtDlp({settings: {limitRate: '500K'}})
		await ytDlp.run(mediaRequest())
		const args = getArgs()
		const idx = args.indexOf('--limit-rate')
		expect(idx).toBeGreaterThan(-1)
		expect(args[idx + 1]).toBe('500K')
	})

	it('settings.limitRate set + kind=video+embed → --limit-rate <value>', async () => {
		const ytDlp = makeYtDlp({settings: {limitRate: '1.5M'}})
		await ytDlp.run(mediaRequest({subtitleLanguages: ['en']}))
		const args = getArgs()
		const idx = args.indexOf('--limit-rate')
		expect(idx).toBeGreaterThan(-1)
		expect(args[idx + 1]).toBe('1.5M')
	})

	it('settings.limitRate set + kind=probe → no --limit-rate (probe must stay fast)', async () => {
		const ytDlp = makeYtDlp({settings: {limitRate: '500K'}})
		await ytDlp.run({kind: 'probe', url: URL})
		expect(getArgs()).not.toContain('--limit-rate')
	})

	it('settings.limitRate set + kind=subtitle → no --limit-rate (sidecar phase exempt)', async () => {
		const ytDlp = makeYtDlp({settings: {limitRate: '500K'}})
		await ytDlp.run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt'}))
		expect(getArgs()).not.toContain('--limit-rate')
	})

	it('settings.limitRate empty/whitespace → no --limit-rate', async () => {
		const ytDlp = makeYtDlp({settings: {limitRate: '   '}})
		await ytDlp.run(mediaRequest())
		expect(getArgs()).not.toContain('--limit-rate')
	})

	it('settings.limitRate undefined → no --limit-rate', async () => {
		await makeYtDlp().run(mediaRequest())
		expect(getArgs()).not.toContain('--limit-rate')
	})
})

describe('YtDlp — network pacing', () => {
	function getArgValue(args: string[], flag: string): string {
		const idx = args.indexOf(flag)
		if (idx === -1) throw new Error(`flag ${flag} not found in args: ${args.join(' ')}`)
		return args[idx + 1]
	}

	it('balanced preset applies request pacing to probes', async () => {
		await makeYtDlp({settings: {networkPacingPreset: 'balanced'}}).run({kind: 'probe', url: URL})
		const args = getArgs()
		expect(args).toContain('--sleep-requests')
		expect(args[args.indexOf('--sleep-requests') + 1]).toBe('1')
	})

	it('missing pacing preset defaults to balanced', async () => {
		await makeYtDlp().run(mediaRequest())
		const args = getArgs()
		expect(getArgValue(args, '--sleep-requests')).toBe('1')
		expect(getArgValue(args, '--sleep-interval')).toBe('5')
		expect(getArgValue(args, '--max-sleep-interval')).toBe('10')
		expect(getArgValue(args, '--concurrent-fragments')).toBe('1')
	})

	it('balanced preset applies download pacing to video downloads', async () => {
		await makeYtDlp({settings: {networkPacingPreset: 'balanced'}}).run(mediaRequest())
		const args = getArgs()
		expect(getArgValue(args, '--sleep-requests')).toBe('1')
		expect(getArgValue(args, '--sleep-interval')).toBe('5')
		expect(getArgValue(args, '--max-sleep-interval')).toBe('10')
		expect(getArgValue(args, '--concurrent-fragments')).toBe('1')
	})

	it('balanced preset applies 3s subtitle pacing to subtitle requests', async () => {
		await makeYtDlp({settings: {networkPacingPreset: 'balanced'}}).run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt'}))
		const args = getArgs()
		expect(getArgValue(args, '--sleep-subtitles')).toBe('3')
	})

	it('off preset still keeps the baseline media-start pause', async () => {
		await makeYtDlp({settings: {networkPacingPreset: 'off'}}).run(mediaRequest())
		const args = getArgs()
		expect(args).not.toContain('--sleep-requests')
		expect(getArgValue(args, '--sleep-interval')).toBe('1')
		expect(getArgValue(args, '--max-sleep-interval')).toBe('3')
	})

	it('video downloads abort on unavailable fragments and back off fragment retries', async () => {
		await makeYtDlp().run(mediaRequest())
		const args = getArgs()
		expect(args).toContain('--abort-on-unavailable-fragments')
		expect(getArgValue(args, '--retry-sleep')).toBe('fragment:exp=1:20')
	})

	it('fragment hardening does not apply to probes or subtitle-only downloads', async () => {
		vi.mocked(spawnYtDlp)
			.mockReturnValueOnce(makeFakeProcess(0) as never)
			.mockReturnValueOnce(makeFakeProcess(0) as never)

		await makeYtDlp().run({kind: 'probe', url: URL})
		await makeYtDlp().run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt'}))

		expect(getArgs(0)).not.toContain('--abort-on-unavailable-fragments')
		expect(getArgs(0)).not.toContain('--retry-sleep')
		expect(getArgs(1)).not.toContain('--abort-on-unavailable-fragments')
		expect(getArgs(1)).not.toContain('--retry-sleep')
	})

	it('custom preset applies subtitle sleep to subtitle requests', async () => {
		await makeYtDlp({settings: {networkPacingPreset: 'custom', pacingSleepRequests: 2, pacingSleepSubtitles: 7}}).run(subtitleRequest({subtitleLanguages: ['en'], subtitleFormat: 'srt'}))
		const args = getArgs()
		expect(getArgValue(args, '--sleep-requests')).toBe('2')
		expect(getArgValue(args, '--sleep-subtitles')).toBe('7')
	})
})

describe('YtDlp — js-runtimes', () => {
	it('prefers Electron Node and clears yt-dlp default runtimes before enabling it', async () => {
		const ytDlp = makeYtDlp()
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		const clearIdx = args.indexOf('--no-js-runtimes')
		const runtimeIdx = args.indexOf('--js-runtimes')
		expect(clearIdx).toBeGreaterThan(-1)
		expect(runtimeIdx).toBeGreaterThan(-1)
		expect(clearIdx).toBeLessThan(runtimeIdx)
		expect(args[runtimeIdx + 1]).toBe(`node:${process.execPath}`)
		expect(args).not.toContain('--remote-components')
		expect(args.some(arg => arg.startsWith('deno:'))).toBe(false)
	})

	it('uses bundled EJS for managed-cache yt-dlp artifacts', async () => {
		const ytDlp = makeYtDlp({ytDlpSource: {kind: 'managedCache', channel: 'nightly', provider: 'github', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/download/2026.06.12/yt-dlp_linux', path: '/runtime-cache/artifacts/hash/yt-dlp'}})
		await ytDlp.run({kind: 'probe', url: URL})
		expect(getArgs()).not.toContain('--remote-components')
	})

	it('enables GitHub EJS downloads when using an external yt-dlp source', async () => {
		const ytDlp = makeYtDlp({ytDlpSource: {kind: 'systemPath', path: '/home/user/.local/bin/yt-dlp'}})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		expect(args[args.indexOf('--remote-components') + 1]).toBe('ejs:github')
	})

	it('fails before spawning yt-dlp when Electron Node probing fails', async () => {
		vi.mocked(probeElectronNodeRuntime).mockResolvedValueOnce({ok: false, reason: 'runAsNode unavailable'})
		const ytDlp = makeYtDlp()

		let caught: unknown
		try {
			await ytDlp.run({kind: 'probe', url: URL})
		} catch (err) {
			caught = err
		}
		expect(caught).toBeInstanceOf(Error)
		expect((caught as Error).message).toMatch(/Electron Node runtime unavailable/)
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})

	it('uses Electron Node in the gated E2E harness', async () => {
		const e2eMode = resolveE2eHarnessMode({ARROXY_E2E: '1', ARROXY_E2E_YTDLP_PLUGIN_DIR: makePluginRoot()}, {isPackaged: false})
		const ytDlp = makeYtDlp({e2eMode})
		await ytDlp.run({kind: 'probe', url: URL})
		const args = getArgs()
		const idx = args.indexOf('--js-runtimes')
		expect(args).toContain('--no-js-runtimes')
		expect(idx).toBeGreaterThan(-1)
		expect(args[idx + 1]).toBe(`node:${process.execPath}`)
	})
})
