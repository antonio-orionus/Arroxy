import {OpenPanel} from '@openpanel/sdk'

type Props = Record<string, string | number | boolean>
type CrashReason = 'clean-exit' | 'abnormal-exit' | 'killed' | 'crashed' | 'oom' | 'launch-failed' | 'integrity-failure' | 'memory-eviction'
type ChildProcessType = 'Utility' | 'Zygote' | 'Sandbox helper' | 'GPU' | 'Pepper Plugin' | 'Pepper Plugin Broker' | 'Unknown'
type RendererWindowRole = 'main-window' | 'auxiliary-window'

type CrashDetectedInput = {kind: 'renderer'; windowRole: RendererWindowRole; reason: Exclude<CrashReason, 'clean-exit'>} | {kind: 'child'; type: ChildProcessType; reason: Exclude<CrashReason, 'clean-exit'>; name?: string; serviceName?: string}

export interface DeviceInfo {
	appVersion: string
	platform: NodeJS.Platform
	architecture: string
	systemVersion: string
	modelName: string
	// Raw OS/Electron-detected locale (e.g. `app.getLocale()`).
	osLocale: string
	// User's in-app language override from Settings; falls back to OS locale.
	appLocale: string
}

const ALLOWED: Record<string, readonly string[]> = {
	app_started: ['install_channel', 'platform_arch', 'is_first_run'],
	update_available: ['to_version', 'install_channel'],
	update_install_clicked: ['install_channel'],
	format_probed: ['duration_bucket', 'bot_wall', 'cookies_mode', 'result_kind'],
	probe_failed: ['duration_bucket', 'error_category', 'cookies_mode'],
	download_started: ['preset', 'has_subtitles', 'has_sponsorblock', 'cookies_mode', 'embed_metadata', 'embed_thumbnail'],
	download_finished: ['duration_bucket', 'size_bucket'],
	download_cancelled: ['duration_bucket'],
	download_failed: ['duration_bucket', 'size_bucket', 'error_category'],
	tray_close_chosen: ['choice', 'remember'],
	binary_setup_failed: ['binary', 'phase', 'code', 'error_code', 'status_code', 'operation', 'setup_step', 'source_kind', 'source_channel', 'elapsed_ms'],
	crash_detected: ['type', 'reason'],
	wizard_started: [],
	share_dialog_opened: ['via'],
	share_dialog_closed: ['via', 'clicked'],
	share_destination_clicked: ['destination'],
	share_link_copied: [],
	share_inline_card_dismissed: [],
	share_prompt_dismissed: ['via']
}

const MAX_STR = 32

function mapOperatingSystem(platform: NodeJS.Platform): string {
	if (platform === 'darwin') return 'macOS'
	if (platform === 'win32') return 'Windows'
	if (platform === 'linux') return 'Linux'
	return platform
}

// Build a browser-like User-Agent. OpenPanel's ingest classifies events as
// client vs. server purely from the request's User-Agent header (parsed via
// UAParser): a generic Node fetch UA matches its server-event regex, so the
// server skips sessionId/deviceId/os/browser. Sending a Chrome-shaped UA makes
// it parse correctly and mint a session.
function darwinReleaseToMacOsUserAgentVersion(systemVersion: string | undefined): string {
	if (!systemVersion) return '10_15_7'
	const parts = systemVersion.split('.').map(part => Number.parseInt(part, 10))
	const major = parts[0]
	if (!Number.isFinite(major)) return '10_15_7'
	const minor = Number.isFinite(parts[1]) ? parts[1] : 0
	const patch = Number.isFinite(parts[2]) ? parts[2] : 0
	if (major >= 20) return `${major - 9}_${minor}_${patch}`
	if (major === 19) return `10_15_${minor}`
	if (major >= 4) return `10_${major - 4}_${minor}`
	return '10_15_7'
}

function buildBrowserishUserAgent(info?: DeviceInfo): string {
	const chromeVersion = process.versions.chrome ?? '124.0.0.0'
	const platform = info?.platform ?? process.platform
	const arch = info?.architecture ?? process.arch
	let osPart: string
	if (platform === 'win32') {
		osPart = 'Windows NT 10.0; Win64; x64'
	} else if (platform === 'darwin') {
		osPart = `Macintosh; Intel Mac OS X ${darwinReleaseToMacOsUserAgentVersion(info?.systemVersion)}`
	} else {
		const linuxArch = arch === 'arm64' ? 'aarch64' : 'x86_64'
		osPart = `X11; Linux ${linuxArch}`
	}
	const appVer = info?.appVersion ?? '0.0.0'
	return `Mozilla/5.0 (${osPart}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36 Arroxy/${appVer}`
}

