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
// A background waiter whose site is cooling down (the LaunchGate) keeps its
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
import type {HeldProbe, ProbeKind} from '@shared/schemas.js'
import type {LaunchGate} from './LaunchGate.js'

const logger = log.scope('probe-slots')

export interface ProbeSlotRequest {
	kind: ProbeKind
	// The request site of the probed link (requestSiteFor).
	site: string
	// The probe's owner key (a Downloads row's id), named while a cooldown holds it.
	owner?: string
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

export type ProbeSlotCooldowns = Pick<LaunchGate, 'rateLimitedUntil' | 'wouldAdmit' | 'holdPass' | 'releasePass' | 'onChange'>

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
	private held: HeldProbe[] = []
	// Sites whose Try now pass this pool holds for a waiter behind it.
	private passSites = new Set<string>()
	private readonly heldListeners = new Set<(held: HeldProbe[]) => void>()

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

	// The background waiters a cooldown holds now, by owner and the site they wait on.
	heldProbes(): HeldProbe[] {
		return this.held.map(probe => ({...probe}))
	}

	onHeldChange(listener: (held: HeldProbe[]) => void): () => void {
		this.heldListeners.add(listener)
		return () => this.heldListeners.delete(listener)
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
		let i = 0
		while (i < this.waiters.length) {
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
		// Waiters left behind a full pool keep their site's Try now pass until they
		// get a slot; a site with none left there gets the pass's usual window back.
		const passSites = new Set(this.waiters.slice(i).map(waiter => waiter.request.site))
		for (const site of passSites) this.cooldown?.holdPass(site)
		for (const site of this.passSites) if (!passSites.has(site)) this.cooldown?.releasePass(site)
		this.passSites = passSites
		this.publishHeld()
		this.schedule(wakeAt)
	}

	// Tells listeners which owned background waiters a cooldown holds, when that
	// changed. A Try now pass lets one request through: the first waiter on its
	// site, in grant order; the others stay held.
	private publishHeld(): void {
		const passing = new Set<string>()
		const held = this.waiters.flatMap(({request: {kind, site, owner}}) => {
			if (kind === 'interactive' || this.coolingUntil(site) === null) return []
			if (this.cooldown?.wouldAdmit(site) && !passing.has(site)) {
				passing.add(site)
				return []
			}
			return owner === undefined ? [] : [{owner, site}]
		})
		if (held.length === this.held.length && held.every((probe, index) => probe.owner === this.held[index]?.owner && probe.site === this.held[index]?.site)) return
		this.held = held
		for (const listener of this.heldListeners) listener(this.heldProbes())
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
