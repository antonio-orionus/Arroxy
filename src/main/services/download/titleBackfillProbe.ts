// The title backfill's lookup: a full video probe, anonymous (a cosmetic
// title never spends the Explore session) and on the pinned 180 s budget a
// slow link needs. Its probe is keyed to the backfill, which runs one lookup
// at a time, so the window's cancel (cancelInFlight) never reaches it while it
// waits for a probe slot. `admit` is asked when the slot is granted.

import {PROBE_TIMEOUT_MS} from '@shared/constants.js'
import type {ProbeService} from '../ProbeService.js'
import type {QueueTitleBackfillDeps, TitleLookup} from './queueTitleBackfill.js'

const TITLE_BACKFILL_OWNER_KEY = 'title-backfill'

export function titleBackfillProbe(probeService: Pick<ProbeService, 'probe'>): QueueTitleBackfillDeps['probeTitle'] {
	return async (url, admit): Promise<TitleLookup> => {
		const result = await probeService.probe(url, {kind: 'backfill', ownerKey: TITLE_BACKFILL_OWNER_KEY, playlistMode: 'video', timeoutMs: PROBE_TIMEOUT_MS, escalate: false, admit})
		if (!result.ok) return result.error.kind === 'other' && (result.error.code === 'cancelled' || result.error.code === 'deferred') ? {kind: result.error.code} : {kind: 'none'}
		if (result.data.kind !== 'video') return {kind: 'none'}
		const title = result.data.title.trim()
		return title === '' ? {kind: 'none'} : {kind: 'found', title}
	}
}
