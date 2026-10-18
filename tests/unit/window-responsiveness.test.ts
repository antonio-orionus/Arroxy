import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vite-plus/test'

import {registerResponsivenessDiagnostics} from '@main/windowResponsiveness.js'

function makeLogger() {
	return {info: vi.fn(), warn: vi.fn()}
}

describe('window responsiveness diagnostics', () => {
	it('logs a hang with the GPU feature status, then how long it lasted', () => {
		const window = new EventEmitter()
		const logger = makeLogger()
		let now = 1_000
		const gpuFeatureStatus = {webgl: 'enabled', gpu_compositing: 'enabled'}

		registerResponsivenessDiagnostics(window as never, {logger, now: () => now, gpuFeatureStatus: () => gpuFeatureStatus})

		window.emit('unresponsive')
		expect(logger.warn).toHaveBeenCalledWith('Main window unresponsive', {gpuFeatureStatus})

		now = 7_500
		window.emit('responsive')
		expect(logger.info).toHaveBeenCalledWith('Main window responsive again', {stalledMs: 6_500})
	})

	it('ignores a responsive event that follows no hang', () => {
		const window = new EventEmitter()
		const logger = makeLogger()

		registerResponsivenessDiagnostics(window as never, {logger, now: () => 0, gpuFeatureStatus: () => ({})})

		window.emit('responsive')
		expect(logger.info).not.toHaveBeenCalled()
	})

	it('still logs the hang when reading the GPU feature status throws', () => {
		const window = new EventEmitter()
		const logger = makeLogger()

		registerResponsivenessDiagnostics(window as never, {
			logger,
			now: () => 0,
			gpuFeatureStatus: () => {
				throw new Error('GPU process gone')
			}
		})

		window.emit('unresponsive')
		expect(logger.warn).toHaveBeenCalledWith('Main window unresponsive', {gpuFeatureStatus: 'unavailable: GPU process gone'})
	})
})
