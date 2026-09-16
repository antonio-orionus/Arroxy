// Headless download smoke: runs the production media request for one URL with
// one input varied (cookies / proxy / profile / player clients), stops once
// yt-dlp has chosen formats, and prints a JSON report. Triggered by
// ARROXY_SMOKE_KIND=download. Never persists settings.
import {mkdir, mkdtemp, readFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {app} from 'electron'
import {DEFAULTS} from '@shared/constants.js'
import {allDownloadProfiles, resolveActiveDownloadProfile, resolveDownloadProfile} from '@shared/downloadProfiles.js'
import {prepareJob} from '@shared/prepareJob.js'
import type {AppSettings} from '@shared/types.js'
import type {E2eHarnessMode} from './e2eHarness.js'
import {applyDownloadSmokeOverrides, type DownloadSmokeConfig} from './downloadSmokeConfig.js'
import {createDownloadSmokeObserver} from './downloadSmokeOutput.js'
import {serializeDownloadSmokeReport, summarizeSpawnArgs, type DownloadSmokeReport} from './downloadSmokeReport.js'
import type {BinaryManager} from './services/BinaryManager.js'
import {TokenService} from './services/TokenService.js'
import {YtDlp, type SettingsSource, type YtDlpResult} from './services/YtDlp.js'
import {parseSelectedFormats, selectedMaxHeight} from './services/download/formatLimitSignals.js'
import {buildMediaRequest} from './services/phases/mediaRequest.js'
import type {SettingsStore} from './stores/SettingsStore.js'
import {HiddenWindowTokenProvider} from './token/providers/HiddenWindowTokenProvider.js'
import {MockTokenProvider} from './token/providers/MockTokenProvider.js'

// Must match the info-json base name the bridge writes into the temp directory.
const INFO_JSON_NAME = '_arroxy.info.json'

function out(line: string): void {
	process.stdout.write(line + '\n')
}

export function reportDownloadSmokeConfigError(error: string): number {
	out(`  FAIL  download smoke config  ${error}`)
	return 1
}

function cookiesLabel(config: DownloadSmokeConfig): string {
	return config.cookies.kind === 'browser' ? `browser:${config.cookies.browser}` : config.cookies.kind
}

function initialReport(config: DownloadSmokeConfig, settings: AppSettings, profileId: string): DownloadSmokeReport {
	return {
		downloadSmoke: true,
		ok: false,
		outcome: 'setup-error',
		appVersion: app.getVersion(),
		platform: process.platform,
		arch: process.arch,
		url: config.url,
		inputs: {cookies: cookiesLabel(config), proxy: config.proxy.kind === 'url' ? 'set' : config.proxy.kind, profileId, youtubePlayerClients: config.youtubePlayerClients ? [...config.youtubePlayerClients] : 'production-default'},
		effective: {cookiesMode: settings.common.cookiesMode ?? 'off', proxyConfigured: Boolean(settings.common.proxyUrl?.trim()), formatSelector: null, formatSort: null},
		selection: {selectedFormat: null, formats: null, maxHeight: null},
		observed: {playerApiClients: [], sabrSkippedClients: [], warnings: []},
		spawned: null,
		attempts: [],
		error: null,
		durationMs: 0
	}
}

function resultError(result: YtDlpResult): string | null {
	if (result.kind === 'success') return null
	if (result.kind === 'spawn-error') return result.error.message
	return result.rawError ?? `exit ${result.exitCode}`
}

function finish(report: DownloadSmokeReport, started: number): number {
	report.durationMs = Date.now() - started
	const s = report.selection
	out(`  ${report.ok ? 'PASS' : 'FAIL'}  download smoke  outcome=${report.outcome} format=${s.selectedFormat ?? '-'} maxHeight=${s.maxHeight ?? '-'} sabrSkipped=${report.observed.sabrSkippedClients.join(',') || '-'}`)
	out(serializeDownloadSmokeReport(report))
	return report.ok ? 0 : 1
}

export async function runDownloadSmokeMode(deps: {config: DownloadSmokeConfig; binaryManager: BinaryManager; settingsStore: SettingsStore; e2eMode: E2eHarnessMode}): Promise<number> {
	const {config, binaryManager, e2eMode} = deps
	const started = Date.now()
	const settings = applyDownloadSmokeOverrides(await deps.settingsStore.get(), config)
	const source: SettingsSource = {get: () => Promise.resolve(settings)}
	// Its own token window, reading the overlaid proxy — the production provider
	// reads the persisted one. Fixture E2E runs swap in the mock provider, as the
	// app itself does, so a smoke against the fixture extractor never reaches YouTube.
	const tokenService = new TokenService(e2eMode.useMockTokenProvider ? new MockTokenProvider() : new HiddenWindowTokenProvider(() => settings.common.proxyUrl))
	const ytDlp = new YtDlp(binaryManager, tokenService, source, {e2eMode})
	const profile = config.profileId ? allDownloadProfiles(settings.profiles).find(p => p.id === config.profileId) : resolveActiveDownloadProfile(settings.profiles).profile
	const report = initialReport(config, settings, profile?.id ?? config.profileId ?? '')
	const nativeAudioPreference = settings.common.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const tempRoot = await mkdtemp(join(tmpdir(), 'arroxy-download-smoke-'))
	try {
		if (!profile) {
			report.error = `unknown profile "${config.profileId}"`
			return finish(report, started)
		}
		const {intent, embed} = resolveDownloadProfile(profile, undefined, nativeAudioPreference)
		if (!intent) {
			report.error = `profile "${profile.id}" has no media intent (subtitles-only?)`
			return finish(report, started)
		}
		// The playlist/profile path, as in the report that motivated this tool.
		// Subtitles and SponsorBlock are separate phases or post-processing and do
		// not affect format selection, so they stay off.
		const job = prepareJob({mode: 'playlist', extractor: 'youtube', extractorKey: 'Youtube', mediaIntent: intent, nativeAudioPreference, filenameTemplate: '{title} [{id}]', sponsorBlockMode: 'off', sponsorBlockCategories: [], embed})
		if (job.kind !== 'ranged-format') throw new Error(`invariant: playlist prepareJob returned ${job.kind}`)
		report.effective.formatSelector = job.formatSelector ?? null
		report.effective.formatSort = job.formatSort ?? null

		const tempDir = join(tempRoot, 'job')
		await mkdir(tempDir, {recursive: true})
		const req = buildMediaRequest({url: config.url, job, outputDir: tempRoot, tempDir, embed: false, ...(config.youtubePlayerClients ? {youtubePlayerClients: config.youtubePlayerClients} : {})})

		const observer = createDownloadSmokeObserver()
		const controller = new AbortController()
		let timedOut = false
		const timer = setTimeout(() => {
			timedOut = true
			controller.abort()
		}, config.timeoutMs)
		const onText = (text: string): void => {
			observer.push(text)
			if (observer.snapshot().shouldStop && !controller.signal.aborted) controller.abort()
		}
		const result = await ytDlp.run(req, {abortSignal: controller.signal, onStdout: onText, onStderr: onText}).finally(() => clearTimeout(timer))

		const seen = observer.snapshot()
		report.observed = {playerApiClients: seen.playerApiClients, sabrSkippedClients: seen.sabrSkippedClients, warnings: seen.warnings}
		report.attempts = ytDlp.getLastInvocationSummaries()
		const lastAttempt = report.attempts.at(-1)
		report.spawned = lastAttempt ? summarizeSpawnArgs(lastAttempt.args) : null
		report.selection.selectedFormat = seen.selectedFormat
		const infoJson = await readFile(join(tempDir, INFO_JSON_NAME), 'utf8').catch(() => null)
		const formats = infoJson ? parseSelectedFormats(infoJson) : null
		report.selection.formats = formats
		report.selection.maxHeight = selectedMaxHeight(formats)

		report.outcome = seen.selectedFormat ? 'format-selected' : timedOut ? 'timeout' : 'ytdlp-error'
		report.ok = report.outcome === 'format-selected'
		if (!report.ok) report.error = resultError(result)
		return finish(report, started)
	} catch (err) {
		report.error = err instanceof Error ? err.message : String(err)
		return finish(report, started)
	} finally {
		tokenService.dispose()
		// The killed yt-dlp can still hold .part files briefly on Windows.
		await rm(tempRoot, {recursive: true, force: true, maxRetries: 5, retryDelay: 200}).catch(() => undefined)
	}
}
