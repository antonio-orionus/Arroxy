import {randomUUID} from 'node:crypto'
import log from 'electron-log/main.js'
import type {SiteCooldown} from '@shared/schemas.js'
import {ExploreSpawnGate, type SpawnGateWait} from './exploreSpawnGate.js'
import type {SiteRequestRun, SiteRequestState} from './SiteRequestState.js'

// The launch gate: where a launch to a site asks whether it may start. It
// holds the site's rate-limit cooldown (SiteRequestState) and the pacing of
// launches signed in to the Explore session (ExploreSpawnGate), and logs every
// wait it imposes with its reason. The queue and probe slots read its
// cooldowns before they hand out a lane or slot; a launch asks it once before
// it prepares and again right before each spawn.

const logger = log.scope('launch-gate')

export type LaunchWaitReason = 'cooldown' | SpawnGateWait['reason']

export type LaunchAdmission = {kind: 'go'; launch: Launch} | {kind: 'wait'; until: number}

export type SignedInOutcome<T> = {kind: 'ran'; value: T} | {kind: 'capReached'} | {kind: 'waitExpired'} | {kind: 'cancelled'}

export interface SignedInLaunchOptions {
	// The job attempt whose signed-in budget the launch spends; a launch with
	// none (a probe) gets a budget of its own.
	jobKey?: string
	// Stops the launch while it waits (cancel or pause).
	stop?: AbortSignal
	// Bounds only the wait for a slot; the launch itself is not timed here.
	waitBudgetMs?: number
}

export interface LaunchGateOptions {
	// Absent: no cooldown is kept (tests and harnesses that never rate-limit).
	cooldowns?: SiteRequestState
	signedIn?: Pick<ExploreSpawnGate, 'run' | 'resetJob'>
}

export class LaunchGate {
	private readonly cooldowns: SiteRequestState | undefined
	private readonly signedIn: Pick<ExploreSpawnGate, 'run' | 'resetJob'>

	constructor(options: LaunchGateOptions = {}) {
		this.cooldowns = options.cooldowns
		this.signedIn = options.signedIn ?? new ExploreSpawnGate()
	}

	// Whether a launch to the site may start now. A launch that does not honor
	// the cooldown (the subtitles of media already saved) goes regardless.
	admit(site: string, {honorCooldown = true}: {honorCooldown?: boolean} = {}): LaunchAdmission {
		if (!this.cooldowns) return {kind: 'go', launch: new Launch(site, null, this.signedIn)}
		const admission = this.cooldowns.admit(site, {honorCooldown})
		if (admission.kind === 'wait') {
			logWait(site, 'cooldown', {until: new Date(admission.until).toISOString()})
			return admission
		}
		return {kind: 'go', launch: new Launch(site, admission.run, this.signedIn)}
	}

	// The job attempt ended: its signed-in budget goes with it.
	resetJob(jobKey: string): void {
		this.signedIn.resetJob(jobKey)
	}

	rateLimitedUntil(site: string): number | null {
		return this.cooldowns?.rateLimitedUntil(site) ?? null
	}

	wouldAdmit(site: string): boolean {
		return this.cooldowns?.wouldAdmit(site) ?? true
	}

	allowOnce(site: string): void {
		this.cooldowns?.allowOnce(site)
	}

	holdPass(site: string): void {
		this.cooldowns?.holdPass(site)
	}

	releasePass(site: string): void {
		this.cooldowns?.releasePass(site)
	}

	snapshot(): SiteCooldown[] {
		return this.cooldowns?.snapshot() ?? []
	}

	onChange(listener: (cooldowns: SiteCooldown[]) => void): () => void {
		return this.cooldowns?.onChange(listener) ?? (() => undefined)
	}

	routeChanged(): void {
		this.cooldowns?.routeChanged()
	}
}

// One admitted launch, from admission to its exit.
export class Launch {
	constructor(
		private readonly site: string,
		private readonly run: SiteRequestRun | null,
		private readonly signedIn: Pick<ExploreSpawnGate, 'run' | 'resetJob'>
	) {}

	// Right before a spawn, on the network route it goes out on: until when it
	// waits for a cooldown that started meanwhile, or null when it may go.
	recheck(route: string): number | null {
		const until = this.run?.recheck(route) ?? null
		if (until !== null) logWait(this.site, 'cooldown', {until: new Date(until).toISOString()})
		return until
	}

	observe(stderr: string): void {
		this.run?.observe(stderr)
	}

	finish(stderr: string, succeeded: boolean): void {
		this.run?.finish(stderr, succeeded)
	}

	// Runs `fn` once the signed-in pacing lets this launch start.
	async runSignedIn<T>({jobKey, stop, waitBudgetMs}: SignedInLaunchOptions, fn: () => Promise<T>): Promise<SignedInOutcome<T>> {
		const key = jobKey ?? `run:${randomUUID()}`
		const waitExpired = new AbortController()
		const waitTimer = waitBudgetMs === undefined ? undefined : setTimeout(() => waitExpired.abort(), waitBudgetMs)
		const signal = AbortSignal.any([stop, waitExpired.signal].filter(s => s !== undefined))
		try {
			const gated = await this.signedIn.run(
				key,
				async () => {
					clearTimeout(waitTimer)
					return {ran: await fn()}
				},
				signal,
				wait => logWait(this.site, wait.reason, wait.reason === 'signedInSpacing' ? {waitMs: wait.waitMs} : {})
			)
			if ('ran' in gated) return {kind: 'ran', value: gated.ran}
			if (gated.kind === 'cap-exceeded') return {kind: 'capReached'}
			return waitExpired.signal.aborted && stop?.aborted !== true ? {kind: 'waitExpired'} : {kind: 'cancelled'}
		} finally {
			clearTimeout(waitTimer)
			if (jobKey === undefined) this.signedIn.resetJob(key)
		}
	}
}

function logWait(site: string, reason: LaunchWaitReason, detail: {until?: string; waitMs?: number}): void {
	logger.info('Launch waits', {site, reason, ...detail})
}
