import type {StaticFallbackDrawStats} from './types.js'

export function rgba(r: number, g: number, b: number, a: number): string {
	return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
}

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value))
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
	const t = clamp01((x - edge0) / (edge1 - edge0))
	return t * t * (3 - 2 * t)
}

export function hash2(x: number, y: number): number {
	const n = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453
	return n - Math.floor(n)
}

export function addStops(gradient: CanvasGradient, stops: [number, string][]): CanvasGradient {
	for (const [offset, color] of stops) gradient.addColorStop(offset, color)
	return gradient
}

export function fillRadial(ctx: CanvasRenderingContext2D, width: number, height: number, x: number, y: number, radius: number, stops: [number, string][]): void {
	const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
	addStops(gradient, stops)
	ctx.fillStyle = gradient
	ctx.fillRect(0, 0, width, height)
}

export function resizeCanvasForFallback(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, renderScale: number, maxDevicePixelRatio: number): Omit<StaticFallbackDrawStats, 'durationMs'> {
	const width = Math.max(1, Math.round(canvas.clientWidth || window.innerWidth || 1))
	const height = Math.max(1, Math.round(canvas.clientHeight || window.innerHeight || 1))
	const devicePixelRatio = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio)
	const dpr = devicePixelRatio * renderScale
	const pixelWidth = Math.max(1, Math.round(width * dpr))
	const pixelHeight = Math.max(1, Math.round(height * dpr))
	const backingStoreResized = canvas.width !== pixelWidth || canvas.height !== pixelHeight
	if (backingStoreResized) {
		canvas.width = pixelWidth
		canvas.height = pixelHeight
	}
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
	ctx.clearRect(0, 0, width, height)
	return {backingStoreResized, cssHeight: height, cssWidth: width, devicePixelRatio, pixelHeight, pixelWidth, renderScale}
}
