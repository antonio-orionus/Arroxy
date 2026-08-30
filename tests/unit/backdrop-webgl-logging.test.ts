import {afterEach, describe, expect, it, vi} from 'vitest'
import {createWebglProgram} from '../../src/renderer/src/components/layout/background/webgl.js'

// The backdrop probe tries a scratch WebGL program and falls back to CSS when
// it fails — a compile or link failure is an expected probe outcome, not an
// error. Logging it at error severity leaks into main.log as an error line and
// fails the startup oracle on GPU-less runners (issue: macOS no-gpu nightly).

function failingCompileGl() {
	return {createShader: () => ({}), shaderSource: () => undefined, compileShader: () => undefined, getShaderParameter: () => false, getShaderInfoLog: () => 'simulated compile failure', deleteShader: () => undefined} as unknown as WebGLRenderingContext
}

function failingLinkGl() {
	return {
		createShader: () => ({}),
		shaderSource: () => undefined,
		compileShader: () => undefined,
		getShaderParameter: () => true,
		deleteShader: () => undefined,
		createProgram: () => ({}),
		attachShader: () => undefined,
		linkProgram: () => undefined,
		getProgramParameter: () => false,
		getProgramInfoLog: () => 'simulated link failure',
		deleteProgram: () => undefined
	} as unknown as WebGLRenderingContext
}

describe('backdrop webgl probe logging', () => {
	let errorSpy: ReturnType<typeof vi.spyOn>
	let infoSpy: ReturnType<typeof vi.spyOn>

	afterEach(() => {
		errorSpy.mockRestore()
		infoSpy.mockRestore()
	})

	it('logs expected shader-compile failures at info severity, not error', () => {
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

		const resources = createWebglProgram(failingCompileGl(), 'fragment-source', 'dark-aurora')

		expect(resources).toBeNull()
		expect(errorSpy).not.toHaveBeenCalled()
		expect(infoSpy).toHaveBeenCalledWith('backdrop shader compile failed for dark-aurora:', 'simulated compile failure')
	})

	it('logs expected program-link failures at info severity, not error', () => {
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

		const resources = createWebglProgram(failingLinkGl(), 'fragment-source', 'dark-aurora')

		expect(resources).toBeNull()
		expect(errorSpy).not.toHaveBeenCalled()
		expect(infoSpy).toHaveBeenCalledWith('backdrop program link failed for dark-aurora:', 'simulated link failure')
	})
})
