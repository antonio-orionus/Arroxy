// Paces every yt-dlp launch that runs on the user's Explore session, one site
// at a time (ADR 0022), so bulk work on one site cannot hammer it with one
// account and never holds back another site. Per site: at most `atOnce`
// launches at once, starts `spacingMs` apart (with jitter), and at most
// `perWindow` launches in any sliding `windowMs`, where a listing adds the
// launches its entries are worth. Per job attempt: at most `perJobCap`
// launches. A slot is held for the whole launch, so a long download keeps it.
//
// An explicit action (the priority button, a link opened in the download
// wizard) skips the spacing and the budget for its own launch, and still
// counts toward the window.

import {randomUUID} from 'node:crypto'
import {setTimeout as sleep} from 'node:timers/promises'
import type {SignedInPacing} from '@shared/sites/siteKeys.js'

// `paced`: the spacing or the budget holds the launch past `maxWaitMs`, until
// `until`; nothing waited.
export type SignedInRefusal = {kind: 'cap-exceeded'} | {kind: 'cancelled'} | {kind: 'paced'; until: number; reason: 'signedInSpacing' | 'signedInBudget'}

// Why a launch waits: the site's slots are taken, the previous start was too
// recent, or the window's allowance is spent.
export type SignedInWait = {reason: 'signedInLimit'} | {reason: 'signedInSpacing'; waitMs: number} | {reason: 'signedInBudget'; waitMs: number}

export interface SignedInRunOptions {
	signal?: AbortSignal
	explicit?: boolean
	onWait?: (wait: SignedInWait) => void
	// A start reserveStart() handed out for this launch.
	reservation?: string
	// The longest the spacing or the budget may hold the launch; past it, run()
	// answers `paced` instead of waiting.
	maxWaitMs?: number
}

export interface SignedInPacerOptions {
	// Read at every decision, so a changed Pacing preset applies at once.
	pacing: (site: string) => SignedInPacing
	perJobCap?: number
	now?: () => number
	sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
	random?: () => number
	// How long a reserved start waits for its launch.
	reservationTtlMs?: number
}

interface Charge {
	at: number
	launches: number
}

interface SiteState {
	active: number
	// Starts the queue reserved for launches still being prepared.
	pending: Map<string, {timer: NodeJS.Timeout; charge: Charge}>
	waiters: Array<() => void>
	// Reserved at a start, so two launches starting together are still staggered.
	nextStartAt: number
	// When the last launch actually started (a reserved one starts later than its reservation).
	lastLaunchAt: number
	charges: Charge[]
}

export class SignedInPacer {
	private readonly pacing: (site: string) => SignedInPacing
	private readonly perJobCap: number
	private readonly now: () => number
	private readonly sleep: (ms: number, signal?: AbortSignal) => Promise<void>
	private readonly random: () => number
	private readonly reservationTtlMs: number
	private readonly sites = new Map<string, SiteState>()
	private readonly launchesByJob = new Map<string, number>()
	private readonly listeners = new Set<() => void>()
	// Launches sleeping out the spacing or the budget, woken when a charge is refunded.
	private readonly wakers = new Set<() => void>()

	constructor(options: SignedInPacerOptions) {
		this.pacing = options.pacing
		this.perJobCap = Math.max(1, options.perJobCap ?? 6)
		this.now = options.now ?? Date.now
		this.sleep = options.sleep ?? ((ms, signal) => sleep(ms, undefined, {signal}))
		this.random = options.random ?? Math.random
		this.reservationTtlMs = options.reservationTtlMs ?? 2 * 60_000
	}

