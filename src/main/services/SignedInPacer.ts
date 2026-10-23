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

import {setTimeout as sleep} from 'node:timers/promises'
import type {SignedInPacing} from '@shared/sites/siteKeys.js'

export type SignedInRefusal = {kind: 'cap-exceeded'} | {kind: 'cancelled'}

// Why a launch waits: the site's slots are taken, the previous start was too
// recent, or the window's allowance is spent.
export type SignedInWait = {reason: 'signedInLimit'} | {reason: 'signedInSpacing'; waitMs: number} | {reason: 'signedInBudget'; waitMs: number}

export interface SignedInRunOptions {
	signal?: AbortSignal
	explicit?: boolean
	onWait?: (wait: SignedInWait) => void
}

export interface SignedInPacerOptions {
	// Read at every decision, so a changed Pacing preset applies at once.
	pacing: (site: string) => SignedInPacing
	perJobCap?: number
	now?: () => number
	sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
	random?: () => number
}

interface Charge {
	at: number
	launches: number
}

interface SiteState {
	active: number
	waiters: Array<() => void>
	// Reserved at a start, so two launches starting together are still staggered.
	nextStartAt: number
	charges: Charge[]
}

export class SignedInPacer {
	private readonly pacing: (site: string) => SignedInPacing
	private readonly perJobCap: number
	private readonly now: () => number
	private readonly sleep: (ms: number, signal?: AbortSignal) => Promise<void>
	private readonly random: () => number
	private readonly sites = new Map<string, SiteState>()
	private readonly launchesByJob = new Map<string, number>()
	private readonly listeners = new Set<() => void>()

	constructor(options: SignedInPacerOptions) {
		this.pacing = options.pacing
		this.perJobCap = Math.max(1, options.perJobCap ?? 6)
		this.now = options.now ?? Date.now
		this.sleep = options.sleep ?? ((ms, signal) => sleep(ms, undefined, {signal}))
		this.random = options.random ?? Math.random
	}

	async run<T>(site: string, jobKey: string, fn: () => Promise<T>, {signal, explicit = false, onWait}: SignedInRunOptions = {}): Promise<{ran: T} | SignedInRefusal> {
		if (signal?.aborted) return {kind: 'cancelled'}
		const used = this.launchesByJob.get(jobKey) ?? 0
		if (used >= this.perJobCap) return {kind: 'cap-exceeded'}
		this.launchesByJob.set(jobKey, used + 1)
		const state = this.state(site)
		if (!(await this.acquire(site, state, signal, onWait))) return this.refund(jobKey)
		try {
			const pacing = this.pacing(site)
			const now = this.now()
			const free = explicit ? null : this.freeAt(state, pacing, now)
			const startAt = free?.at ?? now
			const charge: Charge = {at: startAt, launches: 1}
			state.charges.push(charge)
			const previousNext = state.nextStartAt
			const reservedNext = explicit ? state.nextStartAt : startAt + this.spacing(pacing)
			state.nextStartAt = reservedNext
			const wait = startAt - now
			if (wait > 0 && free) {
				onWait?.({reason: free.reason, waitMs: wait})
				try {
					await this.sleep(wait, signal)
				} catch (err) {
					if (!signal?.aborted) throw err
				}
			}
			if (signal?.aborted) {
				// A cancelled launch gives back what it reserved, so cancels never pile up waits.
				state.charges.splice(state.charges.indexOf(charge), 1)
				if (state.nextStartAt === reservedNext) state.nextStartAt = previousNext
				return this.refund(jobKey)
			}
			return {ran: await fn()}
		} finally {
			this.release(state)
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
		if (state.active >= pacing.atOnce) return 'full'
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
			state = {active: 0, waiters: [], nextStartAt: Number.NEGATIVE_INFINITY, charges: []}
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
		if (state.active < this.pacing(site).atOnce) {
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

	private release(state: SiteState): void {
		state.active -= 1
		state.waiters.shift()?.()
		this.notify()
	}

	private notify(): void {
		for (const listener of this.listeners) listener()
	}
}
