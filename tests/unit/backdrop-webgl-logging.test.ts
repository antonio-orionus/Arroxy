import {afterEach, describe, expect, it, vi} from 'vitest'
import {createWebglProgram} from '../../src/renderer/src/components/layout/background/webgl.js'

// The backdrop probe compiles the repo's constant GLSL on the machine's real GL
// and falls back to CSS when it fails — a compile or link failure is therefore
// a driver rejection of valid shaders (an expected probe outcome), not a
// regression signal. Error severity leaked into main.log as error lines and
// failed the startup oracle on constrained runners (nightly run 2, macOS no-gpu).

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
