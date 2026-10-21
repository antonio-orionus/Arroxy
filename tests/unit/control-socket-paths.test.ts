// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {controlEndpointPlan, fitsSocketPath, isOwnSocketDirName, pipePath, SOCKET_PATH_MAX_BYTES, socketPathIn} from '@main/control/socket/socketPaths.js'

// Where the control socket listens, per platform: pure, so every OS is
// checked on every OS.

describe('controlEndpointPlan', () => {
	it('uses a named pipe on Windows', () => {
		expect(controlEndpointPlan('win32', {XDG_RUNTIME_DIR: '/run/user/1000'})).toEqual({kind: 'pipe'})
	})

	it('uses /tmp on macOS, never TMPDIR', () => {
		expect(controlEndpointPlan('darwin', {TMPDIR: '/Users/a/code/arroxy/.tmp/dev', XDG_RUNTIME_DIR: '/run/user/501'})).toEqual({kind: 'unix', baseDir: '/tmp'})
	})

	it('uses XDG_RUNTIME_DIR on Linux, else /tmp', () => {
		expect(controlEndpointPlan('linux', {XDG_RUNTIME_DIR: '/run/user/1000'})).toEqual({kind: 'unix', baseDir: '/run/user/1000'})
		expect(controlEndpointPlan('linux', {XDG_RUNTIME_DIR: ''})).toEqual({kind: 'unix', baseDir: '/tmp'})
		expect(controlEndpointPlan('linux', {})).toEqual({kind: 'unix', baseDir: '/tmp'})
	})

	it('ignores a relative XDG_RUNTIME_DIR', () => {
		expect(controlEndpointPlan('linux', {XDG_RUNTIME_DIR: 'run/user/1000'})).toEqual({kind: 'unix', baseDir: '/tmp'})
	})

	it('uses the host-visible app folder under Flatpak', () => {
		expect(controlEndpointPlan('linux', {FLATPAK_ID: 'io.github.antonio_orionus.Arroxy', XDG_RUNTIME_DIR: '/run/user/1000'})).toEqual({kind: 'unix', baseDir: '/run/user/1000/app/io.github.antonio_orionus.Arroxy'})
	})

	it('refuses under Flatpak without a runtime dir or with an odd app id', () => {
		expect(controlEndpointPlan('linux', {FLATPAK_ID: 'io.github.antonio_orionus.Arroxy'}).kind).toBe('unavailable')
		expect(controlEndpointPlan('linux', {FLATPAK_ID: '../escape', XDG_RUNTIME_DIR: '/run/user/1000'}).kind).toBe('unavailable')
	})
})

describe('socket paths', () => {
	it('puts control.sock inside the launch folder', () => {
		expect(socketPathIn('/tmp/arroxy-Ab12Cd')).toBe('/tmp/arroxy-Ab12Cd/control.sock')
	})

	it('caps a socket path at 100 bytes, counted in bytes', () => {
		expect(SOCKET_PATH_MAX_BYTES).toBe(100)
		expect(fitsSocketPath(`/${'a'.repeat(99)}`)).toBe(true)
		expect(fitsSocketPath(`/${'a'.repeat(100)}`)).toBe(false)
		// 50 two-byte characters plus the slash: 101 bytes, 51 characters.
		expect(fitsSocketPath(`/${'é'.repeat(50)}`)).toBe(false)
	})

	it('fits the longest Flatpak base for a 10-digit uid', () => {
		const plan = controlEndpointPlan('linux', {FLATPAK_ID: 'io.github.antonio_orionus.Arroxy', XDG_RUNTIME_DIR: '/run/user/4294967294'})
		if (plan.kind !== 'unix') throw new Error('expected a unix plan')
		expect(fitsSocketPath(socketPathIn(`${plan.baseDir}/arroxy-Ab12Cd`))).toBe(true)
	})

	it('names a pipe from its random part', () => {
		expect(pipePath('0123456789abcdef')).toBe('\\\\.\\pipe\\arroxy-control-0123456789abcdef')
	})
})

describe('isOwnSocketDirName', () => {
	it('accepts a launch folder right under the base', () => {
		expect(isOwnSocketDirName('/tmp/arroxy-Ab12Cd', '/tmp')).toBe(true)
		expect(isOwnSocketDirName('/run/user/1000/arroxy-Ab12Cd', '/run/user/1000/')).toBe(true)
	})

	it('refuses anything else', () => {
		expect(isOwnSocketDirName('/tmp/other-Ab12Cd', '/tmp')).toBe(false)
		expect(isOwnSocketDirName('/tmp/x/arroxy-Ab12Cd', '/tmp')).toBe(false)
		expect(isOwnSocketDirName('/var/arroxy-Ab12Cd', '/tmp')).toBe(false)
		expect(isOwnSocketDirName('/tmp/arroxy-', '/tmp')).toBe(false)
		expect(isOwnSocketDirName('/tmp/arroxy-../..', '/tmp')).toBe(false)
		expect(isOwnSocketDirName('/tmp/../tmp/arroxy-Ab12Cd', '/tmp')).toBe(false)
	})
})
