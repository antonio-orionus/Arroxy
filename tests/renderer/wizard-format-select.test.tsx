// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {BUILTIN_DOWNLOAD_PROFILES, DEFAULT_DOWNLOAD_PROFILES_PREFS} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings, DownloadProfile, FormatOption} from '@shared/types.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {editedProfileDraft, profilePatch, wizardChangedAreas} from '@renderer/store/wizard/wizardProfileState.js'
import {StepReview} from '@renderer/components/wizard/StepReview.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p | mp4 | 30fps', ext: 'mp4', resolution: '1080p', fps: 30, filesize: 800_000_000, isVideoOnly: true, isAudioOnly: false},
	{formatId: '22', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 400_000_000, isVideoOnly: false, isAudioOnly: false},
	{formatId: '140', label: 'm4a 128kbps', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true},
	{formatId: '249', label: 'opus 64kbps', ext: 'opus', resolution: 'audio only', abr: 64, isVideoOnly: false, isAudioOnly: true}
]

const DOLBY_FIRST_FORMATS: FormatOption[] = [
	{formatId: '337', label: '2160p hdr', ext: 'webm', resolution: '2160p HDR', isVideoOnly: true, isAudioOnly: false},
	{formatId: '380', label: 'm4a ac-3 384kbps', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ac-3', isVideoOnly: false, isAudioOnly: true},
	{formatId: '328', label: 'm4a ec-3 384kbps', ext: 'm4a', resolution: 'audio only', abr: 384, audioCodec: 'ec-3', isVideoOnly: false, isAudioOnly: true},
	{formatId: '251', label: 'opus 143kbps', ext: 'webm', resolution: 'audio only', abr: 143, audioCodec: 'opus', isVideoOnly: false, isAudioOnly: true}
]

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(p => p.id === id)
	if (!profile) throw new Error(`no builtin ${id}`)
	return profile
}

const SETTINGS: AppSettings = {...defaultAppSettings('/downloads'), common: {...defaultAppSettings('/downloads').common, language: 'es'}}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	useAppStore.setState({
		settings: SETTINGS,
		wizardMode: 'single',
		wizardFormats: FORMATS,
		wizardFormatSelection: selectionSourceFromOptions(FORMATS),
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardIsAudioOnlySource: false,
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		wizardMediaKind: 'video',
		wizardSubtitleLanguages: [],
		wizardSubtitleMode: 'sidecar',
		wizardProfile: null,
		wizardProfileBaseline: null,
		wizardOutputDir: '/downloads'
	})
})

describe('wizard slice — invariant: video + convert audio is unreachable', () => {
	it('picking a video while audio is converting resets audio to best native and switches to Video', () => {
		useAppStore.setState({audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320}, wizardMediaKind: 'audio'})

		useAppStore.getState().setSelectedVideoFormatId('137')

		const {selectedVideoFormatId, audioSelection, wizardMediaKind} = useAppStore.getState()
		expect(selectedVideoFormatId).toBe('137')
		expect(audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(wizardMediaKind).toBe('video')
	})

	it('skips Dolby when choosing the reset native audio', () => {
		useAppStore.setState({wizardFormats: DOLBY_FIRST_FORMATS, wizardFormatSelection: selectionSourceFromOptions(DOLBY_FIRST_FORMATS), audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}, wizardMediaKind: 'audio'})

		useAppStore.getState().setSelectedVideoFormatId('337')

		expect(useAppStore.getState().audioSelection).toEqual({kind: 'native', formatId: '251'})
	})

	it('a muxed stream keeps its own audio ("Keep as-is")', () => {
		useAppStore.setState({audioSelection: {kind: 'native', formatId: '140'}})

		useAppStore.getState().setSelectedVideoFormatId('22')

		expect(useAppStore.getState().audioSelection).toEqual({kind: 'none'})
	})

	it('switching between video-only streams keeps a native audio pick', () => {
		useAppStore.setState({
			wizardFormats: [...FORMATS, {formatId: '136', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: true, isAudioOnly: false}],
			wizardFormatSelection: selectionSourceFromOptions([...FORMATS, {formatId: '136', label: '720p', ext: 'mp4', resolution: '720p', isVideoOnly: true, isAudioOnly: false}]),
			selectedVideoFormatId: '136',
			audioSelection: {kind: 'native', formatId: '249'}
		})

		useAppStore.getState().setSelectedVideoFormatId('137')

		expect(useAppStore.getState().audioSelection).toEqual({kind: 'native', formatId: '249'})
	})

	it('ignores a stream id the probe does not offer', () => {
		useAppStore.setState({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}})

		useAppStore.getState().setSelectedVideoFormatId('')

		expect(useAppStore.getState().selectedVideoFormatId).toBe('137')
	})

	it('picking a conversion while a video is selected switches to Audio', () => {
		useAppStore.setState({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}, wizardMediaKind: 'video'})

		useAppStore.getState().setAudioSelection({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})

		const {selectedVideoFormatId, audioSelection, wizardMediaKind} = useAppStore.getState()
		expect(selectedVideoFormatId).toBe('')
		expect(audioSelection).toEqual({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})
		expect(wizardMediaKind).toBe('audio')
	})

	it('picking native audio keeps the video', () => {
		useAppStore.setState({selectedVideoFormatId: '137', audioSelection: {kind: 'none'}, wizardMediaKind: 'video'})

		useAppStore.getState().setAudioSelection({kind: 'native', formatId: '140'})

		expect(useAppStore.getState()).toMatchObject({selectedVideoFormatId: '137', wizardMediaKind: 'video'})
	})
})

