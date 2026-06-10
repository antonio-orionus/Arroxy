import {act, cleanup, render, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {AppBackdrop} from '@renderer/components/layout/background/AppBackdrop.js'

function mockGradient(): CanvasGradient {
	return {addColorStop: vi.fn()} as unknown as CanvasGradient
}

function mockCanvas2d(): CanvasRenderingContext2D {
	const target: Partial<CanvasRenderingContext2D> = {
		arc: vi.fn(),
		beginPath: vi.fn(),
		bezierCurveTo: vi.fn(),
		clearRect: vi.fn(),
		closePath: vi.fn(),
		createLinearGradient: vi.fn(mockGradient),
		createRadialGradient: vi.fn(mockGradient),
		fill: vi.fn(),
		fillRect: vi.fn(),
		lineTo: vi.fn(),
		moveTo: vi.fn(),
		restore: vi.fn(),
		save: vi.fn(),
		setTransform: vi.fn(),
		stroke: vi.fn()
	}
	return new Proxy(target, {
		get(object, property) {
			const key = property as keyof CanvasRenderingContext2D
			if (key in object) return object[key]
			return vi.fn()
		},
		set(object, property, value) {
			return Reflect.set(object, property, value)
		}
	}) as CanvasRenderingContext2D
}

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

function installCanvasMocks({context2d = mockCanvas2d(), productionGl = mockWebgl(), scratchGl = mockWebgl()}: {context2d?: CanvasRenderingContext2D | null; productionGl?: WebGLRenderingContext | null; scratchGl?: WebGLRenderingContext | null} = {}): void {
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function getContext(this: HTMLCanvasElement, contextId: string) {
		if (contextId === '2d') return context2d
		if (contextId === 'webgl') return this.dataset.backdropLayer === 'webgl' ? productionGl : scratchGl
		return null
	} as HTMLCanvasElement['getContext'])
}

async function nextFrame(): Promise<void> {
	await act(async () => {
		await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
	})
}

function setViewport(width: number, height: number): void {
	Object.defineProperty(window, 'innerWidth', {configurable: true, value: width})
	Object.defineProperty(window, 'innerHeight', {configurable: true, value: height})
}

