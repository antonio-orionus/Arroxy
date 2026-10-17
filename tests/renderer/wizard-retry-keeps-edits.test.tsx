// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import type {FormatOption, ProbeResult} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Risk: a retry inside the same run (degraded probe, cookies, the error
// screen's Retry) silently throws away what the user chose on Format and
// Review, and downloads the profile's picks instead.

const URL = 'https://www.youtube.com/watch?v=retry'

const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p', ext: 'mp4', resolution: '1920x1080', videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
	{formatId: '136', label: '720p', ext: 'mp4', resolution: '1280x720', videoCodec: 'avc1.4d401f', isVideoOnly: true, isAudioOnly: false},
	{formatId: 'a', label: 'opus', ext: 'webm', resolution: 'audio only', audioCodec: 'opus', abr: 160, isVideoOnly: false, isAudioOnly: true},
	{formatId: 'b', label: 'aac', ext: 'm4a', resolution: 'audio only', audioCodec: 'mp4a.40.2', abr: 128, isVideoOnly: false, isAudioOnly: true}
]

function probe(formats: FormatOption[] = FORMATS): ProbeResult {
	return {kind: 'video', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: URL, isAudioOnlySource: false, formats, title: 'Retry', thumbnail: '', duration: 60, subtitles: {en: [{ext: 'vtt'}], de: [{ext: 'vtt'}]}, automaticCaptions: {}, isLive: false, hasDrm: false}
}

async function openFormat(): Promise<ReturnType<typeof buildMockAppApi>> {
	const api = buildMockAppApi({settings: defaultAppSettings('/downloads')})
	api.downloads.probe = vi.fn().mockResolvedValue(ok(probe()))
	window.appApi = api
	await useAppStore.getState().initialize()
	useAppStore.getState().setWizardUrl(URL)
	await useAppStore.getState().submitUrl()
	return api
}

beforeEach(() => {
	useAppStore.setState({...RESET_WIZARD_STATE, initialized: false, initializing: false, settings: null})
})

describe("same-run retries keep the user's edits", () => {
	it('a degraded-probe retry keeps the picked subtitles', async () => {
		await openFormat()
		useAppStore.getState().toggleSubtitleLanguage('de')

		await useAppStore.getState().retryFormatProbe()

		expect(useAppStore.getState().wizardSubtitleLanguages).toEqual(['de'])
	})

	it('a retry keeps Audio when the picked track is gone, choosing another track', async () => {
		const api = await openFormat()
		useAppStore.getState().setWizardMediaKind('audio')
		useAppStore.getState().setAudioSelection({kind: 'native', formatId: 'a'})
		api.downloads.probe = vi.fn().mockResolvedValue(ok(probe(FORMATS.filter(f => f.formatId !== 'a'))))

		await useAppStore.getState().retryFormatProbe()

		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'audio', selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: 'b'}})
	})

	it('a retry keeps a still-offered video when only the audio track is gone', async () => {
		const api = await openFormat()
		useAppStore.getState().setSelectedVideoFormatId('137')
		useAppStore.getState().setAudioSelection({kind: 'native', formatId: 'a'})
		api.downloads.probe = vi.fn().mockResolvedValue(ok(probe(FORMATS.filter(f => f.formatId !== 'a'))))

		await useAppStore.getState().retryFormatProbe()

		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'video', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: 'b'}})
	})

	it("the error screen's Retry keeps the run's profile and edits after a failed retry", async () => {
		const api = await openFormat()
		useAppStore.getState().chooseWizardProfile({kind: 'builtin', id: 'hd-1080'})
		useAppStore.getState().setWizardFilenameTemplate('{title} kept')
		useAppStore.getState().toggleSubtitleLanguage('en')
		api.downloads.probe = vi.fn().mockResolvedValue(fail({kind: 'other', code: 'unknown', message: 'boom'}))
		await useAppStore.getState().retryFormatProbe()
		expect(useAppStore.getState().wizardStep).toBe('error')

		api.downloads.probe = vi.fn().mockResolvedValue(ok(probe()))
		await useAppStore.getState().retry()

		expect(useAppStore.getState()).toMatchObject({wizardStep: 'formats', wizardFilenameTemplate: '{title} kept', wizardSubtitleLanguages: ['en']})
		expect(useAppStore.getState().wizardProfile?.id).toBe('hd-1080')
	})

	it('a new link starts from the active profile, not the abandoned run', async () => {
		await openFormat()
		useAppStore.getState().chooseWizardProfile({kind: 'builtin', id: 'audio-only'})
		useAppStore.getState().back()

		useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=other')
		await useAppStore.getState().submitUrl()

		expect(useAppStore.getState().wizardProfile?.id).toBe('balanced')
	})

	it('the stepper never jumps back to the URL step: Back owns leaving the run', async () => {
		await openFormat()
		useAppStore.getState().openReview(null)

		useAppStore.getState().goToStep('url')

		expect(useAppStore.getState().wizardStep).toBe('confirm')
	})
})
