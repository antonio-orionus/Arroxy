import type {LogPolicy} from './logOracle.js'

export type StartupTier = 'pr' | 'release' | 'nightly'
export const TIERS_UNDER_TEST: readonly StartupTier[] = ['pr', 'release', 'nightly']

/** The provisioner's dispatch key. `ProfileSpec` is what a journey declares. */
export type ProfileKind = 'empty' | 'inherited' | 'warm' | 'corrupt'

/**
 * A `warm` profile names the journey it is cloned from. Ordering used to be an
 * array-position convention guarded by a comment; the nightly tier silently
 * declared three warm journeys and no seeder, and it took three CI runners to
 * find out. Naming the seeder makes that a preflight failure instead.
 */
export type ProfileSpec = {kind: 'empty'} | {kind: 'corrupt'} | {kind: 'inherited'} | {kind: 'warm'; from: string}
export type ExpectedOutcome = 'main-screen' | 'repair-panel'

export interface StartupJourney {
	id: string
	description: string
	profile: ProfileSpec
	env: Readonly<Record<string, string>>
	/** Fake node/deno/yt-dlp on PATH — applied to the CHILD env only, never $GITHUB_PATH. */
	pathContamination?: boolean
	expect: ExpectedOutcome
	logPolicy: LogPolicy
	tiers: readonly StartupTier[]
}

const CLEAN: LogPolicy = {allowedWarnings: [], allowedErrors: []}

export const JOURNEYS: readonly StartupJourney[] = [
	{id: 'fresh-cold', description: 'First launch ever: no profile, no runtime cache, managed yt-dlp downloaded from scratch.', profile: {kind: 'empty'}, env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['pr', 'release', 'nightly']},
	{id: 'warm-restart', description: 'Second launch against a populated runtime cache — the path most users hit daily.', profile: {kind: 'warm', from: 'fresh-cold'}, env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['pr', 'release']},
	{id: 'inherited-update', description: 'This build launched against a profile written by the previous release.', profile: {kind: 'inherited'}, env: {}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['release']},
	{id: 'index-off', description: 'Remote runtime index unreachable; must fall back to last-known-good or bundled index.', profile: {kind: 'warm', from: 'fresh-cold'}, env: {ARROXY_RUNTIME_INDEX_URL: 'off'}, expect: 'main-screen', logPolicy: CLEAN, tiers: ['nightly']},
	{
		id: 'no-gpu',
		description: 'Software rendering only — backdrop must fall back without blocking startup.',
		profile: {kind: 'warm', from: 'fresh-cold'},
		env: {ARROXY_GPU_MODE: 'software'},
		expect: 'main-screen',
		logPolicy: {allowedWarnings: [/gpu info failed .*disabled through commandline switch/i], allowedErrors: []},
		tiers: ['nightly']
	},
	{id: 'contaminated-path', description: 'Stale node/deno and a broken yt-dlp on PATH; the app must still resolve its own binaries.', profile: {kind: 'warm', from: 'fresh-cold'}, env: {}, pathContamination: true, expect: 'main-screen', logPolicy: CLEAN, tiers: ['nightly']},
	{id: 'corrupt-profile', description: 'Malformed settings.json and queue.json must not prevent reaching the main screen.', profile: {kind: 'corrupt'}, env: {}, expect: 'main-screen', logPolicy: {allowedWarnings: [/settings/i, /queue/i, /parse/i], allowedErrors: []}, tiers: ['nightly']}
]

export function journeysForTier(tier: StartupTier): StartupJourney[] {
	return JOURNEYS.filter(journey => journey.tiers.includes(tier))
}

/**
 * Runs before any launch. A tier that selects a warm journey without its seeder
 * ahead of it is not runnable, and must say so in one line rather than burning
 * a runner per platform to discover it.
 */
export function validateJourneySequence(journeys: readonly StartupJourney[], tier: StartupTier): string[] {
	if (journeys.length === 0) return [`tier "${tier}" selects no journeys`]

	const problems: string[] = []
	const earlier = new Set<string>()
	for (const journey of journeys) {
		if (journey.profile.kind === 'warm' && !earlier.has(journey.profile.from)) {
			problems.push(`${journey.id}: warm profile is seeded from "${journey.profile.from}", which does not run earlier in tier "${tier}"`)
		}
		earlier.add(journey.id)
	}
	return problems
}

export function validateTier(tier: StartupTier): string[] {
	return validateJourneySequence(journeysForTier(tier), tier)
}
