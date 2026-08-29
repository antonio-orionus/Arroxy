// The memo's wiring, not the cache class. Every other BinaryManager test injects
// a no-op store or stubs probeAndAccept outright, so "record after a successful
// probe, reuse it on the next resolve" had no coverage at all — the riskiest new
// behaviour was the least tested.
//
// These drive the real ProbeVerdictCache against a real executable, because the
// thing under test is whether a spawn happens.

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {BinaryManager} from '@main/services/BinaryManager.js'
import type {RuntimeBinaryIndexProvider} from '@main/services/binary/RuntimeBinaryIndexService.js'

let userData = ''
let binaryPath = ''

const emptyIndex: RuntimeBinaryIndexProvider = {candidatesFor: vi.fn(async () => [])}

// Counts real spawns: each invocation appends a line, so the file length is the
// number of times the OS actually started this binary.
async function writeCountingBinary(version = '2026.08.27'): Promise<void> {
	await fs.writeFile(binaryPath, `#!/bin/sh\necho run >> "${binaryPath}.runs"\necho "${version}"\n`, {mode: 0o755})
}

async function spawnCount(): Promise<number> {
	try {
		return (await fs.readFile(`${binaryPath}.runs`, 'utf8')).split('\n').filter(Boolean).length
	} catch {
		return 0
	}
}

function manager(): BinaryManager {
	return new BinaryManager(userData, {runtimeBinaryIndex: emptyIndex})
}

beforeEach(async () => {
	userData = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-memo-wiring-'))
	binaryPath = path.join(userData, 'yt-dlp')
	await writeCountingBinary()
	process.env.ARROXY_YT_DLP_PATH = binaryPath
})

describe.skipIf(process.platform === 'win32')('BinaryManager probe memo wiring', () => {
	it('probes the binary the first time', async () => {
		const diag = await manager().resolveYtDlp()

		expect(diag.state).toBe('runnable')
		expect(diag.versionOutput).toBe('2026.08.27')
		expect(await spawnCount()).toBe(1)
	})

	// The point of the whole mechanism: a second launch must not pay for the
	// probe again. On macOS that probe is ~30s of onefile unpack and scanning.
	it('reuses the verdict on a later launch instead of spawning again', async () => {
		await manager().resolveYtDlp()

		const diag = await manager().resolveYtDlp()

		expect(diag.state).toBe('runnable')
		expect(diag.versionOutput).toBe('2026.08.27')
		expect(await spawnCount()).toBe(1)
	})

	it('re-probes once the binary on disk has changed', async () => {
		await manager().resolveYtDlp()
		await new Promise(resolve => setTimeout(resolve, 10))
		await writeCountingBinary('2026.09.01')

		const diag = await manager().resolveYtDlp()

		expect(diag.versionOutput).toBe('2026.09.01')
		expect(await spawnCount()).toBe(2)
	})

	// The recovery path that did not exist: a memoized binary never reaches the
	// probe again, so a spawn failure is the only moment the OS can tell us the
	// recorded verdict is no longer true.
	it('re-probes after a spawn failure disproves the recorded verdict', async () => {
		const mgr = manager()
		await mgr.resolveYtDlp()
		expect(await spawnCount()).toBe(1)

		await mgr.forgetProbeVerdict('yt-dlp')
		const diag = await manager().resolveYtDlp()

		expect(diag.state).toBe('runnable')
		expect(await spawnCount()).toBe(2)
	})

	it('drops the forgotten path from the store rather than wiping it', async () => {
		const mgr = manager()
		await mgr.resolveYtDlp()
		const verdictFile = path.join(userData, 'runtime-cache', 'probe-verdicts.json')
		expect(await fs.readFile(verdictFile, 'utf8')).toContain(binaryPath)

		await mgr.forgetProbeVerdict('yt-dlp')

		// The file survives — other binaries' verdicts are not collateral.
		const raw = await fs.readFile(verdictFile, 'utf8')
		expect(raw).not.toContain(binaryPath)
	})

	// "Check again" in the repair panel has to mean a real re-probe, not a
	// replayed verdict.
	it('re-probes after an explicit invalidate', async () => {
		const mgr = manager()
		await mgr.resolveYtDlp()

		mgr.invalidateResolved()
		await new Promise(resolve => setTimeout(resolve, 20))
		await manager().resolveYtDlp()

		expect(await spawnCount()).toBe(2)
	})

	// A failure is a fact about one moment — a scanner mid-update, a machine under
	// load — and must never be cached, or a transient stumble would be permanent.
	it('does not record a verdict for a binary that failed its probe', async () => {
		await fs.writeFile(binaryPath, `#!/bin/sh\necho run >> "${binaryPath}.runs"\nexit 3\n`, {mode: 0o755})

		await manager().resolveYtDlp()
		await manager().resolveYtDlp()

		// Spawned both times: nothing was replayed from the store.
		expect(await spawnCount()).toBe(2)
	})
})
