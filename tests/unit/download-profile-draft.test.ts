import {describe, expect, it} from 'vitest'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {createDownloadProfileDraft, downloadProfileFromDraft, updateDownloadProfileDraft, validateDownloadProfileDraft} from '@renderer/store/wizard/downloadProfileDraft.js'

const NOW = '2026-06-10T12:00:00.000Z'

describe('DownloadProfileDraft', () => {
	it('initializes from a built-in profile', () => {
		const draft = createDownloadProfileDraft(BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!)

		expect(draft).toMatchObject({profileId: 'balanced', profileName: 'Balanced 720p', profileIcon: 'controls', mediaMode: 'video-audio', codec: 'best', resolution: '720', audioFormat: 'best', subfolderName: 'Balanced 720p'})
	})

	it('keeps codec and video-audio format coupled', () => {
		let draft = createDownloadProfileDraft(null)

		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'video-audio'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-codec', codec: 'mp4'})
		expect(draft.audioFormat).toBe('m4a')

		draft = updateDownloadProfileDraft(draft, {type: 'set-codec', codec: 'best'})
		expect(draft.audioFormat).toBe('best')
	})

	it('caps Smart TV H.264 MP4 profiles at 1080p when codec changes', () => {
		let draft = createDownloadProfileDraft(null)

		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'video-audio'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-resolution', resolution: '2160'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-codec', codec: 'mp4'})

		expect(draft.resolution).toBe('1080')
		expect(draft.audioFormat).toBe('m4a')
	})

	it('caps newly selected Smart TV H.264 MP4 resolutions above 1080p', () => {
		let draft = createDownloadProfileDraft(null)

		draft = updateDownloadProfileDraft(draft, {type: 'set-codec', codec: 'mp4'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-resolution', resolution: '1440'})

		expect(draft.resolution).toBe('1080')
	})

	it('normalizes legacy custom Smart TV H.264 MP4 profiles above 1080p when editing', () => {
		const legacyProfile: DownloadProfile = {...BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!, id: 'custom-mp4-2160', name: 'Custom MP4 2160p', media: {kind: 'video-audio', codec: 'mp4', tiers: ['2160'], audio: {format: 'm4a'}}}

		const draft = createDownloadProfileDraft(legacyProfile)

		expect(draft.codec).toBe('mp4')
		expect(draft.resolution).toBe('1080')
	})

	it('keeps audio-only WAV lossless without bitrate', () => {
		let draft = createDownloadProfileDraft(null)
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'audio-only'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-audio-format', audioFormat: 'wav'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-audio-quality', audioQuality: '320'})

		const profile = downloadProfileFromDraft(draft, NOW, () => 'new-id')

		expect(profile.media).toEqual({kind: 'audio-only', audio: {format: 'wav'}})
	})

	it('tracks the default subfolder name until the user edits it', () => {
		let draft = createDownloadProfileDraft(null)

		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Lecture Pack'})
		expect(draft.subfolderName).toBe('Lecture Pack')

		draft = updateDownloadProfileDraft(draft, {type: 'set-subfolder-name', subfolderName: 'Custom Folder'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Renamed'})
		expect(draft.subfolderName).toBe('Custom Folder')
	})

	it('validates invalid subfolder names only when subfolders are enabled', () => {
		let draft = createDownloadProfileDraft(null)
		draft = updateDownloadProfileDraft(draft, {type: 'set-subfolder-name', subfolderName: 'bad/name'})

		expect(validateDownloadProfileDraft(draft).subfolderInvalid).toBe(true)
		expect(validateDownloadProfileDraft(updateDownloadProfileDraft(draft, {type: 'set-save-inside-subfolder', saveInsideSubfolder: false})).subfolderInvalid).toBe(false)
	})

	it('accepts multi-subtag subtitle language codes in profile drafts', () => {
		let draft = createDownloadProfileDraft(null)
		draft = updateDownloadProfileDraft(draft, {type: 'set-subtitle-language-draft', subtitleLanguageDraft: 'zh-Hant-TW es-419 en bad_value'})
		draft = updateDownloadProfileDraft(draft, {type: 'add-subtitle-languages'})

		expect(draft.subtitleLanguages).toEqual(['en', 'uk', 'zh-hant-tw', 'es-419'])
	})

	it('serializes the draft into a download profile', () => {
		let draft = createDownloadProfileDraft(null)
		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Study Captions'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'subtitles-only'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-subtitle-languages', subtitleLanguages: ['en', 'uk']})
		draft = updateDownloadProfileDraft(draft, {type: 'set-destination', destination: '/courses'})

		const profile = downloadProfileFromDraft(draft, NOW, () => 'profile-id')

		expect(profile).toMatchObject({id: 'profile-id', name: 'Study Captions', media: {kind: 'subtitles-only'}, subtitles: {enabled: true, languages: ['en', 'uk']}, output: {kind: 'fixed', dir: '/courses'}, subfolder: {enabled: true, name: 'Study Captions'}, createdAt: NOW, updatedAt: NOW})
	})
})
