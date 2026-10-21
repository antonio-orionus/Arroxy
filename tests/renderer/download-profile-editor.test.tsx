// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import {DownloadProfileEditor} from '@renderer/components/wizard/DownloadProfileEditor.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {fail, ok} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {i18next} from '@shared/i18n/index.js'

const LINUX_COMMON_PATHS = {desktop: '/home/user/Desktop', documents: '/home/user/Documents', downloads: '/home/user/Downloads', home: '/home/user', music: '/home/user/Music', pictures: '/home/user/Pictures', videos: '/home/user/Videos'}

describe('DownloadProfileEditor', () => {
	it('marks the Best picture goal for best native video profiles', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-goal-best-picture')).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByTestId('profiles-editor-video-goal-smart-tv')).toHaveAttribute('aria-pressed', 'false')
		expect(screen.getByTestId('profiles-editor-video-goal-best-picture')).toHaveTextContent('Best picture')
		expect(screen.getByTestId('profiles-editor-video-goal-best-picture')).toHaveTextContent('AV1 · VP9')
		expect(screen.queryByTestId('profiles-editor-audio-format')).not.toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-audio-quality')).not.toBeInTheDocument()
	})

	it('starts a new profile with an empty name and its fallback as the hint', async () => {
		render(<DownloadProfileEditor initialProfile={null} open onOpenChange={() => undefined} />)
		const name = await screen.findByTestId('profiles-editor-name')
		expect(name).toHaveValue('')
		expect(name).toHaveAttribute('placeholder', 'New profile')
	})

	it('saves an unnamed new profile under the fallback name, with subtitles in the app language', async () => {
		i18next.addResource('he', 'translation', 'wizard.profileEditor.defaultName', 'פרופיל חדש')
		await i18next.changeLanguage('he')
		try {
			const onSave = vi.fn()
			render(<DownloadProfileEditor initialProfile={null} open onOpenChange={() => undefined} onSave={onSave} />)
			fireEvent.click(await screen.findByRole('button', {name: i18next.t('wizard.profileEditor.action.save')}))

			await waitFor(() => expect(onSave).toHaveBeenCalled())
			expect(onSave.mock.calls[0]?.[0]).toMatchObject({name: 'פרופיל חדש', subtitles: {languages: ['iw']}})
		} finally {
			await i18next.changeLanguage('en')
		}
	})

	it('does not render profile-specific playlist cap controls', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-goal')).toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-playlist-cap')).not.toBeInTheDocument()
		expect(screen.queryByText('Playlist probe cap')).not.toBeInTheDocument()
	})

	it('shows the Smart TV goal with its tag and keeps WebM out of reach', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		const card = await screen.findByTestId('profiles-editor-video-goal-smart-tv')
		expect(card).toHaveAttribute('aria-pressed', 'true')
		expect(card).toHaveTextContent('Smart TV')
		expect(card).toHaveTextContent('MP4 · H.264')

		fireEvent.click(screen.getByTestId('profiles-editor-video-advanced-toggle'))
		expect(await screen.findByTestId('profiles-editor-video-file-type')).toHaveTextContent('Auto')
		expect(screen.getByTestId('profiles-editor-video-advanced')).toHaveTextContent("WebM isn't offered with Smart TV: it can't hold H.264.")
		fireEvent.click(screen.getByTestId('profiles-editor-video-file-type'))
		expect(await screen.findByTestId('profiles-editor-video-file-type-option-webm')).toHaveAttribute('aria-disabled', 'true')
	})

	it('limits Smart TV H.264 MP4 profile resolution choices to 1080p and below', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-resolution')).toHaveTextContent('Up to 1080p')
		fireEvent.click(screen.getByTestId('profiles-editor-video-resolution'))

		expect(await screen.findByTestId('profiles-editor-video-resolution-option-1080')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-720')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-480')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-360')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-240')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-144')).toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-video-resolution-option-best')).not.toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-video-resolution-option-1440')).not.toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-video-resolution-option-2160')).not.toBeInTheDocument()
	})

	it('offers low-data resolutions for best native video profiles', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-resolution'))

		expect(await screen.findByTestId('profiles-editor-video-resolution-option-240')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-144')).toBeInTheDocument()
	})

	it('sends the file type back to Auto when the goal becomes Smart TV', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-advanced-toggle'))
		fireEvent.click(await screen.findByTestId('profiles-editor-video-file-type'))
		fireEvent.click(await screen.findByTestId('profiles-editor-video-file-type-option-webm'))
		expect(screen.getByTestId('profiles-editor-video-file-type')).toHaveTextContent('WebM')

		fireEvent.click(screen.getByTestId('profiles-editor-video-goal-smart-tv'))
		expect(screen.getByTestId('profiles-editor-video-file-type')).toHaveTextContent('Auto')
	})

	it('saves the chosen file type and native audio override', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} globalNativeAudioPreference="surround" />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-advanced-toggle'))
		expect(await screen.findByTestId('profiles-editor-native-audio')).toHaveTextContent('Use app setting (Prefer surround / Dolby)')
		fireEvent.click(screen.getByTestId('profiles-editor-video-file-type'))
		fireEvent.click(await screen.findByTestId('profiles-editor-video-file-type-option-mp4'))
		fireEvent.click(screen.getByTestId('profiles-editor-native-audio'))
		fireEvent.click(await screen.findByTestId('profiles-editor-native-audio-option-compatible'))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({media: {kind: 'video-audio', goal: 'best-picture', tier: '1440', fileType: 'mp4', audio: {native: {kind: 'custom', preference: 'compatible'}}}}))
		})
	})

	it('offers an HDR video override and names what the app setting means', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} globalHdrSetting="hdr" />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-advanced-toggle'))
		expect(await screen.findByTestId('profiles-editor-hdr')).toHaveTextContent('Use app setting (HDR)')
		expect(screen.getByTestId('profiles-editor-video-advanced')).toHaveTextContent('HDR looks washed out on regular screens.')
		fireEvent.click(screen.getByTestId('profiles-editor-hdr'))
		fireEvent.click(await screen.findByTestId('profiles-editor-hdr-option-sdr'))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({media: expect.objectContaining({hdr: {kind: 'custom', preference: 'sdr'}})}))
		})
	})

	it('names Auto as the app setting by default, and lists the screen as the reason', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-advanced-toggle'))
		expect(await screen.findByTestId('profiles-editor-hdr')).toHaveTextContent('Use app setting (Auto)')
		fireEvent.click(screen.getByTestId('profiles-editor-selection-order-toggle'))
		// Auto reads the screen; this test window has none that shows HDR.
		expect(await screen.findByTestId('profiles-editor-selection-order-list')).toHaveTextContent("SDR before HDR · this screen isn't HDR")
	})

	it('opens Advanced and the pick order as disclosures that point at their panels', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		for (const [toggleId, panelId] of [
			['profiles-editor-video-advanced-toggle', 'profiles-editor-video-advanced'],
			['profiles-editor-selection-order-toggle', 'profiles-editor-selection-order-list']
		] as const) {
			const toggle = await screen.findByTestId(toggleId)
			expect(toggle).toHaveAttribute('aria-expanded', 'false')
			expect(screen.queryByTestId(panelId)).toBeNull()

			fireEvent.click(toggle)
			expect(toggle).toHaveAttribute('aria-expanded', 'true')
			expect(document.getElementById(toggle.getAttribute('aria-controls') ?? '')).toContainElement(screen.getByTestId(panelId))

			fireEvent.click(toggle)
			expect(toggle).toHaveAttribute('aria-expanded', 'false')
			await waitFor(() => expect(screen.queryByTestId(panelId)).toBeNull())
		}
	})

	it('stores no HDR choice while the profile follows the app setting', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		fireEvent.click(await screen.findByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalled()
		})
		expect(onSave.mock.calls[0]?.[0].media).not.toHaveProperty('hdr')
	})

	it('saves a preferred video codec and lists it in how the profile picks', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-advanced-toggle'))
		expect(await screen.findByTestId('profiles-editor-video-codec')).toHaveTextContent('Auto')
		fireEvent.click(screen.getByTestId('profiles-editor-video-codec'))
		fireEvent.click(await screen.findByTestId('profiles-editor-video-codec-option-h264'))
		fireEvent.click(screen.getByTestId('profiles-editor-video-file-type'))
		expect(await screen.findByTestId('profiles-editor-video-file-type-option-webm')).toHaveAttribute('aria-disabled', 'true')
		fireEvent.click(screen.getByTestId('profiles-editor-selection-order-toggle'))
		expect(await screen.findByTestId('profiles-editor-selection-order-list')).toHaveTextContent("H.264, then VP9, then AV1 · this profile's codec")
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({media: expect.objectContaining({videoCodec: 'h264'})}))
		})
	})

	it('keeps the video codec on Auto for Smart TV, which always takes H.264', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-advanced-toggle'))
		expect(await screen.findByTestId('profiles-editor-video-codec')).toBeDisabled()
		expect(screen.getByTestId('profiles-editor-video-advanced')).toHaveTextContent('Smart TV always takes H.264.')
	})

	it('says SDR is first in the list of how the profile picks', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} globalHdrSetting="sdr" />)

		fireEvent.click(await screen.findByTestId('profiles-editor-selection-order-toggle'))
		expect(await screen.findByTestId('profiles-editor-selection-order-list')).toHaveTextContent('SDR before HDR · looks right on any screen')
	})

	it('lists how the profile picks, with the app setting named as the audio source', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-720')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-selection-order')).toHaveTextContent('Up to 720p · plays on any device')
		expect(screen.queryByTestId('profiles-editor-selection-order-list')).not.toBeInTheDocument()
		fireEvent.click(screen.getByTestId('profiles-editor-selection-order-toggle'))
		const list = await screen.findByTestId('profiles-editor-selection-order-list')
		expect(list).toHaveTextContent('H.264 video')
		expect(list).toHaveTextContent('Up to 720p')
		expect(list).toHaveTextContent('AAC audio')
		expect(list).not.toHaveTextContent('AV1, then VP9')
	})

	it('adds subtitle languages by searching their name', async () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(balanced).toBeDefined()
		const profile: DownloadProfile = {...balanced!, subtitles: {enabled: true, languages: ['en'], source: 'manual-first', mode: 'sidecar', format: 'srt'}}
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		expect(await screen.findByTestId('profiles-editor-subtitle-languages')).toHaveTextContent('English')
		// Base UI only opens the list for input events that carry an `inputType`
		// (it ignores autofill), which jsdom's change events lack.
		fireEvent.input(screen.getByLabelText('Languages'), {target: {value: 'russian'}, inputType: 'insertText'})
		fireEvent.click(await screen.findByTestId('profiles-editor-subtitle-language-option-ru'))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({subtitles: expect.objectContaining({languages: ['en', 'ru']})}))
		})
	})

	it('blocks saving while subtitles are on without any language', async () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(balanced).toBeDefined()
		const profile: DownloadProfile = {...balanced!, subtitles: {enabled: true, languages: ['en'], source: 'manual-first', mode: 'sidecar', format: 'srt'}}
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		fireEvent.click(await screen.findByRole('button', {name: 'Remove English'}))
		expect(await screen.findByText('Choose at least one language, or turn subtitle downloads off.')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Save profile'})).toBeDisabled()

		fireEvent.input(screen.getByLabelText('Languages'), {target: {value: 'uk'}, inputType: 'insertText'})
		fireEvent.click(await screen.findByTestId('profiles-editor-subtitle-language-option-uk'))
		expect(screen.queryByText('Choose at least one language, or turn subtitle downloads off.')).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({subtitles: expect.objectContaining({languages: ['uk']})}))
		})
	})

	it('turns subtitle downloads on and off with a switch, and keeps it on for a subtitles-only profile', async () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(balanced).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()
		const {unmount} = render(<DownloadProfileEditor initialProfile={balanced} open onOpenChange={() => undefined} onSave={onSave} />)

		const toggle = await screen.findByRole('switch', {name: 'Subtitle downloads'})
		expect(toggle).toHaveAttribute('aria-checked', 'false')
		fireEvent.click(toggle)
		expect(toggle).toHaveAttribute('aria-checked', 'true')
		expect(await screen.findByLabelText('Languages')).toBeInTheDocument()
		fireEvent.click(toggle)
		expect(toggle).toHaveAttribute('aria-checked', 'false')
		unmount()

		const subtitlesOnly = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'subtitles-only')
		expect(subtitlesOnly).toBeDefined()
		render(<DownloadProfileEditor initialProfile={subtitlesOnly} open onOpenChange={() => undefined} />)
		const locked = await screen.findByRole('switch', {name: 'Subtitle downloads'})
		expect(locked).toHaveAttribute('aria-checked', 'true')
		expect(locked).toHaveAttribute('aria-disabled', 'true')
	})

	it('saves WAV audio-only profiles without a bitrate', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'audio-only')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-audio-format'))
		fireEvent.click(await screen.findByTestId('profiles-editor-audio-format-option-wav'))

		expect(screen.getByTestId('profiles-editor-audio-quality')).toBeDisabled()

		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({media: {kind: 'audio-only', audio: {format: 'wav'}}}))
		})
	})

	it('offers thumbnail embedding only for media that can hold cover art, and saves it', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'audio-only')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		// "Best" audio keeps the source's own file where it is already a common
		// audio one (WAV, AIFF, WMA), which yt-dlp cannot embed into, so it offers no cover.
		await screen.findByTestId('profiles-editor-audio-format')
		expect(screen.queryByTestId('profiles-editor-embed-thumbnail')).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('profiles-editor-audio-format'))
		fireEvent.click(await screen.findByTestId('profiles-editor-audio-format-option-mp3'))
		fireEvent.click(await screen.findByTestId('profiles-editor-embed-thumbnail'))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({media: expect.objectContaining({kind: 'audio-only', audio: expect.objectContaining({format: 'mp3'})}), embed: expect.objectContaining({thumbnail: true})}))
		})
	})

	it('picks SponsorBlock categories once a mode is on, and saves them', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		expect(await screen.findByText('Mark as chapters')).toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-sb-cat-outro')).not.toBeInTheDocument()
		fireEvent.click(screen.getByText('Mark as chapters'))
		fireEvent.click(await screen.findByTestId('profiles-editor-sb-cat-outro'))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({sponsorBlock: {mode: 'mark', categories: expect.arrayContaining(['outro'])}}))
		})
	})

	it('edits the explicit profile subfolder instead of deriving it silently on save', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		const input = await screen.findByTestId('profiles-editor-subfolder-name')
		expect(input).toHaveValue('Smart TV MP4 Full HD 1080p')

		fireEvent.change(input, {target: {value: 'MP4 videos'}})
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({subfolder: {enabled: true, name: 'MP4 videos'}}))
		})
	})

	it('shows inherited global destination and keeps the profile output on default', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const onChangeGlobalDestination = vi.fn()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} globalDestination="/home/user/Downloads" commonPaths={LINUX_COMMON_PATHS} onChangeGlobalDestination={onChangeGlobalDestination} />)

		expect(await screen.findByTestId('profiles-editor-global-destination')).toHaveTextContent('Global destination')
		expect(screen.getByTestId('profiles-editor-global-destination')).toHaveTextContent('~/Downloads')
		expect(screen.getByTestId('profiles-editor-global-destination')).toHaveTextContent('Active')
		expect(screen.getByTestId('profiles-editor-profile-override')).toHaveTextContent('No override set')
		expect(screen.getByTestId('profiles-editor-final-destination')).toHaveTextContent('~/Downloads/Balanced 720p')

		fireEvent.click(screen.getByRole('button', {name: 'Change global destination'}))
		expect(onChangeGlobalDestination).toHaveBeenCalled()

		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({output: {kind: 'default'}}))
		})
	})

	it('shows a recoverable error when changing the global destination fails', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const onChangeGlobalDestination = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('dialog unavailable'))
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

		try {
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} globalDestination="/home/user/Downloads" commonPaths={LINUX_COMMON_PATHS} onChangeGlobalDestination={onChangeGlobalDestination} />)

			fireEvent.click(screen.getByRole('button', {name: 'Change global destination'}))

			expect(await screen.findByText('Could not change global destination.')).toBeInTheDocument()
			expect(onChangeGlobalDestination).toHaveBeenCalled()
		} finally {
			consoleError.mockRestore()
		}
	})

	it('keeps the editor open and shows a recoverable error when saving fails', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const onOpenChange = vi.fn()
		const onSave = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('settings write failed'))
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

		try {
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={onOpenChange} onSave={onSave} />)

			fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

			expect(await screen.findByText('Could not save profile settings.')).toBeInTheDocument()
			expect(onSave).toHaveBeenCalled()
			expect(onOpenChange).not.toHaveBeenCalled()
		} finally {
			consoleError.mockRestore()
		}
	})

	it('chooses and clears a profile-specific destination override', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const api = buildMockAppApi()
		vi.mocked(api.dialog.chooseFolder).mockResolvedValue(ok({path: '/mnt/archive'}))
		window.appApi = api
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} globalDestination="/home/user/Downloads" commonPaths={LINUX_COMMON_PATHS} />)

		fireEvent.click(screen.getByRole('button', {name: 'Set profile override'}))

		const destination = await screen.findByLabelText('Profile override path')
		await waitFor(() => {
			expect(destination).toHaveValue('/mnt/archive')
		})
		expect(api.dialog.chooseFolder).toHaveBeenCalledWith(undefined)
		expect(screen.getByTestId('profiles-editor-profile-override')).toHaveTextContent('Overrides global')
		expect(screen.getByTestId('profiles-editor-final-destination')).toHaveTextContent('/mnt/archive/Balanced 720p')

		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({output: {kind: 'fixed', dir: '/mnt/archive'}}))
		})

		fireEvent.click(screen.getByRole('button', {name: 'Use global default'}))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({output: {kind: 'default'}}))
		})
	})

	it('shows a recoverable error when the native folder dialog fails', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const api = buildMockAppApi()
		vi.mocked(api.dialog.chooseFolder).mockRejectedValue(new Error('dialog unavailable'))
		window.appApi = api
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

		try {
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

			fireEvent.click(screen.getByRole('button', {name: 'Set profile override'}))

			expect(await screen.findByText('Could not open folder picker. Enter a path manually.')).toBeInTheDocument()
			fireEvent.change(screen.getByLabelText('Profile override path'), {target: {value: 'D:\\Videos'}})
			expect(screen.queryByText('Could not open folder picker. Enter a path manually.')).not.toBeInTheDocument()
		} finally {
			consoleError.mockRestore()
		}
	})

	it('shows the folder picker error when the dialog reports a failure, and stays quiet on cancel', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()
		const api = buildMockAppApi()
		vi.mocked(api.dialog.chooseFolder)
			.mockResolvedValueOnce(ok({path: null}))
			.mockResolvedValueOnce(fail({code: 'unknown', message: 'dialog unavailable'}))
		window.appApi = api
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

		try {
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

			fireEvent.click(screen.getByRole('button', {name: 'Set profile override'}))
			await waitFor(() => expect(api.dialog.chooseFolder).toHaveBeenCalledTimes(1))
			expect(screen.queryByText('Could not open folder picker. Enter a path manually.')).not.toBeInTheDocument()

			fireEvent.click(screen.getByRole('button', {name: 'Choose destination folder'}))
			expect(await screen.findByText('Could not open folder picker. Enter a path manually.')).toBeInTheDocument()
		} finally {
			consoleError.mockRestore()
		}
	})

	it('resets a modified built-in profile through the editor footer', async () => {
		const profile = {...BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')!, name: 'Balanced Custom'}
		const onReset = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
		const onOpenChange = vi.fn()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={onOpenChange} resetProfile={{enabled: true, onReset}} />)

		fireEvent.click(screen.getByRole('button', {name: 'Reset profile'}))

		await waitFor(() => {
			expect(onReset).toHaveBeenCalled()
			expect(onOpenChange).toHaveBeenCalledWith(false)
		})
	})

	it('shows a recoverable error when resetting a profile fails', async () => {
		const profile = {...BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')!, name: 'Balanced Custom'}
		const onReset = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('reset unavailable'))
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

		try {
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} resetProfile={{enabled: true, onReset}} />)

			fireEvent.click(screen.getByRole('button', {name: 'Reset profile'}))

			expect(await screen.findByText('Could not reset profile settings.')).toBeInTheDocument()
			expect(onReset).toHaveBeenCalled()
		} finally {
			consoleError.mockRestore()
		}
	})
})
