import {act, cleanup, render, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {AppBackdrop} from '@renderer/components/layout/background/AppBackdrop.js'
import {lightOceanScene} from '@renderer/components/layout/background/lightOcean/scene.js'

interface MockWebglOptions {
	compileOk?: boolean
	debugRenderer?: string | null
	linkOk?: boolean
	maskedRenderer?: string
	maskedVendor?: string
}

function mockWebgl(options: MockWebglOptions = {}): WebGLRenderingContext & {loseContext: ReturnType<typeof vi.fn>} {
	const loseContext = vi.fn()
	const gl = {
		ARRAY_BUFFER: 0x8892,
		COMPILE_STATUS: 0x8b81,
		FLOAT: 0x1406,
		FRAGMENT_SHADER: 0x8b30,
		LINK_STATUS: 0x8b82,
		RENDERER: 0x1f01,
		STATIC_DRAW: 0x88e4,
		TRIANGLES: 0x0004,
		VENDOR: 0x1f00,
		VERTEX_SHADER: 0x8b31,
		attachShader: vi.fn(),
		bindBuffer: vi.fn(),
		bufferData: vi.fn(),
		compileShader: vi.fn(),
		createBuffer: vi.fn(() => ({})),
		createProgram: vi.fn(() => ({})),
		createShader: vi.fn(() => ({})),
		deleteBuffer: vi.fn(),
		deleteProgram: vi.fn(),
		deleteShader: vi.fn(),
		drawArrays: vi.fn(),
		enableVertexAttribArray: vi.fn(),
		getAttribLocation: vi.fn(() => 0),
		getExtension: vi.fn((name: string) => {
			if (name === 'WEBGL_lose_context') return {loseContext}
			if (name === 'WEBGL_debug_renderer_info' && options.debugRenderer !== null) return {UNMASKED_RENDERER_WEBGL: 0, UNMASKED_VENDOR_WEBGL: 1}
			return null
		}),
		getParameter: vi.fn((parameter: number) => {
			if (parameter === 0) return options.debugRenderer ?? options.maskedRenderer ?? 'Hardware Renderer'
			if (parameter === 1) return options.maskedVendor ?? 'Hardware Vendor'
			if (parameter === 0x1f01) return options.maskedRenderer ?? 'Hardware Renderer'
			if (parameter === 0x1f00) return options.maskedVendor ?? 'Hardware Vendor'
			return ''
		}),
		getProgramInfoLog: vi.fn(() => 'program failed'),
		getProgramParameter: vi.fn(() => options.linkOk ?? true),
		getShaderInfoLog: vi.fn(() => 'shader failed'),
		getShaderParameter: vi.fn(() => options.compileOk ?? true),
		getUniformLocation: vi.fn(() => ({})),
		linkProgram: vi.fn(),
		shaderSource: vi.fn(),
		uniform1f: vi.fn(),
		uniform2f: vi.fn(),
		useProgram: vi.fn(),
		vertexAttribPointer: vi.fn(),
		viewport: vi.fn()
	}
	return Object.assign(gl, {loseContext}) as unknown as WebGLRenderingContext & {loseContext: ReturnType<typeof vi.fn>}
}

function installCanvasMocks({productionGl = mockWebgl(), scratchGl = mockWebgl()}: {productionGl?: WebGLRenderingContext | null; scratchGl?: WebGLRenderingContext | null} = {}) {
	return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function getContext(this: HTMLCanvasElement, contextId: string) {
		if (contextId === 'webgl') return this.dataset.backdropLayer === 'webgl' ? productionGl : scratchGl
		return null
	} as HTMLCanvasElement['getContext'])
}

function expectCanvas2dUnused(getContext: ReturnType<typeof installCanvasMocks>): void {
	expect(getContext.mock.calls.some(([contextId]) => contextId === '2d')).toBe(false)
}

async function nextFrame(): Promise<void> {
	await act(async () => {
		await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
	})
}

