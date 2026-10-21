import {describe, expect, it} from 'vite-plus/test'
import {DEFAULTS} from '@shared/constants.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {downloadProfileSchema, MAX_SUBTITLE_LANGUAGES} from '@shared/schemas.js'
import type {DownloadProfile} from '@shared/types.js'
import {canDraftEmbedThumbnail, createDownloadProfileDraft, downloadProfileFromDraft, draftSelectionOrder, type DownloadProfileDraft, updateDownloadProfileDraft, validateDownloadProfileDraft} from '@renderer/store/wizard/downloadProfileDraft.js'

const NOW = '2026-06-10T12:00:00.000Z'
// What the editor passes in: its fallback name and subtitle language, in the app language.
const NEW_PROFILE = {fallbackName: 'Neues Profil', subtitleLanguage: 'de'}

describe('DownloadProfileDraft', () => {
	it('initializes from a built-in profile', () => {
		const draft = createDownloadProfileDraft(
			BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!,
			NEW_PROFILE
		)

		expect(draft).toMatchObject({profileId: 'balanced', profileName: null, profileIcon: 'controls', mediaMode: 'video-audio', goal: 'best-picture', resolution: '720', fileType: 'auto', nativeAudio: 'default', subfolderName: 'Balanced 720p'})
	})

	it('starts a new profile unnamed, in the app language, and saves it under the fallback name', () => {
		const draft = createDownloadProfileDraft(null, NEW_PROFILE)
		expect(draft.profileName).toBe('')
		expect(draft.subtitleLanguages).toEqual(['de'])

		const profile = downloadProfileFromDraft(draft, NOW, () => 'new-id')
		expect(profile.name).toBe('Neues Profil')
		expect(profile.subfolder).toEqual({enabled: true, name: 'Neues Profil'})
	})

	it('never keeps Smart TV as a WebM file', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)

		draft = updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'best-picture'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-file-type', fileType: 'webm'})
		expect(draft.fileType).toBe('webm')

		draft = updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'smart-tv'})
		expect(draft.fileType).toBe('auto')
		draft = updateDownloadProfileDraft(draft, {type: 'set-file-type', fileType: 'webm'})
		expect(draft.fileType).toBe('auto')
	})

	it('saves a preferred video codec, and leaves it out when it is Auto', () => {
		const base = createDownloadProfileDraft(
			BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'best-quality')!,
			NEW_PROFILE
		)
		expect(base.videoCodec).toBe('auto')
		expect(downloadProfileFromDraft(base, NOW, () => 'id').media).not.toHaveProperty('videoCodec')
		const vp9 = updateDownloadProfileDraft(base, {type: 'set-video-codec', videoCodec: 'vp9'})
		const saved = downloadProfileFromDraft(vp9, NOW, () => 'id')
		expect(saved.media).toMatchObject({videoCodec: 'vp9'})
		expect(createDownloadProfileDraft(saved, NEW_PROFILE).videoCodec).toBe('vp9')
		expect(draftSelectionOrder(vp9, 'compatible', 'hdr')?.videoCodec).toBe('vp9')
	})

	it('drops the codec preference where it cannot apply: Smart TV, and H.264 in WebM', () => {
		let draft = createDownloadProfileDraft(
			BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'best-quality')!,
			NEW_PROFILE
		)
		draft = updateDownloadProfileDraft(draft, {type: 'set-video-codec', videoCodec: 'h264'})
		expect(updateDownloadProfileDraft(draft, {type: 'set-file-type', fileType: 'webm'}).videoCodec).toBe('auto')
		expect(updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'smart-tv'}).videoCodec).toBe('auto')
		draft = updateDownloadProfileDraft(draft, {type: 'set-file-type', fileType: 'mp4'})
		expect(draft.videoCodec).toBe('h264')
		draft = updateDownloadProfileDraft(updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'smart-tv'}), {type: 'set-video-codec', videoCodec: 'vp9'})
		expect(draft.videoCodec).toBe('auto')
		draft = updateDownloadProfileDraft(updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'best-picture'}), {type: 'set-file-type', fileType: 'webm'})
		expect(updateDownloadProfileDraft(draft, {type: 'set-video-codec', videoCodec: 'h264'}).videoCodec).toBe('auto')
		expect(updateDownloadProfileDraft(draft, {type: 'set-video-codec', videoCodec: 'vp9'}).videoCodec).toBe('vp9')
	})

	it('saves the goal, file type and native audio choice into the profile media', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'video-audio'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'best-picture'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-resolution', resolution: '2160'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-file-type', fileType: 'mp4'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-native-audio', nativeAudio: 'surround'})

		const profile = downloadProfileFromDraft(draft, '2026-10-17T00:00:00.000Z', () => 'id-1')
		expect(profile.media).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '2160', fileType: 'mp4', audio: {native: {kind: 'custom', preference: 'surround'}}})
	})

	it('describes the order a draft would pick by, with the settings audio choice', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'video-audio'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'best-picture'})

		expect(draftSelectionOrder(draft, 'surround', 'sdr')?.nativeAudio).toEqual({preference: 'surround', source: 'settings'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'audio-only'})
		expect(draftSelectionOrder(draft, 'surround', 'sdr')).toBeNull()
	})

	it('caps Smart TV H.264 MP4 profiles at 1080p when codec changes', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)

		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'video-audio'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-resolution', resolution: '2160'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'smart-tv'})

		expect(draft.resolution).toBe('1080')
	})

	it('caps newly selected Smart TV H.264 MP4 resolutions above 1080p', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)

		draft = updateDownloadProfileDraft(draft, {type: 'set-goal', goal: 'smart-tv'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-resolution', resolution: '1440'})

		expect(draft.resolution).toBe('1080')
	})

	it('normalizes legacy custom Smart TV H.264 MP4 profiles above 1080p when editing', () => {
		const legacyProfile: DownloadProfile = {...BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!, id: 'custom-mp4-2160', name: 'Custom MP4 2160p', media: {kind: 'video-audio', goal: 'smart-tv', tier: '2160', fileType: 'auto', audio: {native: {kind: 'default'}}}}

		const draft = createDownloadProfileDraft(legacyProfile, NEW_PROFILE)

		expect(draft.goal).toBe('smart-tv')
		expect(draft.resolution).toBe('1080')
	})

	it('keeps audio-only WAV lossless without bitrate', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'audio-only'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-audio-format', audioFormat: 'wav'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-audio-quality', audioQuality: '320'})

		const profile = downloadProfileFromDraft(draft, NOW, () => 'new-id')

		expect(profile.media).toEqual({kind: 'audio-only', audio: {format: 'wav'}})
	})

	it('tracks the default subfolder name until the user edits it', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)

		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Lecture Pack'})
		expect(draft.subfolderName).toBe('Lecture Pack')

		draft = updateDownloadProfileDraft(draft, {type: 'set-subfolder-name', subfolderName: 'Custom Folder'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Renamed'})
		expect(draft.subfolderName).toBe('Custom Folder')
	})

	it('keeps a built-in on its own name until the user types one, and back when the field is cleared', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		let draft = createDownloadProfileDraft(balanced, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-resolution', resolution: '1080'})
		expect(downloadProfileFromDraft(draft, NOW, () => 'unused').name).toBeUndefined()

		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Lectures'})
		// Renaming a built-in leaves its download folder where it was.
		expect(draft.subfolderName).toBe('Balanced 720p')
		expect(downloadProfileFromDraft(draft, NOW, () => 'unused').name).toBe('Lectures')

		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: '  '})
		expect(downloadProfileFromDraft(draft, NOW, () => 'unused').name).toBeUndefined()

		draft = updateDownloadProfileDraft(draft, {type: 'set-subfolder-name', subfolderName: ''})
		expect(downloadProfileFromDraft(draft, NOW, () => 'unused').subfolder).toEqual({enabled: true, name: 'Balanced 720p'})
	})

	it('validates invalid subfolder names only when subfolders are enabled', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-subfolder-name', subfolderName: 'bad/name'})

		expect(validateDownloadProfileDraft(draft).subfolderInvalid).toBe(true)
		expect(validateDownloadProfileDraft(updateDownloadProfileDraft(draft, {type: 'set-save-inside-subfolder', saveInsideSubfolder: false})).subfolderInvalid).toBe(false)
	})

	it('flags missing subtitle languages only while subtitles are effectively on', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-subtitle-languages', subtitleLanguages: []})
		expect(validateDownloadProfileDraft(draft).subtitleLanguagesMissing).toBe(true)

		const off = updateDownloadProfileDraft(draft, {type: 'set-subtitle-enabled', subtitleEnabled: false})
		expect(validateDownloadProfileDraft(off).subtitleLanguagesMissing).toBe(false)

		const subtitlesOnly = updateDownloadProfileDraft(off, {type: 'set-media-mode', mediaMode: 'subtitles-only'})
		expect(validateDownloadProfileDraft(subtitlesOnly).subtitleLanguagesMissing).toBe(true)

		const withLanguage = updateDownloadProfileDraft(subtitlesOnly, {type: 'set-subtitle-languages', subtitleLanguages: ['en']})
		expect(validateDownloadProfileDraft(withLanguage).subtitleLanguagesMissing).toBe(false)
	})

	it('dedupes selected subtitle languages and caps them at the schema limit', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-subtitle-languages', subtitleLanguages: ['en', 'uk', 'en', 'zh-Hant']})
		expect(draft.subtitleLanguages).toEqual(['en', 'uk', 'zh-Hant'])

		const many = Array.from({length: MAX_SUBTITLE_LANGUAGES + 5}, (_, index) => `x${index.toString().padStart(2, '0')}`)
		draft = updateDownloadProfileDraft(draft, {type: 'set-subtitle-languages', subtitleLanguages: many})
		expect(draft.subtitleLanguages).toHaveLength(MAX_SUBTITLE_LANGUAGES)
	})

	it('serializes the draft into a download profile', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-profile-name', profileName: 'Study Captions'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'subtitles-only'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-subtitle-languages', subtitleLanguages: ['en', 'uk']})
		draft = updateDownloadProfileDraft(draft, {type: 'set-destination', destination: '/courses'})

		const profile = downloadProfileFromDraft(draft, NOW, () => 'profile-id')

		expect(profile).toMatchObject({id: 'profile-id', name: 'Study Captions', media: {kind: 'subtitles-only'}, subtitles: {enabled: true, languages: ['en', 'uk']}, output: {kind: 'fixed', dir: '/courses'}, subfolder: {enabled: true, name: 'Study Captions'}, createdAt: NOW, updatedAt: NOW})
		expect('playlistProbeCap' in profile).toBe(false)
	})

	it('opens the editor for a profile saved before filename templates existed', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const {filename: _filename, ...legacy} = balanced

		const normalized = downloadProfileSchema.parse(legacy)
		const draft = createDownloadProfileDraft(normalized, NEW_PROFILE)

		expect(draft.filenameTemplate).toBe('')
	})

	it('carries the visibility flag through the draft round-trip', () => {
		expect(createDownloadProfileDraft(null, NEW_PROFILE).enabled).toBe(true)

		const disabledCustom: DownloadProfile = {...BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!, id: 'hidden-custom', name: 'Hidden', enabled: false}
		const draft = createDownloadProfileDraft(disabledCustom, NEW_PROFILE)
		expect(draft.enabled).toBe(false)

		const profile = downloadProfileFromDraft(draft, NOW, () => 'hidden-custom')
		expect(profile.enabled).toBe(false)
	})
	it('round-trips thumbnail embedding for media that can hold cover art', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'audio-only'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-audio-format', audioFormat: 'mp3'})
		draft = updateDownloadProfileDraft(draft, {type: 'set-embed-thumbnail', embedThumbnail: true})

		const profile = downloadProfileFromDraft(draft, NOW, () => 'mp3-cover')
		expect(profile.embed.thumbnail).toBe(true)
		expect(createDownloadProfileDraft(profile, NEW_PROFILE).embedThumbnail).toBe(true)
	})

	it('never stores thumbnail embedding for media that cannot hold cover art', () => {
		const modes: [DownloadProfileDraft['mediaMode'], DownloadProfileDraft['audioFormat']][] = [
			['video-only', 'best'],
			['audio-only', 'best'],
			['audio-only', 'wav'],
			['subtitles-only', 'best']
		]
		for (const [mediaMode, audioFormat] of modes) {
			let draft = updateDownloadProfileDraft(createDownloadProfileDraft(null, NEW_PROFILE), {type: 'set-embed-thumbnail', embedThumbnail: true})
			draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode})
			draft = updateDownloadProfileDraft(draft, {type: 'set-audio-format', audioFormat})
			expect(canDraftEmbedThumbnail(draft), `${mediaMode}/${audioFormat}`).toBe(false)
			expect(downloadProfileFromDraft(draft, NOW, () => 'id').embed.thumbnail, `${mediaMode}/${audioFormat}`).toBe(false)
		}
	})
	it('stores thumbnail embedding for video without audio saved as MP4 or MKV', () => {
		for (const fileType of ['mp4', 'mkv'] as const) {
			let draft = updateDownloadProfileDraft(createDownloadProfileDraft(null, NEW_PROFILE), {type: 'set-embed-thumbnail', embedThumbnail: true})
			draft = updateDownloadProfileDraft(draft, {type: 'set-media-mode', mediaMode: 'video-only'})
			draft = updateDownloadProfileDraft(draft, {type: 'set-file-type', fileType})
			expect(canDraftEmbedThumbnail(draft), fileType).toBe(true)
			expect(downloadProfileFromDraft(draft, NOW, () => 'id').embed.thumbnail, fileType).toBe(true)
		}
	})
	it('round-trips the chosen SponsorBlock categories instead of resetting them', () => {
		let draft = createDownloadProfileDraft(null, NEW_PROFILE)
		draft = updateDownloadProfileDraft(draft, {type: 'set-sponsor-block-mode', sponsorBlockMode: 'remove'})
		expect(draft.sponsorBlockCategories).toEqual([...DEFAULTS.sponsorBlockCategories])
		for (const category of DEFAULTS.sponsorBlockCategories) if (category !== 'sponsor') draft = updateDownloadProfileDraft(draft, {type: 'toggle-sponsor-block-category', category})
		draft = updateDownloadProfileDraft(draft, {type: 'toggle-sponsor-block-category', category: 'outro'})

		const profile = downloadProfileFromDraft(draft, NOW, () => 'sb')
		expect(profile.sponsorBlock).toEqual({mode: 'remove', categories: ['sponsor', 'outro']})
		expect(createDownloadProfileDraft(profile, NEW_PROFILE).sponsorBlockCategories).toEqual(['sponsor', 'outro'])
	})
	it('keeps an active SponsorBlock mode with no categories as saved', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const emptyActive: DownloadProfile = {...balanced, id: 'sb-empty', sponsorBlock: {mode: 'mark', categories: []}}
		expect(createDownloadProfileDraft(emptyActive, NEW_PROFILE).sponsorBlockCategories).toEqual([])

		const off: DownloadProfile = {...balanced, id: 'sb-off', sponsorBlock: {mode: 'off', categories: []}}
		expect(createDownloadProfileDraft(off, NEW_PROFILE).sponsorBlockCategories).toEqual([...DEFAULTS.sponsorBlockCategories])
	})
})
