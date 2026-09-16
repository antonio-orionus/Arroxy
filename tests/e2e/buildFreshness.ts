import fs from 'node:fs'
import path from 'node:path'

export interface SourceStamp {
	path: string
	mtimeMs: number
}

// Electron E2E launches the built `out/main/index.js`, not the sources. A build
// that silently failed (the build type-checks first) leaves the previous bundle
// in place, and every run then tests code that no longer exists — which looks
// exactly like the change under test not working.
export function findStaleBuild(builtAtMs: number | null, sources: readonly SourceStamp[]): SourceStamp | null {
	if (builtAtMs === null) return null
	let newest: SourceStamp | null = null
	for (const source of sources) if (source.mtimeMs > builtAtMs && (newest === null || source.mtimeMs > newest.mtimeMs)) newest = source
	return newest
}

function listSourceStamps(dir: string): SourceStamp[] {
	return fs.readdirSync(dir, {recursive: true, withFileTypes: true}).flatMap(entry => {
		if (!entry.isFile()) return []
		const full = path.join(entry.parentPath, entry.name)
		return [{path: path.relative(process.cwd(), full), mtimeMs: fs.statSync(full).mtimeMs}]
	})
}

export function assertBuildIsFresh(env: NodeJS.ProcessEnv = process.env): void {
	// Packaged-binary journeys never load out/, and an explicit opt-out covers
	// deliberately running an older bundle.
	if (env.PACKAGED_EXE || env.ARROXY_E2E_ALLOW_STALE_BUILD === '1') return
	const main = path.join(process.cwd(), 'out', 'main', 'index.js')
	const builtAtMs = fs.existsSync(main) ? fs.statSync(main).mtimeMs : null
	const stale = findStaleBuild(builtAtMs, listSourceStamps(path.join(process.cwd(), 'src')))
	if (stale) throw new Error(`out/main/index.js is older than ${stale.path}. Run \`bun run build\` (and read its output — it type-checks first and stops on errors), or set ARROXY_E2E_ALLOW_STALE_BUILD=1.`)
}
