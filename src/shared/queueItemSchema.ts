// The persisted queue item contract: what QueueStore loads and saves, and what
// the queue IPC commands accept. Its enums (status, lane, artifact kind, the
// needs-choice answers) live in `./schemas.ts` with every other enum.

import {z} from 'zod'
import {intakeOriginSchema, pinnedDownloadProfileSchema} from './intake/intakeSchemas.js'
import {QUEUE_STATUS, jobAuthSchema, probePlaylistModeSchema, queueArtifactKindSchema, queueChoiceSchema, queueItemStatusSchema, queueLaneSchema, statusKeySchema, ytDlpErrorKindSchema} from './schemas.js'
import {preparedJobSchema} from './preparedJob.js'

// Used by both the queue IPC handlers and QueueStore.load to reject corrupted
// persistence (manual edits, partial writes). The error shape is exported for
// IPC input validation (queue:cmd:probeFailed) — the same shape the item uses.
const localizedErrorSchemaShape = z.object({kind: ytDlpErrorKindSchema, raw: z.string(), languageCodes: z.array(z.string()).optional()})

const statusSnapshotSchema = z.object({key: statusKeySchema, params: z.record(z.string(), z.union([z.string(), z.number()])).optional()})

const queueResumeContextSchema = z.object({kind: z.literal('media-retry'), tempDir: z.string().min(1), reason: z.enum(['media-transfer', 'postprocess']), failureKind: ytDlpErrorKindSchema})
const probeInfoJsonRefSchema = z.object({id: z.string().min(1), createdAt: z.string().min(1), videoId: z.string().min(1).optional(), formatsWithheld: z.literal(true).optional(), auth: jobAuthSchema.optional()})
const queueArtifactSchema = z.object({id: z.string().min(1), kind: queueArtifactKindSchema, path: z.string().min(1), fileName: z.string().min(1), sizeBytes: z.number().int().nonnegative().optional(), discoveredAt: z.string().min(1), missing: z.boolean().optional(), internal: z.boolean().optional()})

export const queueItemSchema = z
	.object({
		id: z.string(),
		url: z.string(),
		title: z.string(),
		// Fabricated flat-playlist row title (`Untitled · #N`) — see QueueItem.
		titleIsPlaceholder: z.literal(true).optional(),
		thumbnail: z.string(),
		outputDir: z.string(),
		formatLabel: z.string(),
		status: queueItemStatusSchema,
		lane: queueLaneSchema.default('normal'),
		progressPercent: z.number(),
		progressDetail: z.string().nullable(),
		lastStatus: statusSnapshotSchema.nullable(),
		error: localizedErrorSchemaShape.nullable(),
		addedAt: z.string().nullable().default(null),
		finishedAt: z.string().nullable(),
		playlistGroupId: z.string().min(1).optional(),
		// Per-item opt-out for the playlist `.m3u` artifact. Defaults true so
		// pre-existing persisted items (and single-mode items, which ignore it)
		// keep the historical always-on behavior; only an explicit `false` set by
		// the wizard suppresses the write. Consulted in playlist mode only.
		writeM3u: z.boolean().default(true),
		// Persisted resume context. `lastJobId` is set iff status ∈ {running,
		// paused-active}; `tempDir` is set iff status === 'paused-active' and the
		// job was paused mid-download. `tempDir` survives app restart so the
		// resumed yt-dlp run can target the same .part files. Both undefined for
		// paused-held items (they never spawned a job yet).
		tempDir: z.string().min(1).optional(),
		lastJobId: z.string().min(1).optional(),
		resumeContext: queueResumeContextSchema.optional(),
		// Automatic-retry bookkeeping. `retryCount` is how many automatic
		// retries this item has already consumed; `retryAt` is set only while
		// one is scheduled, so a restart can re-arm the timer instead of
		// stranding the item in error.
		retryCount: z.number().int().min(0).default(0),
		retryAt: z.string().optional(),
		probeInfoJsonRef: probeInfoJsonRefSchema.optional(),
		// Sticky once escalated: the job keeps the Explore session for every run.
		auth: jobAuthSchema.optional(),
		artifacts: z.array(queueArtifactSchema).default([]),
		// The playlist mode a placeholder's probe runs with, decided at intake
		// (the policy, or the user's answer to the mixed-URL prompt); a retry
		// probes the same way.
		probeMode: probePlaylistModeSchema.optional(),
		choice: queueChoiceSchema.optional(),
		// Placeholder rows only: the profile and folders the row was placed
		// with. A row saved before they were stored has none, and prepares with
		// the active profile.
		pinnedProfile: pinnedDownloadProfileSchema.optional(),
		// Who took the link in; copied onto every row the placeholder becomes.
		origin: intakeOriginSchema.optional(),
		job: preparedJobSchema
	})
	.superRefine((item, ctx) => {
		// An unresolved job is the probe stage's signature. It is legal only on
		// a live placeholder (`probing`, `needs-choice`) or on a terminal
		// probe-error row (probe-failed finalizes the error but never mints a
		// real job). Everywhere else the pair is a half-built row that must not persist.
		const unresolved = item.job.kind === 'unresolved'
		const legalUnresolved = item.status === QUEUE_STATUS.probing || item.status === QUEUE_STATUS.needsChoice || (item.status === QUEUE_STATUS.error && unresolved)
		if (unresolved !== legalUnresolved) {
			ctx.addIssue({code: 'custom', path: ['job'], message: 'probing status and unresolved job must appear together'})
		}
		// A placeholder's Retry probes the way it was submitted.
		if (unresolved && item.probeMode === undefined) {
			ctx.addIssue({code: 'custom', path: ['probeMode'], message: 'a placeholder row needs the probe mode it was submitted with'})
		}
		if ((item.status === QUEUE_STATUS.needsChoice) !== (item.choice !== undefined)) {
			ctx.addIssue({code: 'custom', path: ['choice'], message: 'a choice belongs to a needs-choice row, and a needs-choice row needs one'})
		}
		if (!item.resumeContext) return

		if (item.status !== QUEUE_STATUS.error && item.status !== QUEUE_STATUS.pending) {
			ctx.addIssue({code: 'custom', path: ['resumeContext'], message: 'resumeContext is only valid on error or pending queue items'})
		}
		if (item.status === QUEUE_STATUS.error && item.error == null) {
			ctx.addIssue({code: 'custom', path: ['resumeContext'], message: 'resumeContext on an error item requires an error payload'})
		}
		if (item.error && item.error.kind !== item.resumeContext.failureKind) {
			ctx.addIssue({code: 'custom', path: ['resumeContext', 'failureKind'], message: 'resumeContext.failureKind must match error.kind when error is present'})
		}
		if (item.tempDir && item.tempDir !== item.resumeContext.tempDir) {
			ctx.addIssue({code: 'custom', path: ['resumeContext', 'tempDir'], message: 'resumeContext.tempDir must match top-level tempDir when both are present'})
		}
	})

export const queueArraySchema = z.array(queueItemSchema)
