import {afterEach, describe, expect, it} from 'vitest'
import {binaryInternals} from '@main/services/BinaryManager.js'

const {classifyProbeError, probeTimeoutMs} = binaryInternals

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')!

function setPlatform(platform: string): void {
	Object.defineProperty(process, 'platform', {value: platform, configurable: true})
}

function makeErr(props: {code?: string; killed?: boolean; errno?: number; message?: string}): NodeJS.ErrnoException {
	const err = new Error(props.message ?? 'probe failed') as NodeJS.ErrnoException
	if (props.code !== undefined) err.code = props.code
	if (props.errno !== undefined) (err as {errno?: number}).errno = props.errno
	if (props.killed !== undefined) (err as {killed?: boolean}).killed = props.killed
	return err
}

afterEach(() => {
	Object.defineProperty(process, 'platform', originalPlatformDescriptor)
})

describe('classifyProbeError', () => {
	it('ENOENT → spawn_failed', () => {
		expect(classifyProbeError(makeErr({code: 'ENOENT'})).kind).toBe('spawn_failed')
	})

	it('EACCES → permission_denied', () => {
		expect(classifyProbeError(makeErr({code: 'EACCES'})).kind).toBe('permission_denied')
	})

	it('EPERM → permission_denied', () => {
		expect(classifyProbeError(makeErr({code: 'EPERM'})).kind).toBe('permission_denied')
	})

	it('ETIMEDOUT → timeout', () => {
		expect(classifyProbeError(makeErr({code: 'ETIMEDOUT'})).kind).toBe('timeout')
	})

	it('killed: true → timeout', () => {
		expect(classifyProbeError(makeErr({killed: true})).kind).toBe('timeout')
	})

	it('Windows SmartScreen marker in stderr → blocked_or_quarantined', () => {
		setPlatform('win32')
		const failure = classifyProbeError(makeErr({code: 'UNKNOWN'}), 'Windows SmartScreen prevented this app from starting')
		expect(failure.kind).toBe('blocked_or_quarantined')
	})

	it('Windows Defender threat marker in stderr → blocked_or_quarantined', () => {
		setPlatform('win32')
		const failure = classifyProbeError(makeErr({}), 'Operation aborted: virus or other threat detected')
		expect(failure.kind).toBe('blocked_or_quarantined')
	})

	it('Windows errno -4094 (UV_UNKNOWN) → blocked_or_quarantined', () => {
		setPlatform('win32')
		const failure = classifyProbeError(makeErr({errno: -4094}))
		expect(failure.kind).toBe('blocked_or_quarantined')
	})

	it('Windows generic stderr without quarantine marker → bad_exit_code (regression: H1 narrowed regex)', () => {
		setPlatform('win32')
		const failure = classifyProbeError(makeErr({code: 'EBADEXEC'}), 'Operation did not complete successfully')
		expect(failure.kind).toBe('bad_exit_code')
	})

	it('POSIX with arbitrary stderr → never blocked_or_quarantined', () => {
		setPlatform('linux')
		const failure = classifyProbeError(makeErr({code: 'EUNKNOWN'}), 'SmartScreen Defender virus 0x800704EC')
		expect(failure.kind).toBe('bad_exit_code')
	})

	it('default unknown error → bad_exit_code', () => {
		setPlatform('linux')
		expect(classifyProbeError(makeErr({})).kind).toBe('bad_exit_code')
	})

	it('preserves osCode on the failure object', () => {
		const failure = classifyProbeError(makeErr({code: 'EACCES'}))
		expect(failure.osCode).toBe('EACCES')
	})
})

describe('probeTimeoutMs', () => {
	it('allows extra first-launch time for Windows yt-dlp probes', () => {
		expect(probeTimeoutMs('yt-dlp', 'win32')).toBe(30_000)
	})

	it('keeps the default probe budget for other binaries and platforms', () => {
		expect(probeTimeoutMs('yt-dlp', 'linux')).toBe(10_000)
		expect(probeTimeoutMs('deno', 'win32')).toBe(10_000)
		expect(probeTimeoutMs('ffmpeg', 'darwin')).toBe(10_000)
	})
})
