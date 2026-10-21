import {z} from 'zod'
import {controlErrorCodeSchema} from './errors'
import {handshakeNonceSchema, handshakeProofSchema} from './handshake'
import {appStatusSchema, idSchema, intakeViewSchema, profileRefSchema, profileViewSchema, queueItemViewSchema, schedulerStateSchema} from './views'

// Every request the Control API v1 answers, with its params and result. Both
// sides drop unknown payload fields, so a newer peer within the same major can
// send more than this version knows.

// Longest a `wait` may hold a request open, so no call outlives a client's
// silence limit.
export const WAIT_TIMEOUT_MAX_MS = 240_000

// `trusted` reads, adds and controls. `paths.read` adds artifact paths to
// queue items; only a local client the user allowed with it gets it.
export const controlRuleSchema = z.enum(['trusted', 'paths.read'])
export type ControlRule = z.infer<typeof controlRuleSchema>

// hello and auth are the handshake; see handshake.ts for the order and the proofs.
// hello carries no credential, so a squatter on the socket learns nothing from it.
const helloParamsSchema = z.object({
	// No shared major answers version_unsupported here, before any proof.
	protocol: z.object({majors: z.array(z.number().int().positive()).min(1)}),
	// Shown to the user as a label when they are asked to allow the client.
	client: z.object({name: z.string().min(1).max(100), version: z.string().min(1).max(64).optional()}),
	clientNonce: handshakeNonceSchema
})

// The challenge. serverProof is handshakeServerProof(token, clientNonce): the
// client checks it before sending auth and drops the connection if it does not
// match.
const helloResultSchema = z.object({serverProof: handshakeProofSchema, serverNonce: handshakeNonceSchema})

// proof is handshakeClientProof(key, serverNonce, clientNonce). The key is the
// client secret with `clientId` for a known client, and the token otherwise:
// alone to ask the user to allow this client (approval_pending), or with the
// `approvalId` it carried, on a new connection once the user has chosen Allow,
// to collect the client id and secret.
const authParamsSchema = z.union([z.object({proof: handshakeProofSchema, clientId: idSchema.optional(), approvalId: z.never().optional()}), z.object({proof: handshakeProofSchema, approvalId: idSchema, clientId: z.never().optional()})])

const authResultSchema = z.object({
	protocol: z.number().int().positive(),
	appVersion: z.string().min(1),
	// Changes every launch. A new boot id means the app forgot its intakes and
	// restarted its event order: resync.
	bootId: idSchema,
	clientId: idSchema,
	rules: z.array(controlRuleSchema),
	// Issued once, on the auth that collects an approval. Keep it; it is never sent again.
	clientSecret: z.string().min(1).optional()
})

const emptySchema = z.object({})
const itemParamsSchema = z.object({itemId: idSchema})
const itemResultSchema = z.object({item: queueItemViewSchema})
const intakeParamsSchema = z.object({intakeId: idSchema})
const intakeResultSchema = z.object({intake: intakeViewSchema})

// `settled`: an intake has left `probing`, or an item no longer moves on its
// own (done, failed, cancelled, paused or needs your choice). `done`: an intake
// is queued and every row it made is done, or an item is done.
const waitUntilSchema = z.enum(['settled', 'done'])
const waitTimeoutSchema = z.number().int().nonnegative().max(WAIT_TIMEOUT_MAX_MS)
const waitParamsSchema = z.union([z.object({intakeId: idSchema, itemId: z.never().optional(), until: waitUntilSchema, timeoutMs: waitTimeoutSchema}), z.object({itemId: idSchema, intakeId: z.never().optional(), until: waitUntilSchema, timeoutMs: waitTimeoutSchema})])
// At the timeout `reached` is false and the target is its current state.
const waitResultSchema = z.object({reached: z.boolean(), target: z.discriminatedUnion('kind', [z.object({kind: z.literal('intake'), intake: intakeViewSchema}), z.object({kind: z.literal('item'), item: queueItemViewSchema})])})

