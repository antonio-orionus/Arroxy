import {randomUUID} from 'node:crypto'
import type {Dirent} from 'node:fs'
import {mkdir, readdir, rm, stat, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import type {ProbeInfoJsonRef} from '@shared/types.js'

const CACHE_DIR = 'probe-info-cache-v1'
const REF_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1_000

function isValidRefId(id: string): boolean {
	return REF_ID_RE.test(id)
}

export class ProbeInfoJsonCache {
	private readonly dir: string

	constructor(userDataPath: string) {
		this.dir = join(userDataPath, CACHE_DIR)
	}

	async write(info: unknown, opts: {videoId?: string | null} = {}): Promise<ProbeInfoJsonRef> {
		await mkdir(this.dir, {recursive: true})
		const id = randomUUID()
		const createdAt = new Date().toISOString()
		await writeFile(this.pathFor(id), `${JSON.stringify(info)}\n`, 'utf8')
		return {id, createdAt, ...(opts.videoId ? {videoId: opts.videoId} : {})}
	}

	async resolve(ref: ProbeInfoJsonRef | undefined): Promise<string | undefined> {
		if (!ref || !isValidRefId(ref.id)) return undefined
		const path = this.pathFor(ref.id)
		try {
			const s = await stat(path)
			return s.isFile() ? path : undefined
		} catch {
			return undefined
		}
	}

	async delete(ref: ProbeInfoJsonRef | undefined): Promise<void> {
		if (!ref || !isValidRefId(ref.id)) return
		await rm(this.pathFor(ref.id), {force: true})
	}

	async sweepExpired(ttlMs = DEFAULT_TTL_MS): Promise<void> {
		let entries: Dirent[]
		try {
			entries = await readdir(this.dir, {withFileTypes: true})
		} catch {
			return
		}
		const cutoff = Date.now() - ttlMs
		await Promise.all(
			entries.flatMap(entry => {
				if (!entry.isFile() || !entry.name.endsWith('.info.json')) return []
				return [
					(async () => {
						const path = join(this.dir, entry.name)
						try {
							const s = await stat(path)
							if (s.mtimeMs <= cutoff) await rm(path, {force: true})
						} catch {
							/* best effort */
						}
					})()
				]
			})
		)
	}

	private pathFor(id: string): string {
		return join(this.dir, `${id}.info.json`)
	}
}
