import {z} from 'zod'

// Public projections. They never carry internal types: no temp dirs, job
// options, raw stderr or output folders. Payload objects drop unknown fields
// instead of failing, so a client keeps working when a later minor adds one.

export const idSchema = z.string().min(1).max(128)
// Milliseconds since the Unix epoch.
export const timestampSchema = z.number().int().nonnegative()

export const profileRefSchema = z.discriminatedUnion('kind', [z.object({kind: z.literal('builtin'), id: idSchema}), z.object({kind: z.literal('custom'), id: idSchema})])
export type ProfileRef = z.infer<typeof profileRefSchema>

export const profileMediaKindSchema = z.enum(['videoAudio', 'videoOnly', 'audioOnly', 'subtitlesOnly'])
export type ProfileMediaKind = z.infer<typeof profileMediaKindSchema>

export const profileViewSchema = z.object({ref: profileRefSchema, label: z.string().min(1), kind: profileMediaKindSchema})
export type ProfileView = z.infer<typeof profileViewSchema>

// `paused` covers a row paused before it started and one paused mid-download.
export const queueItemStatusSchema = z.enum(['probing', 'needsYourChoice', 'pending', 'running', 'paused', 'done', 'failed', 'cancelled'])
export type QueueItemStatus = z.infer<typeof queueItemStatusSchema>
export const QUEUE_ITEM_STATUSES = queueItemStatusSchema.options

export const queueLaneSchema = z.enum(['normal', 'priority'])
export type QueueLane = z.infer<typeof queueLaneSchema>

// Who added the row. `app` is the Arroxy window, its hotkey and Explore.
// `clientId` lets a client recognise its own rows; `label` is what the queue
// shows ("added from Pixel 8").
export const queueItemOriginSchema = z.object({kind: z.enum(['app', 'pairedDevice', 'localClient']), clientId: idSchema.optional(), label: z.string().min(1).optional()})
export type QueueItemOrigin = z.infer<typeof queueItemOriginSchema>

export const progressViewSchema = z.object({percent: z.number().min(0).max(100).nullable(), downloadedBytes: z.number().int().nonnegative().nullable(), totalBytes: z.number().int().nonnegative().nullable(), speedBytesPerSecond: z.number().nonnegative().nullable(), etaSeconds: z.number().nonnegative().nullable()})
export type ProgressView = z.infer<typeof progressViewSchema>

// `ytdlpKind` is the ytdlp-errors kind, or null when the failure did not come
// from yt-dlp. It is a string, not a closed enum: ytdlp-errors adds kinds in
// minor releases.
export const queueItemErrorViewSchema = z.object({ytdlpKind: z.string().min(1).nullable(), message: z.string(), retryable: z.boolean()})
export type QueueItemErrorView = z.infer<typeof queueItemErrorViewSchema>

export const artifactKindSchema = z.enum(['media', 'subtitle', 'thumbnail', 'description', 'companion', 'unknown'])
export type ArtifactKind = z.infer<typeof artifactKindSchema>

export const artifactViewSchema = z.object({kind: artifactKindSchema, path: z.string().min(1)})
export type ArtifactView = z.infer<typeof artifactViewSchema>

export const queueItemViewSchema = z.object({
	id: idSchema,
	title: z.string().nullable(),
	// The site the link belongs to, or null while that is unknown.
	site: z.string().min(1).nullable(),
	status: queueItemStatusSchema,
	progress: progressViewSchema.nullable(),
	lane: queueLaneSchema,
	origin: queueItemOriginSchema,
	intakeId: idSchema.nullable(),
	error: queueItemErrorViewSchema.nullable(),
	// Files the item wrote. Present only for callers holding `paths.read`.
	artifacts: z.array(artifactViewSchema).optional()
})
export type QueueItemView = z.infer<typeof queueItemViewSchema>

// What a `links.add` turned into. `probing` moves to exactly one of the others;
// `needsYourChoice` moves on through intake.choose, `probeFailed` through
// intake.retry. `loadLimit`: a playlist ran past the load limit; `total` is
// null when the site did not say how long it is, and `offered` is how many
// entries were loaded and can be queued.
export const intakeStateSchema = z.discriminatedUnion('state', [
	z.object({state: z.literal('probing')}),
	z.object({state: z.literal('queued'), itemIds: z.array(idSchema).min(1)}),
	z.object({state: z.literal('needsYourChoice'), kind: z.enum(['loadLimit', 'playlistReview']), total: z.number().int().nonnegative().nullable(), offered: z.number().int().nonnegative()}),
	z.object({state: z.literal('probeFailed'), ytdlpKind: z.string().min(1).nullable(), retryable: z.boolean()}),
	z.object({state: z.literal('nothingNew')}),
	z.object({state: z.literal('cancelled')})
])
export type IntakeState = z.infer<typeof intakeStateSchema>

export const intakeViewSchema = z.object({intakeId: idSchema, placeholderId: idSchema, state: intakeStateSchema, updatedAt: timestampSchema})
export type IntakeView = z.infer<typeof intakeViewSchema>

// Whether the queue starts pending items. Paused, running items keep running
// until paused one by one or by queue.pauseAll.
export const schedulerStateSchema = z.enum(['paused', 'running'])
export type SchedulerState = z.infer<typeof schedulerStateSchema>

export const binaryStateSchema = z.enum(['ready', 'installing', 'updating', 'missing', 'failed'])
export type BinaryState = z.infer<typeof binaryStateSchema>

export const appStatusSchema = z.object({
	// Binaries present and the queue able to start work.
	ready: z.boolean(),
	binaries: z.object({ytDlp: binaryStateSchema, ffmpeg: binaryStateSchema}),
	scheduler: schedulerStateSchema,
	// Sites Arroxy is holding off after the site asked it to slow down.
	cooldowns: z.array(z.object({site: z.string().min(1), until: timestampSchema}))
})
export type AppStatus = z.infer<typeof appStatusSchema>
