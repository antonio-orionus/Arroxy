// @vitest-environment jsdom
import {renderHook, waitFor} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'

const originalPlatform = window.platform

// jsdom has no Media Capabilities API: each test brings its own.
function stubMediaCapabilities(value: unknown): void {
	Object.defineProperty(navigator, 'mediaCapabilities', {configurable: true, value})
}

function stubDecodingInfo(answer: () => Promise<Partial<MediaCapabilitiesDecodingInfo>>): ReturnType<typeof vi.fn> {
	const decodingInfo = vi.fn(answer)
	stubMediaCapabilities({decodingInfo})
	return decodingInfo
}

// The probe answers once per app run, so each test loads the module fresh.
async function loadHost(platform: NodeJS.Platform): Promise<typeof import('@renderer/lib/quickTimeHost.js')> {
	vi.resetModules()
	window.platform = platform
	return import('@renderer/lib/quickTimeHost.js')
}

afterEach(() => {
	Reflect.deleteProperty(navigator, 'mediaCapabilities')
	window.platform = originalPlatform
})

describe('decodesAv1InHardware', () => {
	it('asks about AV1 in an MP4 and trusts powerEfficient, not supported', async () => {
		const decodingInfo = stubDecodingInfo(async () => ({supported: true, smooth: true, powerEfficient: false}))
		const {decodesAv1InHardware} = await loadHost('darwin')

		await expect(decodesAv1InHardware()).resolves.toBe(false)
		expect(decodingInfo).toHaveBeenCalledWith(expect.objectContaining({type: 'file', video: expect.objectContaining({contentType: expect.stringMatching(/^video\/mp4; codecs="av01\./)})}))
	})

	it('is true when the chip decodes AV1', async () => {
		stubDecodingInfo(async () => ({supported: true, smooth: true, powerEfficient: true}))
		const {decodesAv1InHardware} = await loadHost('darwin')

		await expect(decodesAv1InHardware()).resolves.toBe(true)
	})

	it('reads as no hardware when Chromium cannot answer', async () => {
		stubDecodingInfo(() => Promise.reject(new TypeError('unsupported')))
		const {decodesAv1InHardware} = await loadHost('darwin')

		await expect(decodesAv1InHardware()).resolves.toBe(false)
	})

	it('reads as no hardware without the Media Capabilities API', async () => {
		stubMediaCapabilities(undefined)
		const {decodesAv1InHardware} = await loadHost('darwin')

		await expect(decodesAv1InHardware()).resolves.toBe(false)
	})
})

describe('useQuickTimeHost', () => {
	it('settles a Mac against the chip once the probe answers', async () => {
		stubDecodingInfo(async () => ({supported: true, smooth: true, powerEfficient: false}))
		const {useQuickTimeHost} = await loadHost('darwin')
		const {result} = renderHook(() => useQuickTimeHost())

		await waitFor(() => expect(result.current).toEqual({mac: true, av1Hardware: false}))
	})

	it('holds the AV1 warning back while the probe has not answered', async () => {
		stubDecodingInfo(() => new Promise(() => undefined))
		const {useQuickTimeHost} = await loadHost('darwin')
		const {result} = renderHook(() => useQuickTimeHost())

		expect(result.current).toEqual({mac: true, av1Hardware: true})
	})

	it('never probes off a Mac', async () => {
		const decodingInfo = stubDecodingInfo(async () => ({supported: true, smooth: true, powerEfficient: true}))
		const {useQuickTimeHost} = await loadHost('win32')
		const {result} = renderHook(() => useQuickTimeHost())

		expect(result.current).toEqual({mac: false, av1Hardware: false})
		expect(decodingInfo).not.toHaveBeenCalled()
	})
})
