import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

const LIB = join(process.cwd(), 'scripts/test-binaries/_lib.sh')

let dir: string

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex')
}

// Drive the real bash helper: curl reads file:// URLs, so a local file stands in
// for the upstream asset without touching the network.
function runFetch(url: string, destination: string, expected?: string): void {
	const args = expected === undefined ? '' : ` '${expected}'`
	execFileSync('bash', ['-c', `source '${LIB}'; fetch '${url}' '${destination}'${args}`], {stdio: 'pipe'})
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'fetch-lib-'))
})

afterEach(() => {
	rmSync(dir, {recursive: true, force: true})
})

describe('_lib.sh fetch cache', () => {
	it('replaces a truncated cached file instead of reusing it forever', () => {
		const source = join(dir, 'upstream.bin')
		const payload = Buffer.from('a'.repeat(4096))
		writeFileSync(source, payload)
		const expected = sha256(payload)

		// Simulate the real failure: an interrupted download left a non-empty but
		// truncated file. curl exited 0, so nothing purged it, and every later
		// build reused it and died on the SHA check with no way to recover.
		const destination = join(dir, 'cached.bin')
		writeFileSync(destination, payload.subarray(0, 128))

		runFetch(`file://${source}`, destination, expected)

		expect(sha256(readFileSync(destination))).toBe(expected)
	})

	it('reuses a cached file that already matches the expected hash', () => {
		const source = join(dir, 'upstream.bin')
		writeFileSync(source, Buffer.from('payload'))
		const cached = Buffer.from('payload')
		const destination = join(dir, 'cached.bin')
		writeFileSync(destination, cached)

		// Point at a URL that cannot resolve: a genuine cache hit must not fetch.
		runFetch('file:///nonexistent/upstream.bin', destination, sha256(cached))

		expect(readFileSync(destination).toString()).toBe('payload')
	})
})
