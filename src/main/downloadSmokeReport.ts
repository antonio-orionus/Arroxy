import type {CookiesMode} from '@shared/schemas.js'
import type {SelectedFormat} from './services/download/formatLimitSignals.js'
import type {YtDlpInvocationSummary} from './services/YtDlp.js'

export const DOWNLOAD_SMOKE_RESULT_PREFIX = 'ARROXY_DOWNLOAD_SMOKE_RESULT '

// Exit code reports whether the tool worked (a format was selected), never the
// resulting quality — quality is read from `selection`.
export type DownloadSmokeOutcome = 'format-selected' | 'ytdlp-error' | 'timeout' | 'setup-error'

export interface DownloadSmokeReport {
	downloadSmoke: true
	ok: boolean
	outcome: DownloadSmokeOutcome
	appVersion: string
	platform: NodeJS.Platform
	arch: string
	url: string
	// `cookies` is a redacted label (settings / off / browser:<name> / file), never a path.
	inputs: {cookies: string; proxy: 'settings' | 'off' | 'set'; profileId: string; youtubePlayerClients: string[] | 'production-default'}
	effective: {cookiesMode: CookiesMode; proxyConfigured: boolean; formatSelector: string | null; formatSort: string | null}
	selection: {selectedFormat: string | null; formats: SelectedFormat[] | null; maxHeight: number | null}
	observed: {playerApiClients: string[]; sabrSkippedClients: string[]; warnings: string[]}
	// What the last spawn actually passed, read back from its argv — proof that
	// an override reached yt-dlp rather than just the settings overlay.
	spawned: SpawnArgsSummary | null
	attempts: YtDlpInvocationSummary[]
	error: string | null
	durationMs: number
}

export interface SpawnArgsSummary {
	cookies: 'none' | 'file' | 'browser'
	proxy: boolean
	poToken: boolean
	// null when no player_client was passed and yt-dlp chose its own.
	playerClients: string[] | null
}

const PLAYER_CLIENT_ARG = /^youtube:player_client=(.+)$/

// Works on redacted argv: secret values are hidden but their flags remain.
export function summarizeSpawnArgs(args: readonly string[]): SpawnArgsSummary {
	const extractorArgs = args.flatMap((arg, i) => (arg === '--extractor-args' && args[i + 1] !== undefined ? [args[i + 1]] : []))
	const playerClientArg = extractorArgs.map(arg => PLAYER_CLIENT_ARG.exec(arg)?.[1]).find(value => value !== undefined)
	return {cookies: args.includes('--cookies-from-browser') ? 'browser' : args.includes('--cookies') ? 'file' : 'none', proxy: args.includes('--proxy'), poToken: extractorArgs.some(arg => arg.includes('po_token=')), playerClients: playerClientArg === undefined ? null : playerClientArg.split(',')}
}

export function serializeDownloadSmokeReport(report: DownloadSmokeReport): string {
	return `${DOWNLOAD_SMOKE_RESULT_PREFIX}${JSON.stringify(report)}`
}