	async run<T>(site: string, jobKey: string, fn: () => Promise<T>, {signal, explicit = false, onWait, reservation, maxWaitMs}: SignedInRunOptions = {}): Promise<{ran: T} | SignedInRefusal> {
		if (signal?.aborted) return {kind: 'cancelled'}
		const used = this.launchesByJob.get(jobKey) ?? 0
		if (used >= this.perJobCap) return {kind: 'cap-exceeded'}
		this.launchesByJob.set(jobKey, used + 1)
		const state = this.state(site)
		// A start the queue reserved for this launch already holds its slot and
		// charge; it waits only out the spacing from the last launch that started.
		const reserved = reservation === undefined ? undefined : this.consume(state, reservation)
		if (reserved !== undefined) {
			// Asked again after every wait: another launch may have started meanwhile.
			for (let wait = this.reservedWait(site, state, explicit); wait > 0; wait = this.reservedWait(site, state, explicit)) {
				onWait?.({reason: 'signedInSpacing', waitMs: wait})
				try {
					await this.sleep(wait, signal)
				} catch (err) {
					if (!signal?.aborted) throw err
				}
				if (signal?.aborted) {
					// Nothing launched: the reserved start gives back its window charge too.
					this.dropCharge(state, reserved)
					this.release(site, state)
					return this.refund(jobKey)
				}
			}
			this.markLaunched(site, state, explicit)
			return this.launch(site, state, fn)
		}
		for (;;) {
			// Waits for the spacing or the budget hold no slot, and are asked again after every wait.
			const free = explicit ? null : this.freeAt(state, this.pacing(site), this.now())
			if (free) {
				const wait = free.at - this.now()
				if (maxWaitMs !== undefined && wait > maxWaitMs) {
					this.refund(jobKey)
					return {kind: 'paced', until: free.at, reason: free.reason}
				}
				onWait?.({reason: free.reason, waitMs: wait})
				await this.sleepOrWake(wait, signal)
				if (signal?.aborted) return this.refund(jobKey)
				continue
			}
			if (!(await this.acquire(site, state, signal, onWait))) return this.refund(jobKey)
			if (!explicit && this.freeAt(state, this.pacing(site), this.now())) {
				this.release(site, state)
				continue
			}
			this.start(site, state, explicit)
			state.lastLaunchAt = this.now()
			return this.launch(site, state, fn)
		}
	}

	// Reserves the next start on the site for a launch still being prepared (a
	// queued row taking its lane), so rows behind it see the site as it will be.
	// The launch hands the id to run(); one never used expires.
	reserveStart(site: string, {explicit = false}: {explicit?: boolean} = {}): {kind: 'reserved'; id: string} | {kind: 'hold'; until: number | 'full'} {
		const until = this.startsAt(site, {explicit})
		if (until !== null) return {kind: 'hold', until}
		const state = this.state(site)
		const id = randomUUID()
		const timer = setTimeout(() => this.releaseReservation(id), this.reservationTtlMs)
		timer.unref?.()
		state.pending.set(id, {timer, charge: this.start(site, state, explicit)})
		// No notify: the caller is the scheduler itself, mid-pass.
		return {kind: 'reserved', id}
	}

	// A reserved start its job never used (it parked or ended first, or the
	// reservation expired): its slot frees and its window charge is refunded.
	releaseReservation(id: string): void {
		for (const [site, state] of this.sites) {
			const reservation = state.pending.get(id)
			if (reservation === undefined) continue
			clearTimeout(reservation.timer)
			state.pending.delete(id)
			this.dropCharge(state, reservation.charge)
			this.grantWaiters(site, state)
			this.notify()
			return
		}
	}

	// A listing's entries, charged after its launch against the site's window.
	charge(site: string, entries: number): void {
		const pacing = this.pacing(site)
		if (entries <= 0) return
		this.state(site).charges.push({at: this.now(), launches: entries / pacing.entriesPerLaunch})
		this.notify()
	}

	// When a launch to the site may start: null for now, a time, or `full` while
	// every slot is taken (listeners hear when one frees).
	startsAt(site: string, {explicit = false}: {explicit?: boolean} = {}): number | 'full' | null {
		const state = this.state(site)
		const pacing = this.pacing(site)
		if (state.active + state.pending.size >= pacing.atOnce) return 'full'
		if (explicit) return null
		return this.freeAt(state, pacing, this.now())?.at ?? null
	}

	// The job attempt ended (finalized or dropped): its budget goes with it.
	resetJob(jobKey: string): void {
		this.launchesByJob.delete(jobKey)
	}

	onChange(listener: () => void): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	// A launch starts now: it counts against the window and, unless explicit,
	// pushes the next start back by the spacing.
	private start(site: string, state: SiteState, explicit: boolean): Charge {
		const pacing = this.pacing(site)
		const now = this.now()
		const charge = {at: now, launches: 1}
		state.charges.push(charge)
		if (!explicit) state.nextStartAt = now + this.spacing(pacing)
		return charge
	}

	// How long a reserved launch still waits out the spacing from the last launch that started.
	private reservedWait(site: string, state: SiteState, explicit: boolean): number {
		return explicit ? 0 : state.lastLaunchAt + this.pacing(site).spacingMs - this.now()
	}

	// A reserved launch actually starts: later starts are spaced from it.
	private markLaunched(site: string, state: SiteState, explicit: boolean): void {
		const now = this.now()
		state.lastLaunchAt = now
		if (!explicit) state.nextStartAt = Math.max(state.nextStartAt, now + this.pacing(site).spacingMs)
	}

	private async launch<T>(site: string, state: SiteState, fn: () => Promise<T>): Promise<{ran: T}> {
		try {
			return {ran: await fn()}
		} finally {
			this.release(site, state)
		}
	}

