import type {LogPolicy} from './logOracle.js'

export type StartupTier = 'pr' | 'release' | 'nightly'
export type ProfileKind = 'empty' | 'inherited' | 'warm' | 'corrupt'
export type ExpectedOutcome = 'main-screen' | 'repair-panel'

export interface StartupJourney {
	id: string
	description: string
	profile: ProfileKind
	env: Readonly<Record<string, string>>
	/** Fake node/deno/yt-dlp on PATH — applied to the CHILD env only, never $GITHUB_PATH. */
	pathContamination?: boolean
	network?: 'online' | 'offline'
	expect: ExpectedOutcome
	logPolicy: LogPolicy
	tiers: readonly StartupTier[]
}

const CLEAN: LogPolicy = {allowedWarnings: []}

export const JOURNEYS: readonly StartupJourney[] = [
	{id: 'fresh-cold', description: 'First launch ever: no profile, no runtime cache, managed yt-dlp downloaded from scratch.', profile: 'empty', env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['pr', 'release']},
	{id: 'warm-restart', description: 'Second launch against a populated runtime cache — the path most users hit daily.', profile: 'warm', env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['pr', 'release']},
	{id: 'inherited-update', description: 'This build launched against a profile written by the previous release.', profile: 'inherited', env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['release']},
	{id: 'index-off', description: 'Remote runtime index unreachable; must fall back to last-known-good or bundled index.', profile: 'warm', env: {ARROXY_RUNTIME_INDEX_URL: 'off'}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['nightly']},
	{id: 'no-gpu', description: 'Software rendering only — backdrop must fall back without blocking startup.', profile: 'warm', env: {ARROXY_GPU_MODE: 'software'}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['nightly']},
	{id: 'contaminated-path', description: 'Stale node/deno and a broken yt-dlp on PATH; the app must still resolve its own binaries.', profile: 'warm', env: {}, pathContamination: true, expect: 'main-screen', logPolicy: CLEAN, tiers: ['nightly']},
	{
		id: 'offline-no-cache',
		description: 'No network and no cached binaries — must surface the repair panel, not hang on the splash.',
		profile: 'empty',
		env: {ARROXY_RUNTIME_INDEX_URL: 'off'},
		network: 'offline',
		expect: 'repair-panel',
		logPolicy: {allowedWarnings: [/runtime binary/i, /download/i, /probe/i]},
		tiers: ['nightly']
	},
	{id: 'corrupt-profile', description: 'Malformed settings.json and queue.json must not prevent reaching the main screen.', profile: 'corrupt', env: {}, expect: 'main-screen', logPolicy: {allowedWarnings: [/settings/i, /queue/i, /parse/i]}, tiers: ['nightly']}
]

export function journeysForTier(tier: StartupTier): StartupJourney[] {
	return JOURNEYS.filter(journey => journey.tiers.includes(tier))
}
