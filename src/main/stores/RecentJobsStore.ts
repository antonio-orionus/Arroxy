import Store from 'electron-store'
import type {LocalizedError, RecentJob} from '@shared/types.js'

const MAX_JOBS = 30

interface RecentJobsData {
	jobs: RecentJob[]
}

// Beta builds wrote `error: { key, rawMessage? }`. Migrate to `{ kind, raw }`
// transparently on load so the recent-jobs panel survives the upgrade.
function migrateError(raw: unknown): LocalizedError | undefined {
	if (raw === undefined || raw === null) return undefined
	if (typeof raw !== 'object') return undefined
	const e = raw as {key?: unknown; rawMessage?: unknown; kind?: unknown; raw?: unknown}
	if (typeof e.kind === 'string') {
		return {kind: e.kind as LocalizedError['kind'], raw: typeof e.raw === 'string' ? e.raw : ''}
	}
	const kind = typeof e.key === 'string' ? (e.key as LocalizedError['kind']) : 'unknown'
	const rawText = typeof e.rawMessage === 'string' ? e.rawMessage : ''
	return {kind, raw: rawText}
}

function migrateJob(raw: unknown): RecentJob | null {
	if (typeof raw !== 'object' || raw === null) return null
	const j = raw as Partial<RecentJob> & {error?: unknown}
	if (typeof j.id !== 'string' || typeof j.url !== 'string' || typeof j.outputDir !== 'string' || typeof j.status !== 'string' || typeof j.finishedAt !== 'string') {
		return null
	}
	const status = j.status
	if (status !== 'completed' && status !== 'failed' && status !== 'cancelled') return null
	return {id: j.id, url: j.url, outputDir: j.outputDir, formatId: typeof j.formatId === 'string' ? j.formatId : undefined, status, finishedAt: j.finishedAt, error: migrateError(j.error)}
}

export class RecentJobsStore {
	private readonly store: Store<RecentJobsData>

	constructor(userDataPath: string) {
		this.store = new Store<RecentJobsData>({name: 'recent-jobs', cwd: userDataPath, defaults: {jobs: []}, clearInvalidConfig: true})
	}

	async list(): Promise<RecentJob[]> {
		const raw = this.store.get('jobs')
		const migrated = Array.isArray(raw) ? raw.map(migrateJob).filter((j): j is RecentJob => j !== null) : []
		await Promise.resolve()
		return migrated.toSorted((a, b) => (a.finishedAt < b.finishedAt ? 1 : -1))
	}

	async push(job: RecentJob): Promise<void> {
		const current = this.store.get('jobs')
		const merged = [job, ...current.filter(entry => entry.id !== job.id)].slice(0, MAX_JOBS)
		this.store.set('jobs', merged)
		await Promise.resolve()
	}
}
