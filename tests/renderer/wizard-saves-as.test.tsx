// @vitest-environment jsdom
import {fireEvent, render, screen} from '@testing-library/react'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {SavesAsControl} from '@renderer/components/wizard/format/SavesAsControl.js'
import {ProfileTag} from '@renderer/components/wizard/format/ProfileTag.js'
import {FitNotices} from '@renderer/components/wizard/format/FitNotices.js'
import {FormatFooterWarnings} from '@renderer/components/wizard/format/FormatFooterWarnings.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import {selectionOrder} from '@shared/selectionOrder.js'
import type {FormatOption} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const FORMATS: FormatOption[] = [
	{formatId: '248', label: '1080p vp9', ext: 'webm', resolution: '1920x1080', videoCodec: 'vp9', isVideoOnly: true, isAudioOnly: false},
	{formatId: '137', label: '1080p h264', ext: 'mp4', resolution: '1920x1080', videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', audioCodec: 'opus', abr: 160, isVideoOnly: false, isAudioOnly: true},
	{formatId: '140', label: 'm4a', ext: 'm4a', resolution: 'audio only', audioCodec: 'mp4a.40.2', abr: 130, isVideoOnly: false, isAudioOnly: true}
]

function builtin(id: string) {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(p => p.id === id)
	if (!profile) throw new Error(`no builtin ${id}`)
	return profile
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	useAppStore.setState({
		settings: defaultAppSettings('/downloads'),
		wizardMode: 'single',
		wizardFormats: FORMATS,
		wizardFormatSelection: selectionSourceFromOptions(FORMATS),
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardIsAudioOnlySource: false,
		wizardMediaKind: 'video',
		wizardSubtitleMode: 'sidecar',
		wizardEmbedThumbnail: false,
		wizardOutputDir: '/downloads',
		wizardFileType: 'auto',
		wizardFileTypeReset: null,
		wizardFitNotices: [],
		wizardSelectionOrder: null,
		wizardProfile: null,
		wizardProfileBaseline: null,
		selectedVideoFormatId: '248',
		audioSelection: {kind: 'native', formatId: '251'}
	})
})

describe('SavesAsControl', () => {
	it('shows the file the picked streams become and their codecs', () => {
		render(<SavesAsControl />)

		expect(screen.getByTestId('saves-as-trigger')).toHaveTextContent('.webm')
		expect(screen.getByTestId('saves-as-codecs')).toHaveTextContent('VP9 · Opus')
	})

	it('follows the pick: VP9 video with AAC audio is an .mkv', () => {
		useAppStore.setState({audioSelection: {kind: 'native', formatId: '140'}})
		render(<SavesAsControl />)

		expect(screen.getByTestId('saves-as-trigger')).toHaveTextContent('.mkv')
		expect(screen.getByTestId('saves-as-codecs')).toHaveTextContent('VP9 · AAC')
	})

	it('changes the file type for this download only', async () => {
		render(<SavesAsControl />)

		fireEvent.click(screen.getByTestId('saves-as-trigger'))
		fireEvent.click(await screen.findByTestId('saves-as-option-mp4'))

		expect(useAppStore.getState().wizardFileType).toBe('mp4')
		expect(screen.getByTestId('saves-as-trigger')).toHaveTextContent('MP4')
	})

	it('offers WebM only when the picked streams fit it, and says why not', async () => {
		useAppStore.setState({selectedVideoFormatId: '137'})
		render(<SavesAsControl />)

		fireEvent.click(screen.getByTestId('saves-as-trigger'))
		const webm = await screen.findByTestId('saves-as-option-webm')

		expect(webm).toHaveAttribute('aria-disabled', 'true')
		expect(webm).toHaveTextContent("WebM can't hold H.264. Choose MKV or MP4.")
		expect(screen.getByTestId('saves-as-option-mp4')).not.toHaveAttribute('aria-disabled', 'true')
	})

	it('marks the profile’s own file type in the menu', async () => {
		useAppStore.setState({...profilePatch({...builtin('hd-1080'), media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'mkv', audio: {native: {kind: 'default'}}}}, useAppStore.getState())})
		render(<SavesAsControl />)

		fireEvent.click(screen.getByTestId('saves-as-trigger'))

		expect(await screen.findByTestId('saves-as-option-mkv')).toHaveTextContent('MKV · Profile')
		expect(screen.getByTestId('saves-as-option-mp4')).not.toHaveTextContent('Profile')
	})

	it('says which file an audio download makes, with nothing to choose', () => {
		useAppStore.setState({wizardMediaKind: 'audio', selectedVideoFormatId: '', audioSelection: {kind: 'native', formatId: '251'}})
		render(<SavesAsControl />)

		// Audio mode extracts: a WebM's Opus lands as .opus.
		expect(screen.getByTestId('saves-as')).toHaveTextContent('Saves as.opus')
		expect(screen.queryByTestId('saves-as-trigger')).not.toBeInTheDocument()
	})

	it('names no file for audio whose codec only extraction finds out', () => {
		const hlsAudio: FormatOption = {formatId: '234', label: 'hls audio', ext: 'mp4', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true}
		useAppStore.setState({wizardMediaKind: 'audio', selectedVideoFormatId: '', wizardFormats: [...FORMATS, hlsAudio], audioSelection: {kind: 'native', formatId: '234'}})
		const {container} = render(<SavesAsControl />)

		// Extraction lands it as .m4a, .opus or .mp3 by the codec ffprobe finds: never .mp4.
		expect(container).toBeEmptyDOMElement()
	})

	it('is hidden for subtitles downloads', () => {
		useAppStore.setState({wizardMediaKind: 'subtitles', selectedVideoFormatId: ''})
		const {container} = render(<SavesAsControl />)

		expect(container).toBeEmptyDOMElement()
	})
})

