import {StrictMode} from 'react'
import {act, cleanup, render, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {AppBackdrop} from '@renderer/components/layout/background/AppBackdrop.js'
import {darkAuroraScene} from '@renderer/components/layout/background/darkAurora/scene.js'
import {lightOceanScene} from '@renderer/components/layout/background/lightOcean/scene.js'
import type {BackdropColorScheme} from '@renderer/components/layout/background/types.js'
import {installCanvasMocks, mockWebgl} from '../shared/mockWebgl.js'

function expectCanvas2dUnused(getContext: ReturnType<typeof installCanvasMocks>): void {
	expect(getContext.mock.calls.some(([contextId]) => contextId === '2d')).toBe(false)
}

const SCENES = {dark: darkAuroraScene, light: lightOceanScene}

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
		const getContext = installCanvasMocks({scratchGl: null})

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('scratch-webgl-unavailable'))
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
		expectCanvas2dUnused(getContext)
	})

	it('rejects software WebGL using masked renderer data', async () => {
		const scratchGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		const getContext = installCanvasMocks({scratchGl})

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('software-webgl-rejected'))
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expectCanvas2dUnused(getContext)
	})

	it('allows software WebGL in the backdrop isolation preview', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')
		const scratchGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		const productionGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		installCanvasMocks({productionGl, scratchGl})

		const {container, unmount, onUnavailable} = renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-layer="webgl"]')).not.toBeNull()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expect(onUnavailable).not.toHaveBeenCalled()

		unmount()

		expect(productionGl.loseContext).toHaveBeenCalledOnce()
	})

	it('does not touch the production WebGL canvas when scratch shader validation fails', async () => {
		const scratchGl = mockWebgl({linkOk: false})
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('scratch-program-failed'))
		expect(productionGl.createShader).not.toHaveBeenCalled()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expectCanvas2dUnused(getContext)
	})

	it('reports unavailable when production WebGL setup fails', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl({linkOk: false})
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-program-failed'))
		expect(productionGl.createShader).toHaveBeenCalled()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expectCanvas2dUnused(getContext)
	})

	it('releases the scratch WebGL context after a successful WebGL setup', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl, scratchGl})

		const {container, unmount} = renderBackdrop()

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-layer="webgl"]')).not.toBeNull()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()

		unmount()

		expect(productionGl.loseContext).toHaveBeenCalledOnce()
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
	})

	// StrictMode re-runs the effect on the same canvas, and a lost context
	// cannot be revived there: releasing it then would fail the backdrop.
	it('keeps the production WebGL context through a StrictMode effect re-run', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl, scratchGl})
		const onUnavailable = vi.fn()

		const {unmount} = render(
			<StrictMode>
				<AppBackdrop scenes={SCENES} colorScheme="dark" onUnavailable={onUnavailable} />
			</StrictMode>
		)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(productionGl.loseContext).not.toHaveBeenCalled()
		expect(onUnavailable).not.toHaveBeenCalled()

		unmount()

		expect(productionGl.loseContext).toHaveBeenCalledOnce()
	})

	it('paints one WebGL frame while initially unfocused without starting the animation loop', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl, scratchGl})
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
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl, scratchGl})
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
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

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
	// backdrop times its first frames and falls back to the base style.
	it('reports unavailable when the GPU cannot draw the scene inside the frame budget', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl})
		let gpuClock = 0
		vi.spyOn(performance, 'now').mockImplementation(() => gpuClock)
		vi.mocked(productionGl.readPixels).mockImplementation(() => {
			gpuClock += 120
		})

		const {onUnavailable} = renderBackdrop('light')

		await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-webgl-too-slow'))
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
		expect(productionGl.loseContext).not.toHaveBeenCalled()
	})

	it('keeps the backdrop when its frames fit the budget', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl})
		let gpuClock = 0
		vi.spyOn(performance, 'now').mockImplementation(() => gpuClock)
		vi.mocked(productionGl.readPixels).mockImplementation(() => {
			gpuClock += 4
		})

		const {onUnavailable} = renderBackdrop('light')

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(productionGl.readPixels).toHaveBeenCalledTimes(4)
		expect(onUnavailable).not.toHaveBeenCalled()
	})

	it('falls back when the window grows past what the measured GPU can draw', async () => {
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl})
		vi.spyOn(document, 'hasFocus').mockReturnValue(true)
		let gpuClock = 0
		vi.spyOn(performance, 'now').mockImplementation(() => gpuClock)
		vi.mocked(productionGl.readPixels).mockImplementation(() => {
			gpuClock += 10
		})
		const {innerWidth, innerHeight} = window

		try {
			const {onUnavailable} = renderBackdrop()
			await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
			expect(onUnavailable).not.toHaveBeenCalled()

			// Ten times the pixels at the measured 10 ms frame is far past the budget.
			Object.assign(window, {innerWidth: innerWidth * 4, innerHeight: innerHeight * 3})
			// The animation loop reads the same clock: move it so the next frame is due.
			gpuClock += 1_000
			await waitFor(() => expect(onUnavailable).toHaveBeenCalledWith('production-webgl-too-slow'))
			expect(document.body).not.toHaveClass('backdrop-webgl-active')
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
		installCanvasMocks({scratchGl: null})

		const {onUnavailable} = renderBackdrop()

		await waitFor(() => expect(onUnavailable).toHaveBeenCalled())
		expect(info).toHaveBeenCalledWith('[backdrop]', expect.objectContaining({event: 'unavailable', reason: 'scratch-webgl-unavailable', sceneId: 'dark-aurora'}))
	})
})