describe('wizard slice — Video, no audio', () => {
	it('sets the picked audio aside, and brings the same pick back on Video + audio', () => {
		useAppStore.setState({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '249'}})

		useAppStore.getState().setFormatMode('video-only')
		expect(useAppStore.getState()).toMatchObject({selectedVideoFormatId: '137', audioSelection: {kind: 'none'}})

		useAppStore.getState().setFormatMode('video')
		expect(useAppStore.getState()).toMatchObject({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '249'}})
	})

	it('trades a stream with its own audio for the silent one, and stays silent on a new pick', () => {
		useAppStore.setState({selectedVideoFormatId: '22', audioSelection: {kind: 'none'}})

		useAppStore.getState().setFormatMode('video-only')
		expect(useAppStore.getState().selectedVideoFormatId).toBe('137')

		useAppStore.getState().setSelectedVideoFormatId('137')
		expect(useAppStore.getState().audioSelection).toEqual({kind: 'none'})
	})
})

describe('wizard slice — leaving a run', () => {
	it('forgets the audio set aside for Video, no audio, so the next video cannot restore it', () => {
		useAppStore.setState({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '249'}})
		useAppStore.getState().setFormatMode('video-only')
		expect(useAppStore.getState().wizardSilencedAudio).not.toBeNull()

		useAppStore.setState(RESET_WIZARD_STATE)

		expect(useAppStore.getState().wizardSilencedAudio).toBeNull()
	})
})

describe('wizard slice — Audio only profile, then Video', () => {
	it('Video, no audio also lands on the ranked silent stream, not the first one listed', () => {
		const silent720: FormatOption = {formatId: '136', label: '720p | mp4 | 30fps', ext: 'mp4', resolution: '720p', fps: 30, filesize: 300_000_000, isVideoOnly: true, isAudioOnly: false}
		useAppStore.setState({wizardFormats: [...FORMATS, silent720], wizardFormatSelection: selectionSourceFromOptions([...FORMATS, silent720])})
		useAppStore.setState(profilePatch(builtin('audio-only'), useAppStore.getState()))

		useAppStore.getState().setFormatMode('video-only')

		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'video', selectedVideoFormatId: '136', audioSelection: {kind: 'none'}})
	})

	it('lands on what the default profile would pick, not the tallest stream', () => {
		useAppStore.setState(profilePatch(builtin('audio-only'), useAppStore.getState()))

		useAppStore.getState().setFormatMode('video')

		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'video', selectedVideoFormatId: '22'})
	})
})