describe('store rule: the newer action wins', () => {
	it('picking a stream WebM cannot hold sends the file type back to Auto and says why', () => {
		useAppStore.setState({wizardFileType: 'webm'})

		useAppStore.getState().setSelectedVideoFormatId('137')

		const state = useAppStore.getState()
		expect(state.selectedVideoFormatId).toBe('137')
		expect(state.wizardFileType).toBe('auto')
		expect(state.wizardFileTypeReset).toEqual({from: 'webm', blocker: 'H.264'})
	})

	it('picking audio WebM cannot hold does the same, and keeps the audio the user picked', () => {
		useAppStore.setState({wizardFileType: 'webm'})

		useAppStore.getState().setAudioSelection({kind: 'native', formatId: '140'})

		const state = useAppStore.getState()
		expect(state.audioSelection).toEqual({kind: 'native', formatId: '140'})
		expect(state.wizardFileType).toBe('auto')
		expect(state.wizardFileTypeReset?.blocker).toBe('AAC')
	})

	it('leaves other file types and a fitting pick alone', () => {
		useAppStore.setState({wizardFileType: 'mp4'})
		useAppStore.getState().setSelectedVideoFormatId('137')
		expect(useAppStore.getState().wizardFileType).toBe('mp4')

		useAppStore.setState({wizardFileType: 'webm', selectedVideoFormatId: '137'})
		useAppStore.getState().setSelectedVideoFormatId('248')
		expect(useAppStore.getState().wizardFileType).toBe('webm')
		expect(useAppStore.getState().wizardFileTypeReset).toBeNull()
	})

	it('choosing a file type clears the explanation of the last reset', () => {
		useAppStore.setState({wizardFileType: 'auto', wizardFileTypeReset: {from: 'webm', blocker: 'H.264'}})

		useAppStore.getState().setWizardFileType('mkv')

		expect(useAppStore.getState().wizardFileTypeReset).toBeNull()
	})

	it('the reset is shown with the fit notices', () => {
		useAppStore.setState({wizardFileTypeReset: {from: 'webm', blocker: 'H.264'}})
		render(<FitNotices />)

		expect(screen.getByTestId('file-type-reset-notice')).toHaveTextContent("WebM can't hold H.264, so the file type went back to Auto.")
	})
})

describe('FitNotices: missing subtitle languages', () => {
	afterEach(async () => {
		await i18next.changeLanguage('en')
	})

	it('names them mid-sentence in the UI language, lowercase as CLDR writes them', async () => {
		await i18next.changeLanguage('ru')
		useAppStore.setState({wizardFitNotices: [{kind: 'subtitle-languages-missing', languages: ['de', 'en-orig']}]})
		render(<FitNotices />)

		expect(screen.getByTestId('fit-notice-subtitle-languages-missing')).toHaveTextContent('немецкий и английский.')
	})
})

