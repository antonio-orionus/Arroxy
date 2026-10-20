// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {I18nextProvider} from 'react-i18next'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {DownloadProfileEditor} from '@renderer/components/wizard/DownloadProfileEditor.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {FILENAME_TOKENS} from '@shared/schemas.js'
import type {DownloadProfile} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {pseudoI18n, untranslatedWords} from '../shared/pseudoLocale.js'

// Every word the profile editor shows must come from the catalog (see pseudoLocale).

const COMMON_PATHS = {desktop: '/home/user/Desktop', documents: '/home/user/Documents', downloads: '/home/user/Downloads', home: '/home/user', music: '/home/user/Music', pictures: '/home/user/Pictures', videos: '/home/user/Videos'}
// The profile name and folders are the user's, filename tokens are template
// syntax, and subtitle languages show their code and their Intl display name.
const USER_DATA = ['Lecture rips', '~/Downloads/Lecture rips', '~/Downloads', '/mnt/archive/Lecture rips', '/mnt/archive', ...FILENAME_TOKENS.map(token => `{${token}}`), 'English', 'German', 'en', 'de']

function customProfile(builtinId: string, changes: Partial<DownloadProfile> = {}): DownloadProfile {
	const builtin = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === builtinId)
	if (!builtin) throw new Error(`expected the ${builtinId} profile`)
	return {...builtin, id: 'custom-lectures', name: 'Lecture rips', subfolder: {enabled: true, name: 'Lecture rips'}, ...changes}
}

async function renderEditor(profile: DownloadProfile, {globalDestination = '/home/user/Downloads'} = {}): Promise<HTMLElement> {
	const i18n = await pseudoI18n()
	render(
		<I18nextProvider i18n={i18n}>
			<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} globalDestination={globalDestination} commonPaths={COMMON_PATHS} onChangeGlobalDestination={() => undefined} resetProfile={{enabled: true, onReset: () => undefined}} />
		</I18nextProvider>
	)
	await screen.findByTestId('profiles-editor-dialog')
	return document.body
}

describe('profile editor copy', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		window.platform = 'linux'
		vi.clearAllMocks()
	})

	it('translates a video profile with its disclosures open', async () => {
		const body = await renderEditor(customProfile('mp4-1080'))
		fireEvent.click(screen.getByTestId('profiles-editor-video-advanced-toggle'))
		fireEvent.click(screen.getByTestId('profiles-editor-selection-order-toggle'))
		await screen.findByTestId('profiles-editor-selection-order-list')

		expect(untranslatedWords(body, USER_DATA)).toEqual([])
	})

	it.each([
		['a video profile', customProfile('balanced'), ['profiles-editor-video-resolution', 'profiles-editor-video-file-type', 'profiles-editor-video-codec', 'profiles-editor-hdr', 'profiles-editor-ai-upscaled', 'profiles-editor-native-audio', 'profiles-editor-subtitle-source']],
		['an audio profile', customProfile('audio-only', {media: {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}}}), ['profiles-editor-audio-format', 'profiles-editor-audio-quality']]
	])('translates the menus of %s', async (_case, profile, selects) => {
		const body = await renderEditor({...profile, subtitles: {...profile.subtitles, enabled: true, languages: ['en']}})
		if (profile.media.kind !== 'audio-only') fireEvent.click(screen.getByTestId('profiles-editor-video-advanced-toggle'))

		for (const select of selects) {
			fireEvent.click(await screen.findByTestId(select))
			await screen.findByRole('listbox')
			expect(untranslatedWords(body, USER_DATA), select).toEqual([])
			fireEvent.keyDown(screen.getByRole('listbox'), {key: 'Escape'})
			await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		}
	})

	it('translates the destination when no global destination is known yet', async () => {
		const body = await renderEditor(customProfile('balanced'), {globalDestination: ''})

		expect(untranslatedWords(body, USER_DATA)).toEqual([])
	})

	it('translates the destination of a profile with its own folder', async () => {
		const body = await renderEditor(customProfile('balanced', {output: {kind: 'fixed', dir: '/mnt/archive'}}))
		await waitFor(() => expect(screen.getByTestId('profiles-editor-final-destination')).toHaveTextContent('/mnt/archive/Lecture rips'))

		expect(untranslatedWords(body, USER_DATA)).toEqual([])
	})

	it('translates the override card while a folder is being chosen and the picker fails', async () => {
		vi.mocked(window.appApi.dialog.chooseFolder).mockRejectedValue(new Error('dialog unavailable'))
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		try {
			const body = await renderEditor(customProfile('balanced'))
			fireEvent.click(within(screen.getByTestId('profiles-editor-profile-override')).getByRole('button'))
			await waitFor(() => expect(consoleError).toHaveBeenCalled())

			expect(untranslatedWords(body, USER_DATA)).toEqual([])
		} finally {
			consoleError.mockRestore()
		}
	})

	it('translates an audio profile with subtitles, SponsorBlock and invalid fields', async () => {
		const audio = customProfile('audio-only')
		const body = await renderEditor({...audio, subtitles: {...audio.subtitles, enabled: true, languages: ['en', 'de']}, sponsorBlock: {mode: 'remove', categories: ['sponsor']}, filename: {kind: 'custom', template: '{nope}'}})
		fireEvent.change(screen.getByTestId('profiles-editor-subfolder-name'), {target: {value: '..'}})

		expect(untranslatedWords(body, USER_DATA)).toEqual([])
	})

	it('translates a subtitles-only profile', async () => {
		const body = await renderEditor(customProfile('subtitles-only'))

		expect(untranslatedWords(body, USER_DATA)).toEqual([])
	})
})
