// A probe failure says one of two things, and conflating them is what turned a
// single slow yt-dlp probe into a download loop: the resolver walked to the next
// candidate, paid for a fresh download, and hit the identical wall.
//
// These tests drive the real probe against real executables — a spawned process
// that hangs is process supervision, not a rule, so a mocked execFile would only
// prove the mock.

import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {isEnvironmentFatalFailure} from '@shared/dependencyPolicy.js'
import {probeBinary, probeTimeoutMs} from '@main/services/binary/BinaryProbe.js'

let tempRoot = ''

async function writeScript(name: string, body: string, mode = 0o755): Promise<string> {
	const filePath = path.join(tempRoot, name)
	await fsPromises.writeFile(filePath, body, {mode})
	return filePath
}

beforeAll(async () => {
	tempRoot = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'arroxy-probe-fatal-'))
})

afterAll(async () => {
	await fsPromises.rm(tempRoot, {recursive: true, force: true})
})

describe('isEnvironmentFatalFailure', () => {
	it('treats the machine refusing to run a binary as fatal to the whole chain', () => {
		expect(isEnvironmentFatalFailure('timeout')).toBe(true)
		expect(isEnvironmentFatalFailure('permission_denied')).toBe(true)
		expect(isEnvironmentFatalFailure('blocked_or_quarantined')).toBe(true)
	})

	it('leaves candidate-specific failures free to fall through', () => {
		expect(isEnvironmentFatalFailure('spawn_failed')).toBe(false)
		expect(isEnvironmentFatalFailure('bad_exit_code')).toBe(false)
		expect(isEnvironmentFatalFailure('hash_failed')).toBe(false)
		expect(isEnvironmentFatalFailure('download_failed')).toBe(false)
	})
})

describe.skipIf(process.platform === 'win32')('probeBinary failure classification', () => {
	it('classifies a binary that outlives its budget as a timeout, not a bad binary', async () => {
		const script = await writeScript('hangs.sh', '#!/bin/sh\nsleep 30\n')

		const result = await probeBinary(script, ['--version'], 300)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('timeout')
		expect(isEnvironmentFatalFailure(result.failure.kind)).toBe(true)
		// A timeout is not a cancellation — the chain must unwind for one and
		// shorten its leash for the other.
		expect(result.cancelled).toBeUndefined()
	})

	it('marks a cancelled probe as cancelled even though it also reads as a timeout', async () => {
		const script = await writeScript('hangs-too.sh', '#!/bin/sh\nsleep 30\n')
		const controller = new AbortController()
		const pending = probeBinary(script, ['--version'], 30_000, controller.signal)
		controller.abort()

		const result = await pending

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.cancelled).toBe(true)
	})

	it('classifies a missing file as candidate-specific, so the next candidate is still worth a try', async () => {
		const result = await probeBinary(path.join(tempRoot, 'absent'), ['--version'], 5_000)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('spawn_failed')
		expect(isEnvironmentFatalFailure(result.failure.kind)).toBe(false)
	})

	it('classifies a non-zero exit as candidate-specific', async () => {
		const script = await writeScript('broken.sh', '#!/bin/sh\nexit 3\n')

		const result = await probeBinary(script, ['--version'], 5_000)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('bad_exit_code')
		expect(isEnvironmentFatalFailure(result.failure.kind)).toBe(false)
	})

	// Deliberate: a file we cannot execute is not just this file's problem. The
	// managed path chmods what it materializes, so EACCES there means the cache
	// directory itself is unusable and re-downloading into it cannot help. Local
	// candidates are still probed — they just get the short leash.
	it('treats a file the OS refuses to execute as environment-fatal', async () => {
		const script = await writeScript('not-executable.sh', '#!/bin/sh\necho hi\n', 0o644)

		const result = await probeBinary(script, ['--version'], 5_000)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('permission_denied')
		expect(isEnvironmentFatalFailure(result.failure.kind)).toBe(true)
	})

	it('accepts a binary that answers slowly but within the yt-dlp budget', async () => {
		const script = await writeScript('slow.sh', '#!/bin/sh\nsleep 0.4\necho "2026.08.27"\n')

		const result = await probeBinary(script, ['--version'], probeTimeoutMs('yt-dlp'))

		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.output).toBe('2026.08.27')
	})
})
