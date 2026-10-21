import {z} from 'zod'
import {controlDiscoverySchema} from './discovery'
import {controlEnvelopeSchema} from './envelope'
import {CONTROL_ERROR_TABLE, type ControlErrorCode} from './errors'
import {CONTROL_EVENT_NAMES, CONTROL_EVENTS, type ControlEventName} from './events'
import {CONTROL_METHOD_NAMES, CONTROL_METHODS, type ControlMethod} from './requests'
import {CONTROL_PROTOCOL_MAJORS} from './version'

type JsonSchema = z.core.JSONSchema.BaseSchema

export interface ControlJsonSchemas {
	readonly protocolMajors: readonly number[]
	readonly envelope: JsonSchema
	readonly discovery: JsonSchema
	readonly methods: Record<ControlMethod, {readonly params: JsonSchema; readonly result: JsonSchema}>
	readonly events: Record<ControlEventName, JsonSchema>
	readonly errors: Record<ControlErrorCode, {readonly retryable: boolean; readonly next: string}>
}

// Input mode: an object schema leaves `additionalProperties` open unless it is
// strict, which matches the parsers (strict envelope, tolerant payloads).
function toJsonSchema(schema: z.ZodType): JsonSchema {
	return z.toJSONSchema(schema, {io: 'input'})
}

// The Control API as JSON Schema (draft 2020-12), for clients that do not use zod.
export function controlJsonSchemas(): ControlJsonSchemas {
	const methods = Object.fromEntries(CONTROL_METHOD_NAMES.map(method => [method, {params: toJsonSchema(CONTROL_METHODS[method].params), result: toJsonSchema(CONTROL_METHODS[method].result)}]))
	const events = Object.fromEntries(CONTROL_EVENT_NAMES.map(event => [event, toJsonSchema(CONTROL_EVENTS[event])]))
	return {
		protocolMajors: [...CONTROL_PROTOCOL_MAJORS],
		envelope: toJsonSchema(controlEnvelopeSchema),
		discovery: toJsonSchema(controlDiscoverySchema),
		// Object.fromEntries over every name yields the full record.
		methods: methods as ControlJsonSchemas['methods'],
		events: events as ControlJsonSchemas['events'],
		errors: CONTROL_ERROR_TABLE
	}
}
