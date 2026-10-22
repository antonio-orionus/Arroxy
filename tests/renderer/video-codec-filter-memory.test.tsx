// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'
import type {FormatOption, ProbeResult} from '@shared/types.js'

// The Format screen's codec filter is remembered as a setting: picking one
// saves it, and the next video opens filtered to it when it has that codec.
// Nothing stays picked that the filter hides.

const video = (formatId: string, height: number, videoCodec: string): FormatOption => ({formatId, label: formatId, ext: 'mp4', resolution: `${Math.round((height * 16) / 9)}x${height}`, videoCodec, isVideoOnly: true, isAudioOnly: false})
const AUDIO: FormatOption = {formatId: '140', label: 'aac', ext: 'm4a', resolution: 'audio only', abr: 128, audioCodec: 'mp4a.40.2', isVideoOnly: false, isAudioOnly: true}

function probe(formats: FormatOption[]): ProbeResult {
	return {kind: 'video', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: 'https://www.youtube.com/watch?v=x', isAudioOnlySource: false, formats: [...formats, AUDIO], title: 'Test', thumbnail: '', duration: 100, subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false}
}

const WITH_VP9 = probe([video('av1-1080', 1080, 'av01.0.08M.08'), video('vp9-1080', 1080, 'vp09.00.40.08'), video('h264-1080', 1080, 'avc1.640028')])
const WITHOUT_VP9 = probe([video('av1-1080', 1080, 'av01.0.08M.08'), video('h264-1080', 1080, 'avc1.640028')])

async function open(result: ProbeResult, settings: Record<string, unknown> = {}): Promise<ReturnType<typeof vi.fn>> {
	const update = vi.fn().mockImplementation(async () => ok(buildAppSettings(settings)))
	const api = buildMockAppApi({settings: buildAppSettings(settings)})
	api.settings.update = update
	api.downloads.probe = vi.fn().mockResolvedValue(ok(result))
	window.appApi = api
	await useAppStore.getState().initialize()
	useAppStore.getState().setWizardUrl('https://www.youtube.com/watch?v=x')
	await useAppStore.getState().submitUrl()
	return update
}

beforeEach(() => {
	useAppStore.setState({initialized: false, initializing: false, settings: null, wizardStep: 'url', wizardMode: 'single', wizardFormats: [], selectedVideoFormatId: '', audioSelection: {kind: 'none'}, wizardMediaKind: 'video', videoCodecFilter: 'all', queue: []})
	vi.clearAllMocks()
})

describe('video codec filter', () => {
	it('saves the picked codec and picks that codec’s stream', async () => {
		const update = await open(WITH_VP9)
		expect(useAppStore.getState().selectedVideoFormatId).toBe('av1-1080')

		useAppStore.getState().setVideoCodecFilter('VP9')

		expect(update).toHaveBeenCalledWith({common: {videoCodecFilter: 'VP9'}})
		expect(useAppStore.getState()).toMatchObject({videoCodecFilter: 'VP9', selectedVideoFormatId: 'vp9-1080'})
	})

	it('opens the next video filtered to the remembered codec, and picks its stream', async () => {
		await open(WITH_VP9, {videoCodecFilter: 'VP9'})
		expect(useAppStore.getState()).toMatchObject({videoCodecFilter: 'VP9', selectedVideoFormatId: 'vp9-1080'})
	})

	it('shows every codec on a video without the remembered one, and keeps remembering it', async () => {
		const update = await open(WITHOUT_VP9, {videoCodecFilter: 'VP9'})
		expect(useAppStore.getState()).toMatchObject({videoCodecFilter: 'VP9', selectedVideoFormatId: 'av1-1080'})
		expect(update).not.toHaveBeenCalled()
	})
})
