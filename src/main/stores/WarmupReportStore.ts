import Store from 'electron-store'
import {z} from 'zod'

// What the warmup report keeps between launches: how many warmups in a row
// fetched without finishing, whether that run of attempts began on an empty
// install, and the reports the collector has not taken yet. No identifier.
const hitSchema = z.object({sid: z.string(), h: z.string(), p: z.string(), r: z.string(), us: z.string(), um: z.string(), uc: z.string(), ut: z.string(), uco: z.string(), ht: z.string()})
const keptReportSchema = z.object({hit: hitSchema, at: z.number()})

// A run sends at most two reports (`started` and one outcome), so two runs' worth.
export const KEPT_REPORTS_MAX = 4

const warmupReportStateSchema = z.object({
	attempt: z.number().int().min(0).catch(0),
	firstPending: z.boolean().catch(false),
	kept: z
		.array(z.unknown())
		.catch([])
		.transform(entries => entries.flatMap(entry => keptReportSchema.safeParse(entry).data ?? []).slice(-KEPT_REPORTS_MAX))
})

export type WarmupReportState = z.infer<typeof warmupReportStateSchema>

const EMPTY: WarmupReportState = {attempt: 0, firstPending: false, kept: []}

// A malformed file reads as a fresh start: losing a count is better than a
// report built from a value nobody wrote.
export function parseWarmupReportState(raw: unknown): WarmupReportState {
	const parsed = warmupReportStateSchema.safeParse(raw)
	return parsed.success ? parsed.data : EMPTY
}

export class WarmupReportStore {
	private readonly store: Store<{state: unknown}>

	constructor(userDataPath: string) {
		this.store = new Store<{state: unknown}>({name: 'warmup-report', cwd: userDataPath, defaults: {state: EMPTY}, clearInvalidConfig: true})
	}

	// Synchronous, so a report can still be kept while the app quits.
	read(): WarmupReportState {
		return parseWarmupReportState(this.store.get('state'))
	}

	write(state: WarmupReportState): void {
		this.store.set('state', state)
	}
}