const linksAddParamsSchema = z.object({
	// Chosen by the client. The same (client, requestId) returns the same intake,
	// so a retransmit never queues twice.
	requestId: idSchema,
	// `pattern` repeats the protocol rule for the JSON Schema export, which keeps
	// only `format: uri` otherwise. JSON Schema patterns take no flags, hence the
	// spelled-out case.
	url: z
		.url({protocol: /^https?$/i})
		.max(4096)
		.meta({pattern: '^[Hh][Tt][Tt][Pp][Ss]?://'}),
	// An existing profile, used for this link only and never made active. Left
	// out, the active profile prepares it.
	profile: profileRefSchema.optional(),
	// Left out, a link to a video in a playlist queues the video, as the hotkey does.
	playlistMode: z.enum(['video', 'playlist']).optional()
})

// Reviewing the entries one by one happens in the window: it is not a choice
// here, and asking for it answers desktop_required.
const intakeChooseParamsSchema = z.discriminatedUnion('take', [z.object({intakeId: idSchema, take: z.literal('all')}), z.object({intakeId: idSchema, take: z.literal('first'), count: z.number().int().positive()})])

// Partial outcomes: the scheduler state after the call, the items it moved and
// the ones it could not.
const bulkResultSchema = z.object({scheduler: schedulerStateSchema, done: z.array(idSchema), failed: z.array(z.object({itemId: idSchema, code: controlErrorCodeSchema}))})

export const CONTROL_METHODS = {
	hello: {params: helloParamsSchema, result: helloResultSchema},
	auth: {params: authParamsSchema, result: authResultSchema},
	status: {params: emptySchema, result: appStatusSchema},
	'profiles.list': {params: emptySchema, result: z.object({profiles: z.array(profileViewSchema), active: profileRefSchema})},
	// Pages are cut by size as well as by `limit`; follow `nextCursor` until it is null.
	'queue.list': {params: z.object({cursor: z.string().min(1).optional(), limit: z.number().int().min(1).max(500).optional()}), result: z.object({items: z.array(queueItemViewSchema), nextCursor: z.string().min(1).nullable()})},
	'queue.get': {params: itemParamsSchema, result: itemResultSchema},
	'intake.get': {params: intakeParamsSchema, result: intakeResultSchema},
	wait: {params: waitParamsSchema, result: waitResultSchema},
	'links.add': {params: linksAddParamsSchema, result: z.object({intakeId: idSchema, placeholderId: idSchema})},
	'intake.choose': {params: intakeChooseParamsSchema, result: intakeResultSchema},
	// Probes the link again through intake; it never resets a row to pending.
	'intake.retry': {params: intakeParamsSchema, result: intakeResultSchema},
	'intake.cancel': {params: intakeParamsSchema, result: intakeResultSchema},
	'queue.pause': {params: itemParamsSchema, result: itemResultSchema},
	'queue.resume': {params: itemParamsSchema, result: itemResultSchema},
	'queue.cancel': {params: itemParamsSchema, result: itemResultSchema},
	'queue.retry': {params: itemParamsSchema, result: itemResultSchema},
	'queue.remove': {params: itemParamsSchema, result: z.object({itemId: idSchema})},
	'queue.pauseAll': {params: emptySchema, result: bulkResultSchema},
	'queue.resumeAll': {params: emptySchema, result: bulkResultSchema},
	// Starts this connection's event feed. With `snapshot` (the default) the
	// queue arrives first as queue.snapshot pages, then the deltas.
	'events.subscribe': {params: z.object({snapshot: z.boolean().optional()}), result: z.object({bootId: idSchema})},
	'events.unsubscribe': {params: emptySchema, result: emptySchema}
} as const

export type ControlMethod = keyof typeof CONTROL_METHODS
export type ControlParams<M extends ControlMethod> = z.output<(typeof CONTROL_METHODS)[M]['params']>
export type ControlResult<M extends ControlMethod> = z.output<(typeof CONTROL_METHODS)[M]['result']>

const controlMethodSchema = z.enum(Object.keys(CONTROL_METHODS) as [ControlMethod, ...ControlMethod[]])
export const CONTROL_METHOD_NAMES = controlMethodSchema.options

export function isControlMethod(name: string): name is ControlMethod {
	return controlMethodSchema.safeParse(name).success
}
