import {describe, expect, it} from 'vite-plus/test'
import {asResolvedHdr, DEFAULT_HDR_PREFERENCE, resolveHdrSetting} from '@shared/hdrSetting.js'

describe('resolveHdrSetting', () => {
	it('Auto follows the screen: HDR first when it shows HDR, else SDR first', () => {
		expect(resolveHdrSetting('auto', true)).toEqual({preference: 'hdr', source: 'display'})
		expect(resolveHdrSetting('auto', false)).toEqual({preference: 'sdr', source: 'display'})
	})

	it("SDR and HDR are the user's own choice, whatever the screen shows", () => {
		expect(resolveHdrSetting('sdr', true)).toEqual({preference: 'sdr', source: 'settings'})
		expect(resolveHdrSetting('hdr', false)).toEqual({preference: 'hdr', source: 'settings'})
	})

	it('reads a bare choice as coming from Settings, and leaves a resolved one alone', () => {
		expect(asResolvedHdr('hdr')).toEqual({preference: 'hdr', source: 'settings'})
		expect(asResolvedHdr({preference: 'sdr', source: 'display'})).toEqual({preference: 'sdr', source: 'display'})
	})

	it('assumes SDR when nothing is known, since it looks right on any screen', () => {
		expect(DEFAULT_HDR_PREFERENCE).toBe('sdr')
	})
})
