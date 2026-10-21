import {z} from 'zod'
import {appStatusSchema, idSchema, intakeViewSchema, progressViewSchema, queueItemViewSchema} from './views'

// Event kinds and their data. Clients ignore kinds they do not know, so a
// later minor can add kinds; data drops unknown fields.
export const CONTROL_EVENTS = {
	// A row was added or changed.
	'queue.item': z.object({item: queueItemViewSchema}),
	'queue.removed': z.object({itemId: idSchema, reason: z.enum(['cancelled', 'removed', 'replaced', 'nothingNew', 'autoRemoved'])}),
	// A placeholder row became the rows its probe prepared.
	'queue.replaced': z.object({fromId: idSchema, toIds: z.array(idSchema)}),
	// Coalesced per subscriber, and dropped first when a subscriber falls behind.
	'queue.progress': z.object({itemId: idSchema, progress: progressViewSchema}),
	// One page of the queue after events.subscribe; deltas follow the `final` page.
	'queue.snapshot': z.object({items: z.array(queueItemViewSchema), final: z.boolean()}),
	'intake.updated': z.object({intake: intakeViewSchema}),
	'app.status': z.object({status: appStatusSchema}),
	// The app dropped this subscription: the subscriber fell too far behind.
	// Subscribe again for a fresh snapshot.
	'events.resync': z.object({reason: z.enum(['lagging'])})
} as const

export type ControlEventName = keyof typeof CONTROL_EVENTS
export type ControlEventData<E extends ControlEventName> = z.output<(typeof CONTROL_EVENTS)[E]>

const controlEventNameSchema = z.enum(Object.keys(CONTROL_EVENTS) as [ControlEventName, ...ControlEventName[]])
export const CONTROL_EVENT_NAMES = controlEventNameSchema.options

export function isControlEventName(name: string): name is ControlEventName {
	return controlEventNameSchema.safeParse(name).success
}
