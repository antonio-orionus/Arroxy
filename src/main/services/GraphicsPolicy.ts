import type {GraphicsPolicy, GraphicsPolicyBackdropReason} from '@shared/types.js'
import {GRAPHICS_POLICY_CRITICAL_FEATURES, isSoftwareOrVirtualRendererName} from '@shared/graphicsPolicy.js'

export interface GpuFeatureStatusLike {
	[feature: string]: string | undefined
}

export interface GraphicsPolicyInput {
	isPackaged: boolean
	env: Partial<Record<string, string | undefined>>
	featureStatus: GpuFeatureStatusLike
	featureStatusUsable?: boolean
	gpuInfo?: unknown
	gpuInfoUnavailable?: boolean
}

function isEnabledStatus(status: string): boolean {
	return /^enabled/.test(status)
}

function classifyFeatureStatus(status: string): GraphicsPolicyBackdropReason | null {
	if (isEnabledStatus(status)) return null
	if (/software/i.test(status)) return 'gpu-feature-software'
	if (/disabled|unavailable|off/i.test(status)) return 'gpu-feature-disabled'
	return 'gpu-feature-disabled'
}

function featureFailure(featureStatus: GpuFeatureStatusLike): GraphicsPolicyBackdropReason | null {
	for (const feature of GRAPHICS_POLICY_CRITICAL_FEATURES) {
		const status = featureStatus[feature]
		if (!status) continue
		const reason = classifyFeatureStatus(status)
		if (reason) return reason
	}
	return null
}

function stringValue(value: unknown): string | null {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

interface GpuRendererDiagnostics {
	devices: {active?: boolean; name: string}[]
	auxRenderers: string[]
}

function collectRendererDiagnostics(gpuInfo: unknown): GpuRendererDiagnostics {
	if (!gpuInfo || typeof gpuInfo !== 'object') return {devices: [], auxRenderers: []}
	const info = gpuInfo as {auxAttributes?: Record<string, unknown>; gpuDevice?: unknown}
	const devices: GpuRendererDiagnostics['devices'] = []
	const rawDevices = Array.isArray(info.gpuDevice) ? info.gpuDevice : []
	for (const device of rawDevices) {
		if (!device || typeof device !== 'object') continue
		const rawDevice = device as Record<string, unknown>
		const deviceString = stringValue(rawDevice.deviceString)
		if (deviceString) devices.push({name: deviceString, active: typeof rawDevice.active === 'boolean' ? rawDevice.active : undefined})
	}
	const aux = info.auxAttributes
	const auxRenderers: string[] = []
	if (aux) {
		for (const key of ['glImplementationParts', 'skiaBackendType']) {
			const value = stringValue(aux[key])
			if (value) auxRenderers.push(value)
		}
		if (aux.softwareRendering === true) auxRenderers.push('softwareRendering')
	}
	return {devices, auxRenderers: [...new Set(auxRenderers)]}
}

function collectRendererStrings(gpuInfo: unknown): string[] {
	const diagnostics = collectRendererDiagnostics(gpuInfo)
	return [...new Set([...diagnostics.devices.map(device => device.name), ...diagnostics.auxRenderers])]
}

function virtualOrSoftwareRenderer(diagnostics: GpuRendererDiagnostics): string | null {
	const auxSoftwareRenderer = diagnostics.auxRenderers.find(isSoftwareOrVirtualRendererName)
	if (auxSoftwareRenderer) return auxSoftwareRenderer

	const softwareDevices = diagnostics.devices.filter(device => isSoftwareOrVirtualRendererName(device.name))
	if (softwareDevices.length === 0) return null
	const activeSoftwareDevice = softwareDevices.find(device => device.active === true)
	if (activeSoftwareDevice) return activeSoftwareDevice.name

	const hardwareDevices = diagnostics.devices.filter(device => !isSoftwareOrVirtualRendererName(device.name))
	if (hardwareDevices.length > 0) return null

	return softwareDevices[0].name
}

function makePolicy(input: GraphicsPolicyInput, forceRenderMode: GraphicsPolicy['backdrop']['forceRenderMode'], fallbackReason?: GraphicsPolicyBackdropReason, renderer?: string): GraphicsPolicy {
	const devices = collectRendererStrings(input.gpuInfo)
	return {
		backdrop: {
			forceRenderMode,
			softwareWebglAllowed: !input.isPackaged && input.env.ARROXY_BACKDROP_SOFTWARE === '1',
			...(fallbackReason ? {fallbackReason} : {}),
			...(renderer ? {renderer} : {}),
			...(devices.length > 0 ? {devices} : {}),
			featureStatus: Object.fromEntries(Object.entries(input.featureStatus).filter(([, value]) => typeof value === 'string')) as Record<string, string>
		}
	}
}

export function buildGraphicsPolicy(input: GraphicsPolicyInput): GraphicsPolicy {
	const softwareWebglAllowed = !input.isPackaged && input.env.ARROXY_BACKDROP_SOFTWARE === '1'
	const rendererDiagnostics = collectRendererDiagnostics(input.gpuInfo)
	const featureStatusUsable = input.featureStatusUsable ?? true

	if (softwareWebglAllowed) return makePolicy(input, null)

	const failedFeature = featureStatusUsable ? featureFailure(input.featureStatus) : null
	if (failedFeature) return makePolicy(input, 'css-only', failedFeature)

	const softwareRenderer = virtualOrSoftwareRenderer(rendererDiagnostics)
	if (softwareRenderer) return makePolicy(input, 'css-only', 'virtual-or-software-renderer', softwareRenderer)

	if (input.gpuInfoUnavailable) return makePolicy(input, 'css-only', 'gpu-info-unavailable')

	return makePolicy(input, null)
}
