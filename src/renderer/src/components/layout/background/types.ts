export type BackdropColorScheme = 'light' | 'dark'
export type BackdropSceneId = 'dark-aurora' | 'light-ocean'

export interface BackdropScene {
	fragmentShader: string
	frameIntervalMs: number
	id: BackdropSceneId
	maxDevicePixelRatio: number
	renderScale: number
}
