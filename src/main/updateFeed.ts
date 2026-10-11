// Where electron-updater looks for releases. Production always reads GitHub
// Releases; ARROXY_UPDATE_FEED_URL points a build at a local feed so an update
// can be exercised end-to-end without publishing anything (see
// scripts/vm/ubu-update-test.sh). The override is honoured only for loopback
// hosts, so even a shipped build can never be redirected to a remote server
// through the environment.

export type UpdateFeed = {provider: 'github'; owner: string; repo: string; channel: string} | {provider: 'generic'; url: string; channel: string}

// A rejected value is not carried along: it may hold credentials, and nothing
// downstream needs it.
export interface ResolvedUpdateFeed {
	kind: 'github' | 'override' | 'rejected'
	feed: UpdateFeed
}

const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(['127.0.0.1', 'localhost', '[::1]'])

function isLoopbackHttpUrl(value: string): boolean {
	if (!URL.canParse(value)) return false
	const url = new URL(value)
	return (url.protocol === 'http:' || url.protocol === 'https:') && url.username === '' && url.password === '' && LOOPBACK_HOSTS.has(url.hostname)
}

export function resolveUpdateFeed(env: NodeJS.ProcessEnv, channel: string): ResolvedUpdateFeed {
	const github: UpdateFeed = {provider: 'github', owner: 'antonio-orionus', repo: 'Arroxy', channel}
	const override = env.ARROXY_UPDATE_FEED_URL
	if (!override) return {kind: 'github', feed: github}
	if (!isLoopbackHttpUrl(override)) return {kind: 'rejected', feed: github}
	return {kind: 'override', feed: {provider: 'generic', url: override, channel}}
}
