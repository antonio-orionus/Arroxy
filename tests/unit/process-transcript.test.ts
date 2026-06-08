import {describe, expect, it, vi} from 'vitest'
import {createHangingProcess, createTranscriptProcess} from '../helpers/processTranscript.js'

describe('process transcript test helper', () => {
	it('emits stdout, stderr, and close transcript steps', async () => {
		const proc = createTranscriptProcess([{stream: 'stdout', data: 'progress'}, {stream: 'stderr', data: 'ERROR: nope'}, {close: 1}])
		const stdout: string[] = []
		const stderr: string[] = []
		let closeCode: number | null | undefined
		proc.stdout.on('data', (chunk: Buffer) => stdout.push(chunk.toString()))
		proc.stderr.on('data', (chunk: Buffer) => stderr.push(chunk.toString()))
		proc.on('close', code => {
			closeCode = code
		})

		await vi.waitFor(() => expect(closeCode).toBe(1))

		expect(stdout).toEqual(['progress'])
		expect(stderr).toEqual(['ERROR: nope'])
	})

	it('emits spawn errors', async () => {
		const proc = createTranscriptProcess([{error: new Error('ENOENT')}])
		const errors: string[] = []
		proc.on('error', (error: Error) => errors.push(error.message))

		await vi.waitFor(() => expect(errors).toEqual(['ENOENT']))
	})

	it('can represent a process that closes only after kill', async () => {
		const onKill = vi.fn()
		const proc = createHangingProcess({onKill, closeOnKill: null})
		let closed = false
		proc.on('close', () => {
			closed = true
		})

		proc.kill()

		await vi.waitFor(() => expect(closed).toBe(true))
		expect(onKill).toHaveBeenCalledOnce()
	})
})
