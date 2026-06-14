import {useEffect, useRef, useState, type ReactNode} from 'react'
import type {BackdropRenderMode} from '@shared/types.js'
import {logBackdrop} from './backdropLogger.js'
import type {BackdropMode, BackdropScene} from './types.js'
import {createWebglProgram, disposeWebglProgram, isSoftwareRenderer, releaseWebglContext, rendererName, WEBGL_CONTEXT_OPTIONS} from './webgl.js'

function backdropPreviewSoftwareAllowed(): boolean {
	try {
		const params = new URLSearchParams(window.location.search)
		return (import.meta.env.MODE === 'browser-mock' || import.meta.env.MODE === 'test') && params.has('backdrop') && !params.has('backdropForceFallback')
	} catch {
		return false
	}
}

function forcedFallbackPreviewMode(): 'css' | null {
	if (import.meta.env.MODE !== 'browser-mock' && import.meta.env.MODE !== 'test') return null
	try {
		return new URLSearchParams(window.location.search).get('backdropForceFallback') === 'css' ? 'css' : null
	} catch {
		return null
	}
}

function isBackdropActive(): boolean {
	return !document.hidden && (typeof document.hasFocus !== 'function' || document.hasFocus())
}

function addSceneClasses(scene: BackdropScene): () => void {
	document.body.classList.add(scene.bodyClassName)
	return () => document.body.classList.remove(scene.bodyClassName)
}

function activateStaticFallback(): () => void {
	document.body.classList.add('backdrop-static-fallback')
	return () => document.body.classList.remove('backdrop-static-fallback')
}

function initialBackdropMode(renderMode: BackdropRenderMode): BackdropMode {
	return renderMode === 'css-only' || forcedFallbackPreviewMode() === 'css' ? 'css' : 'webgl'
}

export function CanvasSceneHost({scene, renderMode, softwareWebglAllowed = false}: {scene: BackdropScene; renderMode: BackdropRenderMode; softwareWebglAllowed?: boolean}): ReactNode {
	const webglCanvasRef = useRef<HTMLCanvasElement>(null)
	const [mode, setMode] = useState<BackdropMode>(() => initialBackdropMode(renderMode))

	useEffect(() => {
		const cleanupSceneClass = addSceneClasses(scene)

		const activateCssFallback = (reason: string, details: Record<string, unknown> = {}, cleanupSceneOnDispose = true): (() => void) => {
			logBackdrop('info', scene.id, 'fallback-activate', {mode: 'css', reason, ...details})
			const cleanupStatic = activateStaticFallback()
			let cancelled = false
			queueMicrotask(() => {
				if (!cancelled) setMode('css')
			})
			return () => {
				cancelled = true
				cleanupStatic()
				if (cleanupSceneOnDispose) cleanupSceneClass()
			}
		}

		const forcedFallback = forcedFallbackPreviewMode()
		if (forcedFallback === 'css') return activateCssFallback('forced-css-preview')
		if (renderMode === 'css-only') return activateCssFallback('render-mode-css-only')

		const webglCanvas = webglCanvasRef.current
		if (!webglCanvas) {
			cleanupSceneClass()
			return
		}

		const softwareRendererAllowed = softwareWebglAllowed || backdropPreviewSoftwareAllowed()
		const probeCanvas = document.createElement('canvas')
		const probeGl = probeCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!probeGl) return activateCssFallback('scratch-webgl-unavailable')

		const probeRendererName = rendererName(probeGl)
		if (isSoftwareRenderer(probeRendererName) && !softwareRendererAllowed) {
			releaseWebglContext(probeGl)
			return activateCssFallback('software-webgl-rejected', {renderer: probeRendererName})
		}

		const probeResources = createWebglProgram(probeGl, scene.fragmentShader, scene.id)
		if (!probeResources) {
			releaseWebglContext(probeGl)
			return activateCssFallback('scratch-program-failed', {renderer: probeRendererName})
		}
		disposeWebglProgram(probeGl, probeResources)
		releaseWebglContext(probeGl)
		logBackdrop('debug', scene.id, 'scratch-webgl-valid', {mode: 'probe', renderer: probeRendererName, softwareRendererAllowed})

		const gl = webglCanvas.getContext('webgl', WEBGL_CONTEXT_OPTIONS)
		if (!gl) return activateCssFallback('production-webgl-unavailable', {renderer: probeRendererName})

		const productionRendererName = rendererName(gl)
		const resources = createWebglProgram(gl, scene.fragmentShader, scene.id)
		if (!resources) {
			releaseWebglContext(gl)
			return activateCssFallback('production-program-failed', {renderer: productionRendererName || probeRendererName})
		}
		gl.useProgram(resources.prog)

		const buf = gl.createBuffer()
		if (!buf) {
			disposeWebglProgram(gl, resources)
			releaseWebglContext(gl)
			return activateCssFallback('production-buffer-failed', {renderer: productionRendererName || probeRendererName})
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, buf)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
		const aPos = gl.getAttribLocation(resources.prog, 'aPos')
		gl.enableVertexAttribArray(aPos)
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

		const uRes = gl.getUniformLocation(resources.prog, 'uRes')
		const uTime = gl.getUniformLocation(resources.prog, 'uTime')

		setMode('webgl')

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
		let webglActive = false
		let fallbackCleanup: (() => void) | null = null
		const start = performance.now()

		const draw = (now: number): void => {
			resize()
			gl.uniform1f(uTime, (now - start) / 1000)
			gl.drawArrays(gl.TRIANGLES, 0, 3)
		}
		const activateWebglBackdrop = (reason: string): void => {
			if (webglActive) return
			webglActive = true
			document.body.classList.add('backdrop-webgl-active')
			logBackdrop('info', scene.id, 'webgl-activate', {mode: 'webgl', reason, renderer: productionRendererName || probeRendererName, softwareRendererAllowed})
		}
		const drawInitialFrame = (reason: string): boolean => {
			if (webglActive || fallbackCleanup || document.hidden) return webglActive
			const now = performance.now()
			draw(now)
			lastFrame = now
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
		const activateRuntimeFallback = (reason: string, details: Record<string, unknown> = {}): void => {
			if (fallbackCleanup) return
			stop()
			webglActive = false
			document.body.classList.remove('backdrop-webgl-active')
			fallbackCleanup = activateCssFallback(reason, details, false)
		}
		const run = (): void => {
			if (fallbackCleanup) return
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
			if (!fallbackCleanup && isBackdropActive() && staticRender()) draw(performance.now())
		}
		const onContextLost = (event: Event): void => {
			event.preventDefault()
			logBackdrop('warn', scene.id, 'webgl-context-lost', {mode: 'webgl', renderer: productionRendererName || probeRendererName})
			activateRuntimeFallback('production-webgl-context-lost', {renderer: productionRendererName || probeRendererName})
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
			fallbackCleanup?.()
			fallbackCleanup = null
			cleanupSceneClass()
			disposeWebglProgram(gl, resources)
			gl.deleteBuffer(buf)
		}
	}, [renderMode, scene, softwareWebglAllowed])

	if (mode === 'css') return null

	return <canvas ref={webglCanvasRef} aria-hidden data-backdrop-layer="webgl" data-backdrop-mode="webgl" data-backdrop-scene={scene.id} className="pointer-events-none fixed inset-0 h-full w-full" style={{zIndex: -1}} />
}