describe('AppBackdrop fallback', () => {
	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
		document.body.className = ''
		document.documentElement.className = ''
		window.history.replaceState(null, '', '/')
		setViewport(1024, 768)
	})

	it('draws an adaptive static canvas when WebGL is unavailable', async () => {
		const context2d = mockCanvas2d()
		installCanvasMocks({context2d, scratchGl: null})

		const {container, unmount} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(document.body).toHaveClass('backdrop-canvas-fallback'))
		const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-backdrop-mode="canvas2d"]')
		expect(canvas).not.toBeNull()
		expect(canvas).toHaveAttribute('data-backdrop-scene', 'dark-aurora')
		expect(canvas?.width).toBeGreaterThan(0)
		expect(canvas?.height).toBeGreaterThan(0)
		expect(context2d.clearRect).toHaveBeenCalled()

		unmount()

		expect(document.body).not.toHaveClass('backdrop-static-fallback')
		expect(document.body).not.toHaveClass('backdrop-canvas-fallback')
		expect(document.body).not.toHaveClass('backdrop-dark-aurora')
	})

	it('rejects software WebGL using masked renderer data when debug renderer info is unavailable', async () => {
		const context2d = mockCanvas2d()
		const scratchGl = mockWebgl({debugRenderer: null, maskedRenderer: 'Google SwiftShader', maskedVendor: 'Google Inc.'})
		installCanvasMocks({context2d, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-canvas-fallback'))
		expect(container.querySelector('canvas[data-backdrop-mode="canvas2d"]')).not.toBeNull()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
	})

	it('does not touch the production WebGL canvas when scratch shader validation fails', async () => {
		const context2d = mockCanvas2d()
		const scratchGl = mockWebgl({linkOk: false})
		const productionGl = mockWebgl()
		installCanvasMocks({context2d, productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(container.querySelector('canvas[data-backdrop-mode="canvas2d"]')).not.toBeNull())
		expect(productionGl.createShader).not.toHaveBeenCalled()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
	})

	it('uses the separate Canvas2D fallback when production WebGL setup fails', async () => {
		const context2d = mockCanvas2d()
		const scratchGl = mockWebgl()
		const productionGl = mockWebgl({linkOk: false})
		installCanvasMocks({context2d, productionGl, scratchGl})

		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(container.querySelector('canvas[data-backdrop-mode="canvas2d"]')).not.toBeNull())
		expect(productionGl.createShader).toHaveBeenCalled()
		expect(context2d.clearRect).toHaveBeenCalled()
		expect(scratchGl.loseContext).toHaveBeenCalledOnce()
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
	})

	it('selects dark aurora for dark mode and light ocean for light mode', async () => {
		const context2d = mockCanvas2d()
		installCanvasMocks({context2d, scratchGl: null})
		const {container, rerender} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(container.querySelector('canvas[data-backdrop-scene="dark-aurora"][data-backdrop-mode="canvas2d"]')).not.toBeNull())
		expect(document.body).toHaveClass('backdrop-dark-aurora')

		rerender(<AppBackdrop colorScheme="light" />)

		await waitFor(() => expect(container.querySelector('canvas[data-backdrop-scene="light-ocean"][data-backdrop-mode="canvas2d"]')).not.toBeNull())
		expect(document.body).toHaveClass('backdrop-light-ocean')
		expect(document.body).not.toHaveClass('backdrop-dark-aurora')
	})

	it('redraws the Canvas2D fallback when the selected scene changes', async () => {
		const context2d = mockCanvas2d()
		installCanvasMocks({context2d, scratchGl: null})
		const {rerender} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-canvas-fallback'))
		const initialDraws = vi.mocked(context2d.clearRect).mock.calls.length
		rerender(<AppBackdrop colorScheme="light" />)

		await waitFor(() => expect(context2d.clearRect).toHaveBeenCalledTimes(initialDraws + 1))
	})

	it('skips live resize redraws and redraws once after resize settles', async () => {
		setViewport(800, 500)
		const context2d = mockCanvas2d()
		installCanvasMocks({context2d, scratchGl: null})
		const {container} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-canvas-fallback'))
		const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-backdrop-mode="canvas2d"]')
		expect(canvas?.width).toBe(600)
		const initialDraws = vi.mocked(context2d.clearRect).mock.calls.length

		setViewport(640, 360)
		window.dispatchEvent(new Event('resize'))
		await nextFrame()

		expect(canvas?.width).toBe(600)
		expect(context2d.clearRect).toHaveBeenCalledTimes(initialDraws)

		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 330))
		})
		await nextFrame()

		expect(canvas?.width).toBe(480)
		expect(canvas?.height).toBe(270)
		expect(context2d.clearRect).toHaveBeenCalledTimes(initialDraws + 1)
	})

	it('logs opt-in Canvas2D fallback diagnostics', async () => {
		window.history.replaceState(null, '', '/?backdropDebug=1')
		const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
		const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
		const context2d = mockCanvas2d()
		installCanvasMocks({context2d, scratchGl: null})
		render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-canvas-fallback'))

		expect(info).toHaveBeenCalledWith('[backdrop]', expect.objectContaining({event: 'fallback-activate', mode: 'fallback', reason: 'scratch-webgl-unavailable', sceneId: 'dark-aurora'}))
		expect(debug).toHaveBeenCalledWith('[backdrop]', expect.objectContaining({cssHeight: 768, cssWidth: 1024, event: 'canvas2d-draw', mode: 'canvas2d', pixelHeight: 576, pixelWidth: 768, reason: 'initial', renderScale: 0.75, sceneId: 'dark-aurora'}))
	})

	it('falls back to CSS only when neither WebGL nor Canvas2D is available', async () => {
		installCanvasMocks({context2d: null, scratchGl: null})

		const {container, unmount} = render(<AppBackdrop colorScheme="dark" />)

		await waitFor(() => expect(document.body).toHaveClass('backdrop-static-fallback'))
		await waitFor(() => expect(container.querySelector('canvas')).toBeNull())

		unmount()

		expect(document.body).not.toHaveClass('backdrop-static-fallback')
		expect(document.body).not.toHaveClass('backdrop-canvas-fallback')
	})
})
