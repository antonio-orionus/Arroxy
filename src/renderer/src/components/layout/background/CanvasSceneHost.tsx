import {useEffect, useLayoutEffect, useRef, type ReactNode} from 'react'
import {logBackdrop, reportBackdropFallback} from './backdropLogger.js'
import {fitsFrameBudget, measureFrameCost} from './frameBudget.js'
import type {BackdropScene} from './types.js'
import {createWebglProgram, disposeWebglProgram, isSoftwareRenderer, releaseWebglContext, rendererName, WEBGL_CONTEXT_OPTIONS} from './webgl.js'

function backdropPreviewSoftwareAllowed(): boolean {
	try {
		return (import.meta.env.MODE === 'browser-mock' || import.meta.env.MODE === 'test') && new URLSearchParams(window.location.search).has('backdrop')
	} catch {
		return false
	}
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

	useEffect(() => {
		const giveUp = (reason: string, details: Record<string, unknown> = {}): void => {
			logBackdrop('info', scene.id, 'unavailable', {reason, ...details})
			onUnavailableRef.current(reason)
		}

		const webglCanvas = webglCanvasRef.current
		if (!webglCanvas) return

		const softwareRendererAllowed = softwareWebglAllowed || backdropPreviewSoftwareAllowed()
		const probeCanvas = document.createElement('canvas')
		const probeGl = probeCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!probeGl) return giveUp('scratch-webgl-unavailable')

		const probeRendererName = rendererName(probeGl)
		if (isSoftwareRenderer(probeRendererName) && !softwareRendererAllowed) {
			releaseWebglContext(probeGl)
			return giveUp('software-webgl-rejected', {renderer: probeRendererName})
		}

		const probeResources = createWebglProgram(probeGl, scene.fragmentShader, scene.id)
		if (!probeResources) {
			releaseWebglContext(probeGl)
			return giveUp('scratch-program-failed', {renderer: probeRendererName})
		}
		disposeWebglProgram(probeGl, probeResources)
		releaseWebglContext(probeGl)
		logBackdrop('debug', scene.id, 'scratch-webgl-valid', {mode: 'probe', renderer: probeRendererName, softwareRendererAllowed})

		const gl = webglCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!gl) return giveUp('production-webgl-unavailable', {renderer: probeRendererName})

		const productionRendererName = rendererName(gl)
		const resources = createWebglProgram(gl, scene.fragmentShader, scene.id)
		if (!resources) {
			releaseWebglContext(gl)
			return giveUp('production-program-failed', {renderer: productionRendererName || probeRendererName})
		}
		gl.useProgram(resources.prog)

		const buf = gl.createBuffer()
		if (!buf) {
			disposeWebglProgram(gl, resources)
			releaseWebglContext(gl)
			return giveUp('production-buffer-failed', {renderer: productionRendererName || probeRendererName})
		}
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
		// GPU time per canvas pixel, measured once the first frames draw.
		let msPerPixel: number | null = null
		const start = performance.now()
		const syncPixel = new Uint8Array(4)

		const rejectSlowGpu = (pixels: number, measuredMs: number): void => {
			const details = {renderer: productionRendererName || probeRendererName, pixels, measuredMs: Math.round(measuredMs)}
			reportBackdropFallback(scene.id, 'production-webgl-too-slow', details)
			failAtRuntime('production-webgl-too-slow', details)
		}

		const resize = (): void => {
			const dpr = Math.min(window.devicePixelRatio || 1, scene.maxDevicePixelRatio) * scene.renderScale
			const w = Math.max(1, Math.floor((webglCanvas.clientWidth || window.innerWidth || 1) * dpr))
			const h = Math.max(1, Math.floor((webglCanvas.clientHeight || window.innerHeight || 1) * dpr))
			if (webglCanvas.width !== w || webglCanvas.height !== h) {
				// A bigger window costs proportionally more: predict it rather than stall to find out.
				if (msPerPixel !== null && !fitsFrameBudget(msPerPixel, w * h)) return rejectSlowGpu(w * h, msPerPixel * w * h)
				webglCanvas.width = w
				webglCanvas.height = h
				gl.viewport(0, 0, w, h)
			}
			gl.uniform2f(uRes, w, h)
		}

		const draw = (now: number): void => {
			resize()
			if (failed) return
			gl.uniform1f(uTime, (now - start) / 1000)
			gl.drawArrays(gl.TRIANGLES, 0, 3)
		}
		// Reading one pixel back blocks until the GPU has finished the frame.
		const drawAndWait = (): void => {
			draw(performance.now())
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, syncPixel)
		}
		const activateWebglBackdrop = (reason: string): void => {
			if (webglActive) return
			webglActive = true
			document.body.classList.add('backdrop-webgl-active')
			logBackdrop('info', scene.id, 'webgl-activate', {mode: 'webgl', reason, renderer: productionRendererName || probeRendererName, softwareRendererAllowed})
		}
		const drawInitialFrame = (reason: string): boolean => {
			if (webglActive || failed || document.hidden) return webglActive
			resize()
			const pixels = webglCanvas.width * webglCanvas.height
			const cost = measureFrameCost(drawAndWait, pixels)
			if (!fitsFrameBudget(cost.msPerPixel, pixels)) {
				rejectSlowGpu(pixels, cost.medianMs)
				return false
			}
			msPerPixel = cost.msPerPixel
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
			if (failed) return
			drawInitialFrame('initial')
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
			logBackdrop('warn', scene.id, 'webgl-context-lost', {mode: 'webgl', renderer: productionRendererName || probeRendererName})
			failAtRuntime('production-webgl-context-lost', {renderer: productionRendererName || probeRendererName})
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
			webglCanvas.removeEventListener('webglcontextlost', onContextLost)
			document.removeEventListener('visibilitychange', onVisibility)
			window.removeEventListener('focus', onWindowFocus)
			window.removeEventListener('blur', onWindowBlur)
			reduceMotion.removeEventListener('change', onReduce)
			window.removeEventListener('resize', onStaticInvalidation)
			document.body.classList.remove('backdrop-webgl-active')
			disposeWebglProgram(gl, resources)
			gl.deleteBuffer(buf)
			// Free the GPU context now rather than whenever the canvas is collected.
			// Only once the canvas has left the page: StrictMode re-runs this effect
			// on the same canvas, and a lost context cannot be revived there.
			if (!webglCanvas.isConnected) releaseWebglContext(gl)
		}
	}, [scene, softwareWebglAllowed])

	return <canvas ref={webglCanvasRef} aria-hidden data-backdrop-layer="webgl" data-backdrop-scene={scene.id} className="pointer-events-none fixed inset-0 h-full w-full" style={{zIndex: -1}} />
}
