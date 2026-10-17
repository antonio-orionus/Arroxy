// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {render, screen, fireEvent} from '@testing-library/react'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {ProbeResult, StatusEvent} from '@shared/types.js'
import {ok} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'
import {SubtitleFields} from '@renderer/components/wizard/SubtitleFields.js'
import {StepReview} from '@renderer/components/wizard/StepReview.js'
import {StepFormatSelect} from '@renderer/components/wizard/StepFormatSelect.js'

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

const PROBE_RESULT: Extract<ProbeResult, {kind: 'video'}> = {
	kind: 'video',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	webpageUrl: YOUTUBE_URL,
	isAudioOnlySource: false,
	formats: [
		{formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false},
		{formatId: '140', label: 'opus 128kbps', ext: 'opus', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true}
	],
	title: 'Test Video',
	thumbnail: '',
	duration: 120,
	subtitles: {en: [{ext: 'vtt', name: 'English'}], es: [{ext: 'vtt'}]},
	automaticCaptions: {'de-orig': [{ext: 'vtt'}], 'ja-orig': [{ext: 'vtt'}]},
	isLive: false,
	hasDrm: false
}

function buildMockApi(settingsOverrides: Record<string, unknown> = {}, probeResult: ProbeResult = PROBE_RESULT) {
	return {
		app: {warmUp: vi.fn().mockResolvedValue(ok({completed: true, failures: []})), getGraphicsPolicy: vi.fn().mockResolvedValue(ok({backdrop: {forceRenderMode: null, softwareWebglAllowed: false}})), setLanguage: vi.fn().mockResolvedValue(undefined)},
		downloads: {
			probeCancel: vi.fn().mockResolvedValue(undefined),
			start: vi.fn().mockResolvedValue(ok({job: {id: 'job-1', url: YOUTUBE_URL, outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: ''}})),
			cancel: vi.fn().mockResolvedValue(ok({cancelled: true})),
			probe: vi.fn().mockResolvedValue(ok(probeResult)),
			pause: vi.fn().mockResolvedValue(ok({paused: true}))
		},
		settings: {get: vi.fn().mockResolvedValue(ok(buildAppSettings(settingsOverrides))), update: vi.fn().mockResolvedValue(ok(buildAppSettings(settingsOverrides)))},
		hotkey: {rendererReady: vi.fn().mockResolvedValue(ok(undefined))},
		shell: {openFolder: vi.fn(), openExternal: vi.fn()},
		logs: {openDir: vi.fn()},
		dialog: {chooseFolder: vi.fn()},
		events: {
			onStatus: vi.fn().mockImplementation((_cb: (event: StatusEvent) => void) => () => undefined),
			onProgress: vi.fn().mockReturnValue(() => undefined),
			onProbeProgress: vi.fn().mockReturnValue(() => undefined),
			onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
			onHotkeyTrigger: vi.fn().mockReturnValue(() => undefined),
			onHotkeyOutcome: vi.fn().mockReturnValue(() => undefined),
			onWarmupProgress: vi.fn().mockReturnValue(() => undefined)
		},
		queue: {
			cmd: {
				add: vi.fn().mockResolvedValue({ok: true, data: {ids: []}}),
				getSnapshot: vi.fn().mockResolvedValue({ok: true, data: {items: [], schedulerPaused: false}}),
				start: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				pause: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				resume: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				cancel: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				retry: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				clearCompleted: vi.fn().mockResolvedValue({ok: true, data: undefined}),
				remove: vi.fn().mockResolvedValue({ok: true, data: undefined})
			},
			events: {onSnapshot: vi.fn().mockReturnValue(() => undefined), onAdded: vi.fn().mockReturnValue(() => undefined), onUpdated: vi.fn().mockReturnValue(() => undefined), onRemoved: vi.fn().mockReturnValue(() => undefined), onScheduler: vi.fn().mockReturnValue(() => undefined)}
		},
		updater: {onUpdateAvailable: vi.fn().mockReturnValue(() => undefined), install: vi.fn()},
		explore: {getState: vi.fn().mockResolvedValue(ok({url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'})), onStateChanged: vi.fn().mockReturnValue(() => undefined), onPointerInView: vi.fn().mockReturnValue(() => undefined)},
		diagnostics: {logWizardStep: vi.fn()}
	}
}

function resetStore() {
	useAppStore.setState({
		initialized: false,
		initializing: false,
		settings: null,
		wizardStep: 'url',
		formatsLoading: false,
		wizardUrl: '',
		wizardTitle: '',
		wizardThumbnail: '',
		wizardFormats: [],
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		wizardMediaKind: 'video',
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: [],
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardSponsorBlockMode: 'off' as const,
		wizardSponsorBlockCategories: ['sponsor', 'selfpromo'] as never[],
		queue: []
	})
}

beforeEach(() => {
	resetStore()
	vi.clearAllMocks()
})

describe('Subtitles kind', () => {
	it('the Subtitles switch clears video and audio selections', async () => {
		window.appApi = buildMockApi() as never
		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl(YOUTUBE_URL)
		await useAppStore.getState().submitUrl()

		useAppStore.getState().setWizardMediaKind('subtitles')

		const state = useAppStore.getState()
		expect(state.wizardMediaKind).toBe('subtitles')
		expect(state.selectedVideoFormatId).toBe('')
		expect(state.audioSelection).toEqual({kind: 'none'})
	})

	it('the Subtitles kind queues a subtitle-only job', async () => {
		window.appApi = buildMockApi() as never
		await useAppStore.getState().initialize()
		useAppStore.getState().setWizardUrl(YOUTUBE_URL)
		await useAppStore.getState().submitUrl()
		useAppStore.getState().setWizardMediaKind('subtitles')
		useAppStore.getState().clearSubtitleLanguages()
		useAppStore.getState().toggleSubtitleLanguage('en')

		await useAppStore.getState().addToQueue()

		const item = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0][0][0]
		expect(item.job.kind).toBe('subtitle-only')
		expect(item.job.kind === 'subtitle-only' ? item.job.subtitles.languages : []).toEqual(['en'])
	})
})

describe('Wizard subtitle step — store behavior', () => {
	it('populates subtitles + automaticCaptions from probe on submitUrl', async () => {
		window.appApi = buildMockApi() as never
		await useAppStore.getState().initialize()

		useAppStore.getState().setWizardUrl(YOUTUBE_URL)
		await useAppStore.getState().submitUrl()

		const state = useAppStore.getState()
		expect(state.wizardSubtitles).toEqual(PROBE_RESULT.subtitles)
		expect(state.wizardAutomaticCaptions).toEqual(PROBE_RESULT.automaticCaptions)
		expect(state.wizardSubtitleLanguages).toEqual([])
	})

	it('takes subtitle languages from the active profile, matching regional and auto tracks', async () => {
		const balanced = (await import('@shared/downloadProfiles.js')).BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const withSubs = {...balanced, id: 'subs', name: 'Subs', subtitles: {...balanced.subtitles, enabled: true, languages: ['es', 'ja']}}
		window.appApi = buildMockApi({profiles: {active: {kind: 'custom', id: 'subs'}, custom: [withSubs], overrides: [], enabledOverrides: {}}}) as never
		await useAppStore.getState().initialize()

		useAppStore.getState().setWizardUrl(YOUTUBE_URL)
		await useAppStore.getState().submitUrl()

		expect(useAppStore.getState().wizardSubtitleLanguages).toEqual(['es', 'ja-orig'])
	})

	it('toggleSubtitleLanguage adds and removes a language', () => {
		useAppStore.setState({wizardSubtitleLanguages: []})
		useAppStore.getState().toggleSubtitleLanguage('en')
		expect(useAppStore.getState().wizardSubtitleLanguages).toEqual(['en'])

		useAppStore.getState().toggleSubtitleLanguage('en')
		expect(useAppStore.getState().wizardSubtitleLanguages).toEqual([])
	})

	it('buildQueueItem derives writeAutoSubs: false when all selected langs are in manual pool', async () => {
		window.appApi = buildMockApi() as never
		await useAppStore.getState().initialize()

		useAppStore.setState({
			wizardUrl: YOUTUBE_URL,
			wizardTitle: 'Test',
			wizardThumbnail: '',
			wizardOutputDir: '/tmp',
			selectedVideoFormatId: '22',
			audioSelection: {kind: 'native', formatId: '140'},
			wizardMediaKind: 'video',
			wizardFormats: PROBE_RESULT.formats,
			wizardSubtitles: PROBE_RESULT.subtitles,
			wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
			wizardSubtitleLanguages: ['en', 'es'],
			wizardStep: 'confirm',
			wizardExtractor: 'youtube'
		})

		await useAppStore.getState().addToQueue()

		const queue = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? []
		expect(queue).toHaveLength(1)
		expect((queue[0].job as Extract<(typeof queue)[0]['job'], {kind: 'single-format'}>).subtitles?.languages).toEqual(['en', 'es'])
		expect((queue[0].job as Extract<(typeof queue)[0]['job'], {kind: 'single-format'}>).subtitles?.writeAuto).toBe(false)
	})

	it('buildQueueItem derives writeAutoSubs: true when a selected lang is auto-only', async () => {
		window.appApi = buildMockApi() as never
		await useAppStore.getState().initialize()

		useAppStore.setState({
			wizardUrl: YOUTUBE_URL,
			wizardTitle: 'Test',
			wizardThumbnail: '',
			wizardOutputDir: '/tmp',
			selectedVideoFormatId: '22',
			audioSelection: {kind: 'native', formatId: '140'},
			wizardMediaKind: 'video',
			wizardFormats: PROBE_RESULT.formats,
			wizardSubtitles: PROBE_RESULT.subtitles,
			wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
			wizardSubtitleLanguages: ['de-orig'], // auto-only lang
			wizardStep: 'confirm',
			wizardExtractor: 'youtube'
		})

		await useAppStore.getState().addToQueue()

		const queue = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0]?.[0] ?? []
		expect((queue[0].job as Extract<(typeof queue)[0]['job'], {kind: 'single-format'}>).subtitles?.writeAuto).toBe(true)
	})

	it('wizardSubtitleMode defaults to sidecar and wizardSubtitleFormat to srt', () => {
		expect(useAppStore.getState().wizardSubtitleMode).toBe('sidecar')
		expect(useAppStore.getState().wizardSubtitleFormat).toBe('srt')
	})

	it('setSubtitleMode updates wizardSubtitleMode', () => {
		useAppStore.getState().setSubtitleMode('embed')
		expect(useAppStore.getState().wizardSubtitleMode).toBe('embed')
	})

	it('setSubtitleFormat updates wizardSubtitleFormat', () => {
		useAppStore.getState().setSubtitleFormat('vtt')
		expect(useAppStore.getState().wizardSubtitleFormat).toBe('vtt')
	})

	it('buildQueueItem includes subtitleMode and subtitleFormat', async () => {
		window.appApi = buildMockApi() as never
		await useAppStore.getState().initialize()

		useAppStore.setState({
			wizardUrl: YOUTUBE_URL,
			wizardTitle: 'Test',
			wizardThumbnail: '',
			wizardOutputDir: '/tmp',
			selectedVideoFormatId: '22',
			audioSelection: {kind: 'native', formatId: '140'},
			wizardMediaKind: 'video',
			wizardFormats: PROBE_RESULT.formats,
			wizardSubtitles: PROBE_RESULT.subtitles,
			wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
			wizardSubtitleLanguages: ['en'],
			wizardSubtitleMode: 'subfolder',
			wizardSubtitleFormat: 'vtt',
			wizardStep: 'confirm',
			wizardExtractor: 'youtube'
		})

		await useAppStore.getState().addToQueue()

		const item = vi.mocked(window.appApi.queue.cmd.add).mock.calls[0][0][0]
		expect((item.job as Extract<typeof item.job, {kind: 'single-format'}>).subtitles?.mode).toBe('subfolder')
		expect((item.job as Extract<typeof item.job, {kind: 'single-format'}>).subtitles?.format).toBe('vtt')
	})

	it('reset() clears subtitle state and resets mode/format to defaults', () => {
		useAppStore.setState({wizardSubtitleLanguages: ['en'], wizardSubtitles: {en: [{ext: 'vtt'}]}, wizardAutomaticCaptions: {de: [{ext: 'vtt'}]}, wizardSubtitleMode: 'embed', wizardSubtitleFormat: 'vtt'})

		useAppStore.getState().reset()

		const state = useAppStore.getState()
		expect(state.wizardSubtitleLanguages).toEqual([])
		expect(state.wizardSubtitles).toEqual({})
		expect(state.wizardAutomaticCaptions).toEqual({})
		expect(state.wizardSubtitleMode).toBe('sidecar')
		expect(state.wizardSubtitleFormat).toBe('srt')
	})
})

describe('SubtitleFields — save mode UI', () => {
	function renderStep(subtitleMode = 'sidecar') {
		useAppStore.setState({wizardStep: 'confirm', wizardSubtitles: {en: [{ext: 'vtt', name: 'English'}]}, wizardAutomaticCaptions: {}, wizardSubtitleLanguages: [], wizardSubtitleMode: subtitleMode as never, wizardSubtitleFormat: 'srt'})
		return render(<SubtitleFields withMedia />)
	}

	it('renders save-mode radio options', () => {
		renderStep()
		expect(screen.getByText('Next to video')).toBeInTheDocument()
		expect(screen.getByText('Embed into video')).toBeInTheDocument()
		expect(screen.getByText('subtitles/ subfolder')).toBeInTheDocument()
	})

	it('shows format toggle buttons when mode is sidecar', () => {
		renderStep('sidecar')
		expect(screen.getByRole('button', {name: 'SRT'})).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'VTT'})).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'ASS'})).toBeInTheDocument()
	})

	it('hides format toggle buttons when mode is embed', () => {
		renderStep('embed')
		expect(screen.queryByRole('button', {name: 'SRT'})).not.toBeInTheDocument()
	})

	it('shows the embed-note hint only when mode is embed', () => {
		const {rerender} = renderStep('sidecar')
		expect(screen.queryByTestId('subtitle-embed-note')).not.toBeInTheDocument()

		useAppStore.setState({wizardSubtitleMode: 'embed'})
		rerender(<SubtitleFields withMedia />)
		const note = screen.getByTestId('subtitle-embed-note')
		expect(note).toBeInTheDocument()
		expect(note.textContent).toMatch(/\.mkv/)
	})

	it('clicking embed mode calls setSubtitleMode', () => {
		const setSubtitleMode = vi.spyOn(useAppStore.getState(), 'setSubtitleMode')
		renderStep('sidecar')
		fireEvent.click(screen.getByText('Embed into video'))
		expect(setSubtitleMode).toHaveBeenCalledWith('embed')
	})

	it('shows the auto-caption ASS-fallback note only when an auto language is selected and format is ASS', () => {
		useAppStore.setState({wizardStep: 'confirm', wizardSubtitles: {}, wizardAutomaticCaptions: {en: [{ext: 'vtt'}]}, wizardSubtitleLanguages: ['en'], wizardSubtitleMode: 'sidecar', wizardSubtitleFormat: 'ass'})
		const {rerender} = render(<SubtitleFields withMedia />)
		expect(screen.getByTestId('subtitle-auto-ass-note')).toBeInTheDocument()

		// Switch format away from ASS — note should disappear
		useAppStore.setState({wizardSubtitleFormat: 'srt'})
		rerender(<SubtitleFields withMedia />)
		expect(screen.queryByTestId('subtitle-auto-ass-note')).not.toBeInTheDocument()

		// ASS again, but only manual sub selected — also no note
		useAppStore.setState({wizardSubtitleFormat: 'ass', wizardSubtitles: {en: [{ext: 'vtt'}]}, wizardAutomaticCaptions: {}, wizardSubtitleLanguages: ['en']})
		rerender(<SubtitleFields withMedia />)
		expect(screen.queryByTestId('subtitle-auto-ass-note')).not.toBeInTheDocument()
	})
})

