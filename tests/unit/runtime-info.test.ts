import {describe, expect, it} from 'vite-plus/test'
import {installChannelArg, parseInstallChannelArg, parseSystemLanguageArg, systemLanguageArg} from '@shared/runtimeInfo.js'
import {SUPPORTED_LANGS} from '@shared/schemas.js'
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

describe('system language launch argument', () => {
	it('round-trips every supported language through the renderer argv', () => {
		for (const lang of SUPPORTED_LANGS) {
			expect(parseSystemLanguageArg(['/path/to/electron', '--type=renderer', installChannelArg('direct'), systemLanguageArg(lang)])).toBe(lang)
		}
	})

	it('is null when the argument is missing', () => {
		expect(parseSystemLanguageArg(['/path/to/electron', '--type=renderer', installChannelArg('direct')])).toBeNull()
	})

	it('is null when the argument is empty', () => {
		expect(parseSystemLanguageArg(['--arroxy-system-language='])).toBeNull()
	})
})
