// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {buildGraphicsPolicy, isGpuAccessDenied} from '@main/services/GraphicsPolicy.js'

const HEALTHY_FEATURES = {gpu_compositing: 'enabled', rasterization: 'enabled', webgl: 'enabled'}

describe('graphics policy', () => {
	it('forces CSS in packaged production when critical GPU features are software or off', () => {
		const policy = buildGraphicsPolicy({isPackaged: true, env: {}, featureStatus: {...HEALTHY_FEATURES, gpu_compositing: 'disabled_software', webgl: 'disabled_off'}, gpuInfo: {}})

		expect(policy.backdrop.forceRenderMode).toBe('css-only')
		expect(policy.backdrop.softwareWebglAllowed).toBe(false)
		expect(policy.backdrop.fallbackReason).toBe('gpu-feature-disabled')
	})

	it('forces CSS in packaged production for virtual or software GPU devices', () => {
		const policy = buildGraphicsPolicy({isPackaged: true, env: {}, featureStatus: HEALTHY_FEATURES, gpuInfo: {gpuDevice: [{deviceString: 'VMware SVGA 3D'}, {deviceString: 'Microsoft Basic Render Driver'}, {deviceString: 'WARP'}]}})

		expect(policy.backdrop.forceRenderMode).toBe('css-only')
		expect(policy.backdrop.fallbackReason).toBe('virtual-or-software-renderer')
		expect(policy.backdrop.renderer).toContain('VMware SVGA 3D')
	})

	it('reports the active software renderer when multiple software devices are present', () => {
		const policy = buildGraphicsPolicy({
			isPackaged: true,
			env: {},
			featureStatus: HEALTHY_FEATURES,
			gpuInfo: {
				gpuDevice: [
					{active: false, deviceString: 'VMware SVGA 3D'},
					{active: true, deviceString: 'WARP'}
				]
			}
		})

		expect(policy.backdrop.forceRenderMode).toBe('css-only')
		expect(policy.backdrop.renderer).toBe('WARP')
	})

	it('does not force CSS just because Windows reports an inactive Microsoft Basic fallback beside a hardware GPU', () => {
		const policy = buildGraphicsPolicy({
			isPackaged: true,
			env: {},
			featureStatus: HEALTHY_FEATURES,
			gpuInfo: {
				gpuDevice: [
					{active: true, deviceString: 'NVIDIA GeForce RTX 4090'},
					{active: false, deviceString: 'Microsoft Basic Render Driver'}
				]
			}
		})

		expect(policy.backdrop.forceRenderMode).toBeNull()
		expect(policy.backdrop.fallbackReason).toBeUndefined()
	})

	it('does not trust early GPU feature status before Electron reports gpu-info-update', () => {
		const policy = buildGraphicsPolicy({
			isPackaged: true,
			env: {},
			featureStatus: {...HEALTHY_FEATURES, gpu_compositing: 'disabled_software', rasterization: 'disabled_software', webgl: 'disabled_off'},
			featureStatusUsable: false,
			gpuInfo: {
				auxAttributes: {glImplementationParts: '(gl=none,angle=none)', skiaBackendType: 'None'},
				gpuDevice: [
					{active: false, deviceString: 'NVIDIA GeForce RTX 4090'},
					{active: false, deviceString: 'Microsoft Basic Render Driver'}
				]
			}
		})

		expect(policy.backdrop.forceRenderMode).toBeNull()
		expect(policy.backdrop.fallbackReason).toBeUndefined()
	})

	it('ignores the software WebGL override in packaged production', () => {
		const policy = buildGraphicsPolicy({isPackaged: true, env: {ARROXY_BACKDROP_SOFTWARE: '1'}, featureStatus: {...HEALTHY_FEATURES, webgl: 'disabled_off'}, gpuInfo: {gpuDevice: [{deviceString: 'Google SwiftShader'}]}})

		expect(policy.backdrop.forceRenderMode).toBe('css-only')
		expect(policy.backdrop.softwareWebglAllowed).toBe(false)
	})

	it('allows software WebGL only for explicit non-packaged dev runs', () => {
		const policy = buildGraphicsPolicy({isPackaged: false, env: {ARROXY_BACKDROP_SOFTWARE: '1'}, featureStatus: {...HEALTHY_FEATURES, gpu_compositing: 'disabled_software', webgl: 'disabled_off'}, gpuInfo: {gpuDevice: [{deviceString: 'Google SwiftShader'}]}})

		expect(policy.backdrop.forceRenderMode).toBeNull()
		expect(policy.backdrop.softwareWebglAllowed).toBe(true)
		expect(policy.backdrop.fallbackReason).toBeUndefined()
	})

	it('uses production-like fallback in normal non-packaged dev runs', () => {
		const policy = buildGraphicsPolicy({isPackaged: false, env: {}, featureStatus: {...HEALTHY_FEATURES, gpu_compositing: 'disabled_software'}, gpuInfo: {}})

		expect(policy.backdrop.forceRenderMode).toBe('css-only')
		expect(policy.backdrop.softwareWebglAllowed).toBe(false)
	})
})

describe('isGpuAccessDenied', () => {
	// Chromium rejects app.getGPUInfo() with this whenever the GPU process runs
	// without GPU access. "due to frequent crashes" is its fallback wording for
	// display-compositor mode on a GPU-less host, not evidence of a crash.
	it('recognizes every GPU-access-denied rejection', () => {
		expect(isGpuAccessDenied(new Error('GPU access not allowed. Reason: GPU access is disabled due to frequent crashes.'))).toBe(true)
		expect(isGpuAccessDenied(new Error('GPU access not allowed. Reason: GPU access is disabled through commandline switch --disable-gpu and --disable-software-rasterizer.'))).toBe(true)
	})

	it('treats any other failure as unexpected', () => {
		expect(isGpuAccessDenied(new Error("GPU process isn't usable. Goodbye."))).toBe(false)
		expect(isGpuAccessDenied('GPU access not allowed')).toBe(false)
		expect(isGpuAccessDenied(undefined)).toBe(false)
	})
})
