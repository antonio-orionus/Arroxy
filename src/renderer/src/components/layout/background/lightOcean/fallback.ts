import {addStops, fillRadial, hash2, resizeCanvasForFallback, rgba} from '../canvasUtils.js'
import type {StaticFallbackDrawStats, StaticFallbackRenderer} from '../types.js'

const FALLBACK_MAX_DEVICE_PIXEL_RATIO = 1.25

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const sky = ctx.createLinearGradient(0, 0, 0, height)
	addStops(sky, [
		[0, '#8fc4fb'],
		[0.36, '#d7f0ff'],
		[0.52, '#eefbff'],
		[1, '#d8f3fb']
	])
	ctx.fillStyle = sky
	ctx.fillRect(0, 0, width, height)

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.55
	ctx.filter = `blur(${Math.max(18, width * 0.014)}px)`
	fillRadial(ctx, width, height, width * 0.64, height * 0.44, Math.max(width, height) * 0.42, [
		[0, rgba(128, 218, 255, 0.48)],
		[0.5, rgba(84, 158, 255, 0.18)],
		[1, rgba(84, 158, 255, 0)]
	])
	fillRadial(ctx, width, height, width * 0.92, height * 0.08, Math.max(width, height) * 0.36, [
		[0, rgba(165, 136, 255, 0.22)],
		[1, rgba(165, 136, 255, 0)]
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
	drawCloud(ctx, width, height, width * 0.22, height * 0.26, Math.min(width, height) * 0.42, 0.46)
	drawCloud(ctx, width, height, width * 0.78, height * 0.22, Math.min(width, height) * 0.52, 0.42)
	drawCloud(ctx, width, height, width * 0.55, height * 0.36, Math.min(width, height) * 0.36, 0.28)
}

function drawWater(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	const horizonY = height * 0.53
	const water = ctx.createLinearGradient(0, horizonY, 0, height)
	addStops(water, [
		[0, '#b9f0fb'],
		[0.42, '#69c8df'],
		[1, '#2a86ad']
	])
	ctx.fillStyle = water
	ctx.fillRect(0, horizonY, width, height - horizonY)

	ctx.save()
	ctx.globalCompositeOperation = 'source-over'
	ctx.globalAlpha = 0.28
	ctx.filter = `blur(${Math.max(12, width * 0.01)}px)`
	fillRadial(ctx, width, height, width * 0.62, horizonY + height * 0.12, Math.max(width, height) * 0.34, [
		[0, rgba(165, 235, 255, 0.58)],
		[0.64, rgba(90, 166, 255, 0.18)],
		[1, rgba(90, 166, 255, 0)]
	])
	ctx.restore()

	ctx.save()
	ctx.globalAlpha = 0.58
	ctx.lineCap = 'round'
	for (let i = 0; i < 44; i++) {
		const y = horizonY + (height - horizonY) * (0.08 + i / 56)
		const phase = hash2(i, 3.7)
		const length = width * (0.08 + hash2(i, 9.2) * 0.28)
		const x = width * hash2(i, 14.1)
		const gradient = ctx.createLinearGradient(x, y, x + length, y)
		addStops(gradient, [
			[0, rgba(220, 250, 255, 0)],
			[0.5, rgba(220, 250, 255, 0.2 + phase * 0.22)],
			[1, rgba(220, 250, 255, 0)]
		])
		ctx.strokeStyle = gradient
		ctx.lineWidth = 1 + hash2(i, 1.8) * 2
		ctx.beginPath()
		ctx.moveTo(x, y)
		ctx.bezierCurveTo(x + length * 0.24, y + Math.sin(i) * 3, x + length * 0.7, y - Math.cos(i * 1.4) * 4, x + length, y + Math.sin(i * 2.1) * 2)
		ctx.stroke()
	}
	ctx.restore()
}

function drawStaticFallback(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, renderScale: number): StaticFallbackDrawStats {
	const startedAt = performance.now()
	const stats = resizeCanvasForFallback(canvas, ctx, renderScale, FALLBACK_MAX_DEVICE_PIXEL_RATIO)
	drawSky(ctx, stats.cssWidth, stats.cssHeight)
	drawClouds(ctx, stats.cssWidth, stats.cssHeight)
	drawWater(ctx, stats.cssWidth, stats.cssHeight)
	return {...stats, durationMs: Math.round((performance.now() - startedAt) * 100) / 100}
}

export function createLightOceanFallbackRenderer(canvas: HTMLCanvasElement): StaticFallbackRenderer | null {
	const ctx = canvas.getContext('2d', {alpha: false})
	if (!ctx) return null
	return {draw: (renderScale = 0.6) => drawStaticFallback(canvas, ctx, renderScale)}
}
