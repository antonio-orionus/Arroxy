import {z} from 'zod'
import {idSchema} from './views'

// The fixed public error table. The app maps every internal failure to one of
// these codes at the Control API boundary; clients branch on the code, never on
// the message. A new code is a new protocol major: clients validate it.
export const controlErrorCodeSchema = z.enum(['not_found', 'invalid_state', 'invalid_request', 'profile_unavailable', 'desktop_required', 'approval_pending', 'unauthorized', 'rate_limited', 'limit_exceeded', 'unsupported_site', 'probe_failed', 'version_unsupported', 'handshake_timeout', 'internal'])
export type ControlErrorCode = z.infer<typeof controlErrorCodeSchema>
export const CONTROL_ERROR_CODES = controlErrorCodeSchema.options

interface ControlErrorTableEntry {
	// Whether the same request can succeed later unchanged. An error instance
	// may override it (a probe failure is retryable or not by its yt-dlp kind).
	readonly retryable: boolean
	// One line telling the caller what to do next.
	readonly next: string
}

export const CONTROL_ERROR_TABLE = {
	not_found: {retryable: false, next: 'Check the id with queue.list or intake.get; finished items are removed after a while.'},
	invalid_state: {retryable: false, next: 'Read the current state with queue.get or intake.get; the action does not apply to it now.'},
	invalid_request: {retryable: false, next: 'Fix the request to match the arroxy-control schema for this method.'},
	profile_unavailable: {retryable: false, next: 'Pick an enabled profile from profiles.list, or leave profile out to use the active one.'},
	desktop_required: {retryable: false, next: 'Finish this in the Arroxy window.'},
	approval_pending: {retryable: true, next: 'Ask the user to choose Allow in Arroxy, then connect again and send auth with this approvalId.'},
	unauthorized: {retryable: false, next: 'Read the discovery file again for a fresh token, or ask the user to allow this client again.'},
	rate_limited: {retryable: true, next: 'Wait until the site cooldown in status ends, then retry.'},
	limit_exceeded: {retryable: false, next: 'Ask for fewer items in one request.'},
	unsupported_site: {retryable: false, next: 'Use a link from a site yt-dlp supports.'},
	probe_failed: {retryable: true, next: 'Call intake.retry; if it fails again, open the link in a browser to check it.'},
	version_unsupported: {retryable: false, next: 'Update the client or Arroxy so both speak a common protocol major.'},
	handshake_timeout: {retryable: true, next: 'Connect again and finish hello and auth within 2 s.'},
	internal: {retryable: true, next: "Retry once; if it fails again, check Arroxy's log."}
} as const satisfies Record<ControlErrorCode, ControlErrorTableEntry>

// Known detail fields, all optional. Unknown ones are dropped, so a later minor
// can add more.
export const controlErrorDetailsSchema = z.object({
	// The ytdlp-errors kind behind a probe_failed.
	ytdlpKind: z.string().min(1).optional(),
	// Hand this back in auth, on a new connection, once the user has chosen Allow.
	approvalId: idSchema.optional(),
	retryAfterMs: z.number().int().nonnegative().optional(),
	limit: z.number().int().nonnegative().optional(),
	clientMajors: z.array(z.number().int().positive()).optional(),
	serverMajors: z.array(z.number().int().positive()).optional()
})
export type ControlErrorDetails = z.infer<typeof controlErrorDetailsSchema>

export const controlErrorSchema = z.object({code: controlErrorCodeSchema, message: z.string(), retryable: z.boolean(), next: z.string().min(1), details: controlErrorDetailsSchema.optional()})
export type ControlError = z.infer<typeof controlErrorSchema>

interface ControlErrorOptions {
	readonly retryable?: boolean
	readonly details?: ControlErrorDetails
}

export function controlError(code: ControlErrorCode, message: string, options: ControlErrorOptions = {}): ControlError {
	const entry = CONTROL_ERROR_TABLE[code]
	const error: ControlError = {code, message, retryable: options.retryable ?? entry.retryable, next: entry.next}
	if (options.details) error.details = options.details
	return error
}
