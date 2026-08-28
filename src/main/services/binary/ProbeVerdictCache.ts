import fsPromises from 'node:fs/promises'
import path from 'node:path'

// A successful version probe is a durable fact about one exact file, but the
// resolver was re-establishing it on every launch. On macOS that meant paying
// yt-dlp's ~30s onefile unpack-and-scan before the window would open, every
// single time.
//
// Identity is (path, size, mtimeMs) rather than a content hash: managed
// artifacts already live under a content-addressed directory, and hashing a
// 35MB binary to avoid spawning it would trade one cost for another. Any
// replacement — an upgrade in place, a re-materialized artifact, a different
// PATH entry — moves at least one of the three and re-probes.
//
// Only successes are recorded. A failure is a fact about the environment at one
// moment (a scanner mid-update, a machine under load) and must not be cached.
interface ProbeVerdict {
	size: number
	mtimeMs: number
	versionOutput: string
	recordedAt: string
}

type VerdictFile = Record<string, ProbeVerdict>

function isVerdict(value: unknown): value is ProbeVerdict {
	if (typeof value !== 'object' || value === null) return false
	const candidate = value as Partial<ProbeVerdict>
	return typeof candidate.size === 'number' && typeof candidate.mtimeMs === 'number' && typeof candidate.versionOutput === 'string'
}

// Narrow port so tests (and any future in-memory strategy) can substitute the
// store without touching the resolver.
export interface ProbeVerdictStore {
	get(binaryPath: string): Promise<string | null>
	record(binaryPath: string, versionOutput: string): Promise<void>
	clear(): Promise<void>
}

export class ProbeVerdictCache implements ProbeVerdictStore {
	private readonly filePath: string

	private loaded: VerdictFile | null = null

	constructor(cacheDir: string) {
		this.filePath = path.join(cacheDir, 'probe-verdicts.json')
	}

	// Returns the recorded version output when the file at `binaryPath` is
	// byte-for-byte the one we probed, or null for anything else: no record, a
	// changed file, a deleted file, an unreadable cache.
	async get(binaryPath: string): Promise<string | null> {
		const verdicts = await this.load()
		const recorded = verdicts[binaryPath]
		if (!recorded) return null
		try {
			const stat = await fsPromises.stat(binaryPath)
			if (stat.size !== recorded.size || stat.mtimeMs !== recorded.mtimeMs) return null
			return recorded.versionOutput
		} catch {
			return null
		}
	}

	async record(binaryPath: string, versionOutput: string): Promise<void> {
		try {
			const stat = await fsPromises.stat(binaryPath)
			const verdicts = await this.load()
			verdicts[binaryPath] = {size: stat.size, mtimeMs: stat.mtimeMs, versionOutput, recordedAt: new Date().toISOString()}
			await this.persist(verdicts)
		} catch {
			// A memo we could not write costs a probe next launch. Never fatal.
		}
	}

	// Called from BinaryManager.invalidateResolved(), which is the user's
	// explicit "check again" gesture from the repair panel. That has to mean a
	// real re-probe, otherwise a binary the OS started blocking after we recorded
	// it would have no way back.
	async clear(): Promise<void> {
		this.loaded = {}
		try {
			await fsPromises.rm(this.filePath, {force: true})
		} catch {
			// Nothing to clear.
		}
	}

	private async load(): Promise<VerdictFile> {
		if (this.loaded) return this.loaded
		try {
			const raw = await fsPromises.readFile(this.filePath, 'utf8')
			const parsed: unknown = JSON.parse(raw)
			const verdicts: VerdictFile = {}
			if (typeof parsed === 'object' && parsed !== null) {
				for (const [key, value] of Object.entries(parsed)) {
					if (isVerdict(value)) verdicts[key] = value
				}
			}
			this.loaded = verdicts
		} catch {
			// Absent or corrupt: start empty rather than failing resolution.
			this.loaded = {}
		}
		return this.loaded
	}

	// Two Arroxy windows can warm up at once. Write to a pid-unique temp file and
	// rename, so a reader never observes a half-written JSON document.
	private async persist(verdicts: VerdictFile): Promise<void> {
		const tempPath = `${this.filePath}.tmp-${process.pid}`
		await fsPromises.mkdir(path.dirname(this.filePath), {recursive: true})
		await fsPromises.writeFile(tempPath, JSON.stringify(verdicts), 'utf8')
		await fsPromises.rename(tempPath, this.filePath)
	}
}
