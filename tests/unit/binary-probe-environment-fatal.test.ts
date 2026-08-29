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
import type {DependencySource} from '@shared/types.js'

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

const MANAGED: DependencySource = {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.invalid/yt-dlp'}
const USER_OVERRIDE: DependencySource = {kind: 'manualOverride', path: '/somewhere/the/user/pointed'}

describe('isEnvironmentFatalFailure', () => {
	it('always treats slowness as the machine, whoever chose the path', () => {
		expect(isEnvironmentFatalFailure('timeout', MANAGED)).toBe(true)
		expect(isEnvironmentFatalFailure('timeout', USER_OVERRIDE)).toBe(true)
	})

	// We chmod what we materialize and know it is unquarantined. The OS refusing
	// it anyway says the environment is the problem, and re-downloading into the
	// same place cannot help.
	it('treats a refusal of our own artifact as environment-fatal', () => {
		expect(isEnvironmentFatalFailure('permission_denied', MANAGED)).toBe(true)
		expect(isEnvironmentFatalFailure('blocked_or_quarantined', MANAGED)).toBe(true)
	})

	// The regression this guards: a 0644 file behind ARROXY_YT_DLP_PATH says
	// nothing about whether a managed download would run. Treating it as fatal
	// skipped every managed candidate and stranded exactly the users who set an
	// override to work around a broken install.
	it('treats a refusal of a path the user supplied as that path, not the machine', () => {
		expect(isEnvironmentFatalFailure('permission_denied', USER_OVERRIDE)).toBe(false)
		expect(isEnvironmentFatalFailure('permission_denied', {kind: 'envOverride', path: '/x', envVar: 'ARROXY_YT_DLP_PATH'})).toBe(false)
		expect(isEnvironmentFatalFailure('blocked_or_quarantined', {kind: 'systemPath', path: '/usr/local/bin/yt-dlp'})).toBe(false)
	})

	it('leaves candidate-specific failures free to fall through from any source', () => {
		for (const source of [MANAGED, USER_OVERRIDE]) {
			expect(isEnvironmentFatalFailure('spawn_failed', source)).toBe(false)
			expect(isEnvironmentFatalFailure('bad_exit_code', source)).toBe(false)
			expect(isEnvironmentFatalFailure('hash_failed', source)).toBe(false)
			expect(isEnvironmentFatalFailure('download_failed', source)).toBe(false)
		}
	})
})

describe.skipIf(process.platform === 'win32')('probeBinary failure classification', () => {
	it('classifies a binary that outlives its budget as a timeout, not a bad binary', async () => {
		const script = await writeScript('hangs.sh', '#!/bin/sh\nsleep 30\n')

		const result = await probeBinary(script, ['--version'], 300)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('timeout')
		expect(isEnvironmentFatalFailure(result.failure.kind, MANAGED)).toBe(true)
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
		expect(isEnvironmentFatalFailure(result.failure.kind, MANAGED)).toBe(false)
	})

	it('classifies a non-zero exit as candidate-specific', async () => {
		const script = await writeScript('broken.sh', '#!/bin/sh\nexit 3\n')

		const result = await probeBinary(script, ['--version'], 5_000)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('bad_exit_code')
		expect(isEnvironmentFatalFailure(result.failure.kind, MANAGED)).toBe(false)
	})

	// EACCES on an artifact we materialized means the cache directory itself is
	// unusable, and re-downloading into it cannot help. The same errno on a path
	// the user supplied means only that their file is not executable.
	it('reads a file the OS refuses to execute against the source it came from', async () => {
		const script = await writeScript('not-executable.sh', '#!/bin/sh\necho hi\n', 0o644)

		const result = await probeBinary(script, ['--version'], 5_000)

		expect(result.ok).toBe(false)
		if (result.ok) return
		expect(result.failure.kind).toBe('permission_denied')
		expect(isEnvironmentFatalFailure(result.failure.kind, MANAGED)).toBe(true)
		expect(isEnvironmentFatalFailure(result.failure.kind, USER_OVERRIDE)).toBe(false)
	})

	it('accepts a binary that answers slowly but within the yt-dlp budget', async () => {
		const script = await writeScript('slow.sh', '#!/bin/sh\nsleep 0.4\necho "2026.08.27"\n')

		const result = await probeBinary(script, ['--version'], probeTimeoutMs('yt-dlp'))

		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.output).toBe('2026.08.27')
	})
})
