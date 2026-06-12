// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {DownloadProfileEditor} from '@renderer/components/wizard/DownloadProfileEditor.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {ok} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const LINUX_COMMON_PATHS = {desktop: '/home/user/Desktop', documents: '/home/user/Documents', downloads: '/home/user/Downloads', home: '/home/user', music: '/home/user/Music', pictures: '/home/user/Pictures', videos: '/home/user/Videos'}

describe('DownloadProfileEditor', () => {
	it('shows best native audio for best native video profiles', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-codec')).toHaveTextContent('Best native')
		expect(await screen.findByTestId('profiles-editor-audio-format')).toHaveTextContent('Best native')
		expect(screen.getByTestId('profiles-editor-audio-format')).not.toBeDisabled()
		expect(screen.queryByTestId('profiles-editor-audio-quality')).not.toBeInTheDocument()
	})

	it('does not render profile-specific playlist cap controls', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-codec')).toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-playlist-cap')).not.toBeInTheDocument()
		expect(screen.queryByText('Playlist probe cap')).not.toBeInTheDocument()
	})

	it('shows M4A/AAC audio preference for Smart TV H.264 MP4 video profiles', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-codec')).toHaveTextContent('Smart TV H.264 MP4')
		expect(await screen.findByTestId('profiles-editor-audio-format')).toHaveTextContent('M4A / AAC')
		expect(screen.getByTestId('profiles-editor-audio-format')).not.toBeDisabled()
		expect(screen.queryByTestId('profiles-editor-audio-quality')).not.toBeInTheDocument()
	})

	it('limits Smart TV H.264 MP4 profile resolution choices to 1080p and below', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-resolution')).toHaveTextContent('Up to 1080p')
		fireEvent.click(screen.getByTestId('profiles-editor-video-resolution'))

		expect(await screen.findByTestId('profiles-editor-video-resolution-option-1080')).toBeInTheDocument()
		expect(screen.getByTestId('profiles-editor-video-resolution-option-720')).toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-video-resolution-option-best')).not.toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-video-resolution-option-1440')).not.toBeInTheDocument()
		expect(screen.queryByTestId('profiles-editor-video-resolution-option-2160')).not.toBeInTheDocument()
	})

	it('pairs video compatibility with the matching native audio default', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-video-codec'))
		fireEvent.click(await screen.findByTestId('profiles-editor-video-codec-option-mp4'))
		expect(screen.getByTestId('profiles-editor-audio-format')).toHaveTextContent('M4A / AAC')

		fireEvent.click(screen.getByTestId('profiles-editor-video-codec'))
		fireEvent.click(await screen.findByTestId('profiles-editor-video-codec-option-best'))
		expect(screen.getByTestId('profiles-editor-audio-format')).toHaveTextContent('Best native')
	})

	it('saves the selected video-audio audio preference', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-1440')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		fireEvent.click(await screen.findByTestId('profiles-editor-audio-format'))
		fireEvent.click(await screen.findByTestId('profiles-editor-audio-format-option-m4a'))
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({media: {kind: 'video-audio', codec: 'best', tiers: ['1440'], audio: {format: 'm4a'}}}))
		})
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

	it('edits the explicit profile subfolder instead of deriving it silently on save', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1080')
		expect(profile).toBeDefined()
		const onSave = vi.fn<(saved: DownloadProfile) => void>()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} onSave={onSave} />)

		const input = await screen.findByTestId('profiles-editor-subfolder-name')
		expect(input).toHaveValue('Smart TV MP4 Full HD')

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
