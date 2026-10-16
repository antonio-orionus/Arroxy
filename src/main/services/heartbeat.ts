import * as Counterscale from '@counterscale/tracker/server'
import type {ServerTrackPageviewOpts} from '@counterscale/tracker/server'
import type {InstallChannel} from '@shared/types.js'

// Heartbeat: one anonymous Counterscale "pageview" per install per UTC day.
// Counterscale counts every server-side hit as a new visit, so the dashboard's
// daily visitors equal daily active installs. Country comes from Cloudflare at
// the collect endpoint; the heartbeat itself carries no identifier.
export const HEARTBEAT_URL = 'https://stats.orionus.dev/collect'
export const HEARTBEAT_SITE_ID = 'arroxy'

// Counterscale is built for websites, so the app's fields ride in the slots its
// dashboard already breaks down: the path holds the version, the UTM fields the rest.
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

export interface HeartbeatDeps {
	send: (pageview: ServerTrackPageviewOpts) => Promise<void>
	now: () => Date
	isEnabled: () => boolean
	snapshot: () => HeartbeatSnapshot
	lastDay: () => string | undefined
	recordDay: (day: string) => void | Promise<void>
	// Called once per failed day; the heartbeat itself never throws.
	onError?: (error: unknown) => void
}

// Release builds report to the production collector; dev, mock, smoke and E2E
// sessions report nowhere unless a collector is named explicitly.
export function heartbeatUrl({isDev, envUrl}: {isDev: boolean; envUrl: string | undefined}): string | undefined {
	if (envUrl) return envUrl
	return isDev ? undefined : HEARTBEAT_URL
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

export function buildHeartbeatPageview(snapshot: HeartbeatSnapshot): ServerTrackPageviewOpts {
	return {url: `/${snapshot.appVersion}`, hostname: PAGEVIEW_HOSTNAME, utmSource: snapshot.installChannel, utmMedium: `${snapshot.platform}-${snapshot.arch}`, utmCampaign: osLabel(snapshot.platform, snapshot.osVersion), utmTerm: snapshot.appLocale, utmContent: snapshot.osLocale}
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
				if (attemptedDay === day || deps.lastDay() === day) return false
				attemptedDay = day
				// Record first: a heartbeat is fire-and-forget, and a lost one is better
				// than a day counted twice.
				await deps.recordDay(day)
				await deps.send(buildHeartbeatPageview(deps.snapshot()))
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
