import {z} from 'zod'
import {type ControlError, controlError, controlErrorSchema} from './errors'
import {CONTROL_EVENTS, type ControlEventData, type ControlEventName, isControlEventName} from './events'
import {CONTROL_METHODS, type ControlMethod, type ControlParams, type ControlResult, isControlMethod} from './requests'
import {idSchema} from './views'

// One Control API message, as carried by every entry point (one per line on the
// local socket, one per Noise frame on the relay). The envelope is strict: an
// unknown field is a framing error, not something to skip. What it carries
// (`params`, `result`, `data`) is parsed per method or event kind.

const methodNameSchema = z.string().min(1).max(64)

export const controlRequestEnvelopeSchema = z.strictObject({type: z.literal('request'), id: idSchema, method: methodNameSchema, params: z.unknown().optional()})
export type ControlRequestEnvelope = z.infer<typeof controlRequestEnvelopeSchema>

// A failure's id is null only on the closing error line that answers no request,
// such as handshake_timeout.
export const controlResponseEnvelopeSchema = z.discriminatedUnion('ok', [z.strictObject({type: z.literal('response'), id: idSchema, ok: z.literal(true), result: z.unknown()}), z.strictObject({type: z.literal('response'), id: idSchema.nullable(), ok: z.literal(false), error: controlErrorSchema})])
export type ControlResponseEnvelope = z.infer<typeof controlResponseEnvelopeSchema>

// `seq` counts this subscription's events after filtering and coalescing; a gap
// or a new `bootId` means "resync".
export const controlEventEnvelopeSchema = z.strictObject({type: z.literal('event'), event: methodNameSchema, seq: z.number().int().nonnegative(), bootId: idSchema, data: z.unknown()})
export type ControlEventEnvelope = z.infer<typeof controlEventEnvelopeSchema>

export const controlEnvelopeSchema = z.union([controlRequestEnvelopeSchema, controlResponseEnvelopeSchema, controlEventEnvelopeSchema])
export type ControlEnvelope = z.infer<typeof controlEnvelopeSchema>

export type ControlRequest = {[M in ControlMethod]: {readonly type: 'request'; readonly id: string; readonly method: M; readonly params: ControlParams<M>}}[ControlMethod]

export type ParsedControlRequest = {readonly ok: true; readonly request: ControlRequest} | {readonly ok: false; readonly error: ControlError}

// What the app does with a request envelope: an unknown method or params that
// do not match it answer invalid_request.
export function parseControlRequest(envelope: ControlRequestEnvelope): ParsedControlRequest {
	if (!isControlMethod(envelope.method)) return {ok: false, error: controlError('invalid_request', `Unknown method ${envelope.method}.`)}
	const method = envelope.method
	// Only missing params mean "none"; an explicit null is a malformed request.
	const parsed = CONTROL_METHODS[method].params.safeParse(envelope.params === undefined ? {} : envelope.params)
	if (!parsed.success) return {ok: false, error: controlError('invalid_request', `Invalid params for ${method}: ${z.prettifyError(parsed.error)}`)}
	// parsed.data came from CONTROL_METHODS[method].params, so it is ControlParams<typeof method>;
	// TypeScript cannot correlate the two unions without this.
	return {ok: true, request: {type: 'request', id: envelope.id, method, params: parsed.data} as ControlRequest}
}

// What a client does with the `result` of a successful response to `method`.
export function parseControlResult<M extends ControlMethod>(method: M, result: unknown): z.ZodSafeParseResult<ControlResult<M>> {
	// CONTROL_METHODS[method].result parses to ControlResult<M> by definition;
	// TypeScript cannot follow that through the generic index.
	return CONTROL_METHODS[method].result.safeParse(result) as z.ZodSafeParseResult<ControlResult<M>>
}

export type ControlEvent = {[E in ControlEventName]: {readonly type: 'event'; readonly event: E; readonly seq: number; readonly bootId: string; readonly data: ControlEventData<E>}}[ControlEventName]

// `ignored`: a kind this version does not know, which a client skips.
export type ParsedControlEvent = {readonly status: 'event'; readonly event: ControlEvent} | {readonly status: 'ignored'} | {readonly status: 'invalid'; readonly error: z.ZodError}

export function parseControlEvent(envelope: ControlEventEnvelope): ParsedControlEvent {
	if (!isControlEventName(envelope.event)) return {status: 'ignored'}
	const event = envelope.event
	const parsed = CONTROL_EVENTS[event].safeParse(envelope.data)
	if (!parsed.success) return {status: 'invalid', error: parsed.error}
	// parsed.data came from CONTROL_EVENTS[event], so it is ControlEventData<typeof event>.
	return {status: 'event', event: {type: 'event', event, seq: envelope.seq, bootId: envelope.bootId, data: parsed.data} as ControlEvent}
}
