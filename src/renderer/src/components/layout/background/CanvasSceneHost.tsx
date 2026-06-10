import {useEffect, useRef, useState, type ReactNode} from 'react'
import {logBackdrop} from './backdropLogger.js'
import type {BackdropMode, BackdropScene} from './types.js'
import {createWebglProgram, disposeWebglProgram, isSoftwareRenderer, releaseWebglContext, rendererName, WEBGL_CONTEXT_OPTIONS} from './webgl.js'

const FALLBACK_RESIZE_SETTLE_MS = 300

function backdropSoftwareAllowed(): boolean {
	try {
		return new URLSearchParams(window.location.search).get('backdropSoftware') === '1'
	} catch {
		return false
	}
}

function addSceneClasses(scene: BackdropScene): () => void {
	document.body.classList.add(scene.bodyClassName)
	return () => document.body.classList.remove(scene.bodyClassName)
}

function activateStaticFallback(): () => void {
	document.body.classList.add('backdrop-static-fallback')
	return () => document.body.classList.remove('backdrop-static-fallback')
}

export function CanvasSceneHost({scene}: {scene: BackdropScene}): ReactNode {
	const webglCanvasRef = useRef<HTMLCanvasElement>(null)
	const fallbackCanvasRef = useRef<HTMLCanvasElement>(null)
	const [mode, setMode] = useState<BackdropMode>('webgl')

	useEffect(() => {
		const webglCanvas = webglCanvasRef.current
		const fallbackCanvas = fallbackCanvasRef.current
		if (!webglCanvas || !fallbackCanvas) return

		const cleanupSceneClass = addSceneClasses(scene)

		const activateCanvasFallback = (reason: string, details: Record<string, unknown> = {}): (() => void) => {
			logBackdrop('info', scene.id, 'fallback-activate', {mode: 'fallback', reason, ...details})
			const cleanupStatic = activateStaticFallback()
			const renderer = scene.createStaticFallbackRenderer(fallbackCanvas)
			if (!renderer) {
				logBackdrop('warn', scene.id, 'fallback-css-only', {mode: 'css', reason, ...details})
				setMode('css')
				return () => {
					cleanupStatic()
					cleanupSceneClass()
				}
			}

			const drawFallback = (drawReason: string, renderScale = scene.fallbackRenderScale): void => {
				const stats = renderer.draw(renderScale)
				logBackdrop(stats.durationMs > 50 ? 'warn' : 'debug', scene.id, 'canvas2d-draw', {mode: 'canvas2d', reason: drawReason, ...stats})
			}

			drawFallback('initial')
			setMode('canvas2d')
			document.body.classList.add('backdrop-canvas-fallback')

			let raf = 0
			let resizeSettledTimer = 0
			const scheduleDraw = (drawReason: string, renderScale = scene.fallbackRenderScale): void => {
				if (raf) cancelAnimationFrame(raf)
				raf = requestAnimationFrame(() => {
					raf = 0
					drawFallback(drawReason, renderScale)
				})
			}
			const scheduleResizeDraw = (): void => {
				if (resizeSettledTimer) window.clearTimeout(resizeSettledTimer)
				logBackdrop('debug', scene.id, 'resize-settle-scheduled', {
					cssHeight: Math.max(1, Math.round(fallbackCanvas.clientHeight || window.innerHeight || 1)),
					cssWidth: Math.max(1, Math.round(fallbackCanvas.clientWidth || window.innerWidth || 1)),
					liveRedraw: false,
					mode: 'canvas2d',
					settleMs: FALLBACK_RESIZE_SETTLE_MS
				})
				resizeSettledTimer = window.setTimeout(() => {
					resizeSettledTimer = 0
					scheduleDraw('resize-settled')
				}, FALLBACK_RESIZE_SETTLE_MS)
			}
			window.addEventListener('resize', scheduleResizeDraw)

			return () => {
				if (raf) cancelAnimationFrame(raf)
				if (resizeSettledTimer) window.clearTimeout(resizeSettledTimer)
				window.removeEventListener('resize', scheduleResizeDraw)
				document.body.classList.remove('backdrop-canvas-fallback')
				cleanupStatic()
				cleanupSceneClass()
			}
		}

		const softwareRendererAllowed = backdropSoftwareAllowed()
		const probeCanvas = document.createElement('canvas')
		const probeGl = probeCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!probeGl) return activateCanvasFallback('scratch-webgl-unavailable')

		const probeRendererName = rendererName(probeGl)
		if (isSoftwareRenderer(probeRendererName) && !softwareRendererAllowed) {
			releaseWebglContext(probeGl)
			return activateCanvasFallback('software-webgl-rejected', {renderer: probeRendererName})
		}

		const probeResources = createWebglProgram(probeGl, scene.fragmentShader, scene.id)
		if (!probeResources) {
			releaseWebglContext(probeGl)
			return activateCanvasFallback('scratch-program-failed', {renderer: probeRendererName})
		}
		disposeWebglProgram(probeGl, probeResources)
		releaseWebglContext(probeGl)
		logBackdrop('debug', scene.id, 'scratch-webgl-valid', {mode: 'probe', renderer: probeRendererName, softwareRendererAllowed})

		const gl = webglCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!gl) return activateCanvasFallback('production-webgl-unavailable', {renderer: probeRendererName})

		const productionRendererName = rendererName(gl)
		const resources = createWebglProgram(gl, scene.fragmentShader, scene.id)
		if (!resources) {
			releaseWebglContext(gl)
			return activateCanvasFallback('production-program-failed', {renderer: productionRendererName || probeRendererName})
		}
		gl.useProgram(resources.prog)

		const buf = gl.createBuffer()
		if (!buf) {
			disposeWebglProgram(gl, resources)
			releaseWebglContext(gl)
			return activateCanvasFallback('production-buffer-failed', {renderer: productionRendererName || probeRendererName})
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, buf)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
		const aPos = gl.getAttribLocation(resources.prog, 'aPos')
		gl.enableVertexAttribArray(aPos)
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

		const uRes = gl.getUniformLocation(resources.prog, 'uRes')
		const uTime = gl.getUniformLocation(resources.prog, 'uTime')

		setMode('webgl')
		document.body.classList.add('backdrop-webgl-active')
		logBackdrop('info', scene.id, 'webgl-activate', {mode: 'webgl', renderer: productionRendererName || probeRendererName, softwareRendererAllowed})

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
		const staticRender = (): boolean => reduceMotion.matches

		const resize = (): void => {
			const dpr = Math.min(window.devicePixelRatio || 1, scene.maxDevicePixelRatio) * scene.renderScale
			const w = Math.max(1, Math.floor((webglCanvas.clientWidth || window.innerWidth || 1) * dpr))
			const h = Math.max(1, Math.floor((webglCanvas.clientHeight || window.innerHeight || 1) * dpr))
			if (webglCanvas.width !== w || webglCanvas.height !== h) {
				webglCanvas.width = w
				webglCanvas.height = h
				gl.viewport(0, 0, w, h)
			}
			gl.uniform2f(uRes, w, h)
		}

		let raf = 0
		let lastFrame = 0
		const start = performance.now()

		const draw = (now: number): void => {
			resize()
			gl.uniform1f(uTime, (now - start) / 1000)
			gl.drawArrays(gl.TRIANGLES, 0, 3)
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
		const run = (): void => {
			if (raf || document.hidden) return
			if (staticRender()) {
				draw(performance.now())
				return
			}
			raf = requestAnimationFrame(loop)
		}
		const onVisibility = (): void => {
			if (document.hidden) stop()
			else run()
		}
		const onReduce = (): void => {
			stop()
			run()
		}
		const onStaticInvalidation = (): void => {
			if (!document.hidden && staticRender()) draw(performance.now())
		}

		document.addEventListener('visibilitychange', onVisibility)
		reduceMotion.addEventListener('change', onReduce)
		window.addEventListener('resize', onStaticInvalidation)
		run()

		return () => {
			stop()
			document.removeEventListener('visibilitychange', onVisibility)
			reduceMotion.removeEventListener('change', onReduce)
			window.removeEventListener('resize', onStaticInvalidation)
			document.body.classList.remove('backdrop-webgl-active')
			cleanupSceneClass()
			disposeWebglProgram(gl, resources)
			gl.deleteBuffer(buf)
			releaseWebglContext(gl)
		}
	}, [scene])

	if (mode === 'css') return null

	const canvasClassName = 'pointer-events-none fixed inset-0 h-full w-full'
	const hiddenStyle = {display: 'none', zIndex: -1}
	const visibleStyle = {zIndex: -1}

	return (
		<>
			<canvas ref={webglCanvasRef} aria-hidden data-backdrop-layer="webgl" data-backdrop-mode={mode === 'webgl' ? 'webgl' : undefined} data-backdrop-scene={scene.id} className={canvasClassName} style={mode === 'webgl' ? visibleStyle : hiddenStyle} />
			<canvas ref={fallbackCanvasRef} aria-hidden data-backdrop-layer="fallback" data-backdrop-mode={mode === 'canvas2d' ? 'canvas2d' : undefined} data-backdrop-scene={scene.id} className={canvasClassName} style={mode === 'canvas2d' ? visibleStyle : hiddenStyle} />
		</>
	)
}
