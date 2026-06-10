import {addStops, fillRadial, hash2, resizeCanvasForFallback, rgba} from '../canvasUtils.js'
import type {StaticFallbackDrawStats, StaticFallbackRenderer} from '../types.js'

const FALLBACK_MAX_DEVICE_PIXEL_RATIO = 1.25

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
		[0, '#84befb'],
		[0.3, '#bfe7ff'],
		[0.47, '#e2f7ff'],
		[0.53, '#effdff'],
		[1, '#d7f3fb']
	])
	ctx.fillStyle = sky
	ctx.fillRect(0, 0, width, height)

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.6
	ctx.filter = `blur(${Math.max(18, width * 0.014)}px) saturate(112%)`
	fillRadial(ctx, width, height, width * 0.64, height * 0.44, Math.max(width, height) * 0.43, [
		[0, rgba(120, 220, 255, 0.54)],
		[0.5, rgba(76, 156, 255, 0.2)],
		[1, rgba(84, 158, 255, 0)]
	])
	fillRadial(ctx, width, height, width * 0.92, height * 0.08, Math.max(width, height) * 0.36, [
		[0, rgba(162, 132, 255, 0.24)],
		[1, rgba(165, 136, 255, 0)]
	])
	ctx.restore()
}

function drawSunRays(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const sunX = width * 0.67
	const sunY = height * 0.3
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.38
	ctx.filter = `blur(${Math.max(10, width * 0.008)}px)`
	const rayColors = [rgba(242, 251, 255, 0.2), rgba(220, 244, 255, 0.17), rgba(204, 234, 255, 0.14)]
	for (let i = 0; i < 7; i++) {
		const drift = (i - 3) * 0.055
		const ray = ctx.createLinearGradient(sunX, sunY, sunX + width * drift, height * 0.7)
		addStops(ray, [
			[0, rayColors[i % rayColors.length]],
			[0.34, rgba(226, 246, 255, 0.09)],
			[1, rgba(226, 246, 255, 0)]
		])
		ctx.fillStyle = ray
		ctx.beginPath()
		ctx.moveTo(sunX + width * (-0.025 + drift * 0.25), sunY + height * 0.01)
		ctx.lineTo(sunX + width * (0.025 + drift * 0.25), sunY + height * 0.01)
		ctx.lineTo(sunX + width * (drift + 0.14), height * 0.68)
		ctx.lineTo(sunX + width * (drift - 0.14), height * 0.68)
		ctx.closePath()
		ctx.fill()
	}
	ctx.restore()
}

function drawSun(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const sunX = width * 0.67
	const sunY = height * 0.3
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.filter = `blur(${Math.max(3, width * 0.003)}px)`
	fillRadial(ctx, width, height, sunX, sunY, Math.min(width, height) * 0.16, [
		[0, rgba(255, 255, 255, 0.98)],
		[0.22, rgba(244, 252, 255, 0.86)],
		[0.52, rgba(204, 236, 255, 0.26)],
		[1, rgba(204, 236, 255, 0)]
	])
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	fillRadial(ctx, width, height, sunX, sunY, Math.min(width, height) * 0.055, [
		[0, rgba(255, 255, 255, 0.98)],
		[0.72, rgba(242, 251, 255, 0.84)],
		[1, rgba(214, 240, 255, 0)]
	])
	ctx.restore()
}

