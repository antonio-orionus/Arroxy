import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import log from 'electron-log/main.js'
import {createStreamTextReader, spawnYtDlp} from '@main/utils/process.js'
import {killProcessTree} from './download/processControl.js'
import {classifyYtDlpStderr, extractLastError} from 'ytdlp-errors'
import type {YtDlpErrorKind} from 'ytdlp-errors'
import {planWorkflow, type CallerMediaWorkflowInput, type CallerSubtitlesWorkflowInput, type ProbePlaylistMode, type ProbeWorkflowInput, type SubtitleFormat} from 'yt-dlp-bridge'
import {redactArgs} from 'yt-dlp-bridge/redaction'
import {resolveCookies, type ResolvedCookies} from './cookiesResolver.js'
import {nonEmpty} from '@shared/format.js'
import {unknownToMessage} from '@main/utils/errorFactory.js'
import {parseProxySetting, proxyForLog} from '@main/utils/proxyUrl.js'
import {siteForUrl} from '@shared/sites/index.js'
import type {SiteId} from '@shared/sites/types.js'
import type {StatusKey, DependencySource} from '@shared/types.js'
import {resolveNetworkPacing, resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {PROBE_TIMEOUT_MS} from '@shared/constants.js'
import type {E2eHarnessMode} from '@main/e2eHarness.js'
import type {BinaryManager} from './BinaryManager.js'
import type {TokenService} from './TokenService.js'
import type {SessionCookieJarPort} from './sessionCookieJarPort.js'
import type {ExploreSpawnGate} from './exploreSpawnGate.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {applyJsRuntimeEnv, buildYtDlpJsRuntimeArgs, probeElectronNodeRuntime, summarizeYtDlpJsRuntimeForLog, type YtDlpJsRuntime, type YtDlpJsRuntimeLogSummary} from './ytDlpJsRuntime.js'

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void

const ytDlpLog = log.scope('yt-dlp')

function shouldAllowRemoteEjsComponents(source: DependencySource | null | undefined): boolean {
	return source !== null && source !== undefined && source.kind !== 'managed' && source.kind !== 'managedCache' && source.kind !== 'bundled'
}

function summarizeDependencySourceForLog(source: DependencySource | null | undefined): Record<string, string | null> {
	if (!source) return {ytDlpSource: null}
	if (source.kind === 'managed') return {ytDlpSource: source.kind, ytDlpProvider: source.provider, ytDlpChannel: source.channel}
	if (source.kind === 'managedCache') return {ytDlpSource: 'managed-cache', ytDlpProvider: source.provider, ytDlpChannel: source.channel}
	return {ytDlpSource: source.kind}
}

export type YtDlpRequest = ProbeWorkflowInput | CallerMediaWorkflowInput | CallerSubtitlesWorkflowInput

export interface YtDlpSignal {
	onMinting?: (attempt: 0 | 1) => void
	onSpawn?: (proc: ChildProcessWithoutNullStreams) => void
	onStdout?: (chunk: string) => void
	onStderr?: (chunk: string) => void
	// Caller-driven cancellation. When aborted, in-flight yt-dlp processes are
	// SIGKILLed and the run resolves with an exit-error (rawError: 'Cancelled').
	abortSignal?: AbortSignal
	// Pause: a run that has not spawned yet (binary setup, token mint, waiting
	// for a signed-in spawn slot) resolves Cancelled without spawning. A process
	// already running is left to the caller.
	pauseSignal?: AbortSignal
	// Per-call timeout override (ms) for probes. Background hydration passes a
	// longer budget; undefined keeps the default policy below.
	timeoutMs?: number
}

export type YtDlpResult =
	| {kind: 'success'; stdout: string; stderr: string; usedExtractorFallback: boolean; effectiveSubtitleFormat?: SubtitleFormat; accountCookiesRejected?: true}
	| {kind: 'spawn-error'; error: Error; stdout: string; stderr: string; accountCookiesRejected?: true}
	| {
			kind: 'exit-error'
			exitCode: number
			// Closed taxonomy. Always populated — `'unknown'` covers the
			// unmatched-stderr fallback. `rawError` carries the verbatim message
			// the renderer should show when no i18n template applies.
			errorKind: YtDlpErrorKind
			rawError: string | null
			stdout: string
			stderr: string
			// yt-dlp warned that the account cookies it was given are no longer
			// valid (the session was rotated or signed out in the browser).
			accountCookiesRejected?: true
	  }

export interface YtDlpInvocationSummary {
	ytDlpPath: string
	ffmpegPath: string | null
	args: string[]
	jsRuntime: YtDlpJsRuntimeLogSummary
	attempt: RetryStrategy['kind']
	reMint: boolean | null
}

// VidBee's strategy: skip the player clients that demand a PoT, so the
// non-PoT download path works without needing to mint anything.
const PLAYER_CLIENT_FALLBACK = 'youtube:player_client=default,-web,-web_safari'

function buildPotExtractorArgs(token: string, visitorData: string): string {
	const visitor = visitorData ? `;visitor_data=${visitorData}` : ''
	return `youtube:po_token=web.gvs+${token}${visitor}`
}

type RetryStrategy = {kind: 'pot'; reMint: boolean} | {kind: 'fallback'} | {kind: 'noExtractorArgs'; usedExtractorFallback?: boolean}

// Marker for timer-killed probes. ProbeService matches on it to grant exactly
// one retry — keep the literal in sync if this ever changes.
export const PROBE_TIMEOUT_MESSAGE = 'Probe timed out'

const ACCOUNT_COOKIES_REJECTED = /provided YouTube account cookies are no longer valid/i

// How long a stopped signed-in run waits for its killed tree to close before
// it settles (and its jar is deleted) anyway.
const STOPPED_SESSION_EXIT_GRACE_MS = 5000

// Which identity a run uses. `configured`: the selected cookie mode (anonymous
// under `explore`). `none`: no cookies this run (the quality fallback).
// `exploreSession`: the escalated Explore session.
export type RunIdentity = 'configured' | 'none' | 'exploreSession'

interface InvokeOptions {
	url: string
	ytDlpPath: string
	ffmpegPath: string | null
	jsRuntime: YtDlpJsRuntime | null
	e2eMode?: E2eHarnessMode
	args: string[]
	tokenService: TokenService
	cookies?: ResolvedCookies | null
	sessionJars?: SessionCookieJarPort
	proxyUrl?: string
	/** Credential-free form of the proxy setting for logs. */
	proxyForLog?: string | null
	limitRate?: string
	timeoutMs?: number
	signal?: YtDlpSignal
	isProbe?: boolean
	probePlaylistMode?: ProbePlaylistMode
	hasExplicitYoutubePlayerClient?: boolean
	onInvocation?: (summary: YtDlpInvocationSummary) => void
}

const EXPLORE_SESSION_UNAVAILABLE_MESSAGE = 'Explore session unavailable'

// A new object per call: results are handed to callers that may annotate them.
function exploreSessionUnavailable(): YtDlpResult {
	return {kind: 'exit-error', exitCode: -1, errorKind: 'loginRequired', rawError: EXPLORE_SESSION_UNAVAILABLE_MESSAGE, stdout: '', stderr: ''}
}

function spawnCapExceeded(): YtDlpResult {
	return {kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Too many signed-in attempts for this download', stdout: '', stderr: ''}
}

function cancelledResult(): YtDlpResult {
	return {kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Cancelled', stdout: '', stderr: ''}
}

function probeTimedOut(): YtDlpResult {
	return {kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: PROBE_TIMEOUT_MESSAGE, stdout: '', stderr: ''}
}

// Cancelled or paused before a spawn: nothing may start.
function stoppedBeforeSpawn(signal: YtDlpSignal | undefined): boolean {
	return signal?.abortSignal?.aborted === true || signal?.pauseSignal?.aborted === true
}

async function invokeOnce(opts: InvokeOptions, strategy: RetryStrategy): Promise<YtDlpResult> {
	const cookies = opts.cookies
	if (cookies?.kind === 'session') {
		const jars = opts.sessionJars
		if (!jars) throw new Error('invariant: session cookies resolved without a session jar port')
		// A run cancelled or paused before it started must not put cookies on disk.
		if (stoppedBeforeSpawn(opts.signal)) return cancelledResult()
		// Only the port's own failure (the jar could not be written) maps to
		// "unavailable"; whatever the spawn itself did is reported as before.
		const spawned: {result?: YtDlpResult; failure?: {error: unknown}} = {}
		try {
			// One jar per spawn: the port deletes it as soon as this spawn settles.
			return await jars.withJar(cookies.siteId, async jarPath => {
				try {
					spawned.result = await spawnCollect(opts, strategy, ['--cookies', jarPath])
					return spawned.result
				} catch (error) {
					spawned.failure = {error}
					throw error
				}
			})
		} catch (error) {
			if (spawned.result) return spawned.result
			if (spawned.failure) throw spawned.failure.error
			// Deliberately no error text: it can carry the jar path.
			ytDlpLog.warn('Explore session jar unavailable', {errorName: error instanceof Error ? error.name : typeof error})
			return exploreSessionUnavailable()
		}
	}
	const cookiesArgs = cookies?.kind === 'file' ? ['--cookies', cookies.path] : cookies?.kind === 'browser' ? ['--cookies-from-browser', cookies.browser] : []
	return spawnCollect(opts, strategy, cookiesArgs)
}

async function spawnCollect(opts: InvokeOptions, strategy: RetryStrategy, cookiesArgs: string[]): Promise<YtDlpResult> {
	const extractorArgsArr: string[] = []
	if (strategy.kind === 'pot') {
		if (strategy.reMint) opts.tokenService.invalidateCache()
		const {token, visitorData, fromCache} = await opts.tokenService.getToken()
		if (!fromCache) opts.signal?.onMinting?.(strategy.reMint ? 1 : 0)
		extractorArgsArr.push('--extractor-args', buildPotExtractorArgs(token, visitorData))
	} else if (strategy.kind === 'fallback') {
		extractorArgsArr.push('--extractor-args', PLAYER_CLIENT_FALLBACK)
	}
	// 'noExtractorArgs' → no --extractor-args flag at all. yt-dlp runs vanilla
	// for non-YouTube extractors.

	const proxyArgs = opts.proxyUrl ? ['--proxy', opts.proxyUrl] : []
	// Bandwidth cap (anti-bot lever): only applied to media downloads via the
	// caller — never on probes (we want format JSON instantly) or subtitle
	// sidecar pulls (tiny text, throttling adds zero anti-bot value).
	const limitRateArgs = opts.limitRate ? ['--limit-rate', opts.limitRate] : []
	// yt-dlp 2026+ requires a JS runtime for nsig/signature decoding on the web
	// client. We point yt-dlp at an explicit runtime so it doesn't silently fall
	// back to JS-free clients (where our web.gvs PoT is unused).
	const jsRuntimeArgs = buildYtDlpJsRuntimeArgs(opts.jsRuntime)
	// Pass ffmpeg's location to yt-dlp explicitly instead of relying on the PATH
	// injection in spawnYtDlp. That PATH approach is unreliable inside the packaged
	// Electron portable on Windows: `process.env` can expose the variable as `Path`,
	// so `{ ...process.env }` then `env.PATH = …` writes a *second* key `PATH`
	// holding only ffmpegDir. The child ends up with both `Path=` and `PATH=`, and
	// yt-dlp's frozen-Python `shutil.which('ffmpeg')` reads the original `Path`
	// (without ffmpegDir) → "Preprocessing/Postprocessing: ffmpeg not found".
	const ffmpegLocationArgs = opts.ffmpegPath ? ['--ffmpeg-location', opts.ffmpegPath] : []
	// Force UTF-8 on everything yt-dlp prints. Its write_string() encodes with the
	// console codepage and *drops* what doesn't fit (`s.encode(enc, 'ignore')`), so on
	// a non-UTF-8 Windows console a Persian or CJK title silently vanishes from the
	// `Destination:` / `Writing video subtitles to:` lines — leaving only the ASCII
	// that survived. ProgressParser reads those lines to learn the media and sidecar
	// paths, so it ends up holding a filename that was never written: subtitle
	// post-processing then ENOENTs and the cue-overlap normalization never runs.
	// `--encoding` only reaches yt-dlp's output paths (params['encoding']); filenames
	// on disk and file writes are unaffected.
	const encodingArgs = ['--encoding', 'utf-8']
	const e2eArgs = opts.e2eMode?.ytDlpArgs({isProbe: opts.isProbe === true}) ?? []
	const args = [...e2eArgs, ...encodingArgs, ...ffmpegLocationArgs, ...extractorArgsArr, ...cookiesArgs, ...proxyArgs, ...limitRateArgs, ...jsRuntimeArgs, ...opts.args]
	const jsRuntimeSummary = summarizeYtDlpJsRuntimeForLog(opts.jsRuntime)
	opts.onInvocation?.({ytDlpPath: opts.ytDlpPath, ffmpegPath: opts.ffmpegPath, args: redactArgs(args), jsRuntime: jsRuntimeSummary, attempt: strategy.kind, reMint: strategy.kind === 'pot' ? strategy.reMint : null})

	ytDlpLog.info('spawn', {attempt: strategy.kind, reMint: strategy.kind === 'pot' ? strategy.reMint : undefined, binary: opts.ytDlpPath, ffmpeg: opts.ffmpegPath, ...jsRuntimeSummary, cookies: opts.cookies?.kind ?? null, proxy: opts.proxyForLog ?? null, args: redactArgs(args)})

	const abortSignal = opts.signal?.abortSignal
	// The token mint above can take a while; a pause landing during it stops the run here.
	if (stoppedBeforeSpawn(opts.signal)) {
		return Promise.resolve(cancelledResult())
	}
	const runtime = opts.jsRuntime
	return new Promise<YtDlpResult>(resolve => {
		const proc = spawnYtDlp(opts.ytDlpPath, args, opts.ffmpegPath, opts.e2eMode, runtime ? env => applyJsRuntimeEnv(env, runtime) : undefined)
		let stdout = ''
		let stderr = ''
		let settled = false

		// Decode + reframe both pipes before anyone parses them. Raw chunks split
		// multi-byte characters and cut lines in half; `drainStreams` releases what
		// the readers are still holding so the accumulated text handed to error
		// classification and JSON parsing is complete.
		const stdoutReader = createStreamTextReader()
		const stderrReader = createStreamTextReader()
		const drainStreams = (): void => {
			const out = stdoutReader.flush()
			stdout += out.text
			if (out.lines) opts.signal?.onStdout?.(out.lines)
			const err = stderrReader.flush()
			stderr += err.text
			if (err.lines) opts.signal?.onStderr?.(err.lines)
		}

		// A signed-in run's jar must not outlive its process tree: yt-dlp writes
		// cookies back into the jar, and a PyInstaller build's leader leaves its
		// Python child running when only the leader is killed. So a stopped
		// session run kills the whole tree and settles (releasing the jar) only
		// once the child has closed — bounded, in case close never comes.
		const sessionRun = opts.cookies?.kind === 'session'
		let stopped: YtDlpResult | null = null
		let exitGrace: NodeJS.Timeout | null = null

		const finish = (result: YtDlpResult): void => {
			if (settled) return
			settled = true
			if (timer) clearTimeout(timer)
			if (exitGrace) clearTimeout(exitGrace)
			if (abortSignal && onAbort) abortSignal.removeEventListener('abort', onAbort)
			resolve(ACCOUNT_COOKIES_REJECTED.test(result.stderr) ? {...result, accountCookiesRejected: true} : result)
		}

		const stop = (result: () => YtDlpResult): void => {
			if (settled || stopped) return
			if (sessionRun) {
				killProcessTree(proc, 'SIGKILL')
			} else {
				try {
					proc.kill('SIGKILL')
				} catch {
					/* already exited */
				}
			}
			drainStreams()
			// Detach buffered listeners — the dead proc will eventually fire
			// 'close' (the settled guard absorbs it), but until GC the closure
			// captures stdout/stderr buffers we no longer need.
			proc.stdout.removeAllListeners('data')
			proc.stderr.removeAllListeners('data')
			if (!sessionRun) {
				finish(result())
				return
			}
			stopped = result()
			const pending = stopped
			exitGrace = setTimeout(() => finish(pending), STOPPED_SESSION_EXIT_GRACE_MS)
		}

		// Force-kill if the process exceeds opts.timeoutMs. SIGKILL on win32 is
		// implemented by node as TerminateProcess — the close event still fires,
		// which the `settled` guard absorbs as a no-op.
		const timer = opts.timeoutMs ? setTimeout(() => stop(() => ({kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: PROBE_TIMEOUT_MESSAGE, stdout, stderr})), opts.timeoutMs) : null

		// Caller-driven cancel — kill the child and resolve with a Cancelled
		// exit-error so the wider probe pipeline can categorize and exit cleanly
		// rather than waiting for natural completion.
		const onAbort = abortSignal ? (): void => stop(() => ({kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Cancelled', stdout, stderr})) : null
		if (abortSignal && onAbort) abortSignal.addEventListener('abort', onAbort, {once: true})

		opts.signal?.onSpawn?.(proc)

		proc.stdout.on('data', (chunk: Buffer) => {
			const {text, lines} = stdoutReader.push(chunk)
			stdout += text
			if (lines) opts.signal?.onStdout?.(lines)
		})

		proc.stderr.on('data', (chunk: Buffer) => {
			const {text, lines} = stderrReader.push(chunk)
			stderr += text
			if (lines) opts.signal?.onStderr?.(lines)
		})

		proc.on('error', error => {
			drainStreams()
			finish(stopped ?? {kind: 'spawn-error', error, stdout, stderr})
		})

		proc.on('close', code => {
			if (stopped) {
				finish(stopped)
				return
			}
			drainStreams()
			if (code === 0) {
				finish({
					kind: 'success',
					stdout,
					stderr,
					// 'fallback' is the YouTube degraded-success path (no PoT). The non-YouTube
					// vanilla path ('noExtractorArgs') is not a fallback — the user sees nothing.
					usedExtractorFallback: strategy.kind === 'fallback' || (strategy.kind === 'noExtractorArgs' && strategy.usedExtractorFallback === true)
				})
				return
			}
			finish({kind: 'exit-error', exitCode: code ?? -1, errorKind: classifyYtDlpStderr(stderr).kind, rawError: extractLastError(stderr), stdout, stderr})
		})
	})
}

function finalFallbackStrategy(opts: InvokeOptions): RetryStrategy {
	// An explicit probe player client is already present in plan args. Preserve
	// it on the final no-PoT attempt instead of injecting the generic default
	// client override, which would erase the caller's chosen enrichment client.
	return opts.hasExplicitYoutubePlayerClient === true ? {kind: 'noExtractorArgs', usedExtractorFallback: true} : {kind: 'fallback'}
}

function shouldUsePotLadder(opts: InvokeOptions): boolean {
	// An escalated run is the user's signed-in session; the anonymous token would
	// contradict it, so such runs never get one.
	if (opts.cookies?.kind === 'session') return false
	if (!siteForUrl(opts.url).needsPotToken) return false
	if (opts.isProbe !== true) return true
	return (opts.probePlaylistMode ?? 'auto') === 'video'
}

// 3-attempt ladder (YouTube media and explicit single-video probes only):
//   0. PoT token  → if botBlock, retry
//   1. Re-mint PoT → if still botBlock, fall back
//   2. No PoT, player_client=default,-web,-web_safari  (final attempt)
//
// If the *first* PoT mint throws (provider unavailable, scrape broke), we
// skip the PoT path entirely and go straight to step 2.
//
// Non-YouTube URLs run a single attempt with no --extractor-args. Skipping the
// PoT mint avoids gratuitous HiddenWindow scrapes for sites where the token
// would be ignored.
//
// Playlist-capable probes (--dump-single-json with playlistMode auto/playlist)
// bypass the PoT path. The `visitor_data` arg that travels alongside the PoT
// silently caps YouTube tab pagination at 100 entries (single innertube page)
// regardless of --playlist-end, so a 290-video playlist comes back with
// `entries.length=100` and `playlist_count=290` — visible in user reports as
// "can't fetch more than 100 videos". Explicit single-video probes cannot
// enumerate tabs, so they can use the manual PoT ladder to expose clients and
// formats that require it.
async function invokeWithRetry(opts: InvokeOptions): Promise<YtDlpResult> {
	// Site adapter resolves PoT applicability from the URL hostname. The unified
	// probe pipeline runs before extractor identity is known, so URL-based
	// routing stays the conservative pre-probe signal.
	if (!shouldUsePotLadder(opts)) {
		return invokeOnce(opts, {kind: 'noExtractorArgs'})
	}

	let result: YtDlpResult
	try {
		result = await invokeOnce(opts, {kind: 'pot', reMint: false})
	} catch (err) {
		// The spawn that follows is logged as a plain fallback attempt; without
		// this line nothing in the log says the run lost its token, or why.
		ytDlpLog.warn('PoT unavailable — running without a token', {error: unknownToMessage(err), reMint: false})
		return invokeOnce(opts, finalFallbackStrategy(opts))
	}

	if (result.kind !== 'exit-error' || result.errorKind !== 'botBlock') return result

	try {
		result = await invokeOnce(opts, {kind: 'pot', reMint: true})
	} catch (err) {
		ytDlpLog.warn('PoT unavailable — running without a token', {error: unknownToMessage(err), reMint: true})
		return invokeOnce(opts, finalFallbackStrategy(opts))
	}

	if (result.kind !== 'exit-error' || result.errorKind !== 'botBlock') return result

	return invokeOnce(opts, finalFallbackStrategy(opts))
}

export interface YtDlpRunOptions {
	identity?: RunIdentity
	// The download attempt this run belongs to: signed-in spawns are capped per
	// key. A run without one (a probe) gets a budget of its own.
	jobKey?: string
}

// Only `get()` is read, so a download smoke run can hand in an in-memory overlay.
export type SettingsSource = Pick<SettingsStore, 'get'>

// Whether a run may use the Explore session right now (explore mode, the kill
// switch, a signed-in partition), read live. Structural so this module does not
// import the gate, which imports it.
export interface SessionAuthorization {
	canEscalate(siteId: SiteId): Promise<boolean>
}

export class YtDlp {
	private _ytDlpPath: string | null = null
	private _ffmpegPath: string | null = null
	private _jsRuntime: YtDlpJsRuntime | null = null
	private _lastInvocation: YtDlpInvocationSummary | null = null
	private _lastInvocations: YtDlpInvocationSummary[] = []

	constructor(
		private readonly binaryManager: BinaryManager,
		private readonly tokenService: TokenService,
		private readonly settingsStore: SettingsSource,
		private readonly opts: {e2eMode?: E2eHarnessMode; sessionJars?: SessionCookieJarPort; spawnGate?: Pick<ExploreSpawnGate, 'run' | 'resetJob'>; sessionAuth?: SessionAuthorization} = {}
	) {}

	// Call once at job start to emit binary-setup status events.
	// run() calls this lazily if not yet done; explicit call lets callers
	// emit status events during the download/install progress.
	async prepare(onStatus?: StatusReporter): Promise<void> {
		this._ytDlpPath = await this.binaryManager.ensureYtDlp(onStatus)
		this._ffmpegPath = await this.binaryManager.ensureFFmpeg(onStatus)
		// ffprobe must live in the same dir as ffmpeg so spawnYtDlp's PATH
		// injection picks up both. We don't need to track the path separately —
		// yt-dlp's post-processors discover it via PATH.
		await this.binaryManager.ensureFFprobe(onStatus)
		const electronNode = await probeElectronNodeRuntime()
		if (electronNode.ok) {
			const ytDlpSource = this.binaryManager.getLastDiagnostic?.('yt-dlp')?.source
			this._jsRuntime = {...electronNode.runtime, allowRemoteComponents: shouldAllowRemoteEjsComponents(ytDlpSource)}
			ytDlpLog.info('JS runtime selected', {...summarizeYtDlpJsRuntimeForLog(this._jsRuntime), ...summarizeDependencySourceForLog(ytDlpSource), env: 'ELECTRON_RUN_AS_NODE child-process only'})
			return
		}
		this._jsRuntime = null
		ytDlpLog.error('Electron Node runtime unavailable', {reason: electronNode.reason})
		throw new Error(`Electron Node runtime unavailable: ${electronNode.reason}`)
	}

	get ffmpegPath(): string | null {
		return this._ffmpegPath
	}

	// Drop the cached PO token / visitor_data and mint a new one, so the next run
	// is issued under a new session identity. The bot-wall ladder in
	// invokeWithRetry re-mints on its own; this is the seam for callers that know
	// the *transport* is wedged (see VideoPhase's re-extraction fallback), which
	// the ladder cannot detect because the run exits cleanly on a network error.
	async invalidateTokenSession(signal?: AbortSignal): Promise<boolean> {
		return this.tokenService.resetSession(undefined, signal)
	}

	getLastInvocationSummary(): YtDlpInvocationSummary | null {
		if (!this._lastInvocation) return null
		return {...this._lastInvocation, args: [...this._lastInvocation.args]}
	}

	getLastInvocationSummaries(): YtDlpInvocationSummary[] {
		return this._lastInvocations.map(summary => ({...summary, args: [...summary.args]}))
	}

	async usesCookies(): Promise<boolean> {
		return resolveCookies(await this.settingsStore.get(), 'anonymous', 'youtube') !== null
	}

	async run(req: YtDlpRequest, signal?: YtDlpSignal, options: YtDlpRunOptions = {}): Promise<YtDlpResult> {
		// A job paused (or cancelled) with no live process stops at its next run.
		if (stoppedBeforeSpawn(signal)) return cancelledResult()
		if (!this._ytDlpPath) await this.prepare()
		this._lastInvocation = null
		this._lastInvocations = []
		const settings = await this.settingsStore.get()
		const identity = options.identity ?? 'configured'
		const siteId = siteForUrl(req.url).id
		const cookies = identity === 'none' ? null : resolveCookies(settings, identity === 'exploreSession' ? 'exploreSession' : 'anonymous', siteId)
		// An escalated job must never fall back to running anonymously, nor run unpaced.
		if (identity === 'exploreSession' && (cookies?.kind !== 'session' || !this.opts.sessionJars || !this.opts.spawnGate || !this.opts.sessionAuth)) {
			ytDlpLog.warn('escalated run refused: Explore session unavailable', {resolved: cookies?.kind ?? null, hasJarPort: this.opts.sessionJars !== undefined, hasSpawnGate: this.opts.spawnGate !== undefined, hasSessionAuth: this.opts.sessionAuth !== undefined})
			return exploreSessionUnavailable()
		}
		// The normalized URL, so yt-dlp and the token window read the setting the
		// same way. An unusable value is still handed to yt-dlp as typed: its own
		// error names the problem better than silently dropping the proxy would.
		const proxySetting = parseProxySetting(settings.common?.proxyUrl)
		const proxyUrl = proxySetting.kind === 'proxy' ? proxySetting.url : nonEmpty(settings.common?.proxyUrl?.trim())
		const pacing = resolveNetworkPacing(settings.common)
		const playlistProbeLimit = resolvePlaylistProbeLimit(settings.common)
		const plan = planWorkflow(req, {pacing, playlistProbeLimit, downloadRetryPolicy: this.opts.e2eMode?.downloadRetryPolicy})
		const isProbe = req.kind === 'probe'
		const probePlaylistMode = isProbe ? (req.selection?.playlistMode ?? 'auto') : undefined
		const hasExplicitYoutubePlayerClient = 'extractor' in req && (req.extractor?.youtube?.playerClient?.length ?? 0) > 0
		if (isProbe) {
			ytDlpLog.info('probe request', {url: req.url, playlistMode: probePlaylistMode, playlistScope: plan.facts.playlistScope ?? null})
		}
		// Bandwidth cap applies to media downloads only — probes need raw speed
		// for snappy "Fetch formats" UX, sidecar subs are tiny so throttling
		// wouldn't change YouTube's anti-bot signal.
		const limitRate = plan.facts.isMediaDownload ? nonEmpty(settings.common?.limitRate?.trim()) : undefined
		// A caller-supplied budget wins over the interactive default. Anything
		// non-positive/non-integer falls back to default policy rather than
		// arming a nonsense timer.
		const timeoutOverride = signal?.timeoutMs
		const validOverride = timeoutOverride !== undefined && Number.isInteger(timeoutOverride) && timeoutOverride > 0 ? timeoutOverride : undefined
		const invoke = (): Promise<YtDlpResult> =>
			invokeWithRetry({
				url: req.url,
				ytDlpPath: this._ytDlpPath!,
				ffmpegPath: this._ffmpegPath,
				jsRuntime: this._jsRuntime,
				e2eMode: this.opts.e2eMode,
				args: plan.args,
				tokenService: this.tokenService,
				cookies,
				sessionJars: this.opts.sessionJars,
				proxyUrl,
				proxyForLog: proxyForLog(proxySetting),
				limitRate,
				timeoutMs: validOverride ?? (isProbe ? PROBE_TIMEOUT_MS : undefined),
				isProbe,
				probePlaylistMode,
				hasExplicitYoutubePlayerClient,
				signal,
				onInvocation: summary => {
					this._lastInvocation = summary
					this._lastInvocations.push(summary)
				}
			})
		const spawnGate = this.opts.spawnGate
		// A signed-in probe waits for a slot no longer than its own timeout (R21):
		// it shares the gate with signed-in downloads, which can hold a slot for long.
		const result = identity === 'exploreSession' && spawnGate ? await this.runGated(spawnGate, options.jobKey, signal, isProbe ? (validOverride ?? PROBE_TIMEOUT_MS) : undefined, () => this.invokeIfStillAuthorized(siteId, invoke)) : await invoke()
		// 'spawn-error' is the child failing to start at all — ENOENT, EACCES, a
		// security scanner holding it. That contradicts the recorded probe verdict
		// this path may have been resolved from, so drop it and let the next warmup
		// rather than keep trusting a memo the OS has just disproved.
		//
		// Clearing _ytDlpPath is what makes that invalidation reachable. run()
		// only calls prepare() when the field is null, so leaving it set would
		// route every later attempt straight back to the same dead path and the
		// re-resolve would not happen until the next app launch.
		if (result.kind === 'spawn-error') {
			this._ytDlpPath = null
			await this.binaryManager.forgetProbeVerdict('yt-dlp')
		}
		if (result.kind === 'success' && plan.facts.effectiveSubtitleFormat) {
			return {...result, effectiveSubtitleFormat: plan.facts.effectiveSubtitleFormat}
		}
		return result
	}

	// A signed-in run can wait minutes for a slot. The user may have left explore
	// mode, flipped the kill switch or signed out meanwhile, so the decision is
	// taken again right before the jar is written.
	private async invokeIfStillAuthorized(siteId: SiteId, invoke: () => Promise<YtDlpResult>): Promise<YtDlpResult> {
		const authorized = await this.opts.sessionAuth?.canEscalate(siteId).catch(() => false)
		if (authorized === true) return invoke()
		ytDlpLog.warn('escalated run refused after its slot wait: Explore session no longer authorized', {siteId})
		return exploreSessionUnavailable()
	}

	// `waitBudgetMs` bounds only the wait for a slot; a run that got one is
	// bounded by its own timer as usual.
	private async runGated(gate: Pick<ExploreSpawnGate, 'run' | 'resetJob'>, jobKey: string | undefined, signal: YtDlpSignal | undefined, waitBudgetMs: number | undefined, invoke: () => Promise<YtDlpResult>): Promise<YtDlpResult> {
		const key = jobKey ?? `run:${randomUUID()}`
		const waitExpired = new AbortController()
		const waitTimer = waitBudgetMs === undefined ? undefined : setTimeout(() => waitExpired.abort(), waitBudgetMs)
		const gateSignal = AbortSignal.any([signal?.abortSignal, signal?.pauseSignal, waitExpired.signal].filter(s => s !== undefined))
		try {
			const gated = await gate.run(
				key,
				() => {
					clearTimeout(waitTimer)
					return invoke()
				},
				gateSignal
			)
			if (gated.kind === 'cap-exceeded') {
				ytDlpLog.warn('escalated run refused: signed-in spawn cap reached', {jobKey: key})
				return spawnCapExceeded()
			}
			if (gated.kind !== 'cancelled') return gated
			if (waitExpired.signal.aborted && !stoppedBeforeSpawn(signal)) {
				ytDlpLog.warn('signed-in probe timed out waiting for a spawn slot', {waitBudgetMs})
				return probeTimedOut()
			}
			return cancelledResult()
		} finally {
			clearTimeout(waitTimer)
			if (jobKey === undefined) gate.resetJob(key)
		}
	}
}