describe('wizard slice — switching profile after edits', () => {
	function editThenSwitch(keepEdits: boolean): void {
		useAppStore.setState(profilePatch(builtin('hd-1080'), useAppStore.getState()))
		useAppStore.setState({wizardWriteThumbnail: true, wizardSponsorBlockMode: 'remove', selectedVideoFormatId: '22'})
		useAppStore.setState({settings: {...SETTINGS, profiles: DEFAULT_DOWNLOAD_PROFILES_PREFS}})
		useAppStore.getState().chooseWizardProfile({kind: 'builtin', id: 'balanced'}, keepEdits)
	}

	it('Keep my changes: the new profile picks the streams, the other edits stay and show as changed', () => {
		editThenSwitch(true)

		const state = useAppStore.getState()
		expect(state.wizardProfile?.id).toBe('balanced')
		expect(state).toMatchObject({wizardWriteThumbnail: true, wizardSponsorBlockMode: 'remove'})
		expect(wizardChangedAreas(state)).toEqual(['sponsorBlock', 'extras'])
	})

	it('Reset all: everything comes from the new profile', () => {
		editThenSwitch(false)

		const state = useAppStore.getState()
		expect(state).toMatchObject({wizardWriteThumbnail: false, wizardSponsorBlockMode: 'off'})
		expect(wizardChangedAreas(state)).toEqual([])
	})
})

describe('wizard slice — Video / Audio / Subtitles switch', () => {
	it('Audio drops the video and keeps the audio track', () => {
		useAppStore.setState({selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '249'}})

		useAppStore.getState().setWizardMediaKind('audio')

		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'audio', selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '249'}})
	})

	// Named after the combined file yt-dlp picks, as the profile pick is.
	it('Audio on a muxed-only source keeps the audio of the file yt-dlp picks, as it is', () => {
		const muxedOnly = FORMATS.filter(f => !f.isAudioOnly)
		useAppStore.setState({wizardFormats: muxedOnly, wizardFormatSelection: selectionSourceFromOptions(muxedOnly), lastConvertBitrate: 256})

		useAppStore.getState().setWizardMediaKind('audio')

		expect(useAppStore.getState().audioSelection).toEqual({kind: 'extract', formatId: '22'})
	})

	it('Video returns to the profile pick', () => {
		useAppStore.setState(profilePatch(builtin('hd-1080'), useAppStore.getState()))
		useAppStore.getState().setWizardMediaKind('audio')

		useAppStore.getState().setWizardMediaKind('video')

		// yt-dlp reads the .opus file's codec from its extension and ranks Opus above an unnamed codec.
		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'video', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '249'}})
	})

	it('Subtitles drops the media, starts from the app language and never embeds', () => {
		useAppStore.setState({wizardSubtitles: {es: [{ext: 'vtt'}], de: [{ext: 'vtt'}]}, wizardSubtitleMode: 'embed', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}})

		useAppStore.getState().setWizardMediaKind('subtitles')

		expect(useAppStore.getState()).toMatchObject({wizardMediaKind: 'subtitles', selectedVideoFormatId: '', audioSelection: {kind: 'none'}, wizardSubtitleLanguages: ['es'], wizardSubtitleMode: 'sidecar'})
	})
})

