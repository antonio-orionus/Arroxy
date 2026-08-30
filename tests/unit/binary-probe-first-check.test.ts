// The splash needs to distinguish a first check of a given binary file from a
// reused verdict: the first is a full spawn that a security scanner can hold for
// ~15s, the second is a memo read that returns immediately. Both emit `probing`,
// so without a flag the renderer cannot tell a slow wait from an instant one.

import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi} from 'vitest'
import {BinaryManager, type ProbeOutcome} from '@main/services/BinaryManager.js'
import type {ProbeVerdictStore} from '@main/services/binary/ProbeVerdictCache.js'
import type {DependencyAttempt, DependencyId, DependencySource, WarmupProgressEvent} from '@shared/types.js'

vi.mock('@main/services/binary/BinaryProbe.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/binary/BinaryProbe.js')>()
	return {...actual, probeBinary: vi.fn(async () => ({ok: true as const, output: 'yt-dlp 2026.08.27'}))}
})

const source: DependencySource = {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.invalid/yt-dlp'}

async function probeOnce(memo: string | null): Promise<WarmupProgressEvent[]> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bm-firstcheck-'))
	const verdicts: ProbeVerdictStore = {get: async () => memo, record: async () => undefined, forget: async () => undefined, clear: async () => undefined}
	const mgr = new BinaryManager(dir, {probeVerdicts: verdicts})
	const events: WarmupProgressEvent[] = []
	const internal = mgr as unknown as {probeAndAccept: (id: DependencyId, s: DependencySource, p: string, attempts: DependencyAttempt[], onProgress?: (e: WarmupProgressEvent) => void) => Promise<ProbeOutcome>}
	await internal.probeAndAccept('yt-dlp', source, path.join(dir, 'yt-dlp'), [], e => events.push(e))
	return events
}

describe('probe first-check signalling', () => {
	it('marks a probe as the first check when no verdict is memoized', async () => {
		const probing = (await probeOnce(null)).filter(e => e.phase === 'probing')

		expect(probing).toHaveLength(1)
		expect(probing[0]?.firstCheck).toBe(true)
	})

	it('marks a probe as not the first check when a verdict is reused', async () => {
		const probing = (await probeOnce('yt-dlp 2026.08.27')).filter(e => e.phase === 'probing')

		expect(probing).toHaveLength(1)
		expect(probing[0]?.firstCheck).toBe(false)
	})
})
