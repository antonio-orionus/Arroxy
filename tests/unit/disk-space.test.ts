import {describe, expect, it, vi, beforeEach} from 'vitest'
import {checkDiskSpace} from '@main/utils/diskSpace.js'

vi.mock('node:fs/promises', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs/promises')>()
	return {...actual, statfs: vi.fn()}
})

import {statfs} from 'node:fs/promises'

beforeEach(() => {
	vi.clearAllMocks()
})

function mockStatfs(freeBytes: number) {
	// bsize=4096, bavail computed from freeBytes
	const bsize = 4096
	const bavail = Math.floor(freeBytes / bsize)
	vi.mocked(statfs).mockResolvedValue({bsize, bavail} as never)
}

describe('checkDiskSpace', () => {
	it('returns ok=true when free space exceeds required×margin', async () => {
		mockStatfs(10_000_000_000) // 10 GB free
		const result = await checkDiskSpace('/some/dir', 4_000_000_000) // 4 GB expected → needs 6 GB with 1.5×
		expect(result.ok).toBe(true)
		expect(result.freeBytes).toBeGreaterThan(0)
	})

	it('returns ok=false when free space is below required×margin', async () => {
		mockStatfs(500_000_000) // 500 MB free
		const result = await checkDiskSpace('/some/dir', 400_000_000) // 400 MB → needs 600 MB with 1.5×
		expect(result.ok).toBe(false)
		expect(result.freeBytes).toBeDefined()
		expect(result.requiredBytes).toBeGreaterThan(result.freeBytes!)
	})

	it('still probes when expectedBytes undefined and uses minFreeBytes floor', async () => {
		mockStatfs(50 * 1024 * 1024) // 50 MB free, below 200 MB default floor
		const result = await checkDiskSpace('/some/dir', undefined)
		expect(statfs).toHaveBeenCalled()
		expect(result.ok).toBe(false)
		expect(result.requiredBytes).toBe(200 * 1024 * 1024)
	})

	it('returns ok=true when expectedBytes undefined and free space exceeds floor', async () => {
		mockStatfs(5 * 1024 * 1024 * 1024) // 5 GB free
		const result = await checkDiskSpace('/some/dir', undefined)
		expect(result.ok).toBe(true)
	})

	it('requiredBytes uses max(expectedBytes×margin, minFreeBytes) — floor wins for tiny expected', async () => {
		mockStatfs(0)
		// 10 MB expected × 1.5 = 15 MB, floor 200 MB wins
		const result = await checkDiskSpace('/some/dir', 10 * 1024 * 1024)
		expect(result.requiredBytes).toBe(200 * 1024 * 1024)
	})

	it('respects custom minFreeBytes', async () => {
		mockStatfs(150 * 1024 * 1024) // 150 MB free
		const result = await checkDiskSpace('/some/dir', undefined, 1.5, 100 * 1024 * 1024)
		expect(result.ok).toBe(true) // 150 MB > 100 MB floor
		expect(result.requiredBytes).toBe(100 * 1024 * 1024)
	})

	it('requiredBytes = expectedBytes × marginFactor', async () => {
		mockStatfs(0)
		const result = await checkDiskSpace('/some/dir', 1_000_000_000, 2.0)
		expect(result.requiredBytes).toBe(2_000_000_000)
	})

	it('uses default margin of 1.5', async () => {
		mockStatfs(0)
		const result = await checkDiskSpace('/some/dir', 1_000_000_000)
		expect(result.requiredBytes).toBe(1_500_000_000)
	})

	it('returns ok=false with `error` set when statfs throws ENOENT', async () => {
		// Distinguish "checked and passed" (ok:true, no error) from "couldn't
		// check" (ok:false, error message present). Callers that need to be
		// lenient (post-hoc disk probe) can inspect `error` and decide whether
		// to use the verdict or skip it.
		vi.mocked(statfs).mockRejectedValue(Object.assign(new Error('no such file'), {code: 'ENOENT'}))
		const result = await checkDiskSpace('/nonexistent/dir', 1_000_000_000)
		expect(result.ok).toBe(false)
		expect(result.error).toContain('no such file')
		expect(result.freeBytes).toBeUndefined()
	})

	it('returns ok=false with `error` set when statfs throws EACCES', async () => {
		vi.mocked(statfs).mockRejectedValue(Object.assign(new Error('permission denied'), {code: 'EACCES'}))
		const result = await checkDiskSpace('/protected/dir', 1_000_000_000)
		expect(result.ok).toBe(false)
		expect(result.error).toContain('permission denied')
		expect(result.freeBytes).toBeUndefined()
	})

	it('returns freeBytes from statfs (bsize × bavail)', async () => {
		vi.mocked(statfs).mockResolvedValue({bsize: 512, bavail: 1000} as never)
		const r2 = await checkDiskSpace('/dir', 9999)
		expect(r2.freeBytes).toBe(512 * 1000) // 512_000
	})
})
