// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {FormatProfileCallout} from '@renderer/components/wizard/format/FormatProfileCallout.js'
import {WizardProfileLine} from '@renderer/components/wizard/format/WizardProfileLine.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {profilePatch} from '@renderer/store/wizard/wizardProfileState.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {FormatOption} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

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

function seedSettings(common: Record<string, unknown>) {
	const base = defaultAppSettings('/downloads')
	return {...base, common: {...base.common, ...common}}
}

const saveDownloadProfile = vi.fn()
const chooseWizardProfile = vi.fn()

beforeEach(() => {
	saveDownloadProfile.mockReset().mockResolvedValue(true)
	chooseWizardProfile.mockReset()
	window.appApi = buildMockAppApi()
	useAppStore.setState({
		settings: seedSettings({formatProfileCalloutDismissed: true}),
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
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'hd-1080'}, false)
	})

	it('asks whether to keep edits beyond the streams, naming them, before an edited profile is applied', async () => {
		useAppStore.setState({wizardWriteThumbnail: true})
		render(<WizardProfileLine />)

		await saveFromEditor()

		expect(await screen.findByText('Use the updated profile?')).toBeInTheDocument()
		expect(screen.getByTestId('wizard-profile-switch-dialog').textContent).toContain('You changed extras')
		expect(chooseWizardProfile).not.toHaveBeenCalled()
		fireEvent.click(screen.getByTestId('wizard-profile-switch-keep'))
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'hd-1080'}, true)
	})

	it('resets every edit when asked to', async () => {
		useAppStore.setState({wizardWriteThumbnail: true})
		render(<WizardProfileLine />)

		await saveFromEditor()

		fireEvent.click(await screen.findByTestId('wizard-profile-switch-reset'))
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'hd-1080'}, false)
	})

	// The question is an alert dialog: a stray click outside cannot answer it,
	// and Escape leaves the profile as it is.
	it('asks in an alert dialog that Escape dismisses without applying the profile', async () => {
		useAppStore.setState({wizardWriteThumbnail: true})
		render(<WizardProfileLine />)

		await saveFromEditor()

		const dialog = await screen.findByRole('alertdialog', {name: 'Use the updated profile?'})
		expect(dialog).toBe(screen.getByTestId('wizard-profile-switch-dialog'))
		fireEvent.keyDown(dialog, {key: 'Escape'})
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		expect(chooseWizardProfile).not.toHaveBeenCalled()
	})

	it('applies a profile straight away when only the streams were changed: picking them is what a profile does', async () => {
		useAppStore.setState({selectedVideoFormatId: '136'})
		render(<WizardProfileLine />)

		await saveFromEditor()

		expect(screen.queryByTestId('wizard-profile-switch-dialog')).toBeNull()
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'hd-1080'}, false)
	})

	it('opens the profile menu for this download only, with no way out to the Profiles tab', async () => {
		render(<WizardProfileLine />)

		fireEvent.click(screen.getByTestId('wizard-profile-trigger'))

		expect(await screen.findByText('For this download only. Your default profile stays as it is.')).toBeInTheDocument()
		expect(screen.getByTestId('wizard-profile-option-hd-1080')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.queryByRole('button', {name: 'Manage profiles'})).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('wizard-profile-option-balanced'))
		expect(chooseWizardProfile).toHaveBeenCalledWith({kind: 'builtin', id: 'balanced'}, false)
	})

	it('lets Cancel back out of switching profiles', async () => {
		useAppStore.setState({wizardWriteThumbnail: true})
		render(<WizardProfileLine />)

		fireEvent.click(screen.getByTestId('wizard-profile-trigger'))
		fireEvent.click(await screen.findByTestId('wizard-profile-option-balanced'))

		const dialog = await screen.findByRole('alertdialog')
		const cancel = within(dialog).getByTestId('wizard-profile-switch-cancel')
		expect(cancel).toHaveAccessibleName('Cancel')
		fireEvent.click(cancel)
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		expect(chooseWizardProfile).not.toHaveBeenCalled()
	})
})

describe('One-time profile callout on the Format step', () => {
	const update = vi.fn((patch: {common?: Record<string, unknown>}) => Promise.resolve({ok: true as const, data: seedSettings(patch.common ?? {})}))

	beforeEach(() => {
		update.mockClear()
		window.appApi = {settings: {update}, intake: {setWindowContext: vi.fn().mockResolvedValue({ok: true, data: undefined})}} as unknown as typeof window.appApi
		useAppStore.setState({settings: seedSettings({})})
	})

	function renderLine(): void {
		render(
			<>
				<FormatProfileCallout />
				<WizardProfileLine />
			</>
		)
	}

	it('explains that the profile picks the formats, until closed', async () => {
		renderLine()
		expect(screen.getByTestId('format-profile-callout')).toBeInTheDocument()

		fireEvent.click(screen.getByTestId('format-profile-callout-dismiss'))

		await waitFor(() => expect(update).toHaveBeenCalledWith({common: {formatProfileCalloutDismissed: true}}))
		expect(screen.queryByTestId('format-profile-callout')).toBeNull()
	})

	it('never shows once dismissed', () => {
		useAppStore.setState({settings: seedSettings({formatProfileCalloutDismissed: true})})
		renderLine()
		expect(screen.queryByTestId('format-profile-callout')).toBeNull()
	})

	it('counts opening the profile menu as having seen it', async () => {
		renderLine()
		fireEvent.click(screen.getByTestId('wizard-profile-trigger'))

		await waitFor(() => expect(update).toHaveBeenCalledWith({common: {formatProfileCalloutDismissed: true}}))
		expect(screen.queryByTestId('format-profile-callout')).toBeNull()
	})

	it('counts the pencil as having seen it', async () => {
		renderLine()
		fireEvent.click(screen.getByTestId('wizard-profile-edit'))

		await waitFor(() => expect(update).toHaveBeenCalledWith({common: {formatProfileCalloutDismissed: true}}))
		expect(screen.queryByTestId('format-profile-callout')).toBeNull()
	})
})
