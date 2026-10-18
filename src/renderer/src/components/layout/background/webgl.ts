import {isSoftwareOrVirtualRendererName} from '@shared/graphicsPolicy.js'

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
		.flatMap(name => {
			const renderer = String(name ?? '').trim()
			return renderer ? [renderer] : []
		})
		.join(' ')
}

export function isSoftwareRenderer(name: string): boolean {
	return isSoftwareOrVirtualRendererName(name)
}

export function releaseWebglContext(gl: WebGLRenderingContext): void {
	;(gl.getExtension('WEBGL_lose_context') as WebglLoseContext | null)?.loseContext()
}

export function disposeWebglProgram(gl: WebGLRenderingContext, resources: WebglProgramResources): void {
	gl.deleteProgram(resources.prog)
	gl.deleteShader(resources.vert)
	gl.deleteShader(resources.frag)
}

interface KhrParallelShaderCompile {
	COMPLETION_STATUS_KHR: number
}

// A program the driver may still be compiling. `completionStatus` is the
// KHR_parallel_shader_compile query, null when the driver lacks it.
export interface PendingWebglProgram {
	completionStatus: number | null
	resources: WebglProgramResources
}

function createShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
	const sh = gl.createShader(type)
	if (!sh) return null
	gl.shaderSource(sh, src)
	gl.compileShader(sh)
	return sh
}

// Queues the compile and link without reading any status: a status read waits
// for the driver to finish, and a cold ANGLE/D3D11 compile of a scene shader
// takes seconds of frozen UI. With KHR_parallel_shader_compile the driver works
// in the background until `webglProgramSettled` says it is done.
export function startWebglProgram(gl: WebGLRenderingContext, fragmentShader: string): PendingWebglProgram | null {
	const parallelCompile = gl.getExtension('KHR_parallel_shader_compile') as KhrParallelShaderCompile | null
	const vert = createShader(gl, gl.VERTEX_SHADER, VERT)
	const frag = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
	const prog = vert && frag ? gl.createProgram() : null
	if (!vert || !frag || !prog) {
		if (vert) gl.deleteShader(vert)
		if (frag) gl.deleteShader(frag)
		return null
	}

	gl.attachShader(prog, vert)
	gl.attachShader(prog, frag)
	gl.linkProgram(prog)
	return {completionStatus: parallelCompile?.COMPLETION_STATUS_KHR ?? null, resources: {frag, prog, vert}}
}

// Without the extension there is nothing to wait for: the status read in
// `finishWebglProgram` blocks instead, as WebGL always did.
export function webglProgramSettled(gl: WebGLRenderingContext, pending: PendingWebglProgram): boolean {
	return pending.completionStatus === null || gl.getProgramParameter(pending.resources.prog, pending.completionStatus) === true
}

// Reads the link outcome, logging why it failed. The caller owns the program
// either way and disposes it with `disposeWebglProgram`.
export function webglProgramLinked(gl: WebGLRenderingContext, pending: PendingWebglProgram, sceneId: string): boolean {
	const {frag, prog, vert} = pending.resources
	if (gl.getProgramParameter(prog, gl.LINK_STATUS)) return true

	// Expected probe outcome, not a regression signal: the GLSL is a repo
	// constant, so a failure on one machine is the driver rejecting valid
	// shaders. The caller falls back and logs the reason at info; error severity
	// here turned constrained-runner startups into oracle violations (nightly
	// run 2, macOS no-gpu). A shader that failed to compile also fails the link,
	// so its log is read only here.
	for (const shader of [vert, frag]) {
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.info(`backdrop shader compile failed for ${sceneId}:`, gl.getShaderInfoLog(shader))
	}
	console.info(`backdrop program link failed for ${sceneId}:`, gl.getProgramInfoLog(prog))
	return false
}
