import {useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react'
import {logBackdrop, reportBackdrop} from './backdropLogger.js'
import {BACKDROP_CONFIRM_DELAY_MS, fitRenderScale, fitsFrameBudget, measureFrameCost, MIN_RENDER_SCALE} from './frameBudget.js'
import type {BackdropScene} from './types.js'
import {disposeWebglProgram, isSoftwareRenderer, releaseWebglContext, rendererName, startWebglProgram, WEBGL_CONTEXT_OPTIONS, webglProgramLinked, webglProgramSettled, type WebglProgramResources} from './webgl.js'

function backdropPreviewSoftwareAllowed(): boolean {
	try {
		return (import.meta.env.MODE === 'browser-mock' || import.meta.env.MODE === 'test') && new URLSearchParams(window.location.search).has('backdrop')
	} catch {
		return false
	}
}

// The backdrop canvas's context with the scene program linked on it.
interface LinkedScene {
	gl: WebGLRenderingContext
	renderer: string
	resources: WebglProgramResources
	softwareRendererAllowed: boolean
}

function reportUnavailable(sceneId: BackdropScene['id'], onUnavailable: (reason: string) => void, reason: string, details: Record<string, unknown>): void {
	logBackdrop('info', sceneId, 'unavailable', {reason, ...details})
	onUnavailable(reason)
}

function isBackdropActive(): boolean {
	return !document.hidden && (typeof document.hasFocus !== 'function' || document.hasFocus())
}

// Draws a scene on hardware WebGL, or reports that it cannot. There is no CSS
// imitation: when this host gives up, the app renders the base style instead
// (DESIGN.md §8, the Hardware-Or-Base Rule).
export function CanvasSceneHost({scene, softwareWebglAllowed = false, onUnavailable}: {scene: BackdropScene; softwareWebglAllowed?: boolean; onUnavailable: (reason: string) => void}): ReactNode {
	const webglCanvasRef = useRef<HTMLCanvasElement>(null)
	// Latest callback without re-running the WebGL setup when the parent re-renders.
	const onUnavailableRef = useRef(onUnavailable)
	useLayoutEffect(() => {
		onUnavailableRef.current = onUnavailable
	})

	const [linked, setLinked] = useState<LinkedScene | null>(null)

	// Compiles the scene without blocking the renderer where the driver allows:
	// any status read waits for the compile, which a cold ANGLE/D3D11 compile of
	// a scene shader stretches to seconds of frozen UI.
	useEffect(() => {
		const giveUp = (reason: string, details: Record<string, unknown> = {}): void => reportUnavailable(scene.id, onUnavailableRef.current, reason, details)
		const webglCanvas = webglCanvasRef.current
		if (!webglCanvas) return

		const softwareRendererAllowed = softwareWebglAllowed || backdropPreviewSoftwareAllowed()
		const gl = webglCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!gl) return giveUp('production-webgl-unavailable')
		// Free the GPU context now rather than whenever the canvas is collected.
		// Only once the canvas has left the page: StrictMode re-runs this effect
		// on the same canvas, and a lost context cannot be revived there.
		const release = (): void => {
			if (!webglCanvas.isConnected) releaseWebglContext(gl)
		}

		const renderer = rendererName(gl)
		if (isSoftwareRenderer(renderer) && !softwareRendererAllowed) {
			giveUp('software-webgl-rejected', {renderer})
			return release
		}

		const program = startWebglProgram(gl, scene.fragmentShader)
		if (!program) {
			giveUp('production-program-failed', {renderer})
			return release
		}

		const compileStart = performance.now()
		let compileRaf = 0
		const awaitLink = (): void => {
			compileRaf = 0
			if (!webglProgramSettled(gl, program)) {
				compileRaf = requestAnimationFrame(awaitLink)
				return
			}
			if (!webglProgramLinked(gl, program, scene.id)) return giveUp('production-program-failed', {renderer})
			logBackdrop('debug', scene.id, 'program-linked', {parallelCompile: program.completionStatus !== null, waitedMs: Math.round(performance.now() - compileStart)})
			setLinked({gl, renderer, resources: program.resources, softwareRendererAllowed})
		}
		awaitLink()

		return () => {
			if (compileRaf) cancelAnimationFrame(compileRaf)
			setLinked(null)
			disposeWebglProgram(gl, program.resources)
			release()
		}
	}, [scene, softwareWebglAllowed])

	// Draws the linked program: the GPU is timed only once the compile is done.
	useEffect(() => {
		const webglCanvas = webglCanvasRef.current
		if (!webglCanvas || !linked) return
		const {gl, renderer, resources, softwareRendererAllowed} = linked
		const giveUp = (reason: string, details: Record<string, unknown> = {}): void => reportUnavailable(scene.id, onUnavailableRef.current, reason, details)

		gl.useProgram(resources.prog)

		const buf = gl.createBuffer()
		if (!buf) return giveUp('production-buffer-failed', {renderer})
		gl.bindBuffer(gl.ARRAY_BUFFER, buf)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
		const aPos = gl.getAttribLocation(resources.prog, 'aPos')
		gl.enableVertexAttribArray(aPos)
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

		const uRes = gl.getUniformLocation(resources.prog, 'uRes')
		const uTime = gl.getUniformLocation(resources.prog, 'uTime')

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
		const staticRender = (): boolean => reduceMotion.matches

		let raf = 0
		let lastFrame = 0
		let webglActive = false
		let failed = false
		// Lowered from the scene's own when the GPU cannot keep up at it.
		let renderScale = scene.renderScale
		// GPU time per canvas pixel, from the latest measurement.
		let msPerPixel: number | null = null
		// A start that was not clean (resolution lowered, or over budget even at the
		// lowest) is measured once more after a delay. While over budget, nothing draws.
		let recheckTimer: ReturnType<typeof setTimeout> | null = null
		let paused = false
		const start = performance.now()
		const syncPixel = new Uint8Array(4)

		const devicePixels = (): number => Math.min(window.devicePixelRatio || 1, scene.maxDevicePixelRatio)
		// The canvas area at render scale 1.
		const cssPixels = (): number => (webglCanvas.clientWidth || window.innerWidth || 1) * (webglCanvas.clientHeight || window.innerHeight || 1) * devicePixels() ** 2
		const canvasPixels = (): number => webglCanvas.width * webglCanvas.height

		const resize = (): void => {
			const dpr = devicePixels() * renderScale
			const w = Math.max(1, Math.floor((webglCanvas.clientWidth || window.innerWidth || 1) * dpr))
			const h = Math.max(1, Math.floor((webglCanvas.clientHeight || window.innerHeight || 1) * dpr))
			if (webglCanvas.width !== w || webglCanvas.height !== h) {
				// A bigger window costs proportionally more: predict the scale that fits
				// rather than stall to find out. A smaller one may afford more again.
				if (msPerPixel !== null) {
					const fit = fitRenderScale(msPerPixel, cssPixels(), scene.renderScale)
					if (fit === null) return recheckLater(true)
					if (fit !== renderScale) {
						renderScale = fit
						return resize()
					}
				}
				webglCanvas.width = w
				webglCanvas.height = h
				gl.viewport(0, 0, w, h)
			}
			gl.uniform2f(uRes, w, h)
		}

		const draw = (now: number): void => {
			resize()
			if (failed || paused) return
			gl.uniform1f(uTime, (now - start) / 1000)
			gl.drawArrays(gl.TRIANGLES, 0, 3)
		}
		// Reading one pixel back blocks until the GPU has finished the frame.
		const drawAndWait = (): void => {
			draw(performance.now())
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel)
		}
		// Times the scene at its own scale and, when that is over budget, once more
		// at the highest scale predicted to fit.
		const calibrate = (): {fits: boolean; rescaled: boolean; medianMs: number} => {
			msPerPixel = null
			renderScale = scene.renderScale
			resize()
			let cost = measureFrameCost(drawAndWait, canvasPixels())
			if (!fitsFrameBudget(cost.msPerPixel, canvasPixels())) {
				const fromScale = renderScale
				renderScale = fitRenderScale(cost.msPerPixel, cssPixels(), scene.renderScale) ?? MIN_RENDER_SCALE
				if (renderScale !== fromScale) {
					resize()
					const before = cost.medianMs
					cost = measureFrameCost(drawAndWait, canvasPixels())
					reportBackdrop(scene.id, 'rescaled', {fromScale, toScale: renderScale, measuredMs: Math.round(before), nowMs: Math.round(cost.medianMs)})
				}
			}
			msPerPixel = cost.msPerPixel
			return {fits: fitsFrameBudget(cost.msPerPixel, canvasPixels()), rescaled: renderScale !== scene.renderScale, medianMs: cost.medianMs}
		}
		const activateWebglBackdrop = (reason: string): void => {
			if (webglActive) return
			webglActive = true
			document.body.classList.add('backdrop-webgl-active')
			logBackdrop('info', scene.id, 'webgl-activate', {mode: 'webgl', reason, renderer, softwareRendererAllowed})
		}
		// A second look a little later decides: a busy moment or a GPU still at idle
		// clocks is not a slow GPU. It returns to the scene's own resolution when the
		// GPU now keeps up, and only a second miss at the lowest scale falls back.
		const recheckLater = (pause: boolean): void => {
			if (failed) return
			if (pause) {
				paused = true
				stop()
			}
			if (recheckTimer !== null) return
			recheckTimer = setTimeout(() => {
				recheckTimer = null
				paused = false
				if (failed) return
				const result = calibrate()
				if (!result.fits) {
					const details = {renderer, pixels: canvasPixels(), renderScale, measuredMs: Math.round(result.medianMs)}
					reportBackdrop(scene.id, 'fallback', {reason: 'production-webgl-too-slow', ...details})
					failAtRuntime('production-webgl-too-slow', details)
					return
				}
				lastFrame = performance.now()
				activateWebglBackdrop('rechecked')
				run()
			}, BACKDROP_CONFIRM_DELAY_MS)
		}
		const drawInitialFrame = (reason: string): boolean => {
			if (webglActive || failed || paused || document.hidden) return webglActive
			const result = calibrate()
			if (!result.fits) {
				recheckLater(true)
				return false
			}
			if (result.rescaled) recheckLater(false)
			lastFrame = performance.now()
			activateWebglBackdrop(reason)
			return true
		}
		const loop = (now: number): void => {
			if (now - lastFrame >= scene.frameIntervalMs) {
				draw(now)
				lastFrame = now
			}
			raf = requestAnimationFrame(loop)
		}
		const stop = (): void => {
			if (raf) cancelAnimationFrame(raf)
			raf = 0
		}
		const failAtRuntime = (reason: string, details: Record<string, unknown> = {}): void => {
			if (failed) return
			failed = true
			stop()
			webglActive = false
			document.body.classList.remove('backdrop-webgl-active')
			giveUp(reason, details)
		}
		const run = (): void => {
			if (failed || paused) return
			if (!drawInitialFrame('initial') && paused) return
			if (raf || !isBackdropActive()) return
			if (staticRender()) {
				draw(performance.now())
				return
			}
			raf = requestAnimationFrame(loop)
		}
		const onActivityChange = (): void => {
			if (isBackdropActive()) run()
			else stop()
		}
		const onVisibility = (): void => {
			if (!document.hidden) drawInitialFrame('visibility')
			onActivityChange()
		}
		const onWindowFocus = (): void => {
			onActivityChange()
		}
		const onWindowBlur = (): void => {
			stop()
		}
		const onReduce = (): void => {
			stop()
			run()
		}
		const onStaticInvalidation = (): void => {
			if (!failed && isBackdropActive() && staticRender()) draw(performance.now())
		}
		const onContextLost = (event: Event): void => {
			event.preventDefault()
			logBackdrop('warn', scene.id, 'webgl-context-lost', {mode: 'webgl', renderer})
			failAtRuntime('production-webgl-context-lost', {renderer})
		}

		webglCanvas.addEventListener('webglcontextlost', onContextLost)
		document.addEventListener('visibilitychange', onVisibility)
		window.addEventListener('focus', onWindowFocus)
		window.addEventListener('blur', onWindowBlur)
		reduceMotion.addEventListener('change', onReduce)
		window.addEventListener('resize', onStaticInvalidation)
		run()

		return () => {
			stop()
			if (recheckTimer !== null) clearTimeout(recheckTimer)
			webglCanvas.removeEventListener('webglcontextlost', onContextLost)
			document.removeEventListener('visibilitychange', onVisibility)
			window.removeEventListener('focus', onWindowFocus)
			window.removeEventListener('blur', onWindowBlur)
			reduceMotion.removeEventListener('change', onReduce)
			window.removeEventListener('resize', onStaticInvalidation)
			document.body.classList.remove('backdrop-webgl-active')
			gl.deleteBuffer(buf)
		}
	}, [linked, scene])

	return <canvas ref={webglCanvasRef} aria-hidden data-backdrop-layer="webgl" data-backdrop-scene={scene.id} className="pointer-events-none fixed inset-0 h-full w-full" style={{zIndex: -1}} />
}