function singleState(overrides: Record<string, unknown> = {}): void {
	window.appApi = buildMockApi() as never
	useAppStore.setState({
		wizardStep: 'confirm',
		wizardMode: 'single',
		wizardUrl: YOUTUBE_URL,
		wizardTitle: 'Test',
		wizardThumbnail: '',
		wizardOutputDir: '/tmp',
		wizardFilenameTemplate: '{title} [{id}]',
		selectedVideoFormatId: '22',
		audioSelection: {kind: 'none'},
		wizardMediaKind: 'video',
		wizardFormats: PROBE_RESULT.formats,
		wizardSubtitles: PROBE_RESULT.subtitles,
		wizardAutomaticCaptions: PROBE_RESULT.automaticCaptions,
		wizardSubtitleLanguages: [],
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		...overrides
	})
}

describe('Review — subtitle row', () => {
	it('shows language + format + mode for sidecar', () => {
		singleState({wizardSubtitleLanguages: ['en']})
		render(<StepReview />)
		const value = screen.getByTestId('review-row-subtitles').textContent ?? ''
		expect(value).toContain('SRT')
		expect(value).toContain('Next to video')
	})

	it('shows language + mode for embed (no format)', () => {
		singleState({wizardSubtitleLanguages: ['en'], wizardSubtitleMode: 'embed'})
		render(<StepReview />)
		const value = screen.getByTestId('review-row-subtitles').textContent ?? ''
		expect(value).toContain('Embed into video')
		expect(value).not.toContain('SRT')
	})

	it('shows Off when no languages are selected, and opens the picker in place', () => {
		singleState()
		render(<StepReview />)
		expect(screen.getByTestId('review-row-subtitles').textContent).toContain('Off')
		fireEvent.click(screen.getByTestId('review-row-subtitles-toggle'))
		expect(screen.getByTestId('subtitle-fields')).toBeTruthy()
	})
})

