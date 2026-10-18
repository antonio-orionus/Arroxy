import {vi} from 'vite-plus/test'

const COMPLETION_STATUS_KHR = 0x91b1

// A stand-in WebGL context: jsdom has none, so a backdrop that probes it gives up.
export interface MockWebglOptions {
	compileOk?: boolean
	// Exposes KHR_parallel_shader_compile; the program stays incomplete until `completeCompile()`.
	parallelCompile?: boolean
	debugRenderer?: string | null
	linkOk?: boolean
	maskedRenderer?: string
	maskedVendor?: string
}

export type MockWebgl = WebGLRenderingContext & {completeCompile: () => void; loseContext: ReturnType<typeof vi.fn>}

export function mockWebgl(options: MockWebglOptions = {}): MockWebgl {
	const loseContext = vi.fn()
	let compileComplete = false
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
			if (name === 'KHR_parallel_shader_compile' && options.parallelCompile) return {COMPLETION_STATUS_KHR}
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
		getProgramParameter: vi.fn((_program: unknown, parameter: number) => (parameter === COMPLETION_STATUS_KHR ? compileComplete : (options.linkOk ?? true))),
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
	const completeCompile = (): void => {
		compileComplete = true
	}
	return Object.assign(gl, {completeCompile, loseContext}) as unknown as MockWebgl
}

// `gl` answers the backdrop canvas; every other canvas has no WebGL.
export function installCanvasMocks(gl: WebGLRenderingContext | null = mockWebgl()) {
	return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function getContext(this: HTMLCanvasElement, contextId: string) {
		if (contextId === 'webgl' && this.dataset.backdropLayer === 'webgl') return gl
		return null
	} as HTMLCanvasElement['getContext'])
}
