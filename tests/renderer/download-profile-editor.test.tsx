// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {DownloadProfileEditor} from '@renderer/components/wizard/DownloadProfileEditor.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'

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

	it('shows M4A/AAC audio preference for MP4/Smart TV video profiles', async () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-1440')
		expect(profile).toBeDefined()

		render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

		expect(await screen.findByTestId('profiles-editor-video-codec')).toHaveTextContent('MP4 / Smart TV')
		expect(await screen.findByTestId('profiles-editor-audio-format')).toHaveTextContent('M4A / AAC')
		expect(screen.getByTestId('profiles-editor-audio-format')).not.toBeDisabled()
		expect(screen.queryByTestId('profiles-editor-audio-quality')).not.toBeInTheDocument()
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
		expect(input).toHaveValue('MP4 1080p')

		fireEvent.change(input, {target: {value: 'MP4 videos'}})
		fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith(expect.objectContaining({subfolder: {enabled: true, name: 'MP4 videos'}}))
		})
	})
})
