import {addStops, fillRadial, hash2, resizeCanvasForFallback, rgba, smoothstep} from '../canvasUtils.js'
import type {StaticFallbackDrawStats, StaticFallbackRenderer} from '../types.js'

const FALLBACK_AURORA_TIME = 12.5
const FALLBACK_MAX_DEVICE_PIXEL_RATIO = 1

function fallbackBandAt(x: number, height: number): {base: number; upper: number} {
	const drift = FALLBACK_AURORA_TIME * 0.045
	const qBase = 0.32 + 0.09 * Math.sin(x * 5.2 - 0.55 + drift) + 0.025 * Math.sin(x * 15 + 1.7 - drift * 1.4)
	const qUpper = qBase + 0.36 + 0.1 * Math.sin(x * 3.4 + 0.8 + drift * 0.6)
	return {base: height * (1 - qBase), upper: height * (1 - qUpper)}
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const sky = ctx.createLinearGradient(0, 0, 0, height)
	addStops(sky, [
		[0, '#01040d'],
		[0.36, '#031026'],
		[0.68, '#020817'],
		[1, '#01030a']
	])
	ctx.fillStyle = sky
	ctx.fillRect(0, 0, width, height)
}

function drawBlooms(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.42
	ctx.filter = `blur(${Math.max(22, width * 0.018)}px) saturate(130%)`
	fillRadial(ctx, width, height, width * 0.46, height * -0.06, Math.max(width, height) * 0.48, [
		[0, rgba(94, 238, 255, 0.72)],
		[0.34, rgba(55, 122, 255, 0.38)],
		[0.74, rgba(55, 122, 255, 0.08)],
		[1, rgba(55, 122, 255, 0)]
	])
	fillRadial(ctx, width, height, width * 0.86, height * 0.04, Math.max(width, height) * 0.42, [
		[0, rgba(202, 76, 255, 0.62)],
		[0.42, rgba(122, 62, 255, 0.28)],
		[1, rgba(122, 62, 255, 0)]
	])
	ctx.restore()
}

function drawCurtain(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const steps = 84
	const bandGradient = ctx.createLinearGradient(0, 0, width, 0)
	addStops(bandGradient, [
		[0, rgba(33, 230, 255, 0.44)],
		[0.36, rgba(62, 118, 255, 0.5)],
		[0.7, rgba(132, 70, 255, 0.46)],
		[1, rgba(208, 62, 255, 0.3)]
	])

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.48
	ctx.filter = `blur(${Math.max(10, width * 0.006)}px) saturate(132%)`
	ctx.beginPath()
	for (let i = 0; i <= steps; i++) {
		const x = i / steps
		const y = fallbackBandAt(x, height).upper
		if (i === 0) ctx.moveTo(0, y)
		else ctx.lineTo(x * width, y)
	}
	for (let i = steps; i >= 0; i--) {
		const x = i / steps
		const y = fallbackBandAt(x, height).base
		ctx.lineTo(x * width, y)
	}
	ctx.closePath()
	ctx.fillStyle = bandGradient
	ctx.fill()
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.3
	ctx.filter = 'blur(2px) saturate(125%)'
	for (let i = 0; i < 132; i++) {
		const xNorm = i / 131
		const rnd = hash2(i, 8.4)
		if (rnd < 0.16) continue
		const x = xNorm * width
		const band = fallbackBandAt(xNorm, height)
		const span = band.base - band.upper
		const top = band.upper + span * (0.05 + hash2(i, 2.3) * 0.24)
		const bottom = band.base - span * hash2(i, 9.7) * 0.18
		const alpha = 0.12 + hash2(i, 5.8) * 0.22
		const lineGradient = ctx.createLinearGradient(x, top, x, bottom)
		addStops(lineGradient, [
			[0, rgba(154, 225, 255, 0)],
			[0.24, rgba(98, 213, 255, alpha)],
			[0.62, rgba(110, 102, 255, alpha * 0.9)],
			[1, rgba(208, 86, 255, 0)]
		])
		ctx.strokeStyle = lineGradient
		ctx.lineWidth = 1.4 + hash2(i, 4.1) * 4.8
		ctx.beginPath()
		ctx.moveTo(x, bottom)
		ctx.bezierCurveTo(x + Math.sin(i) * 14, bottom - span * 0.32, x - Math.cos(i * 1.7) * 18, top + span * 0.22, x + Math.sin(i * 2.3) * 10, top)
		ctx.stroke()
	}
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.42
	ctx.filter = `blur(${Math.max(3, width * 0.002)}px)`
	const waveGradient = ctx.createLinearGradient(0, 0, width, 0)
	addStops(waveGradient, [
		[0, rgba(60, 240, 255, 0.32)],
		[0.42, rgba(92, 134, 255, 0.72)],
		[0.78, rgba(190, 72, 255, 0.62)],
		[1, rgba(210, 72, 255, 0.2)]
	])
	ctx.strokeStyle = waveGradient
	ctx.lineWidth = Math.max(12, height * 0.016)
	ctx.beginPath()
	for (let i = 0; i <= steps; i++) {
		const x = i / steps
		const yQ = 0.42 + 0.19 * Math.sin((x - 0.18) * 3.15 + FALLBACK_AURORA_TIME * 0.8) + 0.18 * x
		const y = height * (1 - yQ)
		if (i === 0) ctx.moveTo(0, y)
		else ctx.lineTo(x * width, y)
	}
	ctx.stroke()
	ctx.restore()
}