	// The reserved start's slot becomes this launch's; its charge stays refundable until the launch starts.
	private consume(state: SiteState, id: string): Charge | undefined {
		const reservation = state.pending.get(id)
		if (reservation === undefined) return undefined
		clearTimeout(reservation.timer)
		state.pending.delete(id)
		state.active += 1
		return reservation.charge
	}

	// A charge for a launch that never ran leaves the window, and launches
	// waiting on the budget ask again.
	private dropCharge(state: SiteState, charge: Charge): void {
		state.charges = state.charges.filter(other => other !== charge)
		for (const wake of [...this.wakers]) wake()
	}

	// Sleeps out a spacing or budget wait; a refunded charge cuts it short.
	private async sleepOrWake(ms: number, signal: AbortSignal | undefined): Promise<void> {
		if (signal?.aborted) return
		const wake = new AbortController()
		const onAbort = (): void => wake.abort()
		signal?.addEventListener('abort', onAbort, {once: true})
		this.wakers.add(onAbort)
		try {
			await this.sleep(ms, wake.signal)
		} catch (err) {
			if (!wake.signal.aborted) throw err
		} finally {
			this.wakers.delete(onAbort)
			signal?.removeEventListener('abort', onAbort)
		}
	}

	// The earliest start the spacing and the budget allow, and which of them
	// holds it; null when a launch may start now.
	private freeAt(state: SiteState, pacing: SignedInPacing, now: number): {at: number; reason: 'signedInSpacing' | 'signedInBudget'} | null {
		const spaced = Math.max(now, state.nextStartAt)
		const budgeted = this.budgetFreeAt(state, pacing, spaced)
		if (budgeted > spaced) return {at: budgeted, reason: 'signedInBudget'}
		return spaced > now ? {at: spaced, reason: 'signedInSpacing'} : null
	}

	private budgetFreeAt(state: SiteState, pacing: SignedInPacing, from: number): number {
		// Charges older than one window from now can never count again.
		state.charges = state.charges.filter(charge => charge.at > this.now() - pacing.windowMs)
		const charges = [...state.charges].sort((a, b) => a.at - b.at)
		let at = from
		for (;;) {
			const inWindow = charges.filter(charge => charge.at > at - pacing.windowMs && charge.at <= at)
			const spent = inWindow.reduce((sum, charge) => sum + charge.launches, 0)
			const oldest = inWindow[0]
			if (spent + 1 <= pacing.perWindow || !oldest) return at
			at = oldest.at + pacing.windowMs
		}
	}

	private spacing(pacing: SignedInPacing): number {
		return Math.max(0, Math.round(pacing.spacingMs + (this.random() * 2 - 1) * pacing.jitterMs))
	}

	private state(site: string): SiteState {
		let state = this.sites.get(site)
		if (!state) {
			state = {active: 0, pending: new Map(), waiters: [], nextStartAt: Number.NEGATIVE_INFINITY, lastLaunchAt: Number.NEGATIVE_INFINITY, charges: []}
			this.sites.set(site, state)
		}
		return state
	}

	// A launch cancelled before it ran does not count against its job.
	private refund(jobKey: string): SignedInRefusal {
		const used = this.launchesByJob.get(jobKey) ?? 0
		if (used <= 1) this.launchesByJob.delete(jobKey)
		else this.launchesByJob.set(jobKey, used - 1)
		return {kind: 'cancelled'}
	}

	// Resolves true once a slot is held, false if the job was cancelled while waiting.
	private acquire(site: string, state: SiteState, signal: AbortSignal | undefined, onWait: SignedInRunOptions['onWait']): Promise<boolean> {
		if (state.active + state.pending.size < this.pacing(site).atOnce) {
			state.active += 1
			return Promise.resolve(true)
		}
		onWait?.({reason: 'signedInLimit'})
		return new Promise<boolean>(resolve => {
			const onAbort = (): void => {
				const index = state.waiters.indexOf(grant)
				if (index >= 0) state.waiters.splice(index, 1)
				resolve(false)
			}
			const grant = (): void => {
				signal?.removeEventListener('abort', onAbort)
				state.active += 1
				resolve(true)
			}
			state.waiters.push(grant)
			signal?.addEventListener('abort', onAbort, {once: true})
		})
	}

	private release(site: string, state: SiteState): void {
		state.active -= 1
		this.grantWaiters(site, state)
		this.notify()
	}

	private grantWaiters(site: string, state: SiteState): void {
		while (state.waiters.length > 0 && state.active + state.pending.size < this.pacing(site).atOnce) state.waiters.shift()?.()
	}

	private notify(): void {
		for (const listener of this.listeners) listener()
	}
}
