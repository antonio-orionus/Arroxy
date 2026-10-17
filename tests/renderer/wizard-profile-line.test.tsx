// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {WizardProfileLine} from '@renderer/components/wizard/format/WizardProfileLine.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {FormatOption} from '@shared/types.js'

const FORMATS: FormatOption[] = [
	{formatId: '248', label: '1080p vp9', ext: 'webm', resolution: '1920x1080', videoCodec: 'vp9', isVideoOnly: true, isAudioOnly: false},
	{formatId: '136', label: '720p h264', ext: 'mp4', resolution: '1280x720', videoCodec: 'avc1.4d401f', isVideoOnly: true, isAudioOnly: false},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', audioCodec: 'opus', abr: 160, isVideoOnly: false, isAudioOnly: true}
]

function builtin(id: string) {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(p => p.id === id)
	if (!profile) throw new Error(`no builtin ${id}`)
	return profile
}

const saveDownloadProfile = vi.fn()
const chooseWizardProfile = vi.fn()

beforeEach(() => {
	saveDownloadProfile.mockReset().mockResolvedValue(undefined)
	chooseWizardProfile.mockReset()
	useAppStore.setState({
		settings: defaultAppSettings('/downloads'),
		wizardMode: 'single',
		wizardFormats: FORMATS,
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardIsAudioOnlySource: false,
		wizardMediaKind: 'video',
		wizardOutputDir: '/downloads',
		wizardFitNotices: [],
		selectedVideoFormatId: '248',
		audioSelection: {kind: 'native', formatId: '251'}
	})
	useAppStore.setState({...profilePatch(builtin('hd-1080'), useAppStore.getState()), saveDownloadProfile, chooseWizardProfile})
})

async function saveFromEditor(): Promise<void> {
	fireEvent.click(screen.getByTestId('wizard-profile-edit'))
	fireEvent.click(await screen.findByRole('button', {name: 'Save profile'}))
	await waitFor(() => expect(saveDownloadProfile).toHaveBeenCalled())
}

describe('WizardProfileLine', () => {
	it("shows the download's profile as a button with a pencil beside it", () => {
		render(<WizardProfileLine />)

		expect(screen.getByTestId('wizard-profile-trigger')).toHaveTextContent('Full HD 1080p')
		expect(screen.getByTestId('wizard-profile-edit')).toHaveAccessibleName('Edit Full HD 1080p')
	})

	it('edits the profile in place, saves it without making it the app default, and re-applies it', async () => {
		render(<WizardProfileLine />)

		await saveFromEditor()

		expect(saveDownloadProfile).toHaveBeenCalledWith(expect.objectContaining({id: 'hd-1080'}), false)
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'hd-1080'})
	})

	it('asks before an edited profile replaces changes made to this download', async () => {
		useAppStore.setState({selectedVideoFormatId: '136'})
		render(<WizardProfileLine />)

		await saveFromEditor()

		expect(await screen.findByText('Use the updated profile?')).toBeInTheDocument()
		expect(chooseWizardProfile).not.toHaveBeenCalled()
		fireEvent.click(screen.getByRole('button', {name: 'Keep my changes'}))
		expect(chooseWizardProfile).not.toHaveBeenCalled()
	})

	it('opens the profile menu for this download only, with no way out to the Profiles tab', async () => {
		render(<WizardProfileLine />)

		fireEvent.click(screen.getByTestId('wizard-profile-trigger'))

		expect(await screen.findByText('For this download only. Your default profile stays as it is.')).toBeInTheDocument()
		expect(screen.getByTestId('wizard-profile-option-hd-1080')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.queryByRole('button', {name: 'Manage profiles'})).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('wizard-profile-option-balanced'))
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'balanced'})
	})
})
