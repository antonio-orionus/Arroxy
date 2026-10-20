import * as Counterscale from '@counterscale/tracker/server'
import type {ServerTrackPageviewOpts} from '@counterscale/tracker/server'
import type {InstallAge} from '@shared/schemas.js'
import type {InstallChannel} from '@shared/types.js'

// Heartbeat: one anonymous Counterscale "pageview" per install per UTC day.
// Counterscale counts every server-side hit as a new visit, so the dashboard's
// daily visitors equal daily active installs. It cannot tell new installs from
// returning ones, so each heartbeat names its own install age instead. Country
// comes from Cloudflare at the collect endpoint; the heartbeat itself carries no
// identifier.
export const HEARTBEAT_URL = 'https://stats.orionus.dev/collect'
export const HEARTBEAT_SITE_ID = 'arroxy'

// Counterscale is built for websites, so the app's fields ride in the slots its
// dashboard already breaks down: the path holds the version, the referrer the
// install age, the UTM fields the rest.
const PAGEVIEW_HOSTNAME = 'desktop.arroxy'
const SEND_TIMEOUT_MS = 5_000

export interface HeartbeatSnapshot {
	appVersion: string
	platform: NodeJS.Platform
	arch: string
	osVersion: string
	installChannel: InstallChannel
	appLocale: string
	osLocale: string
}

// The OS's most preferred language as the OS names it (km-KH, nl-NL), so languages
// the app lacks still show up. Chromium's application locale is only the fallback:
// it reads as en-US for every language Chromium ships no locale for.
export function osLocale(preferredSystemLanguages: readonly string[], chromiumLocale: string): string {
	return preferredSystemLanguages[0] ?? chromiumLocale
}

// UTC days (YYYY-MM-DD) of this install's first and last heartbeat. The first
// is unknown for installs counted before it was recorded.
export interface HeartbeatHistory {
	firstDay?: string
	lastDay?: string
}

export interface HeartbeatDeps {
	send: (pageview: ServerTrackPageviewOpts) => Promise<void>
	now: () => Date
	isEnabled: () => boolean
	snapshot: () => HeartbeatSnapshot
	history: () => HeartbeatHistory
	record: (history: {firstDay?: string; lastDay: string}) => void | Promise<void>
	// Called once per failed day; the heartbeat itself never throws.
	onError?: (error: unknown) => void
	// Called once the request has gone out. The tracker swallows network errors,
	// so this confirms the send, not that the collector received it.
	onSent?: (sent: {day: string; installAge: InstallAge}) => void
}

// `ARROXY_HEARTBEAT_URL=off` keeps any build, a release one included, from
// reporting: test harnesses that launch real release builds set it. Builds
// before this value existed read it as an invalid URL, which also sends nothing.
export const HEARTBEAT_OFF = 'off'

// Only a packaged release build reports to the production collector. Dev, mock,
// smoke and E2E sessions, and any unpackaged build (`electron-vite preview`
// starts no dev server), report nowhere unless a collector is named explicitly.
export function heartbeatUrl({isPackaged, isDev, envUrl}: {isPackaged: boolean; isDev: boolean; envUrl: string | undefined}): string | undefined {
	if (envUrl === HEARTBEAT_OFF) return undefined
	if (envUrl) return isAllowedCollector(envUrl) ? envUrl : undefined
	return isPackaged && !isDev ? HEARTBEAT_URL : undefined
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

// An override is environment input: HTTPS anywhere, plain HTTP only to a local
// test collector, so a heartbeat never crosses the network unencrypted.
function isAllowedCollector(raw: string): boolean {
	if (!URL.canParse(raw)) return false
	const url = new URL(raw)
	return url.protocol === 'https:' || (url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname))
}

// Windows 11 still reports 10.0; build 22000 is the first Windows 11 build.
// Labels carry no spaces: a collector that decodes `+` differently from `%20`
// must still store the same value.
const WINDOWS_11_FIRST_BUILD = 22_000

export function osLabel(platform: NodeJS.Platform, osVersion: string): string {
	const parts = osVersion.split(/[.-]/)
	if (platform === 'darwin') return `macos-${parts[0]}`
	if (platform === 'win32') return Number(parts[2]) >= WINDOWS_11_FIRST_BUILD ? 'windows-11' : 'windows-10'
	if (platform === 'linux') return `linux-${parts[0]}.${parts[1]}`
	return platform
}

const DAY_MS = 86_400_000
const UTC_DAY = /^\d{4}-\d{2}-\d{2}$/

function parseUtcDay(day: string): number | undefined {
	if (!UTC_DAY.test(day)) return undefined
	const time = Date.parse(`${day}T00:00:00Z`)
	// Date.parse rolls impossible dates over (2026-02-30 becomes March 2nd).
	return Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== day ? undefined : time
}

// Coarse on purpose: a bucket is shared by many installs, so it can never
// single one out the way an exact install date could.
export function installAge(firstDay: string | undefined, today: string): InstallAge {
	const first = firstDay === undefined ? undefined : parseUtcDay(firstDay)
	const now = parseUtcDay(today)
	if (first === undefined || now === undefined) return 'existing'
	if (first === now) return 'new'
	// A first day in the future means the clock was set back; the install is not new.
	const days = (now - first) / DAY_MS
	if (days <= 7) return '1-7d'
	if (days <= 30) return '8-30d'
	if (days <= 90) return '31-90d'
	return 'over-90d'
}

export function buildHeartbeatPageview(snapshot: HeartbeatSnapshot, age: InstallAge): ServerTrackPageviewOpts {
	return {url: `/${snapshot.appVersion}`, hostname: PAGEVIEW_HOSTNAME, referrer: age, utmSource: snapshot.installChannel, utmMedium: `${snapshot.platform}-${snapshot.arch}`, utmCampaign: osLabel(snapshot.platform, snapshot.osVersion), utmTerm: snapshot.appLocale, utmContent: snapshot.osLocale}
}

// The tracker never throws on network errors; it resolves once the request
// settles or times out.
export function counterscaleSender(reporterUrl: string, siteId: string): HeartbeatDeps['send'] {
	Counterscale.init({siteId, reporterUrl, timeout: SEND_TIMEOUT_MS})
	return pageview => Counterscale.trackPageview(pageview)
}

function utcDay(date: Date): string {
	return date.toISOString().slice(0, 10)
}

export function createHeartbeat(deps: HeartbeatDeps): {maybeSend: () => Promise<boolean>} {
	let inFlight = false
	// Kept in memory too, so a day whose record could not be saved is still tried
	// only once: a broken settings file must not turn into an hourly retry.
	let attemptedDay: string | undefined
	return {
		async maybeSend() {
			if (inFlight) return false
			inFlight = true
			try {
				if (!deps.isEnabled()) return false
				const day = utcDay(deps.now())
				const history = deps.history()
				if (attemptedDay === day || history.lastDay === day) return false
				attemptedDay = day
				// An install that never sent a heartbeat starts today. One that sent
				// before first days were recorded keeps an unknown age.
				const firstDay = history.firstDay ?? (history.lastDay === undefined ? day : undefined)
				// Record first: a heartbeat is fire-and-forget, and a lost one is better
				// than a day counted twice.
				await deps.record({firstDay, lastDay: day})
				const age = installAge(firstDay, day)
				await deps.send(buildHeartbeatPageview(deps.snapshot(), age))
				deps.onSent?.({day, installAge: age})
				return true
			} catch (error) {
				deps.onError?.(error)
				return false
			} finally {
				inFlight = false
			}
		}
	}
}
