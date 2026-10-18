import {vi} from 'vite-plus/test'

// A stand-in WebGL context: jsdom has none, so a backdrop that probes it gives up.
export interface MockWebglOptions {
	compileOk?: boolean
	debugRenderer?: string | null
	linkOk?: boolean
	maskedRenderer?: string
	maskedVendor?: string
}

export function mockWebgl(options: MockWebglOptions = {}): WebGLRenderingContext & {loseContext: ReturnType<typeof vi.fn>} {
	const loseContext = vi.fn()
	const gl = {
		ARRAY_BUFFER: 0x8892,
		COMPILE_STATUS: 0x8b81,
		RGBA: 0x1908,
		UNSIGNED_BYTE: 0x1401,
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
		readPixels: vi.fn(),
		shaderSource: vi.fn(),
		uniform1f: vi.fn(),
		uniform2f: vi.fn(),
		useProgram: vi.fn(),
		vertexAttribPointer: vi.fn(),
		viewport: vi.fn()
	}
	return Object.assign(gl, {loseContext}) as unknown as WebGLRenderingContext & {loseContext: ReturnType<typeof vi.fn>}
}

export function installCanvasMocks({productionGl = mockWebgl(), scratchGl = mockWebgl()}: {productionGl?: WebGLRenderingContext | null; scratchGl?: WebGLRenderingContext | null} = {}) {
	return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function getContext(this: HTMLCanvasElement, contextId: string) {
		if (contextId === 'webgl') return this.dataset.backdropLayer === 'webgl' ? productionGl : scratchGl
		return null
	} as HTMLCanvasElement['getContext'])
}
