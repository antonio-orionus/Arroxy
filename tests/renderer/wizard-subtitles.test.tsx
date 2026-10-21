// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import {useAppStore} from '@renderer/store/useAppStore.js'
import type {ProbeResult, StatusEvent} from '@shared/types.js'
import {ok} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'
import {SubtitleFields} from '@renderer/components/wizard/SubtitleFields.js'
import {StepReview} from '@renderer/components/wizard/StepReview.js'
import {StepFormatSelect} from '@renderer/components/wizard/StepFormatSelect.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {wizardSnapshot} from '@renderer/store/wizard/wizardProfileState.js'
import {selectWizardReviewState} from '@renderer/store/wizard/wizardReviewState.js'

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
		app: {warmUp: vi.fn().mockResolvedValue(ok({completed: true, failures: []})), getGraphicsPolicy: vi.fn().mockResolvedValue(ok({backdrop: {webglBlocked: false, softwareWebglAllowed: false}})), setLanguage: vi.fn().mockResolvedValue(undefined)},
		downloads: {
			probeCancel: vi.fn().mockResolvedValue(undefined),
			start: vi.fn().mockResolvedValue(ok({job: {id: 'job-1', url: YOUTUBE_URL, outputDir: '/tmp', status: 'running', createdAt: '', updatedAt: ''}})),
			cancel: vi.fn().mockResolvedValue(ok({cancelled: true})),
			probe: vi.fn().mockResolvedValue(ok(probeResult)),
			pause: vi.fn().mockResolvedValue(ok({paused: true}))
		},
		settings: {get: vi.fn().mockResolvedValue(ok(buildAppSettings(settingsOverrides))), update: vi.fn().mockResolvedValue(ok(buildAppSettings(settingsOverrides)))},
		hotkey: {rendererReady: vi.fn().mockResolvedValue(ok(undefined))},
		links: {rendererReady: vi.fn().mockResolvedValue(ok(undefined))},
		shell: {openFolder: vi.fn(), openExternal: vi.fn()},
		logs: {openDir: vi.fn()},
		dialog: {chooseFolder: vi.fn()},
		events: {
			onStatus: vi.fn().mockImplementation((_cb: (event: StatusEvent) => void) => () => undefined),
			onProgress: vi.fn().mockReturnValue(() => undefined),
			onProbeProgress: vi.fn().mockReturnValue(() => undefined),
			onClipboardUrl: vi.fn().mockReturnValue(() => undefined),
			onOpenedLink: vi.fn().mockReturnValue(() => undefined),
			onHotkeyTrigger: vi.fn().mockReturnValue(() => undefined),
			onMenuAction: vi.fn().mockReturnValue(() => undefined),
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
		siteRequests: {getCooldowns: vi.fn().mockResolvedValue({ok: true, data: []}), tryNow: vi.fn().mockResolvedValue({ok: true, data: undefined}), onCooldownsChanged: vi.fn().mockReturnValue(() => undefined)},
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
		expect(item.job.kind === 'subtitle-only' ? item.job.subtitles.request : undefined).toEqual({kind: 'tracks', tracks: [{key: 'en', auto: false}]})
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
		expect((queue[0].job as Extract<(typeof queue)[0]['job'], {kind: 'single-format'}>).subtitles?.request).toEqual({
			kind: 'tracks',
			tracks: [
				{key: 'en', auto: false},
				{key: 'es', auto: false}
			]
		})
	})

	it('buildQueueItem marks a selected lang that is auto-only as an automatic track', async () => {
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
		expect((queue[0].job as Extract<(typeof queue)[0]['job'], {kind: 'single-format'}>).subtitles?.request).toEqual({kind: 'tracks', tracks: [{key: 'de-orig', auto: true}]})
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

	// yt-dlp names YouTube's original-language caption "English (Original)";
	// next to the Auto badge that reads as the uploaded track, so the label is
	// the plain language name.
	it('labels an -orig caption by its plain language name, not yt-dlp\'s "(Original)"', () => {
		useAppStore.setState({wizardStep: 'confirm', wizardSubtitles: {en: [{ext: 'vtt', name: 'English'}]}, wizardAutomaticCaptions: {'en-orig': [{ext: 'vtt', name: 'English (Original)'}]}, wizardSubtitleLanguages: ['en', 'en-orig'], wizardSubtitleMode: 'sidecar', wizardSubtitleFormat: 'srt'})
		render(<SubtitleFields withMedia />)
		expect(screen.getByTestId('subtitle-fields').textContent).not.toContain('Original')
		expect(screen.getAllByText('English').length).toBeGreaterThanOrEqual(2)
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
		wizardPart: null,
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

	it('names an -orig caption by its language, without "(Original)"', () => {
		singleState({wizardAutomaticCaptions: {'ja-orig': [{ext: 'vtt', name: 'Japanese (Original)'}]}, wizardSubtitleLanguages: ['ja-orig']})
		render(<StepReview />)
		const value = screen.getByTestId('review-row-subtitles').textContent ?? ''
		expect(value).toContain('Japanese')
		expect(value).not.toContain('Original')
	})

	it('shows Off when no languages are selected, and opens the picker in place', () => {
		singleState()
		render(<StepReview />)
		expect(screen.getByTestId('review-row-subtitles').textContent).toContain('Off')
		fireEvent.click(screen.getByTestId('review-row-subtitles-toggle'))
		expect(screen.getByTestId('subtitle-fields')).toBeTruthy()
	})
})

// The rows are one accordion: one open at a time, each row a heading with a
// native button (Tab reaches it, Enter and Space toggle it), and Done closes it.
describe('Review — rows', () => {
	it('opens one row at a time, each from a heading button', async () => {
		singleState({wizardReviewRow: null})
		render(<StepReview />)
		const subtitles = screen.getByTestId('review-row-subtitles-toggle')
		const extras = screen.getByTestId('review-row-extras-toggle')
		expect(subtitles).toHaveAttribute('aria-expanded', 'false')

		fireEvent.click(subtitles)
		expect(subtitles).toHaveAttribute('aria-expanded', 'true')
		expect(useAppStore.getState().wizardReviewRow).toBe('subtitles')
		expect(document.getElementById(subtitles.getAttribute('aria-controls') ?? '')).toContainElement(screen.getByTestId('subtitle-fields'))

		fireEvent.click(extras)
		expect(useAppStore.getState().wizardReviewRow).toBe('extras')
		await waitFor(() => expect(screen.queryByTestId('subtitle-fields')).toBeNull())
		expect(subtitles).toHaveAttribute('aria-expanded', 'false')

		for (const toggle of screen.getAllByTestId(/^review-row-\w+-toggle$/)) {
			expect(toggle.tagName).toBe('BUTTON')
			expect(toggle).not.toHaveAttribute('tabindex', '-1')
			expect(toggle.closest('h3')).not.toBeNull()
		}
	})

	it('dims values that are off and brightens ones that are on', () => {
		singleState({wizardReviewRow: null, wizardSubtitleLanguages: [], wizardEmbedChapters: false, wizardEmbedMetadata: false, wizardEmbedThumbnail: false, wizardWriteDescription: false, wizardWriteThumbnail: false})
		const {unmount} = render(<StepReview />)
		expect(screen.getByTestId('review-row-subtitles-value')).toHaveAttribute('data-value-state', 'off')
		expect(screen.getByTestId('review-row-extras-value')).toHaveAttribute('data-value-state', 'off')
		expect(screen.getByTestId('review-row-saveTo-value')).toHaveAttribute('data-value-state', 'on')
		unmount()

		useAppStore.setState({wizardSubtitleLanguages: ['en'], wizardWriteThumbnail: true})
		render(<StepReview />)
		expect(screen.getByTestId('review-row-subtitles-value')).toHaveAttribute('data-value-state', 'on')
		expect(screen.getByTestId('review-row-extras-value')).toHaveAttribute('data-value-state', 'on')
	})

	it('marks only the rows this run changed from its profile', () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES[0]
		singleState({wizardReviewRow: null, wizardProfile: profile})
		useAppStore.setState({wizardProfileBaseline: wizardSnapshot(selectWizardReviewState(useAppStore.getState()))})
		useAppStore.setState({wizardFilenameTemplate: '{uploader} - {title}'})
		try {
			render(<StepReview />)
			expect(screen.getByTestId('review-row-fileName-changed')).toBeInTheDocument()
			expect(screen.getByTestId('review-row-fileName-toggle').textContent).toContain(`Changed from ${profile.name}:`)
			expect(screen.queryByTestId('review-row-subtitles-changed')).toBeNull()
			expect(screen.queryByTestId('review-row-saveTo-changed')).toBeNull()
		} finally {
			useAppStore.setState({wizardProfile: null, wizardProfileBaseline: null})
		}
	})

	it('edits the file name with single-video tokens and blocks Download on an invalid template', () => {
		singleState({wizardReviewRow: 'fileName'})
		render(<StepReview />)
		expect(screen.getByTestId('filename-token-uploader')).toBeInTheDocument()
		expect(screen.queryByTestId('filename-token-playlist_index')).toBeNull()
		expect(screen.queryByTestId('filename-token-playlist_title')).toBeNull()
		expect(screen.queryByTestId('filename-token-playlist_id')).toBeNull()
		expect(screen.getByTestId('btn-download')).not.toHaveAttribute('aria-disabled', 'true')

		fireEvent.change(screen.getByTestId('review-filename-input'), {target: {value: '{titel}'}})
		expect(screen.getByTestId('filename-template-error').textContent).toContain('titel')
		// A screen reader names the error from the input.
		const errorId = screen.getByTestId('filename-template-error').id
		expect(errorId).not.toBe('')
		expect(screen.getByTestId('review-filename-input').getAttribute('aria-describedby')).toBe(errorId)
		expect(screen.getByTestId('btn-download')).toHaveAttribute('aria-disabled', 'true')

		fireEvent.change(screen.getByTestId('review-filename-input'), {target: {value: '{title}'}})
		expect(screen.queryByTestId('filename-template-error')).toBeNull()
		expect(screen.getByTestId('filename-template-preview')).toBeInTheDocument()
		expect(screen.queryByTestId('filename-template-preview-playlist')).toBeNull()
		// The {id} warning is about playlist sync, which a single video never uses.
		expect(screen.queryByTestId('filename-template-id-warning')).toBeNull()
		expect(screen.getByTestId('btn-download')).not.toHaveAttribute('aria-disabled', 'true')
	})

	it('opens on the row that blocks Download, so its error is in view', () => {
		singleState({wizardStep: 'formats', wizardReviewRow: null, wizardFilenameTemplate: '{titel}'})
		useAppStore.getState().openReview(null)
		expect(useAppStore.getState().wizardReviewRow).toBe('fileName')
		render(<StepReview />)
		expect(screen.getByTestId('filename-template-error')).toBeInTheDocument()

		singleState({wizardStep: 'formats', wizardReviewRow: null, wizardOutputDir: ''})
		useAppStore.getState().openReview(null)
		expect(useAppStore.getState().wizardReviewRow).toBe('saveTo')

		singleState({wizardStep: 'formats', wizardReviewRow: null})
		useAppStore.getState().openReview(null)
		expect(useAppStore.getState().wizardReviewRow).toBeNull()
	})

	it('closes the open row from its header', () => {
		singleState({wizardReviewRow: 'fileName'})
		render(<StepReview />)
		expect(screen.getByTestId('review-filename-input')).toBeInTheDocument()

		fireEvent.click(screen.getByTestId('review-row-fileName-toggle'))
		expect(useAppStore.getState().wizardReviewRow).toBeNull()
		expect(screen.getByTestId('review-row-fileName-toggle')).toHaveAttribute('aria-expanded', 'false')
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

	it('maps each format chip to its store selection, with conversions only in Audio', () => {
		singleState({wizardStep: 'formats', audioSelection: {kind: 'native', formatId: '140'}})
		const {rerender} = render(<StepFormatSelect />)
		// A chip's spoken name lists every fact about its stream; these match its start or end.
		const radio = (name: RegExp): HTMLElement => {
			const match = screen.getAllByRole('radio', {name})[0]
			if (!match) throw new Error(`no radio named ${String(name)}`)
			return match
		}

		fireEvent.click(radio(/^Keep as-is/))
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'none'})
		fireEvent.click(radio(/^opus · 128 kbps/))
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(screen.queryByRole('radio', {name: /mp3$/})).toBeNull()

		useAppStore.getState().setWizardMediaKind('audio')
		rerender(<StepFormatSelect />)
		fireEvent.click(radio(/mp3$/))
		expect(useAppStore.getState().audioSelection).toMatchObject({kind: 'convert-lossy', target: 'mp3'})
		fireEvent.click(radio(/^WAV/))
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'convert-lossless', target: 'wav'})
		expect(radio(/^WAV/).getAttribute('aria-checked')).toBe('true')
	})
})

