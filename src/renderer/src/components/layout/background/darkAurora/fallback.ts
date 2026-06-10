import {addStops, fillRadial, hash2, resizeCanvasForFallback, rgba, smoothstep} from '../canvasUtils.js'
import type {StaticFallbackDrawStats, StaticFallbackRenderer} from '../types.js'

const FALLBACK_AURORA_TIME = 12.5
const FALLBACK_MAX_DEVICE_PIXEL_RATIO = 1
type Color = readonly [number, number, number]

const AURORA_RAMP = [
	{at: 0, color: [24, 205, 225] as const},
	{at: 0.22, color: [68, 230, 220] as const},
	{at: 0.48, color: [60, 115, 250] as const},
	{at: 0.72, color: [118, 78, 255] as const},
	{at: 1, color: [205, 58, 255] as const}
] as const

function mix(a: number, b: number, t: number): number {
	return a + (b - a) * t
}

function colorAt(x: number): Color {
	const clamped = Math.min(1, Math.max(0, x))
	for (let i = 1; i < AURORA_RAMP.length; i++) {
		const previous = AURORA_RAMP[i - 1]
		const next = AURORA_RAMP[i]
		if (clamped > next.at) continue
		const t = smoothstep(previous.at, next.at, clamped)
		return [mix(previous.color[0], next.color[0], t), mix(previous.color[1], next.color[1], t), mix(previous.color[2], next.color[2], t)]
	}
	return AURORA_RAMP[AURORA_RAMP.length - 1].color
}

function colorStop(x: number, alpha: number): string {
	const [r, g, b] = colorAt(x)
	return rgba(r, g, b, alpha)
}

function fillEllipticalRadial(ctx: CanvasRenderingContext2D, x: number, y: number, radiusX: number, radiusY: number, stops: [number, string][]): void {
	ctx.save()
	ctx.translate(x, y)
	ctx.scale(radiusX, radiusY)
	const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
	addStops(gradient, stops)
	ctx.fillStyle = gradient
	ctx.fillRect(-1, -1, 2, 2)
	ctx.restore()
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const sky = ctx.createLinearGradient(0, 0, 0, height)
	addStops(sky, [
		[0, '#020719'],
		[0.22, '#041133'],
		[0.48, '#03102a'],
		[0.76, '#010717'],
		[1, '#01040d']
	])
	ctx.fillStyle = sky
	ctx.fillRect(0, 0, width, height)

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.56
	ctx.filter = `blur(${Math.max(22, width * 0.018)}px)`
	fillRadial(ctx, width, height, width * 0.5, height * 1.02, Math.max(width, height) * 0.52, [
		[0, rgba(0, 5, 22, 0.72)],
		[0.48, rgba(0, 7, 22, 0.42)],
		[1, rgba(0, 8, 28, 0)]
	])
	ctx.restore()
}

