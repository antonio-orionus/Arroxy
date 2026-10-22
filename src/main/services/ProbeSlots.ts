// How many probes main runs at once, and which waiting probe goes next.
//
// Background probes (a placeholder row's, a title lookup's) together never
// exceed the user's "Links checked at once" setting. The window's own probes
// always have INTERACTIVE_PROBE_HEADROOM slots of their own, plus whatever
// background capacity is unused, so Interactive Download never waits behind a
// pasted batch, even right after the limit is lowered. A freed slot goes to
// the oldest interactive waiter, then intake in arrival order, then backfill.
// A caller may decline its slot once granted (`admit`): the title backfill
// does while a download runs, and nothing spawns.
//
// A background waiter whose site is cooling down (SiteRequestState) keeps its
// place but takes no slot, so waiters for other sites behind it can start.
// One timer wakes the queue at the earliest cooldown end, and a cooldown that
// ends early ("Try now") wakes it through onChange. A background probe that
// comes back held by a cooldown that began after it got its slot (nothing
// spawned) goes back to its place instead of failing its row. Interactive
// probes ignore cooldowns: the wizard shows its rate-limit notice at once.
//
// Owned rather than p-queue: per-site skipping, cooldown wake-ups, the held
// waiter's requeue at its old place and per-class counts are the whole job.

import log from 'electron-log/main.js'
import {INTERACTIVE_PROBE_HEADROOM} from '@shared/constants.js'
import type {ProbeKind} from '@shared/schemas.js'
import type {SiteRequestState} from './SiteRequestState.js'

const logger = log.scope('probe-slots')

export interface ProbeSlotRequest {
	kind: ProbeKind
	// The request site of the probed link (requestSiteFor).
	site: string
}

export type ProbeSlotOutcome<T> = {kind: 'ran'; value: T} | {kind: 'cancelled'} | {kind: 'deferred'}

export interface ProbeSlotRunOptions<T> {
	// The site whose cooldown held this result (YtDlp spawned nothing), or null:
	// a background probe waits again on that site, which a redirect may have
	// made another than the one it asked for.
	isHeld?: (value: T) => string | null
	// Asked when the slot is granted; false frees it unused (`deferred`).
	admit?: () => boolean
}

export type ProbeSlotCooldowns = Pick<SiteRequestState, 'rateLimitedUntil' | 'wouldAdmit' | 'onChange'>

export interface ProbeSlotsOptions {
	backgroundLimit: number
	// Absent: no cooldown holds a waiter.
	cooldown?: ProbeSlotCooldowns
	now?: () => number
}

interface Waiter {
	request: ProbeSlotRequest
	// Arrival order, kept when a held probe goes back to wait.
	seq: number
	grant: () => void
}

const CLASS_ORDER: Record<ProbeKind, number> = {interactive: 0, intake: 1, backfill: 2}

export class ProbeSlots {
	private backgroundLimit: number
	private readonly cooldown: ProbeSlotCooldowns | undefined
	private readonly now: () => number
	private readonly running: Record<ProbeKind, number> = {interactive: 0, intake: 0, backfill: 0}
	// Kept in grant order: class first, then arrival.
	private readonly waiters: Waiter[] = []
	private nextSeq = 0
	private timer: ReturnType<typeof setTimeout> | null = null
	private timerAt = 0

	constructor(options: ProbeSlotsOptions) {
		this.backgroundLimit = options.backgroundLimit
		this.cooldown = options.cooldown
		this.now = options.now ?? Date.now
		this.cooldown?.onChange(() => this.pump())
	}

	// A changed setting applies to the next decision; a higher limit starts waiters at once.
	setBackgroundLimit(limit: number): void {
		this.backgroundLimit = limit
		this.pump()
	}

