import type {QueueItem} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import {queueItemSchema} from '@shared/schemas.js'

export {ok} from '@shared/result.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}

const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}

export function makeItem(overrides: Partial<QueueItem> & Pick<QueueItem, 'id' | 'status'>): QueueItem {
	const candidate = {url: `https://youtube.com/watch?v=${overrides.id}`, title: overrides.id, thumbnail: '', outputDir: '/tmp', formatLabel: 'Best', progressPercent: 0, progressDetail: null, lastStatus: null, error: null, finishedAt: null, job: DEFAULT_JOB, ...overrides}
	// Schema-validate so a future field added to QueueItem cannot silently slip
	// past test fixtures — the fixture and the real shape are forced to agree.
	const parsed = queueItemSchema.safeParse(candidate)
	if (!parsed.success) {
		throw new Error(`makeItem fixture invalid: ${parsed.error.issues[0]?.message ?? 'schema mismatch'}`)
	}
	return parsed.data
}
