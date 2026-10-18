import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {startWebglProgram, webglProgramLinked} from '../../src/renderer/src/components/layout/background/webgl.js'
import {mockWebgl} from '../shared/mockWebgl.js'

// The backdrop probe compiles the repo's constant GLSL on the machine's real GL
// and falls back to CSS when it fails — a compile or link failure is therefore
// a driver rejection of valid shaders (an expected probe outcome), not a
// regression signal. Error severity leaked into main.log as error lines and
// failed the startup oracle on constrained runners (nightly run 2, macOS no-gpu).

function linked(gl: WebGLRenderingContext): boolean {
	const program = startWebglProgram(gl, 'fragment-source')
	expect(program).not.toBeNull()
	return program ? webglProgramLinked(gl, program, 'dark-aurora') : true
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

		expect(linked(mockWebgl({compileOk: false, linkOk: false}))).toBe(false)
		expect(errorSpy).not.toHaveBeenCalled()
		expect(infoSpy).toHaveBeenCalledWith('backdrop shader compile failed for dark-aurora:', 'shader failed')
	})

	it('logs expected program-link failures at info severity, not error', () => {
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

		expect(linked(mockWebgl({linkOk: false}))).toBe(false)
		expect(errorSpy).not.toHaveBeenCalled()
		expect(infoSpy).toHaveBeenCalledWith('backdrop program link failed for dark-aurora:', 'program failed')
	})
})
