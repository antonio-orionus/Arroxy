// @vitest-environment jsdom
import {fireEvent, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {SavesAsControl} from '@renderer/components/wizard/format/SavesAsControl.js'
import {ProfileTag} from '@renderer/components/wizard/format/ProfileTag.js'
import {FitNotices} from '@renderer/components/wizard/format/FitNotices.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import {selectionOrder} from '@shared/selectionOrder.js'
import type {FormatOption} from '@shared/types.js'

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
	useAppStore.setState({
		settings: defaultAppSettings('/downloads'),
		wizardMode: 'single',
		wizardFormats: FORMATS,
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

	it('is hidden for audio and subtitles downloads', () => {
		useAppStore.setState({wizardMediaKind: 'audio', selectedVideoFormatId: ''})
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

	it('is a plain badge while no order is known', () => {
		render(<ProfileTag closest />)

		expect(screen.getByTestId('profile-pick-tag')).toHaveTextContent('Closest to profile')
		expect(screen.getByTestId('profile-pick-tag')).not.toHaveAttribute('tabindex')
	})
})
