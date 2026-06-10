import {describe, expect, it} from 'vitest'
import {lightOceanScene} from '@renderer/components/layout/background/lightOcean/scene.js'
import {FRAG} from '@renderer/components/layout/background/lightOcean/shader.js'

describe('light ocean WebGL shader', () => {
	it('uses the higher-quality GPU render budget', () => {
		expect(lightOceanScene.renderScale).toBe(0.75)
		expect(lightOceanScene.maxDevicePixelRatio).toBe(1.5)
		expect(lightOceanScene.frameIntervalMs).toBe(1000 / 24)
	})

	it('does not regress to the flat postcard ocean structure', () => {
		expect(FRAG).not.toContain('float horizon = 0.47')
		expect(FRAG).not.toMatch(/\bcloud[A-C]\b/)
		expect(FRAG).not.toMatch(/q\.y\s*\*\s*(88\.0|142\.0|120\.0)/)
		expect(FRAG).toContain('seaNormal')
		expect(FRAG).toContain('domainWarp')
		expect(FRAG).toContain('atmosphericHaze')
	})

	it('keeps the GPU scene recognizably oceanic instead of a fog gradient', () => {
		expect(FRAG).toContain('sunDisc')
		expect(FRAG).toContain('sunRays')
		expect(FRAG).toContain('cloudVolume')
		expect(FRAG).toContain('oceanSwells')
		expect(FRAG).toContain('foamCrests')
	})
})