	async run<T>(asked: ProbeSlotRequest, signal: AbortSignal, task: () => Promise<T>, options: ProbeSlotRunOptions<T> = {}): Promise<ProbeSlotOutcome<T>> {
		const seq = this.nextSeq++
		let request = asked
		for (;;) {
			if (!(await this.acquire(request, seq, signal))) return {kind: 'cancelled'}
			if (options.admit && !options.admit()) {
				this.release(request.kind)
				logger.info('Probe declined its slot', {kind: request.kind, site: request.site})
				return {kind: 'deferred'}
			}
			let value: T
			try {
				value = await task()
			} finally {
				this.release(request.kind)
			}
			const heldBy = request.kind === 'interactive' || signal.aborted ? null : (options.isHeld?.(value) ?? null)
			// A holding site no longer cooling returns the result as is, so a probe never loops.
			if (heldBy === null || this.coolingUntil(heldBy) === null) return {kind: 'ran', value}
			request = {...request, site: heldBy}
			logger.info('Probe held by a cooldown goes back to wait', {kind: request.kind, site: heldBy})
		}
	}

	snapshot(): {running: Record<ProbeKind, number>; waiting: ProbeSlotRequest[]} {
		return {running: {...this.running}, waiting: this.waiters.map(waiter => ({...waiter.request}))}
	}

	private acquire(request: ProbeSlotRequest, seq: number, signal: AbortSignal): Promise<boolean> {
		if (signal.aborted) return Promise.resolve(false)
		return new Promise<boolean>(resolve => {
			const onAbort = (): void => {
				const index = this.waiters.indexOf(waiter)
				if (index >= 0) this.waiters.splice(index, 1)
				resolve(false)
				this.pump()
			}
			const waiter: Waiter = {
				request,
				seq,
				grant: () => {
					signal.removeEventListener('abort', onAbort)
					this.running[request.kind] += 1
					resolve(true)
				}
			}
			const index = this.waiters.findIndex(other => CLASS_ORDER[other.request.kind] > CLASS_ORDER[request.kind] || (other.request.kind === request.kind && other.seq > seq))
			this.waiters.splice(index < 0 ? this.waiters.length : index, 0, waiter)
			signal.addEventListener('abort', onAbort, {once: true})
			this.pump()
			if (this.waiters.includes(waiter)) logger.info('Probe waits for a slot', {kind: request.kind, site: request.site, waiting: this.waiters.length})
		})
	}

	private release(kind: ProbeKind): void {
		this.running[kind] -= 1
		this.pump()
	}

	// Grants every slot it can, in grant order, and times the wake-up for the
	// earliest cooldown still holding a waiter.
	private pump(): void {
		let wakeAt: number | null = null
		for (let i = 0; i < this.waiters.length;) {
			const waiter = this.waiters[i]
			if (!waiter) break
			// Background capacity in use: background probes, and the window's probes beyond their own headroom.
			const used = this.running.intake + this.running.backfill + Math.max(0, this.running.interactive - INTERACTIVE_PROBE_HEADROOM)
			if (waiter.request.kind === 'interactive') {
				if (this.running.interactive >= INTERACTIVE_PROBE_HEADROOM && used >= this.backgroundLimit) break
			} else {
				if (used >= this.backgroundLimit) break
				// A site cooling down holds its waiters, unless a Try now pass waits for a request.
				const until = this.cooldown?.wouldAdmit(waiter.request.site) === false ? this.coolingUntil(waiter.request.site) : null
				if (until !== null) {
					wakeAt = wakeAt === null ? until : Math.min(wakeAt, until)
					i += 1
					continue
				}
			}
			this.waiters.splice(i, 1)
			waiter.grant()
		}
		this.schedule(wakeAt)
	}

	private coolingUntil(site: string): number | null {
		return this.cooldown?.rateLimitedUntil(site) ?? null
	}

	private schedule(wakeAt: number | null): void {
		if (this.timer !== null && wakeAt === this.timerAt) return
		if (this.timer !== null) clearTimeout(this.timer)
		this.timer = null
		if (wakeAt === null) return
		this.timerAt = wakeAt
		this.timer = setTimeout(
			() => {
				this.timer = null
				this.pump()
			},
			Math.max(0, wakeAt - this.now())
		)
	}
}