describe('Format screen — Subtitles kind', () => {
	it('swaps the stream lists for the language picker', () => {
		singleState({wizardStep: 'formats', wizardMediaKind: 'subtitles', selectedVideoFormatId: ''})
		render(<StepFormatSelect />)
		expect(screen.getByTestId('subtitle-fields')).toBeTruthy()
		expect(screen.queryAllByRole('radio')).toEqual([])
	})

	it('drops "embed" when there is no media file to embed into', () => {
		singleState({wizardStep: 'formats', wizardMediaKind: 'subtitles', selectedVideoFormatId: '', wizardSubtitleLanguages: ['en']})
		render(<StepFormatSelect />)
		expect(screen.queryByText('Embed into video')).toBeNull()
	})

	it('keeps exactly one video and one audio row selected in Video', () => {
		singleState({wizardStep: 'formats', audioSelection: {kind: 'native', formatId: '140'}})
		render(<StepFormatSelect />)
		expect(screen.getAllByRole('radio').filter(r => r.getAttribute('aria-checked') === 'true')).toHaveLength(2)
	})

	it('maps each format row to its store selection, with conversions only in Audio', () => {
		singleState({wizardStep: 'formats', audioSelection: {kind: 'native', formatId: '140'}})
		const {rerender} = render(<StepFormatSelect />)
		const radio = (name: string, index = 0): HTMLElement => {
			const match = screen.getAllByRole('radio', {name})[index]
			if (!match) throw new Error(`no radio named ${name}`)
			return match
		}

		fireEvent.click(radio('Keep as-is'))
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'none'})
		fireEvent.click(radio('opus'))
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(screen.queryByRole('radio', {name: 'mp3'})).toBeNull()

		useAppStore.getState().setWizardMediaKind('audio')
		rerender(<StepFormatSelect />)
		fireEvent.click(radio('mp3'))
		expect(useAppStore.getState().audioSelection).toMatchObject({kind: 'convert-lossy', target: 'mp3'})
		fireEvent.click(radio('wav'))
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'convert-lossless', target: 'wav'})
		expect(radio('wav').getAttribute('aria-checked')).toBe('true')
	})
})

describe('Download — subtitles-only safeguards', () => {
	it('is disabled in Subtitles with no language', () => {
		singleState({wizardMediaKind: 'subtitles', selectedVideoFormatId: ''})
		render(<StepReview />)
		expect(screen.getByTestId<HTMLButtonElement>('btn-download').disabled).toBe(true)
		expect(screen.getByTestId<HTMLButtonElement>('btn-download-menu').disabled).toBe(true)
	})

	it('is enabled in Subtitles with at least one language', () => {
		singleState({wizardMediaKind: 'subtitles', selectedVideoFormatId: '', wizardSubtitleLanguages: ['en']})
		render(<StepReview />)
		expect(screen.getByTestId<HTMLButtonElement>('btn-download').disabled).toBe(false)
	})
})
