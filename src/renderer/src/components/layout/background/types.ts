export type BackdropColorScheme = 'light' | 'dark'
export type BackdropMode = 'webgl' | 'canvas2d' | 'css'
export type BackdropSceneId = 'dark-aurora' | 'light-ocean'

export interface StaticFallbackDrawStats {
	backingStoreResized: boolean
	cssHeight: number
	cssWidth: number
	devicePixelRatio: number
	durationMs: number
	pixelHeight: number
	pixelWidth: number
	renderScale: number
}

export interface StaticFallbackRenderer {
	draw: (renderScale?: number) => StaticFallbackDrawStats
}

export interface BackdropScene {
	bodyClassName: string
	fallbackRenderScale: number
	fragmentShader: string
	frameIntervalMs: number
	id: BackdropSceneId
	maxDevicePixelRatio: number
	renderScale: number
	createStaticFallbackRenderer: (canvas: HTMLCanvasElement) => StaticFallbackRenderer | null
}