// Format's highlighted action is Continue to Review, so a user who keeps
// pressing it sees every option first; Download beside it is the shortcut.
describe('Format screen — footer', () => {
	it('offers Continue as its primary action and the Download split as a shortcut', () => {
		singleState({wizardStep: 'formats'})
		render(<StepFormatSelect />)
		expect(screen.getByTestId('btn-format-continue')).toBeTruthy()
		expect(screen.getByTestId('btn-download')).toBeTruthy()
		expect(screen.getByTestId('btn-download-menu')).toBeTruthy()
		expect(screen.queryByTestId('btn-review-options')).toBeNull()
	})

	it('Download starts the download without opening Review', () => {
		singleState({wizardStep: 'formats'})
		const original = useAppStore.getState().addAndDownloadImmediately
		const addAndDownloadImmediately = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({addAndDownloadImmediately})
		try {
			render(<StepFormatSelect />)
			fireEvent.click(screen.getByTestId('btn-download'))
			expect(addAndDownloadImmediately).toHaveBeenCalledOnce()
			expect(useAppStore.getState().wizardStep).toBe('formats')
		} finally {
			useAppStore.setState({addAndDownloadImmediately: original})
		}
	})

	// Review opens folded: every row's value already says what it holds.
	it('Continue opens Review with every row folded', () => {
		singleState({wizardStep: 'formats', wizardReviewRow: 'subtitles'})
		render(<StepFormatSelect />)
		fireEvent.click(screen.getByTestId('btn-format-continue'))
		expect(useAppStore.getState().wizardStep).toBe('confirm')
		expect(useAppStore.getState().wizardReviewRow).toBeNull()
	})

	it('Continue is disabled in Subtitles with no language', () => {
		singleState({wizardStep: 'formats', wizardMediaKind: 'subtitles', selectedVideoFormatId: ''})
		render(<StepFormatSelect />)
		expect(screen.getByTestId('btn-format-continue')).toHaveAttribute('aria-disabled', 'true')
	})

	it('Continue is disabled while the part is invalid', () => {
		singleState({wizardStep: 'formats', wizardDuration: 120, wizardPart: {start: '1:00', end: '0:10', exactCut: false}})
		render(<StepFormatSelect />)
		expect(screen.getByTestId('btn-format-continue')).toHaveAttribute('aria-disabled', 'true')
	})

	it('Continue stays enabled when only Review settings block Download', () => {
		singleState({wizardStep: 'formats', wizardOutputDir: '', wizardFilenameTemplate: ''})
		render(<StepFormatSelect />)
		expect(screen.getByTestId('btn-format-continue')).not.toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByTestId('btn-download')).toHaveAttribute('aria-disabled', 'true')
	})
})

describe('Download — subtitles-only safeguards', () => {
	it('is disabled in Subtitles with no language', () => {
		singleState({wizardMediaKind: 'subtitles', selectedVideoFormatId: ''})
		render(<StepReview />)
		expect(screen.getByTestId('btn-download')).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByTestId<HTMLButtonElement>('btn-download-menu').disabled).toBe(true)
	})

	it('is enabled in Subtitles with at least one language', () => {
		singleState({wizardMediaKind: 'subtitles', selectedVideoFormatId: '', wizardSubtitleLanguages: ['en']})
		render(<StepReview />)
		expect(screen.getByTestId('btn-download')).not.toHaveAttribute('aria-disabled', 'true')
	})
})
