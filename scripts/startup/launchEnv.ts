// `HEARTBEAT_OFF` in src/main/services/heartbeat.ts. Every shipped build that
// sends a heartbeat stops on this value: newer ones read it as off, older ones
// as an invalid collector URL.
const HEARTBEAT_OFF = 'off'

// The environment for a launch of a real packaged build (this build's journeys,
// or the previous release writing the inherited profile). The launch must stay
// unmocked, and it must never be counted as an install on the production
// heartbeat dashboard: CI runs these on every PR.
export function packagedLaunchEnv(profileDir: string, overrides: Readonly<Record<string, string>> = {}): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {...process.env, ARROXY_HEARTBEAT_URL: HEARTBEAT_OFF, ...overrides, ELECTRON_USER_DATA: profileDir}

	// ELECTRON_RUN_AS_NODE turns the app into a bare Node process — it must never
	// reach the app itself, only yt-dlp's child env (see AGENTS.md).
	delete env.ELECTRON_RUN_AS_NODE

	// ARROXY_E2E would swap in MockTokenProvider and the fixture yt-dlp plugin,
	// mocking away the very branches these launches exist to verify; MOCK_BACKEND
	// would stub the backend the same way.
	delete env.ARROXY_E2E
	delete env.MOCK_BACKEND

	return env
}