function buildDefaultPayload(info: DeviceInfo): Record<string, string> {
	const segs = info.systemVersion.split('.')
	const major = segs[0] ?? ''
	const majorMinor = segs.length >= 2 ? `${segs[0]}.${segs[1]}` : major
	return {
		app_version: info.appVersion,
		build_number: info.appVersion,
		platform: info.platform,
		operating_system: mapOperatingSystem(info.platform),
		system_version: info.systemVersion,
		major_system_version: major,
		major_minor_system_version: majorMinor,
		architecture: info.architecture,
		model_name: info.modelName.slice(0, 64),
		os_locale: info.osLocale,
		app_locale: info.appLocale,
		sdk_client_version: `arroxy/${info.appVersion}`
	}
}

let _dev = false
let _op: OpenPanel | null = null
let _on = false
const _seenCrashSignatures = new Set<string>()

// Initialize OpenPanel. Plain HTTPS POST — safe to call from app.whenReady()
// after settings load.
//
// In dev we stay fully offline by default — HMR reloads would otherwise spam
// `wizard_started` / `app_started` and pollute prod stats. Set
// ARROXY_ANALYTICS_DEBUG=1 to opt in.
export function setupAnalytics(clientId: string | undefined, clientSecret: string | undefined, isDev: boolean, installId: string, deviceInfo?: DeviceInfo): void {
	_dev = isDev
	_op = null
	_on = false
	_seenCrashSignatures.clear()
	if (!clientId || !clientSecret) return
	const debugOptIn = process.env.ARROXY_ANALYTICS_DEBUG === '1'
	if (isDev && !debugOptIn) return
	_op = new OpenPanel({
		clientId,
		clientSecret,
		sdk: 'web',
		sdkVersion: '1.3.1',
		// Runtime gate via filter — `disabled` queues instead of dropping, which
		// isn't what we want when the user opts out.
		filter: () => _on
	})
	// Override the request User-Agent so OpenPanel ingest classifies events as
	// client (mints sessionId/deviceId, parses os/browser). See
	// buildBrowserishUserAgent for the why.
	_op.api.addHeader('user-agent', buildBrowserishUserAgent(deviceInfo))
	if (deviceInfo) {
		const payload = buildDefaultPayload(deviceInfo)
		_op.setGlobalProperties(payload)
		void _op.identify({profileId: installId, properties: payload})
	} else {
		void _op.identify({profileId: installId})
	}
}

export function setAnalyticsEnabled(enabled: boolean): void {
	_on = enabled
}

// --- Bucketing helpers ---

export function probeDurationBucket(ms: number): string {
	if (ms < 2_000) return '<2s'
	if (ms < 5_000) return '2-5s'
	if (ms < 15_000) return '5-15s'
	return '>15s'
}

export function downloadDurationBucket(ms: number): string {
	if (ms < 30_000) return '<30s'
	if (ms < 120_000) return '30s-2m'
	if (ms < 600_000) return '2-10m'
	if (ms < 1_800_000) return '10-30m'
	return '>30m'
}

export function sizeBucket(bytes: number): string {
	const MB = 1_048_576
	if (bytes < 50 * MB) return '<50MB'
	if (bytes < 500 * MB) return '50-500MB'
	if (bytes < 2_048 * MB) return '500MB-2GB'
	return '>2GB'
}

// --- Core track function ---

export function trackMain(name: string, props?: Props): boolean {
	const keys = ALLOWED[name]
	if (keys === undefined) {
		if (_dev) throw new Error(`[analytics] unknown event: "${name}"`)
		return false
	}
	if (props) {
		for (const [k, v] of Object.entries(props)) {
			if (!keys.includes(k)) {
				if (_dev) throw new Error(`[analytics] prop "${k}" not allowed on event "${name}"`)
				return false
			}
			if (typeof v === 'string' && v.length > MAX_STR) {
				if (_dev) throw new Error(`[analytics] prop "${k}" value too long (${v.length} > ${MAX_STR})`)
				return false
			}
		}
	}
	if (!_op || !_on) return false
	void _op.track(name, props)
	return true
}

function normalizeCrashSignaturePart(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function crashSignature(input: CrashDetectedInput): string {
	if (input.kind === 'renderer') {
		return `renderer|${normalizeCrashSignaturePart(input.reason)}`
	}

	return `child|${normalizeCrashSignaturePart(input.type)}|${normalizeCrashSignaturePart(input.reason)}`
}

export function trackCrashDetectedOncePerSession(input: CrashDetectedInput): void {
	const signature = crashSignature(input)
	if (_seenCrashSignatures.has(signature)) return

	const didTrack = input.kind === 'renderer' ? trackMain('crash_detected', {type: 'renderer', reason: input.reason}) : trackMain('crash_detected', {type: input.type, reason: input.reason})

	if (didTrack) {
		_seenCrashSignatures.add(signature)
	}
}