describe('ProfileTag: why this one', () => {
	it('explains the pick with the ranks that made it', async () => {
		useAppStore.setState({wizardSelectionOrder: selectionOrder({kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}}, 'compatible')})
		render(<ProfileTag />)

		fireEvent.focus(screen.getByTestId('profile-pick-tag'))
		const why = await screen.findByTestId('profile-pick-why')

		expect(why).toHaveTextContent('Why the profile picked this')
		expect(why).toHaveTextContent('H.264 video')
		expect(why).toHaveTextContent('Up to 1080p')
		expect(why).toHaveTextContent('AAC audio')
	})

	it("carries the chips' dot and points at them while hovered", () => {
		useAppStore.setState({wizardSelectionOrder: selectionOrder({kind: 'video-audio', goal: 'best-picture', tier: 'best', fileType: 'auto', audio: {native: {kind: 'default'}}}, 'compatible')})
		render(<ProfileTag />)

		const tag = screen.getByTestId('profile-pick-tag')
		expect(tag.querySelector('[data-slot="profile-dot"]')).not.toBeNull()
		expect(tag).toHaveAttribute('data-profile-why')
	})

	it('is a plain badge while no order is known', () => {
		render(<ProfileTag closest />)

		const tag = screen.getByTestId('profile-pick-tag')
		expect(tag).toHaveTextContent('Closest to profile')
		expect(tag).not.toHaveAttribute('tabindex')
		expect(tag).not.toHaveAttribute('data-profile-why')
		expect(tag.querySelector('[data-slot="profile-dot"]')).not.toBeNull()
	})
})

describe('MP4 playback caveat', () => {
	const originalPlatform = window.platform
	// The warnings name QuickTime, so they show on a Mac only. jsdom has no
	// Media Capabilities API, which reads as a Mac without AV1 hardware.
	beforeEach(() => {
		window.platform = 'darwin'
	})
	afterEach(() => {
		window.platform = originalPlatform
	})

	function showSummary(): void {
		render(<FormatFooterWarnings />)
	}

	it('warns in the Format footer when an MP4 holds VP9 and Opus', () => {
		useAppStore.setState({wizardFileType: 'mp4'})
		showSummary()

		expect(screen.getByTestId('summary-mp4-caveat')).toHaveTextContent("VP9 in an MP4 won't play video in QuickTime. H.264 plays everywhere.")
	})

	it('says nothing for Opus audio in an MP4 with H.264 video', () => {
		useAppStore.setState({wizardFileType: 'mp4', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '251'}})
		showSummary()

		expect(screen.queryByTestId('summary-mp4-caveat')).not.toBeInTheDocument()
	})

	it('says nothing for the safe pair, H.264 with AAC', () => {
		useAppStore.setState({wizardFileType: 'mp4', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}})
		showSummary()

		expect(screen.queryByTestId('summary-mp4-caveat')).not.toBeInTheDocument()
	})

	it('says nothing when the file is not an MP4', () => {
		useAppStore.setState({wizardFileType: 'mkv'})
		showSummary()

		expect(screen.queryByTestId('summary-mp4-caveat')).not.toBeInTheDocument()
	})

	it('says nothing when embedded subtitles turn the file into an MKV', () => {
		useAppStore.setState({wizardFileType: 'mp4', wizardSubtitleMode: 'embed', wizardSubtitleLanguages: ['en']})
		showSummary()

		expect(screen.queryByTestId('summary-mp4-caveat')).not.toBeInTheDocument()
	})

	it('also follows an Auto file type that ends as an MP4 with AV1', async () => {
		useAppStore.setState({wizardFormats: [{formatId: '399', label: '1080p av1', ext: 'mp4', resolution: '1920x1080', videoCodec: 'av01.0.08M.08', isVideoOnly: true, isAudioOnly: false}, FORMATS[3]], selectedVideoFormatId: '399', audioSelection: {kind: 'native', formatId: '140'}, wizardFileType: 'auto'})
		showSummary()

		expect(await screen.findByTestId('summary-mp4-caveat')).toHaveTextContent('AV1 in an MP4 needs a recent Mac to play in QuickTime. H.264 plays everywhere.')
	})

	it('says nothing on Windows or Linux, which have no QuickTime', () => {
		useAppStore.setState({wizardFileType: 'mp4'})
		window.platform = 'win32'
		showSummary()

		expect(screen.queryByTestId('summary-mp4-caveat')).not.toBeInTheDocument()
	})
})
