import {StrictMode} from 'react'
import {act, cleanup, render, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {AppBackdrop} from '@renderer/components/layout/background/AppBackdrop.js'
import {darkAuroraScene} from '@renderer/components/layout/background/darkAurora/scene.js'
import {lightOceanScene} from '@renderer/components/layout/background/lightOcean/scene.js'
import {BACKDROP_CONFIRM_DELAY_MS} from '@renderer/components/layout/background/frameBudget.js'
import type {BackdropColorScheme} from '@renderer/components/layout/background/types.js'
import {installCanvasMocks, mockWebgl} from '../shared/mockWebgl.js'

function expectCanvas2dUnused(getContext: ReturnType<typeof installCanvasMocks>): void {
	expect(getContext.mock.calls.some(([contextId]) => contextId === '2d')).toBe(false)
}

const SCENES = {dark: darkAuroraScene, light: lightOceanScene}
const COMPLETION_STATUS_KHR = 0x91b1

function renderBackdrop(colorScheme: BackdropColorScheme = 'dark', onUnavailable = vi.fn()) {
	const result = render(<AppBackdrop scenes={SCENES} colorScheme={colorScheme} onUnavailable={onUnavailable} />)
	return {...result, onUnavailable}
}

async function nextFrame(): Promise<void> {
	await act(async () => {
		await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
	})
}

describe('AppBackdrop', () => {
	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
		document.body.className = ''
		document.documentElement.className = ''
		window.history.replaceState(null, '', '/')
	})

	it('renders nothing for a style without a backdrop', () => {
		const getContext = installCanvasMocks()
		const {container} = render(<AppBackdrop scenes={null} colorScheme="dark" onUnavailable={vi.fn()} />)
		expect(container.querySelector('canvas')).toBeNull()
		expect(getContext).not.toHaveBeenCalled()
	})

	it('reports unavailable when WebGL is missing, without touching Canvas2D', async () => {
		const getContext = installCanvasMocks(null)

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-webgl-unavailable'))
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
		expectCanvas2dUnused(getContext)
	})

	it('rejects software WebGL using masked renderer data, before compiling anything', async () => {
		const gl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		const getContext = installCanvasMocks(gl)

		const {onUnavailable, unmount} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('software-webgl-rejected'))
		expect(gl.createShader).not.toHaveBeenCalled()
		expectCanvas2dUnused(getContext)

		unmount()

		expect(gl.loseContext).toHaveBeenCalledOnce()
	})

	it('allows software WebGL in the backdrop isolation preview', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')
		const gl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		installCanvasMocks(gl)

		const {container, unmount, onUnavailable} = renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-layer="webgl"]')).not.toBeNull()
		expect(onUnavailable).not.toHaveBeenCalled()

		unmount()

		expect(gl.loseContext).toHaveBeenCalledOnce()
	})

	it('reports unavailable when the scene program does not link, without drawing', async () => {
		const gl = mockWebgl({linkOk: false})
		const getContext = installCanvasMocks(gl)

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-program-failed'))
		expect(gl.drawArrays).not.toHaveBeenCalled()
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
		expectCanvas2dUnused(getContext)
	})

	it('compiles the scene once, on the backdrop canvas', async () => {
		const gl = mockWebgl()
		const getContext = installCanvasMocks(gl)

		renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(getContext.mock.calls.filter(([contextId]) => contextId === 'webgl')).toHaveLength(1)
		expect(gl.linkProgram).toHaveBeenCalledOnce()
	})

	// Without KHR_parallel_shader_compile any status read waits for the driver,
	// so the program is checked right away, as it always was.
	it('reads the program status synchronously when parallel compile is unavailable', () => {
		const gl = mockWebgl()
		installCanvasMocks(gl)

		renderBackdrop()

		expect(gl.getProgramParameter).toHaveBeenCalledWith(expect.anything(), gl.LINK_STATUS)
		expect(document.body).toHaveClass('backdrop-webgl-active')
	})

	// A status read forces the driver to finish the compile on the spot, which
	// a cold ANGLE/D3D11 compile stretches to seconds of frozen UI.
	it('waits for the parallel compile before reading any status or drawing', async () => {
		const gl = mockWebgl({parallelCompile: true})
		installCanvasMocks(gl)

		const {onUnavailable} = renderBackdrop()
		await nextFrame()
		await nextFrame()

		expect(gl.getExtension).toHaveBeenCalledWith('KHR_parallel_shader_compile')
		expect(gl.linkProgram).toHaveBeenCalledOnce()
		expect(vi.mocked(gl.getProgramParameter).mock.calls.every(([, parameter]) => parameter === COMPLETION_STATUS_KHR)).toBe(true)
		expect(vi.mocked(gl.getProgramParameter).mock.calls.length).toBeGreaterThanOrEqual(2)
		expect(gl.getShaderParameter).not.toHaveBeenCalled()
		expect(gl.getUniformLocation).not.toHaveBeenCalled()
		expect(gl.drawArrays).not.toHaveBeenCalled()
		expect(gl.readPixels).not.toHaveBeenCalled()
		expect(document.body).not.toHaveClass('backdrop-webgl-active')

		gl.completeCompile()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(gl.getProgramParameter).toHaveBeenCalledWith(expect.anything(), gl.LINK_STATUS)
		// The frame-budget probe runs on the finished program.
		expect(gl.readPixels).toHaveBeenCalledTimes(4)
		expect(onUnavailable).not.toHaveBeenCalled()
	})

	it('reports unavailable when the parallel compile finishes with a link failure', async () => {
		const gl = mockWebgl({linkOk: false, parallelCompile: true})
		installCanvasMocks(gl)

		const {onUnavailable} = renderBackdrop()
		await nextFrame()
		expect(onUnavailable).not.toHaveBeenCalled()

		gl.completeCompile()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-program-failed'))
		expect(gl.drawArrays).not.toHaveBeenCalled()
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
	})

	it('stops waiting for the compile and frees the program when unmounted mid-compile', async () => {
		const gl = mockWebgl({parallelCompile: true})
		installCanvasMocks(gl)

		const {unmount} = renderBackdrop()
		await nextFrame()
		unmount()
		const pollsAtUnmount = vi.mocked(gl.getProgramParameter).mock.calls.length
		gl.completeCompile()
		await nextFrame()
		await nextFrame()

		expect(vi.mocked(gl.getProgramParameter).mock.calls.length).toBe(pollsAtUnmount)
		expect(gl.deleteProgram).toHaveBeenCalledOnce()
		expect(gl.loseContext).toHaveBeenCalledOnce()
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
	})

	it('releases the WebGL context on unmount', async () => {
		const gl = mockWebgl()
		installCanvasMocks(gl)

		const {container, unmount} = renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-layer="webgl"]')).not.toBeNull()
		expect(gl.loseContext).not.toHaveBeenCalled()

		unmount()

		expect(gl.loseContext).toHaveBeenCalledOnce()
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
	})

	// StrictMode re-runs the effect on the same canvas, and a lost context
	// cannot be revived there: releasing it then would fail the backdrop.
	it.each([
		['synchronous', false],
		['parallel', true]
	])('keeps the WebGL context through a StrictMode effect re-run (%s compile)', async (_label, parallelCompile) => {
		const gl = mockWebgl({parallelCompile})
		installCanvasMocks(gl)
		const onUnavailable = vi.fn()

		const {unmount} = render(
			<StrictMode>
				<AppBackdrop scenes={SCENES} colorScheme="dark" onUnavailable={onUnavailable} />
			</StrictMode>
		)
		gl.completeCompile()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(gl.loseContext).not.toHaveBeenCalled()
		expect(onUnavailable).not.toHaveBeenCalled()

		unmount()

		expect(gl.loseContext).toHaveBeenCalledOnce()
	})

	it('paints one WebGL frame while initially unfocused without starting the animation loop', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks(productionGl)
		const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(false)
		const request = vi.spyOn(window, 'requestAnimationFrame')

		renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		// One warm-up and three timed frames measure the GPU; no loop follows.
		expect(productionGl.drawArrays).toHaveBeenCalledTimes(4)

		const requestCallsAfterInitialPaint = request.mock.calls.length
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 40))
		})
		expect(request.mock.calls.length).toBe(requestCallsAfterInitialPaint)

		hasFocus.mockReturnValue(true)
		window.dispatchEvent(new Event('focus'))

		expect(request.mock.calls.length).toBeGreaterThan(requestCallsAfterInitialPaint)
	})

	it('pauses WebGL while the window is blurred and resumes on focus', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks(productionGl)
		const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(true)
		const cancel = vi.spyOn(window, 'cancelAnimationFrame')
		const request = vi.spyOn(window, 'requestAnimationFrame')

		renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(request).toHaveBeenCalled()

		hasFocus.mockReturnValue(false)
		window.dispatchEvent(new Event('blur'))

		expect(cancel).toHaveBeenCalled()

		const requestCallsAfterBlur = request.mock.calls.length
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 40))
		})
		expect(request.mock.calls.length).toBe(requestCallsAfterBlur)

		hasFocus.mockReturnValue(true)
		window.dispatchEvent(new Event('focus'))
		await nextFrame()

		expect(request.mock.calls.length).toBeGreaterThan(requestCallsAfterBlur)
	})

	it('reports unavailable when the production WebGL context is lost', async () => {
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks(productionGl)

		const {container, onUnavailable} = renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		const webglCanvas = container.querySelector<HTMLCanvasElement>('canvas[data-backdrop-layer="webgl"]')
		expect(webglCanvas).not.toBeNull()

		const lostEvent = new Event('webglcontextlost', {cancelable: true})
		webglCanvas?.dispatchEvent(lostEvent)

		expect(lostEvent.defaultPrevented).toBe(true)
		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-webgl-context-lost'))
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
		expectCanvas2dUnused(getContext)
	})

	// A GPU too slow for the scene saturates and stalls the whole window, so the
	// backdrop times its first frames, lowers its resolution, confirms, and only
	// then falls back to the base style.
	function fakeGpu(productionGl: ReturnType<typeof mockWebgl>, frameMs: (pixels: number, call: number) => number) {
		let clock = 0
		let call = 0
		vi.spyOn(performance, 'now').mockImplementation(() => clock)
		vi.mocked(productionGl.readPixels).mockImplementation(() => {
			const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-backdrop-layer="webgl"]')
			clock += frameMs((canvas?.width ?? 0) * (canvas?.height ?? 0), call++)
		})
		return {advance: (ms: number) => (clock += ms)}
	}

	function webglCanvas(): HTMLCanvasElement {
		const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-backdrop-layer="webgl"]')
		if (!canvas) throw new Error('no backdrop canvas')
		return canvas
	}

	it('falls back when the GPU misses the frame budget at every scale, twice', () => {
		vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
		try {
			const productionGl = mockWebgl()
			installCanvasMocks(productionGl)
			fakeGpu(productionGl, () => 120)

			const {onUnavailable} = renderBackdrop('light')
			expect(onUnavailable).not.toHaveBeenCalled()
			expect(document.body).not.toHaveClass('backdrop-webgl-active')

			act(() => {
				vi.advanceTimersByTime(BACKDROP_CONFIRM_DELAY_MS)
			})

			expect(onUnavailable).toHaveBeenCalledWith('production-webgl-too-slow')
			expect(document.body).not.toHaveClass('backdrop-webgl-active')
			expect(productionGl.loseContext).not.toHaveBeenCalled()
		} finally {
			vi.useRealTimers()
		}
	})

	it('keeps the backdrop when a slow first measurement does not repeat', () => {
		vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
		try {
			const productionGl = mockWebgl()
			installCanvasMocks(productionGl)
			// Eight slow frames: both measurements of the first calibration, at idle clocks.
			fakeGpu(productionGl, (_pixels, call) => (call < 8 ? 120 : 4))

			const {onUnavailable} = renderBackdrop('light')
			act(() => {
				vi.advanceTimersByTime(BACKDROP_CONFIRM_DELAY_MS)
			})

			expect(onUnavailable).not.toHaveBeenCalled()
			expect(document.body).toHaveClass('backdrop-webgl-active')
			expect(webglCanvas().width).toBe(Math.floor(window.innerWidth * lightOceanScene.renderScale))
		} finally {
			vi.useRealTimers()
		}
	})

	it('returns to full resolution once a slow moment passes', () => {
		vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
		try {
			const productionGl = mockWebgl()
			installCanvasMocks(productionGl)
			// Slow for the first measurement only: the lower scale fits at once.
			fakeGpu(productionGl, (_pixels, call) => (call < 4 ? 120 : 3))
			const fullWidth = Math.floor(window.innerWidth * lightOceanScene.renderScale)

			const {onUnavailable} = renderBackdrop('light')
			expect(document.body).toHaveClass('backdrop-webgl-active')
			expect(webglCanvas().width).toBeLessThan(fullWidth)

			act(() => {
				vi.advanceTimersByTime(BACKDROP_CONFIRM_DELAY_MS)
			})

			expect(webglCanvas().width).toBe(fullWidth)
			expect(onUnavailable).not.toHaveBeenCalled()
		} finally {
			vi.useRealTimers()
		}
	})

	it('lowers its resolution instead of falling back when that fits the budget', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks(productionGl)
		// 100 ms for a frame at the scene's own scale, proportional to pixels.
		const fullScalePixels = Math.floor(window.innerWidth * darkAuroraScene.renderScale) * Math.floor(window.innerHeight * darkAuroraScene.renderScale)
		fakeGpu(productionGl, pixels => (pixels / fullScalePixels) * 100)

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(onUnavailable).not.toHaveBeenCalled()
		expect(webglCanvas().width * webglCanvas().height).toBeLessThan(fullScalePixels / 2)
	})

	it('keeps the backdrop when its frames fit the budget', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks(productionGl)
		fakeGpu(productionGl, () => 4)

		const {onUnavailable} = renderBackdrop('light')

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(productionGl.readPixels).toHaveBeenCalledTimes(4)
		expect(onUnavailable).not.toHaveBeenCalled()
	})

	it('lowers its resolution when the window grows past what the measured GPU can draw', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks(productionGl)
		vi.spyOn(document, 'hasFocus').mockReturnValue(true)
		const gpu = fakeGpu(productionGl, () => 10)
		const {innerWidth, innerHeight} = window

		try {
			const {onUnavailable} = renderBackdrop()
			await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
			const widthBefore = webglCanvas().width

			// Twelve times the area at the measured 10 ms frame is past the budget at the scene's scale.
			Object.assign(window, {innerWidth: innerWidth * 4, innerHeight: innerHeight * 3})
			// The animation loop reads the same clock: move it so the next frame is due.
			gpu.advance(1_000)
			await waitFor(() => expect(webglCanvas().width).toBeGreaterThan(widthBefore))

			expect(webglCanvas().width).toBeLessThan(widthBefore * 4)
			expect(onUnavailable).not.toHaveBeenCalled()
			expect(document.body).toHaveClass('backdrop-webgl-active')
		} finally {
			Object.assign(window, {innerWidth, innerHeight})
		}
	})

	it('runs the light ocean WebGL scene at 30 FPS', () => {
		expect(lightOceanScene.frameIntervalMs).toBe(1000 / 30)
	})

	it('draws the scene for the current color scheme', async () => {
		installCanvasMocks()
		const onUnavailable = vi.fn()
		const {container, rerender} = render(<AppBackdrop scenes={SCENES} colorScheme="dark" onUnavailable={onUnavailable} />)

		await waitFor(() => expect(container.querySelector('canvas[data-backdrop-scene="dark-aurora"]')).not.toBeNull())

		rerender(<AppBackdrop scenes={SCENES} colorScheme="light" onUnavailable={onUnavailable} />)

		await waitFor(() => expect(container.querySelector('canvas[data-backdrop-scene="light-ocean"]')).not.toBeNull())
		expect(container.querySelector('canvas[data-backdrop-scene="dark-aurora"]')).toBeNull()
	})

	it('logs opt-in unavailable diagnostics', async () => {
		window.history.replaceState(null, '', '/?backdropDebug=1')
		const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
		installCanvasMocks(null)

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalled())
		expect(info).toHaveBeenCalledWith('[backdrop]', expect.objectContaining({event: 'unavailable', reason: 'production-webgl-unavailable', sceneId: 'dark-aurora'}))
	})
})
