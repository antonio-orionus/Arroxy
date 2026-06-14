export const GRAPHICS_POLICY_CRITICAL_FEATURES = ['webgl', 'gpu_compositing', 'rasterization'] as const

const SOFTWARE_OR_VIRTUAL_RENDERER_PATTERN = /\b(swiftshader|llvmpipe|lavapipe|software|microsoft basic render driver|warp|vmware|virtualbox|parallels|virgl|gdi generic)\b/i

export function isSoftwareOrVirtualRendererName(name: string): boolean {
	return SOFTWARE_OR_VIRTUAL_RENDERER_PATTERN.test(name)
}
