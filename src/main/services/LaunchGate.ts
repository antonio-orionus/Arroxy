import {randomUUID} from 'node:crypto'
import log from 'electron-log/main.js'
import type {SiteCooldown} from '@shared/schemas.js'
import {signedInPacingFor} from '@shared/sites/signedInPacing.js'
import {SignedInPacer, type SignedInWait} from './SignedInPacer.js'
import type {SiteRequestRun, SiteRequestState} from './SiteRequestState.js'

// The launch gate: where a launch to a site asks whether it may start. It
// holds the site's rate-limit cooldown (SiteRequestState) and the pacing of
// launches signed in to the Explore session (SignedInPacer), and logs every
// wait it imposes with its reason. The queue and probe slots read its
// cooldowns before they hand out a lane or slot; a launch asks it once before
// it prepares and again right before each spawn.

const logger = log.scope('launch-gate')

export type LaunchWaitReason = 'cooldown' | SignedInWait['reason']

type SignedInPacerPort = Pick<SignedInPacer, 'run' | 'resetJob' | 'charge' | 'startsAt' | 'reserveStart' | 'releaseReservation' | 'onChange'>

export type LaunchAdmission = {kind: 'go'; launch: Launch} | {kind: 'wait'; until: number}

// `paced`: the spacing or the budget would hold the launch past its wait
// budget, until `until`; it did not wait.
export type SignedInOutcome<T> = {kind: 'ran'; value: T} | {kind: 'capReached'} | {kind: 'waitExpired'} | {kind: 'paced'; until: number} | {kind: 'cancelled'}

export interface SignedInLaunchOptions {
	// The job attempt whose signed-in budget the launch spends; a launch with
	// none (a probe) gets a budget of its own.
	jobKey?: string
	// Stops the launch while it waits (cancel or pause).
	stop?: AbortSignal
	// Bounds the launch's wait: a slot wait past it expires, and a launch the
	// spacing or the budget would hold longer answers `paced` at once. The
	// launch itself is not timed here.
	waitBudgetMs?: number
	// The start the queue reserved for this job's first launch (reserveSignedInStart).
	reservation?: string
	// The priority button or a link opened in the wizard: skips the spacing
	// and the budget, and still counts toward the window.
	explicit?: boolean
}

export interface LaunchGateOptions {
	// Absent: no cooldown is kept (tests and harnesses that never rate-limit).
	cooldowns?: SiteRequestState
	signedIn?: SignedInPacerPort
}

export class LaunchGate {
	private readonly cooldowns: SiteRequestState | undefined
	private readonly signedIn: SignedInPacerPort

	constructor(options: LaunchGateOptions = {}) {
		this.cooldowns = options.cooldowns
		this.signedIn = options.signedIn ?? new SignedInPacer({pacing: site => signedInPacingFor(site, 'balanced')})
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

	// When a signed-in launch to the site may start: null for now, a time, or
	// `full` until a slot frees (onSignedInChange).
	signedInStartsAt(site: string, options: {explicit?: boolean} = {}): number | 'full' | null {
		return this.signedIn.startsAt(site, options)
	}

	// Reserves the next signed-in start on the site for a queued row taking its
	// lane, or says how long the row waits (`full` until a slot frees).
	reserveSignedInStart(site: string, options: {explicit?: boolean} = {}): {kind: 'reserved'; id: string} | {kind: 'hold'; until: number | 'full'} {
		return this.signedIn.reserveStart(site, options)
	}

	// A reserved signed-in start its job no longer needs.
	releaseSignedInStart(id: string): void {
		this.signedIn.releaseReservation(id)
	}

	// A signed-in listing's entries, charged against the site's window after its launch.
	chargeListing(site: string, entries: number): void {
		this.signedIn.charge(site, entries)
	}

	onSignedInChange(listener: () => void): () => void {
		return this.signedIn.onChange(listener)
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
		private readonly signedIn: SignedInPacerPort
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
	async runSignedIn<T>({jobKey, stop, waitBudgetMs, explicit, reservation}: SignedInLaunchOptions, fn: () => Promise<T>): Promise<SignedInOutcome<T>> {
		const key = jobKey ?? `run:${randomUUID()}`
		const waitExpired = new AbortController()
		const waitTimer = waitBudgetMs === undefined ? undefined : setTimeout(() => waitExpired.abort(), waitBudgetMs)
		const signal = AbortSignal.any([stop, waitExpired.signal].filter(s => s !== undefined))
		try {
			const gated = await this.signedIn.run(
				this.site,
				key,
				() => {
					clearTimeout(waitTimer)
					return fn()
				},
				{signal, explicit, reservation, ...(waitBudgetMs === undefined ? {} : {maxWaitMs: waitBudgetMs}), onWait: wait => logWait(this.site, wait.reason, wait.reason === 'signedInLimit' ? {} : {waitMs: wait.waitMs})}
			)
			if ('ran' in gated) return {kind: 'ran', value: gated.ran}
			if (gated.kind === 'cap-exceeded') return {kind: 'capReached'}
			if (gated.kind === 'paced') {
				logWait(this.site, gated.reason, {until: new Date(gated.until).toISOString()})
				return {kind: 'paced', until: gated.until}
			}
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