describe('AppBackdrop fallback', () => {
	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
		document.body.className = ''
		document.documentElement.className = ''
		window.history.replaceState(null, '', '/')
	})

	it('uses the CSS fallback when WebGL is unavailable without touching Canvas2D', async () => {
		const getContext = installCanvasMocks({scratchGl: null})

		const {container, unmount} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(document.body).toHaveClass('backdrop-dark-aurora')
		expectCanvas2dUnused(getContext)

		unmount()

		expect(document.body).not.toHaveClass('backdrop-static-fallback')
		expect(document.body).not.toHaveClass('backdrop-dark-aurora')
	})

	it('forces the CSS fallback preview without probing WebGL or touching Canvas2D', async () => {
		window.history.replaceState(null, '', '/?backdropForceFallback=css')
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(document.body).toHaveClass('backdrop-dark-aurora')
		expect(scratchGl.createShader).not.toHaveBeenCalled()
		expect(productionGl.createShader).not.toHaveBeenCalled()
		expectCanvas2dUnused(getContext)
	})

	it('ignores the removed Canvas2D preview mode and uses GPU rendering', async () => {
		window.history.replaceState(null, '', '/?backdropForceFallback=canvas2d')
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="light" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-mode="webgl"]')).not.toBeNull()
		expect(scratchGl.createShader).toHaveBeenCalled()
		expect(productionGl.createShader).toHaveBeenCalled()
		expectCanvas2dUnused(getContext)
	})

	it('uses the persisted CSS-only mode without probing WebGL or touching Canvas2D', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" renderMode="css-only" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(scratchGl.createShader).not.toHaveBeenCalled()
		expect(productionGl.createShader).not.toHaveBeenCalled()
		expectCanvas2dUnused(getContext)
	})

	it('rejects software WebGL using masked renderer data and falls back to CSS', async () => {
		const scratchGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		const getContext = installCanvasMocks({scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expectCanvas2dUnused(getContext)
	})

	it('allows software WebGL in the backdrop isolation preview', async () => {
		window.history.replaceState(null, '', '/?backdrop=1')
		const scratchGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		const productionGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		installCanvasMocks({productionGl, scratchGl})

		const {container, unmount} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-mode="webgl"]')).not.toBeNull()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()

		unmount()

		expect(productionGl.loseContext).not.toHaveBeenCalled()
	})

	it('does not touch the production WebGL canvas when scratch shader validation fails', async () => {
		const scratchGl = mockWebgl({linkOk: false})
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(productionGl.createShader).not.toHaveBeenCalled()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expectCanvas2dUnused(getContext)
	})

	it('falls back to CSS when production WebGL setup fails', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl({linkOk: false})
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(productionGl.createShader).toHaveBeenCalled()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
		expectCanvas2dUnused(getContext)
	})

	it('releases the scratch WebGL context after a successful WebGL setup', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl, scratchGl})

		const {container, unmount} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(container.querySelector('canvas[data-backdrop-mode="webgl"]')).not.toBeNull()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()

		unmount()

		expect(productionGl.loseContext).not.toHaveBeenCalled()
	})

	it('paints one WebGL frame while initially unfocused without starting the animation loop', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		installCanvasMocks({productionGl, scratchGl})
		const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(false)
		const request = vi.spyOn(window, 'requestAnimationFrame')

		render(<AppBackdrop colorScheme="dark" renderMode="gpu" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		expect(productionGl.drawArrays).toHaveBeenCalledOnce()

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

		render(<AppBackdrop colorScheme="dark" renderMode="gpu" />)

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

	it('falls back to CSS when the production WebGL context is lost', async () => {
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl()
		const getContext = installCanvasMocks({productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" renderMode="gpu" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-webgl-active'))
		const webglCanvas = container.querySelector<HTMLCanvasElement>('canvas[data-backdrop-layer="webgl"]')
		expect(webglCanvas).not.toBeNull()

		const lostEvent = new Event('webglcontextlost', {cancelable: true})
		webglCanvas?.dispatchEvent(lostEvent)

		expect(lostEvent.defaultPrevented).toBe(true)
		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
		expect(document.body).not.toHaveClass('backdrop-webgl-active')
		expectCanvas2dUnused(getContext)
	})

	it('runs the light ocean WebGL scene at 30 FPS', () => {
		expect(lightOceanScene.frameIntervalMs).toBe(1000 / 30)
	})

	it('selects dark aurora for dark mode and light ocean for light mode under CSS fallback', async () => {
		const getContext = installCanvasMocks({scratchGl: null})
		const {container, rerender} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		expect(document.body).toHaveClass('backdrop-dark-aurora')
		expect(container.querySelector('canvas')).toBeNull()

		rerender(<AppBackdrop colorScheme="light" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-light-ocean'))
		expect(document.body).not.toHaveClass('backdrop-dark-aurora')
		expect(container.querySelector('canvas')).toBeNull()
		expectCanvas2dUnused(getContext)
	})

	it('logs opt-in CSS fallback diagnostics', async () => {
		window.history.replaceState(null, '', '/?backdropDebug=1')
		const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
		const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
		installCanvasMocks({scratchGl: null})

		render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))

		expect(info).toHaveBeenCalledWith('[backdrop]', expect.objectContaining({event: 'fallback-activate', mode: 'css', reason: 'scratch-webgl-unavailable', sceneId: 'dark-aurora'}))
		expect(debug).not.toHaveBeenCalledWith('[backdrop]', expect.objectContaining({event: 'canvas2d-draw'}))
	})
})
