import {describe, expect, it} from 'vite-plus/test'
import {installChannelArg, parseInstallChannelArg} from '@shared/runtimeInfo.js'
import {INSTALL_CHANNELS} from '@shared/types.js'

describe('install channel launch argument', () => {
	it('round-trips every install channel through the renderer argv', () => {
		for (const channel of INSTALL_CHANNELS) {
			expect(parseInstallChannelArg(['/path/to/electron', '--type=renderer', installChannelArg(channel)])).toBe(channel)
		}
	})

	it('is null when the argument is missing', () => {
		expect(parseInstallChannelArg(['/path/to/electron', '--type=renderer'])).toBeNull()
	})

	it('rejects a value that is not a known install channel', () => {
		expect(parseInstallChannelArg([installChannelArg('direct').replace('direct', 'sideloaded')])).toBeNull()
	})
})