describe('wizard slice — profiles', () => {
	it('choosing another profile re-applies every setting and drops edits', () => {
		useAppStore.setState(profilePatch(builtin('hd-1080'), useAppStore.getState()))
		useAppStore.setState({wizardSponsorBlockMode: 'remove'})
		expect(wizardChangedAreas(useAppStore.getState())).toEqual(['sponsorBlock'])

		useAppStore.getState().chooseWizardProfile({kind: 'builtin', id: 'audio-only'})

		const state = useAppStore.getState()
		expect(state.wizardProfile?.id).toBe('audio-only')
		expect(state).toMatchObject({wizardMediaKind: 'audio', wizardSponsorBlockMode: 'off'})
		expect(wizardChangedAreas(state)).toEqual([])
	})

	it('reset puts the profile back', () => {
		useAppStore.setState(profilePatch(builtin('hd-1080'), useAppStore.getState()))
		useAppStore.setState({wizardEmbedThumbnail: true, selectedVideoFormatId: '22'})

		useAppStore.getState().resetWizardToProfile()

		expect(wizardChangedAreas(useAppStore.getState())).toEqual([])
	})

	it('Save as profile stores the edits as a new profile without changing the active one', async () => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(true)
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile})
		useAppStore.setState({wizardSponsorBlockMode: 'remove'})

		await expect(useAppStore.getState().saveWizardAsProfile('My 1080p')).resolves.toBe(true)

		expect(saveDownloadProfile).toHaveBeenCalledWith(expect.objectContaining({name: 'My 1080p', sponsorBlock: expect.objectContaining({mode: 'remove'})}), false)
		expect(wizardChangedAreas(useAppStore.getState())).toEqual([])
		expect(useAppStore.getState().settings?.profiles).toEqual(DEFAULT_DOWNLOAD_PROFILES_PREFS)
	})

	it("Save as profile keeps the profile's media when only other settings changed", async () => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(true)
		const lowRes: FormatOption[] = [FORMATS[1], FORMATS[2]]
		useAppStore.setState({wizardFormats: lowRes, saveDownloadProfile})
		useAppStore.setState(profilePatch(builtin('hd-1080'), useAppStore.getState()))
		useAppStore.setState({wizardFilenameTemplate: '{title}'})

		await useAppStore.getState().saveWizardAsProfile('Mine')

		expect(saveDownloadProfile).toHaveBeenCalledWith(expect.objectContaining({media: builtin('hd-1080').media}), false)
	})

	it('Update profile saves the edits into the profile the run started from, keeping its id, name and creation date', async () => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(true)
		const base = builtin('hd-1080')
		useAppStore.setState({...profilePatch(base, useAppStore.getState()), saveDownloadProfile})
		useAppStore.setState({wizardWriteThumbnail: true})

		await expect(useAppStore.getState().updateWizardProfile()).resolves.toBe(true)

		expect(saveDownloadProfile).toHaveBeenCalledWith(expect.objectContaining({id: base.id, name: base.name, createdAt: base.createdAt, enabled: base.enabled, embed: expect.objectContaining({thumbnailSidecar: true})}), false)
		expect(useAppStore.getState().wizardProfile?.embed.thumbnailSidecar).toBe(true)
		expect(wizardChangedAreas(useAppStore.getState())).toEqual([])
	})

	it('Update profile does nothing without edits', async () => {
		const saveDownloadProfile = vi.fn()
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile})

		await expect(useAppStore.getState().updateWizardProfile()).resolves.toBe(false)
		expect(saveDownloadProfile).not.toHaveBeenCalled()
	})

	it('Save as profile refuses an empty name or no edits', async () => {
		const saveDownloadProfile = vi.fn()
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile})

		await expect(useAppStore.getState().saveWizardAsProfile('Name')).resolves.toBe(false)
		useAppStore.setState({wizardSponsorBlockMode: 'remove'})
		await expect(useAppStore.getState().saveWizardAsProfile('  ')).resolves.toBe(false)
		expect(saveDownloadProfile).not.toHaveBeenCalled()
	})

	// A profile saved with such a template would fail every download it starts.
	it.each(['{titel}', 'a:b {title}'])('Save as profile, Update profile and the after-download offer refuse the file name %s', async template => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(true)
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile})
		useAppStore.setState({wizardFilenameTemplate: template})

		await expect(useAppStore.getState().saveWizardAsProfile('Mine')).resolves.toBe(false)
		await expect(useAppStore.getState().updateWizardProfile()).resolves.toBe(false)
		expect(editedProfileDraft(useAppStore.getState(), 'Mine')).toBeNull()
		expect(saveDownloadProfile).not.toHaveBeenCalled()
	})

	// Saved before templates were checked: the profile may keep it, but a new
	// profile may not take it on.
	it("Save as refuses a profile's stored template that does not validate, while Update keeps it", async () => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(true)
		const typo: DownloadProfile = {...builtin('hd-1080'), filename: {kind: 'custom', template: '{titel}'}}
		useAppStore.setState({...profilePatch(typo, useAppStore.getState()), saveDownloadProfile})
		useAppStore.setState({wizardSponsorBlockMode: 'remove'})

		await expect(useAppStore.getState().saveWizardAsProfile('Mine')).resolves.toBe(false)
		expect(saveDownloadProfile).not.toHaveBeenCalled()
		await expect(useAppStore.getState().updateWizardProfile()).resolves.toBe(true)
		expect(saveDownloadProfile).toHaveBeenCalledWith(expect.objectContaining({id: 'hd-1080', filename: typo.filename}), false)
	})
})

