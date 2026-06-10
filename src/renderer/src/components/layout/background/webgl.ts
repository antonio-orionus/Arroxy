const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

export const WEBGL_CONTEXT_OPTIONS: WebGLContextAttributes = {alpha: false, antialias: false, powerPreference: 'low-power'}

interface WebglDebugRendererInfo {
	UNMASKED_RENDERER_WEBGL: number
	UNMASKED_VENDOR_WEBGL: number
}

export interface WebglLoseContext {
	loseContext(): void
}

export interface WebglProgramResources {
	frag: WebGLShader
	prog: WebGLProgram
	vert: WebGLShader
}

export function rendererName(gl: WebGLRenderingContext): string {
	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as WebglDebugRendererInfo | null
	const names = [debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null, debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null, gl.getParameter(gl.RENDERER), gl.getParameter(gl.VENDOR)]
	return names
		.map(name => String(name ?? '').trim())
		.filter(Boolean)
		.join(' ')
}

export function isSoftwareRenderer(name: string): boolean {
	return /swiftshader|llvmpipe|software/i.test(name)
}

export function releaseWebglContext(gl: WebGLRenderingContext): void {
	;(gl.getExtension('WEBGL_lose_context') as WebglLoseContext | null)?.loseContext()
}

export function disposeWebglProgram(gl: WebGLRenderingContext, resources: WebglProgramResources): void {
	gl.deleteProgram(resources.prog)
	gl.deleteShader(resources.vert)
	gl.deleteShader(resources.frag)
}

function compile(gl: WebGLRenderingContext, type: number, src: string, sceneId: string): WebGLShader | null {
	const sh = gl.createShader(type)
	if (!sh) return null
	gl.shaderSource(sh, src)
	gl.compileShader(sh)
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		console.error(`backdrop shader compile failed for ${sceneId}:`, gl.getShaderInfoLog(sh))
		gl.deleteShader(sh)
		return null
	}
	return sh
}

export function createWebglProgram(gl: WebGLRenderingContext, fragmentShader: string, sceneId: string): WebglProgramResources | null {
	const vert = compile(gl, gl.VERTEX_SHADER, VERT, sceneId)
	const frag = compile(gl, gl.FRAGMENT_SHADER, fragmentShader, sceneId)
	if (!vert || !frag) {
		if (vert) gl.deleteShader(vert)
		if (frag) gl.deleteShader(frag)
		return null
	}

	const prog = gl.createProgram()
	if (!prog) {
		gl.deleteShader(vert)
		gl.deleteShader(frag)
		return null
	}

	gl.attachShader(prog, vert)
	gl.attachShader(prog, frag)
	gl.linkProgram(prog)
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.error(`backdrop program link failed for ${sceneId}:`, gl.getProgramInfoLog(prog))
		gl.deleteProgram(prog)
		gl.deleteShader(vert)
		gl.deleteShader(frag)
		return null
	}

	return {frag, prog, vert}
}