function drawCloudSheets(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.filter = `blur(${Math.max(14, width * 0.012)}px) saturate(106%)`
	fillEllipticalRadial(ctx, width * 0.43, height * 0.16, width * 0.44, height * 0.18, [
		[0, rgba(255, 255, 255, 0.6)],
		[0.48, rgba(236, 251, 255, 0.42)],
		[1, rgba(214, 240, 255, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.18, height * 0.22, width * 0.2, height * 0.13, [
		[0, rgba(255, 255, 255, 0.44)],
		[0.56, rgba(232, 248, 255, 0.28)],
		[1, rgba(214, 240, 255, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.78, height * 0.18, width * 0.34, height * 0.16, [
		[0, rgba(250, 255, 255, 0.42)],
		[0.52, rgba(230, 248, 255, 0.3)],
		[1, rgba(214, 240, 255, 0)]
	])
	fillEllipticalRadial(ctx, width * 0.94, height * 0.32, width * 0.16, height * 0.08, [
		[0, rgba(255, 255, 255, 0.34)],
		[0.56, rgba(225, 246, 255, 0.2)],
		[1, rgba(214, 240, 255, 0)]
	])
	ctx.restore()
}

function drawCloud(ctx: CanvasRenderingContext2D, width: number, height: number, cx: number, cy: number, scale: number, alpha: number): void {
	ctx.save()
	ctx.globalAlpha = alpha
	ctx.filter = `blur(${Math.max(9, scale * 0.05)}px)`
	for (let i = 0; i < 7; i++) {
		const x = cx + (hash2(i, cx) - 0.5) * scale * 0.9
		const y = cy + (hash2(i, cy) - 0.5) * scale * 0.26
		const radius = scale * (0.18 + hash2(cx, i) * 0.18)
		fillRadial(ctx, width, height, x, y, radius, [
			[0, rgba(255, 255, 255, 0.72)],
			[0.58, rgba(225, 244, 255, 0.26)],
			[1, rgba(225, 244, 255, 0)]
		])
	}
	ctx.restore()
}

function drawClouds(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	drawCloudSheets(ctx, width, height)
	drawCloud(ctx, width, height, width * 0.2, height * 0.2, Math.min(width, height) * 0.48, 0.58)
	drawCloud(ctx, width, height, width * 0.78, height * 0.18, Math.min(width, height) * 0.58, 0.54)
	drawCloud(ctx, width, height, width * 0.54, height * 0.3, Math.min(width, height) * 0.42, 0.36)

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.34
	ctx.filter = `blur(${Math.max(14, width * 0.012)}px)`
	for (let i = 0; i < 18; i++) {
		const x = width * (0.05 + hash2(i, 12.2) * 0.9)
		const y = height * (0.14 + hash2(i, 4.6) * 0.3)
		const radius = Math.min(width, height) * (0.12 + hash2(i, 8.9) * 0.16)
		fillRadial(ctx, width, height, x, y, radius, [
			[0, rgba(255, 255, 255, 0.48)],
			[0.54, rgba(222, 244, 255, 0.18)],
			[1, rgba(222, 244, 255, 0)]
		])
	}
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.34
	ctx.filter = `blur(${Math.max(6, height * 0.012)}px)`
	const horizonY = height * 0.53
	const haze = ctx.createLinearGradient(0, horizonY - height * 0.08, 0, horizonY + height * 0.08)
	addStops(haze, [
		[0, rgba(228, 250, 255, 0)],
		[0.48, rgba(230, 250, 255, 0.8)],
		[1, rgba(180, 236, 255, 0)]
	])
	ctx.fillStyle = haze
	ctx.fillRect(0, horizonY - height * 0.11, width, height * 0.22)
	ctx.restore()
}

function drawSunReflection(ctx: CanvasRenderingContext2D, width: number, height: number, horizonY: number): void {
	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.54
	ctx.filter = `blur(${Math.max(4, width * 0.004)}px)`
	const centerX = width * 0.67
	for (let i = 0; i < 20; i++) {
		const depth = i / 20
		const y = horizonY + (height - horizonY) * (0.06 + depth * 0.7)
		const spread = width * (0.025 + depth * 0.1)
		const offset = (hash2(i, 6.8) - 0.5) * width * 0.06
		const gradient = ctx.createLinearGradient(centerX - spread + offset, y, centerX + spread + offset, y)
		addStops(gradient, [
			[0, rgba(218, 244, 255, 0)],
			[0.5, rgba(218, 244, 255, 0.16 + hash2(i, 2.6) * 0.2)],
			[1, rgba(218, 244, 255, 0)]
		])
		ctx.strokeStyle = gradient
		ctx.lineWidth = 1.2 + hash2(i, 4.3) * 2.8
		ctx.beginPath()
		ctx.moveTo(centerX - spread + offset, y)
		ctx.bezierCurveTo(centerX - spread * 0.35 + offset * 0.5, y - 2, centerX + spread * 0.38 + offset * 0.2, y + 2, centerX + spread + offset, y)
		ctx.stroke()
	}
	ctx.restore()
}

function drawWater(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const horizonY = height * 0.53
	const water = ctx.createLinearGradient(0, horizonY, 0, height)
	addStops(water, [
		[0, '#bff8ff'],
		[0.32, '#6fd4e7'],
		[0.72, '#2f99c2'],
		[1, '#1c7ca4']
	])
	ctx.fillStyle = water
	ctx.fillRect(0, horizonY, width, height - horizonY)

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.32
	ctx.filter = `blur(${Math.max(12, width * 0.01)}px) saturate(112%)`
	fillRadial(ctx, width, height, width * 0.62, horizonY + height * 0.11, Math.max(width, height) * 0.35, [
		[0, rgba(170, 238, 255, 0.64)],
		[0.64, rgba(90, 166, 255, 0.18)],
		[1, rgba(90, 166, 255, 0)]
	])
	ctx.restore()

	drawSunReflection(ctx, width, height, horizonY)

	ctx.save()
	ctx.globalAlpha = 0.7
	ctx.lineCap = 'round'
	for (let i = 0; i < 72; i++) {
		const depth = i / 86
		const y = horizonY + (height - horizonY) * (0.05 + depth)
		const phase = hash2(i, 3.7)
		const length = width * (0.06 + hash2(i, 9.2) * 0.32)
		const x = width * hash2(i, 14.1)
		const gradient = ctx.createLinearGradient(x, y, x + length, y)
		addStops(gradient, [
			[0, rgba(220, 250, 255, 0)],
			[0.5, rgba(224, 253, 255, 0.2 + phase * 0.3)],
			[1, rgba(220, 250, 255, 0)]
		])
		ctx.strokeStyle = gradient
		ctx.lineWidth = 0.8 + hash2(i, 1.8) * 2.4
		ctx.beginPath()
		ctx.moveTo(x, y)
		ctx.bezierCurveTo(x + length * 0.24, y + Math.sin(i) * 3, x + length * 0.7, y - Math.cos(i * 1.4) * 4, x + length, y + Math.sin(i * 2.1) * 2)
		ctx.stroke()
	}
	ctx.restore()

	ctx.save()
	ctx.globalCompositeOperation = 'screen'
	ctx.globalAlpha = 0.34
	ctx.lineCap = 'round'
	ctx.filter = 'blur(0.4px)'
	for (let i = 0; i < 30; i++) {
		const y = horizonY + (height - horizonY) * (0.08 + i / 70)
		const center = width * (0.62 + (hash2(i, 5.1) - 0.5) * 0.08)
		const length = width * (0.04 + hash2(i, 10.2) * 0.13)
		const x = center - length * 0.5
		const alpha = 0.16 + hash2(i, 2.2) * 0.18
		const gradient = ctx.createLinearGradient(x, y, x + length, y)
		addStops(gradient, [
			[0, rgba(180, 238, 255, 0)],
			[0.5, rgba(198, 250, 255, alpha)],
			[1, rgba(180, 238, 255, 0)]
		])
		ctx.strokeStyle = gradient
		ctx.lineWidth = 1 + hash2(i, 3.3) * 2
		ctx.beginPath()
		ctx.moveTo(x, y)
		ctx.bezierCurveTo(x + length * 0.25, y - 2, x + length * 0.68, y + 2, x + length, y)
		ctx.stroke()
	}
	ctx.restore()
}

function drawStaticFallback(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, renderScale: number): StaticFallbackDrawStats {
	const startedAt = performance.now()
	const stats = resizeCanvasForFallback(canvas, ctx, renderScale, FALLBACK_MAX_DEVICE_PIXEL_RATIO)
	drawSky(ctx, stats.cssWidth, stats.cssHeight)
	drawSunRays(ctx, stats.cssWidth, stats.cssHeight)
	drawClouds(ctx, stats.cssWidth, stats.cssHeight)
	drawSun(ctx, stats.cssWidth, stats.cssHeight)
	drawWater(ctx, stats.cssWidth, stats.cssHeight)
	return {...stats, durationMs: Math.round((performance.now() - startedAt) * 100) / 100}
}

export function createLightOceanFallbackRenderer(canvas: HTMLCanvasElement): StaticFallbackRenderer | null {
	const ctx = canvas.getContext('2d', {alpha: false})
	if (!ctx) return null
	return {draw: (renderScale = 0.6) => drawStaticFallback(canvas, ctx, renderScale)}
}
