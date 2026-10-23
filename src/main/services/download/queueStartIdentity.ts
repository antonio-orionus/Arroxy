// Which identity a queue item starts under, and whether its probe info-json may
// be replayed. Extracted from QueueService so the scheduler class stays under
// the repo's LOC cap.
//
// An item records an identity only when it must not change: the Explore
// session after escalation (ADR 0008), or anonymous after its safety launch ran
// (ADR 0022). Any other item asks its site at every start, so a row queued
// while signed in starts anonymous once the user signed out.

import type {AuthBasis, JobAuth, QueueItem} from '@shared/types.js'
import type {StartDecision} from '../startIdentity.js'

export type StartIdentity = {auth: Extract<JobAuth, 'exploreSession'>; basis: AuthBasis; replayProbeInfoJson: boolean} | {auth: Extract<JobAuth, 'anonymous'>; replayProbeInfoJson: boolean}

export function resolveStartIdentity(item: Pick<QueueItem, 'url' | 'auth' | 'probeInfoJsonRef'>, decide: (url: string) => StartDecision): StartIdentity {
	const ref = item.probeInfoJsonRef
	const escalated = item.auth === 'exploreSession' || (item.auth === undefined && ref?.auth === 'exploreSession' && (ref.authBasis ?? 'escalation') === 'escalation')
	// An info-json is replayed only by a run of the identity that extracted it:
	// an anonymous one loaded signed in would reuse anonymous format URLs, and a
	// signed-in one must never reach an anonymous run.
	const replays = (auth: JobAuth): boolean => ref !== undefined && (ref.auth ?? 'anonymous') === auth
	if (escalated) return {auth: 'exploreSession', basis: 'escalation', replayProbeInfoJson: replays('exploreSession')}
	if (item.auth === 'anonymous') return {auth: 'anonymous', replayProbeInfoJson: replays('anonymous')}
	const decision = decide(item.url)
	return decision.auth === 'exploreSession' ? {auth: 'exploreSession', basis: 'siteDefault', replayProbeInfoJson: replays('exploreSession')} : {auth: 'anonymous', replayProbeInfoJson: replays('anonymous')}
}
