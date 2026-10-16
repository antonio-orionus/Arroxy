// Which identity a queue item starts under, and whether its probe info-json may
// be replayed. Extracted from QueueService so the scheduler class stays under
// the repo's LOC cap.

import type {JobAuth, QueueItem} from '@shared/types.js'

export interface StartIdentity {
	auth: JobAuth
	// An info-json is replayed only by a run of the identity that extracted it:
	// an anonymous one loaded signed in would reuse anonymous format URLs, and a
	// signed-in one must never reach an anonymous run.
	replayProbeInfoJson: boolean
}

export function resolveStartIdentity(item: Pick<QueueItem, 'auth' | 'probeInfoJsonRef'>): StartIdentity {
	const auth: JobAuth = item.auth === 'exploreSession' || item.probeInfoJsonRef?.auth === 'exploreSession' ? 'exploreSession' : 'anonymous'
	return {auth, replayProbeInfoJson: item.probeInfoJsonRef !== undefined && (item.probeInfoJsonRef.auth ?? 'anonymous') === auth}
}