function drawReflection(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.22
	ctx.filter = `blur(${Math.max(14, width * 0.011)}px) saturate(126%)`
	fillRadial(ctx, width, height, width * 0.13, height * 0.82, Math.max(width, height) * 0.34, [
		[0, rgba(36, 240, 255, 0.58)],
		[0.52, rgba(35, 134, 255, 0.24)],
		[1, rgba(35, 134, 255, 0)]
	])
	fillRadial(ctx, width, height, width * 0.55, height * 0.86, Math.max(width, height) * 0.42, [
		[0, rgba(62, 100, 255, 0.42)],
		[0.58, rgba(52, 72, 255, 0.2)],
		[1, rgba(52, 72, 255, 0)]
	])
	fillRadial(ctx, width, height, width * 0.86, height * 0.82, Math.max(width, height) * 0.4, [
		[0, rgba(184, 64, 255, 0.5)],
		[0.58, rgba(116, 48, 255, 0.22)],
		[1, rgba(116, 48, 255, 0)]
	])
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.16
	ctx.filter = 'blur(8px)'
	for (let i = 0; i < 72; i++) {
		const x = width * hash2(i, 14.7)
		const y = height * (0.64 + hash2(i, 3.1) * 0.26)
		const h = height * (0.05 + hash2(i, 6.2) * 0.18)
		const gradient = ctx.createLinearGradient(x, y - h, x, y + h)
		addStops(gradient, [
			[0, rgba(84, 226, 255, 0)],
			[0.38, rgba(80, 136, 255, 0.2)],
			[0.7, rgba(180, 76, 255, 0.2)],
			[1, rgba(180, 76, 255, 0)]
		])
		ctx.strokeStyle = gradient
		ctx.lineWidth = 2 + hash2(i, 1.1) * 8
		ctx.beginPath()
		ctx.moveTo(x, y - h)
		ctx.lineTo(x + Math.sin(i * 2.1) * 12, y + h)
		ctx.stroke()
	}
	ctx.restore()
}

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const layers = [
		{cell: 28, threshold: 0.955, radius: [0.55, 1.15], alpha: 0.72},
		{cell: 19, threshold: 0.977, radius: [0.42, 0.88], alpha: 0.58},
		{cell: 13, threshold: 0.989, radius: [0.34, 0.66], alpha: 0.44}
	] as const

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	for (const layer of layers) {
		const cols = Math.ceil(width / layer.cell)
		const rows = Math.ceil((height * 0.84) / layer.cell)
		for (let gx = 0; gx < cols; gx++) {
			for (let gy = 0; gy < rows; gy++) {
				const present = hash2(gx + layer.cell, gy + 41.3)
				if (present < layer.threshold) continue
				const x = (gx + 0.14 + hash2(gx, gy) * 0.72) * layer.cell
				const y = (gy + 0.14 + hash2(gx + 8.2, gy + 3.7) * 0.72) * layer.cell
				const bottomFade = 1 - smoothstep(height * 0.7, height * 0.86, y)
				if (bottomFade <= 0) continue
				const radius = layer.radius[0] + hash2(gx + 1.7, gy + 9.9) * (layer.radius[1] - layer.radius[0])
				const alpha = layer.alpha * bottomFade * (0.7 + hash2(gx + 4.4, gy + 5.5) * 0.3)
				const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
				addStops(gradient, [
					[0, rgba(238, 246, 255, alpha)],
					[0.28, rgba(170, 210, 255, alpha * 0.55)],
					[1, rgba(120, 170, 255, 0)]
				])
				ctx.fillStyle = gradient
				ctx.beginPath()
				ctx.arc(x, y, radius * 4, 0, Math.PI * 2)
				ctx.fill()
			}
		}
	}
	ctx.restore()
}

function drawStaticFallback(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, renderScale: number): StaticFallbackDrawStats {
	const startedAt = performance.now()
	const stats = resizeCanvasForFallback(canvas, ctx, renderScale, FALLBACK_MAX_DEVICE_PIXEL_RATIO)
	drawSky(ctx, stats.cssWidth, stats.cssHeight)
	drawBlooms(ctx, stats.cssWidth, stats.cssHeight)
	drawCurtain(ctx, stats.cssWidth, stats.cssHeight)
	drawReflection(ctx, stats.cssWidth, stats.cssHeight)
	drawStars(ctx, stats.cssWidth, stats.cssHeight)
	return {...stats, durationMs: Math.round((performance.now() - startedAt) * 100) / 100}
}

export function createDarkAuroraFallbackRenderer(canvas: HTMLCanvasElement): StaticFallbackRenderer | null {
	const ctx = canvas.getContext('2d', {alpha: false})
	if (!ctx) return null
	return {draw: (renderScale = 0.75) => drawStaticFallback(canvas, ctx, renderScale)}
}