function drawShaderWash(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.filter = `blur(${Math.max(34, width * 0.032)}px) saturate(138%)`
	fillEllipticalRadial(ctx, width * 0.22, height * 0.17, width * 0.28, height * 0.72, [
		[0, rgba(34, 238, 230, 0.26)],
		[0.36, rgba(38, 178, 235, 0.15)],
		[0.72, rgba(24, 122, 220, 0.07)],
		[1, rgba(24, 122, 220, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.48, height * 0.26, width * 0.24, height * 0.78, [
		[0, rgba(58, 124, 255, 0.23)],
		[0.42, rgba(55, 112, 248, 0.13)],
		[0.78, rgba(45, 82, 230, 0.06)],
		[1, rgba(45, 82, 230, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.72, height * 0.23, width * 0.22, height * 0.82, [
		[0, rgba(135, 84, 255, 0.2)],
		[0.48, rgba(104, 76, 255, 0.1)],
		[0.82, rgba(96, 64, 245, 0.04)],
		[1, rgba(96, 64, 245, 0)]
	])
	fillEllipticalRadial(ctx, width * 1.02, height * 0.33, width * 0.34, height * 0.86, [
		[0, rgba(214, 54, 255, 0.26)],
		[0.44, rgba(166, 52, 255, 0.13)],
		[0.82, rgba(110, 40, 220, 0.06)],
		[1, rgba(110, 40, 220, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.3, height * -0.02, width * 0.22, height * 0.28, [
		[0, rgba(136, 255, 208, 0.24)],
		[0.5, rgba(46, 210, 230, 0.12)],
		[1, rgba(46, 210, 230, 0)]
	])
	ctx.restore()
}

function drawBroadColumns(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.filter = `blur(${Math.max(16, width * 0.014)}px) saturate(136%)`
	ctx.lineCap = 'round'
	for (let i = 0; i < 38; i++) {
		const xNorm = -0.05 + (i / 37) * 1.12 + (hash2(i, 17.2) - 0.5) * 0.035
		const centerX = xNorm * width
		const top = height * (-0.08 + hash2(i, 2.3) * 0.18)
		const bottom = height * (0.64 + hash2(i, 5.9) * 0.22)
		const mid = height * (0.22 + hash2(i, 8.1) * 0.28)
		const sway = width * (0.02 + hash2(i, 4.4) * 0.055) * (hash2(i, 11.7) > 0.5 ? 1 : -1)
		const alpha = 0.045 + hash2(i, 7.4) * 0.1
		const columnGradient = ctx.createLinearGradient(centerX, top, centerX, bottom)
		addStops(columnGradient, [
			[0, colorStop(xNorm, alpha * 0.2)],
			[0.18, colorStop(xNorm, alpha)],
			[0.48, colorStop(Math.min(1, xNorm + 0.08), alpha * 0.54)],
			[0.78, colorStop(xNorm, alpha * 0.14)],
			[1, colorStop(xNorm, 0)]
		])
		ctx.strokeStyle = columnGradient
		ctx.lineWidth = Math.max(12, width * (0.018 + hash2(i, 12.8) * 0.038))
		ctx.beginPath()
		ctx.moveTo(centerX, top)
		ctx.bezierCurveTo(centerX + sway * 0.28, mid, centerX - sway * 0.65, bottom * 0.74, centerX + sway, bottom)
		ctx.stroke()
	}
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.filter = `blur(${Math.max(5, width * 0.005)}px) saturate(128%)`
	ctx.lineCap = 'round'
	for (let i = 0; i < 92; i++) {
		const xNorm = hash2(i, 21.6)
		const x = xNorm * width
		const top = height * (0.04 + hash2(i, 1.9) * 0.24)
		const bottom = height * (0.58 + hash2(i, 9.4) * 0.28)
		const alpha = 0.016 + hash2(i, 6.6) * 0.04
		const lineGradient = ctx.createLinearGradient(x, top, x, bottom)
		addStops(lineGradient, [
			[0, colorStop(xNorm, 0)],
			[0.2, colorStop(xNorm, alpha)],
			[0.7, colorStop(Math.min(1, xNorm + 0.12), alpha * 0.42)],
			[1, colorStop(xNorm, 0)]
		])
		ctx.strokeStyle = lineGradient
		ctx.lineWidth = 1.2 + hash2(i, 4.2) * 5.5
		ctx.beginPath()
		ctx.moveTo(x, top)
		ctx.bezierCurveTo(x + Math.sin(i * 1.6) * 10, top + (bottom - top) * 0.34, x - Math.cos(i * 0.9) * 16, bottom - (bottom - top) * 0.2, x + Math.sin(i * 2.2) * 8, bottom)
		ctx.stroke()
	}
	ctx.restore()
}

function lowCurtainTop(x: number, height: number): number {
	return height * (0.75 + 0.035 * Math.sin(x * 5.1 + 0.7) + 0.02 * Math.sin(x * 15.0 - 1.5))
}

function drawMiddleShadow(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const steps = 96

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.filter = `blur(${Math.max(16, width * 0.015)}px)`
	ctx.beginPath()
	for (let i = 0; i <= steps; i++) {
		const x = i / steps
		const y = height * (0.52 + 0.1 * Math.sin(x * 5.3 + 0.8) + 0.04 * Math.sin(x * 17 - 1.4))
		if (i === 0) ctx.moveTo(0, y)
		else ctx.lineTo(x * width, y)
	}
	ctx.lineTo(width, height)
	ctx.lineTo(0, height)
	ctx.closePath()
	const shadow = ctx.createLinearGradient(0, height * 0.48, 0, height)
	addStops(shadow, [
		[0, rgba(0, 4, 18, 0.02)],
		[0.26, rgba(0, 5, 20, 0.48)],
		[0.62, rgba(0, 4, 16, 0.62)],
		[1, rgba(0, 3, 12, 0.52)]
	])
	ctx.fillStyle = shadow
	ctx.fill()
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.filter = `blur(${Math.max(18, width * 0.018)}px)`
	fillEllipticalRadial(ctx, width * 0.48, height * 0.61, width * 0.42, height * 0.18, [
		[0, rgba(0, 4, 18, 0.58)],
		[0.52, rgba(0, 5, 20, 0.34)],
		[1, rgba(0, 5, 20, 0)]
	])
	ctx.restore()
}

function drawHorizonPatches(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.filter = `blur(${Math.max(12, width * 0.012)}px) saturate(138%)`
	fillEllipticalRadial(ctx, width * 0.18, height * 0.8, width * 0.18, height * 0.1, [
		[0, rgba(78, 255, 205, 0.36)],
		[0.36, rgba(34, 222, 236, 0.26)],
		[1, rgba(34, 222, 236, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.29, height * 0.79, width * 0.18, height * 0.09, [
		[0, rgba(96, 255, 192, 0.28)],
		[0.5, rgba(48, 178, 242, 0.18)],
		[1, rgba(48, 178, 242, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.55, height * 0.82, width * 0.24, height * 0.09, [
		[0, rgba(64, 118, 255, 0.3)],
		[0.52, rgba(54, 96, 245, 0.18)],
		[1, rgba(54, 96, 245, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.76, height * 0.8, width * 0.18, height * 0.11, [
		[0, rgba(122, 74, 255, 0.26)],
		[0.52, rgba(95, 64, 245, 0.18)],
		[1, rgba(95, 64, 245, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.92, height * 0.84, width * 0.22, height * 0.1, [
		[0, rgba(206, 58, 255, 0.27)],
		[0.5, rgba(148, 48, 230, 0.16)],
		[1, rgba(148, 48, 230, 0)]
	])
	ctx.restore()
}

function drawLowHorizon(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const steps = 96

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.5
	ctx.filter = `blur(${Math.max(12, width * 0.012)}px) saturate(132%)`
	ctx.beginPath()
	for (let i = 0; i <= steps; i++) {
		const x = i / steps
		const y = lowCurtainTop(x, height) - height * (0.035 + 0.02 * Math.sin(x * 7.0))
		if (i === 0) ctx.moveTo(0, y)
		else ctx.lineTo(x * width, y)
	}
	ctx.lineTo(width, height)
	ctx.lineTo(0, height)
	ctx.closePath()
	const bandGradient = ctx.createLinearGradient(0, 0, width, 0)
	addStops(bandGradient, [
		[0, rgba(34, 226, 236, 0.26)],
		[0.22, rgba(40, 176, 230, 0.18)],
		[0.5, rgba(58, 100, 245, 0.26)],
		[0.72, rgba(114, 70, 255, 0.24)],
		[1, rgba(196, 54, 255, 0.22)]
	])
	ctx.fillStyle = bandGradient
	ctx.fill()
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.36
	ctx.filter = `blur(${Math.max(4, width * 0.004)}px) saturate(132%)`
	ctx.lineCap = 'round'
	for (let i = 0; i < 110; i++) {
		const xNorm = i / 109
		const rnd = hash2(i, 8.4)
		if (rnd < 0.2) continue
		const x = xNorm * width
		const top = lowCurtainTop(xNorm, height) + height * (0.006 + hash2(i, 3.4) * 0.055)
		const bottom = height * (0.92 + hash2(i, 9.7) * 0.12)
		const alpha = 0.075 + hash2(i, 5.8) * 0.14
		const lineGradient = ctx.createLinearGradient(x, top, x, bottom)
		addStops(lineGradient, [
			[0, colorStop(xNorm, 0)],
			[0.2, colorStop(xNorm, alpha)],
			[0.6, colorStop(Math.min(1, xNorm + 0.1), alpha * 0.62)],
			[1, colorStop(xNorm, 0)]
		])
		ctx.strokeStyle = lineGradient
		ctx.lineWidth = 1.2 + hash2(i, 4.1) * 5.4
		ctx.beginPath()
		ctx.moveTo(x, top)
		ctx.bezierCurveTo(x + Math.sin(i) * 8, top + (bottom - top) * 0.22, x - Math.cos(i * 1.7) * 10, bottom - (bottom - top) * 0.28, x + Math.sin(i * 2.3) * 5, bottom)
		ctx.stroke()
	}
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.24
	ctx.filter = `blur(${Math.max(3, width * 0.003)}px)`
	const ridgeGradient = ctx.createLinearGradient(0, 0, width, 0)
	addStops(ridgeGradient, [
		[0, rgba(34, 220, 235, 0.28)],
		[0.35, rgba(46, 116, 248, 0.22)],
		[0.68, rgba(106, 78, 255, 0.28)],
		[1, rgba(205, 58, 255, 0.24)]
	])
	ctx.strokeStyle = ridgeGradient
	ctx.lineWidth = Math.max(6, height * 0.009)
	ctx.beginPath()
	for (let i = 0; i <= steps; i++) {
		const x = i / steps
		const y = lowCurtainTop(x, height) + height * (0.012 * Math.sin(x * 11 + FALLBACK_AURORA_TIME * 0.2))
		if (i === 0) ctx.moveTo(0, y)
		else ctx.lineTo(x * width, y)
	}
	ctx.stroke()
	ctx.restore()
}

function drawReflection(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.28
	ctx.filter = `blur(${Math.max(18, width * 0.018)}px) saturate(128%)`
	fillEllipticalRadial(ctx, width * 0.12, height * 0.88, width * 0.26, height * 0.24, [
		[0, rgba(28, 220, 228, 0.36)],
		[0.56, rgba(24, 122, 220, 0.16)],
		[1, rgba(24, 122, 220, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.52, height * 0.9, width * 0.34, height * 0.22, [
		[0, rgba(54, 100, 245, 0.34)],
		[0.6, rgba(36, 62, 220, 0.14)],
		[1, rgba(36, 62, 220, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.9, height * 0.86, width * 0.34, height * 0.26, [
		[0, rgba(190, 58, 255, 0.34)],
		[0.6, rgba(110, 44, 228, 0.16)],
		[1, rgba(110, 44, 228, 0)]
	])
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.12
	ctx.filter = `blur(${Math.max(5, width * 0.005)}px)`
	for (let i = 0; i < 44; i++) {
		const xNorm = hash2(i, 14.7)
		const x = width * xNorm
		const y = height * (0.78 + hash2(i, 3.1) * 0.18)
		const h = height * (0.035 + hash2(i, 6.2) * 0.1)
		const gradient = ctx.createLinearGradient(x, y - h, x, y + h)
		addStops(gradient, [
			[0, colorStop(xNorm, 0)],
			[0.5, colorStop(xNorm, 0.18)],
			[1, colorStop(xNorm, 0)]
		])
		ctx.strokeStyle = gradient
		ctx.lineWidth = 2 + hash2(i, 1.1) * 7
		ctx.beginPath()
		ctx.moveTo(x, y - h)
		ctx.lineTo(x + Math.sin(i * 2.1) * 8, y + h)
		ctx.stroke()
	}
	ctx.restore()
}

function gaussian(x: number, center: number, width: number): number {
	const normalized = (x - center) / width
	return Math.exp(-(normalized * normalized))
}

function lowFilamentMask(x: number): number {
	const left = gaussian(x, 0.18, 0.18)
	const center = gaussian(x, 0.55, 0.17) * 0.65
	const right = gaussian(x, 0.84, 0.22) * 0.9
	return Math.min(1, left + center + right)
}

function drawLowFilaments(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.5
	ctx.filter = `blur(${Math.max(1.2, width * 0.0015)}px) saturate(132%)`
	ctx.lineCap = 'round'
	for (let i = 0; i < 150; i++) {
		const xNorm = i / 149
		const mask = lowFilamentMask(xNorm)
		const rnd = hash2(i, 19.6)
		if (mask < 0.12 || rnd < 0.28) continue
		const x = xNorm * width + (hash2(i, 2.8) - 0.5) * width * 0.012
		const top = lowCurtainTop(xNorm, height) - height * (0.025 + hash2(i, 7.2) * 0.045)
		const bottom = height * (0.88 + hash2(i, 12.4) * 0.1)
		const alpha = (0.07 + hash2(i, 4.6) * 0.13) * mask
		const filament = ctx.createLinearGradient(x, top, x, bottom)
		addStops(filament, [
			[0, colorStop(xNorm, 0)],
			[0.18, colorStop(xNorm, alpha)],
			[0.52, colorStop(Math.min(1, xNorm + 0.1), alpha * 0.72)],
			[1, colorStop(xNorm, 0)]
		])
		ctx.strokeStyle = filament
		ctx.lineWidth = 0.8 + hash2(i, 8.3) * 4.2
		ctx.beginPath()
		ctx.moveTo(x, top)
		ctx.bezierCurveTo(x + Math.sin(i * 1.2) * 5, top + (bottom - top) * 0.3, x - Math.cos(i * 0.8) * 7, bottom - (bottom - top) * 0.28, x + Math.sin(i * 1.7) * 3, bottom)
		ctx.stroke()
	}
	ctx.restore()
}

function drawForegroundVoid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.filter = `blur(${Math.max(18, width * 0.018)}px)`
	fillEllipticalRadial(ctx, width * 0.48, height * 0.84, width * 0.48, height * 0.22, [
		[0, rgba(0, 3, 15, 0.52)],
		[0.48, rgba(0, 5, 18, 0.32)],
		[1, rgba(0, 6, 20, 0)]
	])
	ctx.restore()

	const shade = ctx.createLinearGradient(0, height * 0.72, 0, height)
	addStops(shade, [
		[0, rgba(0, 3, 12, 0)],
		[0.64, rgba(0, 4, 14, 0.24)],
		[1, rgba(0, 3, 10, 0.62)]
	])
	ctx.fillStyle = shade
	ctx.fillRect(0, height * 0.7, width, height * 0.3)
}

function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const layers = [
		{cell: 32, threshold: 0.93, radius: [0.35, 0.9], alpha: 0.58},
		{cell: 22, threshold: 0.965, radius: [0.26, 0.62], alpha: 0.46},
		{cell: 14, threshold: 0.986, radius: [0.22, 0.46], alpha: 0.34}
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
				const bottomFade = 1 - smoothstep(height * 0.66, height * 0.86, y)
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
	drawShaderWash(ctx, stats.cssWidth, stats.cssHeight)
	drawBroadColumns(ctx, stats.cssWidth, stats.cssHeight)
	drawMiddleShadow(ctx, stats.cssWidth, stats.cssHeight)
	drawForegroundVoid(ctx, stats.cssWidth, stats.cssHeight)
	drawHorizonPatches(ctx, stats.cssWidth, stats.cssHeight)
	drawLowHorizon(ctx, stats.cssWidth, stats.cssHeight)
	drawReflection(ctx, stats.cssWidth, stats.cssHeight)
	drawLowFilaments(ctx, stats.cssWidth, stats.cssHeight)
	drawStars(ctx, stats.cssWidth, stats.cssHeight)
	return {...stats, durationMs: Math.round((performance.now() - startedAt) * 100) / 100}
}

export function createDarkAuroraFallbackRenderer(canvas: HTMLCanvasElement): StaticFallbackRenderer | null {
	const ctx = canvas.getContext('2d', {alpha: false})
	if (!ctx) return null
	return {draw: (renderScale = 0.75) => drawStaticFallback(canvas, ctx, renderScale)}
}
