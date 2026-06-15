import {describe, expect, it} from 'vitest'
import {preferredNativeAudioId} from '@shared/nativeAudioPreference.js'
import type {FormatOption} from '@shared/types.js'

function audio(formatId: string, audioCodec: string, options: Partial<FormatOption> = {}): FormatOption {
	return {formatId, label: formatId, ext: 'm4a', resolution: 'audio only', abr: 128, audioCodec, isVideoOnly: false, isAudioOnly: true, ...options}
}

describe('preferredNativeAudioId', () => {
	it('compatible skips Dolby and DRC when normal audio exists', () => {
		const formats = [audio('328', 'ec-3', {abr: 384}), audio('140-drc', 'mp4a.40.2', {abr: 130, isDrc: true}), audio('251', 'opus', {abr: 143})]

		expect(preferredNativeAudioId(formats, 'compatible')).toBe('251')
	})

	it('compatible prefers source default original non-DRC audio over same-bitrate translated audio', () => {
		const formats = [
			audio('140-drc', 'mp4a.40.2', {abr: 130, isDrc: true, audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true}),
			audio('140-0', 'mp4a.40.2', {abr: 130, audioLanguage: 'tlh', audioTrackLabel: 'Klingon'}),
			audio('140-1', 'mp4a.40.2', {abr: 130, audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true})
		]

		expect(preferredNativeAudioId(formats, 'compatible')).toBe('140-1')
	})

	it('surround prefers non-DRC ec-3 before ac-3', () => {
		const formats = [audio('380', 'ac-3', {abr: 384}), audio('328-drc', 'ec-3', {abr: 384, isDrc: true}), audio('328', 'ec-3', {abr: 384}), audio('251', 'opus', {abr: 143})]

		expect(preferredNativeAudioId(formats, 'surround')).toBe('328')
	})

	it('surround prefers source default ec-3 before non-default ec-3', () => {
		const formats = [
			audio('328-0', 'ec-3', {abr: 384, audioLanguage: 'tlh', audioTrackLabel: 'Klingon'}),
			audio('328-1', 'ec-3', {abr: 384, audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true}),
			audio('251-1', 'opus', {abr: 128, audioLanguage: 'en', audioLanguagePreference: 10, isDefaultAudio: true, isOriginalAudio: true})
		]

		expect(preferredNativeAudioId(formats, 'surround')).toBe('328-1')
	})

	it('selects non-DRC English original default from same-bitrate multilingual YouTube tracks', () => {
		const formats = [
			audio('140-drc', 'mp4a.40.2', {abr: 130, isDrc: true, audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true}),
			audio('140-1', 'mp4a.40.2', {abr: 130, audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true}),
			audio('140-0', 'mp4a.40.2', {abr: 130, audioLanguage: 'tlh', audioTrackLabel: 'Klingon'}),
			audio('251-0', 'opus', {abr: 123, audioLanguage: 'tlh', audioTrackLabel: 'Klingon'}),
			audio('251-1', 'opus', {abr: 122, audioLanguage: 'en', audioLanguagePreference: 10, audioTrackLabel: 'English original (default)', isDefaultAudio: true, isOriginalAudio: true})
		]

		expect(preferredNativeAudioId(formats, 'compatible')).toBe('140-1')
	})

	it('falls back safely when only Dolby audio exists', () => {
		const formats = [audio('380-drc', 'ac-3', {isDrc: true}), audio('380', 'ac-3')]

		expect(preferredNativeAudioId(formats, 'compatible')).toBe('380')
	})
})