describe('Review — changed from profile', () => {
	it('offers updating the profile or saving a new one', () => {
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), selectedVideoFormatId: '137', wizardWriteThumbnail: true})
		render(<StepReview />)
		expect(screen.getByTestId('review-update-profile')).toHaveAttribute('aria-label', expect.stringContaining('Full HD 1080p'))
		expect(screen.getByTestId('review-save-as-profile')).toBeTruthy()
	})

	it('a file name that does not validate disables Update and Save as, but not Undo', () => {
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), wizardFilenameTemplate: '{titel}'})
		render(<StepReview />)
		for (const id of ['review-update-profile', 'review-save-as-profile']) {
			expect(screen.getByTestId(id)).toHaveAttribute('aria-disabled', 'true')
			fireEvent.click(screen.getByTestId(id))
		}
		expect(screen.queryByTestId('update-profile-dialog')).toBeNull()
		expect(screen.queryByTestId('save-as-profile-dialog')).toBeNull()
		expect(screen.getByTestId('review-reset')).not.toHaveAttribute('aria-disabled', 'true')
	})

	it("a profile's stored template that does not validate disables only Save as", () => {
		useAppStore.setState(profilePatch({...builtin('hd-1080'), filename: {kind: 'custom', template: '{titel}'}}, useAppStore.getState()))
		useAppStore.setState({wizardSponsorBlockMode: 'remove'})
		render(<StepReview />)
		expect(screen.getByTestId('review-save-as-profile')).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByTestId('review-update-profile')).not.toHaveAttribute('aria-disabled', 'true')
	})

	it('Update shows what the profile will change, then saves into it', async () => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(true)
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile})
		useAppStore.setState({wizardWriteThumbnail: true})
		render(<StepReview />)

		fireEvent.click(screen.getByTestId('review-update-profile'))
		const row = screen.getByTestId('profile-diff-extras')
		// Only what changes: the extras the profile already has are not repeated.
		expect(row.textContent).toContain('+ Save thumbnail')
		expect(row.textContent).not.toContain('Embed chapters')
		expect(screen.queryByTestId('profile-diff-format')).toBeNull()

		fireEvent.click(screen.getByTestId('update-profile-confirm'))
		await waitFor(() => expect(saveDownloadProfile).toHaveBeenCalledWith(expect.objectContaining({id: 'hd-1080', embed: expect.objectContaining({thumbnailSidecar: true})}), false))
		await waitFor(() => expect(screen.queryByTestId('update-profile-dialog')).toBeNull())
	})
})

describe('Review — a profile write that fails', () => {
	it('is not reported as saved: the dialog stays open and the run still shows its changes', async () => {
		const saveDownloadProfile = vi.fn().mockResolvedValue(false)
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile})
		useAppStore.setState({wizardWriteThumbnail: true})
		render(<StepReview />)

		fireEvent.click(screen.getByTestId('review-update-profile'))
		fireEvent.click(screen.getByTestId('update-profile-confirm'))

		await waitFor(() => expect(saveDownloadProfile).toHaveBeenCalled())
		expect(screen.getByTestId('update-profile-dialog')).toBeTruthy()
		expect(wizardChangedAreas(useAppStore.getState())).toEqual(['extras'])
	})
})

// Returning users knew Subtitles, SponsorBlock, Output and Folder as separate
// steps; Review now holds them all on one page.
describe('Review — one-page callout', () => {
	function seedReview(common: Partial<AppSettings['common']>): ReturnType<typeof vi.fn> {
		const dismissReviewCallout = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), settings: {...SETTINGS, common: {...SETTINGS.common, ...common}}, dismissReviewCallout})
		return dismissReviewCallout
	}

	it('shows once to a user who has downloaded before', () => {
		seedReview({successfulDownloadCount: 3})
		render(<StepReview />)
		expect(screen.getByTestId('review-page-callout')).toBeTruthy()
	})

	it('stays hidden for a new user or after it was closed', () => {
		seedReview({successfulDownloadCount: 0})
		const {unmount} = render(<StepReview />)
		expect(screen.queryByTestId('review-page-callout')).toBeNull()
		unmount()
		seedReview({successfulDownloadCount: 3, reviewCalloutDismissed: true})
		render(<StepReview />)
		expect(screen.queryByTestId('review-page-callout')).toBeNull()
	})

	it('retires when closed or when the user opens a row', () => {
		const dismiss = seedReview({successfulDownloadCount: 3})
		const {unmount} = render(<StepReview />)
		fireEvent.click(screen.getByTestId('review-page-callout-dismiss'))
		expect(dismiss).toHaveBeenCalledOnce()
		unmount()
		const dismissOnRow = seedReview({successfulDownloadCount: 3})
		render(<StepReview />)
		fireEvent.click(screen.getByTestId('review-row-saveTo-toggle'))
		expect(dismissOnRow).toHaveBeenCalledOnce()
	})
})
