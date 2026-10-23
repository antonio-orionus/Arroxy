// Holds a queued item's start while its site may not take a launch now, so
// it never holds a download lane doing nothing (ADR 0022):
//   - a rate-limit cooldown holds every item for the site, in both lanes:
//     starting one would only meet the same limit;
//   - an item that starts signed in also waits for its site's signed-in
//     pacing. A priority item skips the spacing and the budget, never a full
//     site.
// The item stays pending and starts on its own when the hold ends: at its
// time, when a cooldown ends early ("Try now"), when a signed-in slot frees, or
// when its start identity changes (a sign-out, a not-working mark).

import {requestSiteFor} from '@shared/sites/index.js'
import type {QueueItem} from '@shared/types.js'
import type {LaunchGate} from '../LaunchGate.js'
import type {StartDecision} from '../startIdentity.js'
import {resolveStartIdentity, type StartIdentity} from './queueStartIdentity.js'

export type QueueSiteGate = Pick<LaunchGate, 'rateLimitedUntil' | 'onChange' | 'signedInStartsAt' | 'reserveSignedInStart' | 'onSignedInChange'>

// The start identity of an item that records none (startIdentity.ts), and
// word when it may have changed.
export interface QueueStartIdentitySource {
	decide: (url: string) => StartDecision
	onChange?: (listener: () => void) => void
}

const NOT_SIGN_IN_FIRST: QueueStartIdentitySource = {decide: url => ({site: requestSiteFor(url), auth: 'anonymous', reason: 'notSignInFirst'})}

// Until when the item's start waits, `full` until a signed-in slot frees, or
// null when it may start now.
export type QueueStartHold = number | 'full' | null

export class QueueSiteHold {
	private timer: NodeJS.Timeout | null = null
	private wakeAt = 0

	constructor(
		private readonly gate: QueueSiteGate | undefined,
		private readonly identities: QueueStartIdentitySource = NOT_SIGN_IN_FIRST
	) {}

	startIdentity(item: QueueItem): StartIdentity {
		return resolveStartIdentity(item, this.identities.decide)
	}

	private startHold(item: QueueItem, now: number): QueueStartHold {
		if (!this.gate) return null
		const site = requestSiteFor(item.url)
		const cooldown = this.gate.rateLimitedUntil(site)
		if (cooldown !== null) return cooldown
		if (this.startIdentity(item).auth !== 'exploreSession') return null
		const signedIn = this.gate.signedInStartsAt(site, {explicit: item.lane === 'priority'})
		return signedIn === 'full' || (signedIn !== null && signedIn > now) ? signedIn : null
	}

	// Called as the item would take its lane: how long it waits, or `go`. A go
	// for an item that starts signed in reserves its start, so the rows behind
	// it on the same site wait for it in this same scheduler pass.
	admit(item: QueueItem, now: number): {kind: 'go'; reservation?: string} | {kind: 'hold'; until: number | 'full'} {
		const hold = this.startHold(item, now)
		if (hold !== null) return {kind: 'hold', until: hold}
		if (!this.gate || this.startIdentity(item).auth !== 'exploreSession') return {kind: 'go'}
		const start = this.gate.reserveSignedInStart(requestSiteFor(item.url), {explicit: item.lane === 'priority'})
		return start.kind === 'reserved' ? {kind: 'go', reservation: start.id} : start
	}

	// The rate-limit cooldown left for the item's site; automatic retries wait it out.
	cooldownRemainingMs(item: QueueItem, now: number): number {
		const until = this.gate?.rateLimitedUntil(requestSiteFor(item.url)) ?? null
		return until === null ? 0 : Math.max(0, until - now)
	}

	// Re-runs the scheduler whenever a cooldown starts or ends early, a signed-in
	// slot frees, or an item's start identity may have changed.
	onChange(listener: () => void): void {
		this.gate?.onChange(listener)
		this.gate?.onSignedInChange(listener)
		this.identities.onChange?.(listener)
	}

	// Keeps one timer armed for the earliest held item; drops it when nothing waits.
	sync(earliest: number | null, now: number, onWake: () => void): void {
		if (earliest === null) {
			this.clear()
			return
		}
		if (this.timer && this.wakeAt === earliest) return
		this.clear()
		this.wakeAt = earliest
		this.timer = setTimeout(
			() => {
				this.timer = null
				onWake()
			},
			Math.max(0, earliest - now)
		)
		this.timer.unref?.()
	}

	clear(): void {
		if (this.timer) clearTimeout(this.timer)
		this.timer = null
		this.wakeAt = 0
	}
}
