import {describe, expect, it} from 'vite-plus/test'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {applyProfileToWizard, changedFromProfile, profileFromWizard, type SaveProfileContext, type WizardSettingsSnapshot} from '@renderer/store/wizard/profileApplication.js'
import type {DownloadProfile, FormatOption} from '@shared/types.js'

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(p => p.id === id)
	if (!profile) throw new Error(`no builtin ${id}`)
	return profile
}

const FORMATS: FormatOption[] = [
	{formatId: '399', label: '1080', ext: 'mp4', resolution: '1920x1080', videoCodec: 'av01.0.08M.08', isVideoOnly: true, isAudioOnly: false},
	{formatId: '137', label: '1080', ext: 'mp4', resolution: '1920x1080', videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
	{formatId: '247', label: '720', ext: 'webm', resolution: '1280x720', videoCodec: 'vp9', isVideoOnly: true, isAudioOnly: false},
	{formatId: '136', label: '720', ext: 'mp4', resolution: '1280x720', videoCodec: 'avc1.4d401f', isVideoOnly: true, isAudioOnly: false},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', audioCodec: 'opus', abr: 160, isVideoOnly: false, isAudioOnly: true},
	{formatId: '140', label: 'm4a', ext: 'm4a', resolution: 'audio only', audioCodec: 'mp4a.40.2', abr: 130, isVideoOnly: false, isAudioOnly: true}
]

function apply(profile: DownloadProfile) {
	return applyProfileToWizard({
		profile,
		formats: FORMATS,
		selection: selectionSourceFromOptions(FORMATS),
		subtitles: {en: [{ext: 'vtt'}], de: [{ext: 'vtt'}]},
		automaticCaptions: {'ja-orig': [{ext: 'vtt'}]},
		isAudioOnlySource: false,
		nativeAudioPreference: 'compatible',
		baseOutputDir: '/home/me/Downloads',
		globalFilenameTemplate: undefined
	})
}

describe('applyProfileToWizard', () => {
	it('fills every wizard setting from the profile', () => {
		const {snapshot, notices} = apply(builtin('balanced'))
		expect(notices).toEqual([])
		expect(snapshot).toEqual({
			mediaKind: 'video',
			videoFormatId: '247',
			audioSelection: {kind: 'native', formatId: '251'},
			subtitleLanguages: [],
			subtitleMode: 'sidecar',
			subtitleFormat: 'srt',
			sponsorBlockMode: 'off',
			sponsorBlockCategories: ['sponsor', 'selfpromo'],
			embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false},
			outputDir: '/home/me/Downloads',
			subfolderEnabled: true,
			subfolderName: 'Balanced 720p',
			filenameTemplate: '{title} [{id}]',
			fileType: 'auto'
		} satisfies WizardSettingsSnapshot)
	})

	it('uses a fixed profile folder and a custom file name', () => {
		const profile: DownloadProfile = {...builtin('audio-only'), output: {kind: 'fixed', dir: '/music'}, filename: {kind: 'custom', template: '{uploader} - {title}'}}
		const {snapshot} = apply(profile)
		expect(snapshot.outputDir).toBe('/music')
		expect(snapshot.filenameTemplate).toBe('{uploader} - {title}')
		expect(snapshot.mediaKind).toBe('audio')
	})
})

describe('changedFromProfile', () => {
	const baseline = apply(builtin('balanced')).snapshot

	it('is empty when nothing changed', () => {
		expect(changedFromProfile(baseline, {...baseline, sponsorBlockCategories: ['selfpromo', 'sponsor']})).toEqual([])
	})

	it('names each changed area once, in screen order', () => {
		const current: WizardSettingsSnapshot = {...baseline, videoFormatId: '137', subtitleLanguages: ['en'], embed: {...baseline.embed, thumbnail: true}, subfolderEnabled: false, filenameTemplate: '{title}'}
		expect(changedFromProfile(baseline, current)).toEqual(['format', 'subtitles', 'extras', 'saveTo', 'fileName'])
	})

	it('treats a different audio track or media kind as a format change', () => {
		expect(changedFromProfile(baseline, {...baseline, audioSelection: {kind: 'native', formatId: '140'}})).toEqual(['format'])
		expect(changedFromProfile(baseline, {...baseline, mediaKind: 'audio'})).toEqual(['format'])
		expect(changedFromProfile(baseline, {...baseline, sponsorBlockMode: 'remove'})).toEqual(['sponsorBlock'])
	})
})

describe('profileFromWizard', () => {
	const MANUAL = {en: [{ext: 'vtt'}], de: [{ext: 'vtt'}]}
	const AUTO = {'ja-orig': [{ext: 'vtt'}]}
	const context: SaveProfileContext = {id: 'custom-1', name: 'My 1080p', now: '2026-10-17T00:00:00.000Z', defaultOutputDir: '/home/me/Downloads', globalFilenameTemplate: undefined, subtitles: MANUAL, automaticCaptions: AUTO}

	function save(base: DownloadProfile, edit: (snapshot: WizardSettingsSnapshot) => WizardSettingsSnapshot, formats: FormatOption[] = FORMATS, ctx = context): DownloadProfile {
		const baseline = applyProfileToWizard({
			profile: base,
			formats,
			selection: selectionSourceFromOptions(formats),
			subtitles: ctx.subtitles,
			automaticCaptions: ctx.automaticCaptions,
			isAudioOnlySource: false,
			nativeAudioPreference: 'compatible',
			baseOutputDir: ctx.defaultOutputDir,
			globalFilenameTemplate: undefined
		}).snapshot
		return profileFromWizard(base, baseline, edit(baseline), formats, ctx)
	}

	it('keeps every area the user did not change, exactly as the base had it', () => {
		const profile = {...builtin('hd-1080'), subtitles: {...builtin('hd-1080').subtitles, enabled: true, languages: ['en', 'fr']}}
		const saved = save(profile, snapshot => ({...snapshot, filenameTemplate: '{title}'}))
		expect(saved.media).toEqual(profile.media)
		expect(saved.subtitles).toEqual(profile.subtitles)
		expect(saved.output).toEqual(profile.output)
		expect(saved.subfolder).toEqual(profile.subfolder)
		expect(saved.embed).toEqual(profile.embed)
		expect(saved.sponsorBlock).toEqual(profile.sponsorBlock)
		expect(saved.filename).toEqual({kind: 'custom', template: '{title}'})
		expect(saved).toMatchObject({id: 'custom-1', name: 'My 1080p', enabled: true, icon: profile.icon, createdAt: context.now, updatedAt: context.now})
	})

	it('turns a picked video stream into the tier it sits in, keeping the audio intent', () => {
		const saved = save(builtin('balanced'), snapshot => ({...snapshot, videoFormatId: '137'}))
		expect(saved.media).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}})
	})

	it('saves "best" only when the user picks the top stream themselves', () => {
		expect(save(builtin('balanced'), snapshot => ({...snapshot, videoFormatId: '399'})).media).toEqual({kind: 'video-audio', goal: 'best-picture', tier: 'best', fileType: 'auto', audio: {native: {kind: 'default'}}})
	})

	it('an audio-only edit keeps the video tier and records an AAC pick as M4A', () => {
		const saved = save(builtin('balanced'), snapshot => ({...snapshot, audioSelection: {kind: 'native', formatId: '140'}}))
		expect(saved.media).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '720', fileType: 'mp4', audio: {native: {kind: 'default'}}})
	})

	it('keeps languages the video lacked when subtitles were not edited', () => {
		const profile = {...builtin('balanced'), subtitles: {...builtin('balanced').subtitles, enabled: true, languages: ['en', 'pt']}}
		expect(save(profile, snapshot => ({...snapshot, outputDir: '/music'})).subtitles).toEqual(profile.subtitles)
	})

	it('derives the subtitle source from the tracks actually picked', () => {
		const autoOnly = {...builtin('balanced'), subtitles: {...builtin('balanced').subtitles, enabled: true, languages: ['ja'], source: 'auto-only' as const}}
		expect(save(autoOnly, snapshot => ({...snapshot, subtitleLanguages: ['de']})).subtitles).toMatchObject({languages: ['de'], source: 'manual-first'})
		const manualOnly = {...builtin('balanced'), subtitles: {...builtin('balanced').subtitles, enabled: true, languages: ['en'], source: 'manual-only' as const}}
		const bareAuto = {...context, subtitles: {}, automaticCaptions: {fr: [{ext: 'vtt'}]}}
		expect(save(manualOnly, snapshot => ({...snapshot, subtitleLanguages: ['fr']}), FORMATS, bareAuto).subtitles).toMatchObject({languages: ['fr'], source: 'auto-only'})
		expect(save(manualOnly, snapshot => ({...snapshot, subtitleLanguages: ['en', 'ja-orig']})).subtitles).toMatchObject({languages: ['en', 'ja'], source: 'manual-first'})
	})

	it('saves audio conversions, folder and file name', () => {
		const saved = save(builtin('balanced'), snapshot => ({...snapshot, mediaKind: 'audio', videoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320}, outputDir: '/music', filenameTemplate: '{title}'}))
		expect(saved.media).toEqual({kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 320}})
		expect(saved.output).toEqual({kind: 'fixed', dir: '/music'})
		expect(saved.filename).toEqual({kind: 'custom', template: '{title}'})
	})

	it('saves subtitles-only and video without audio', () => {
		expect(save(builtin('balanced'), snapshot => ({...snapshot, mediaKind: 'subtitles', videoFormatId: '', audioSelection: {kind: 'none'}, subtitleLanguages: ['de']})).media).toEqual({kind: 'subtitles-only'})
		expect(save(builtin('balanced'), snapshot => ({...snapshot, audioSelection: {kind: 'none'}})).media).toEqual({kind: 'video-only', goal: 'best-picture', tier: '720', fileType: 'auto'})
	})

	describe('file type in the wizard', () => {
		const WEBM_FORMATS: FormatOption[] = [
			{formatId: '248', label: '1080', ext: 'webm', resolution: '1920x1080', videoCodec: 'vp9', isVideoOnly: true, isAudioOnly: false},
			{formatId: '137', label: '1080', ext: 'mp4', resolution: '1920x1080', videoCodec: 'avc1.640028', isVideoOnly: true, isAudioOnly: false},
			{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', audioCodec: 'opus', abr: 160, isVideoOnly: false, isAudioOnly: true},
			{formatId: '140', label: 'm4a', ext: 'm4a', resolution: 'audio only', audioCodec: 'mp4a.40.2', abr: 130, isVideoOnly: false, isAudioOnly: true}
		]
		const profileWith = (fileType: 'auto' | 'mp4' | 'mkv' | 'webm', goal: 'best-picture' | 'smart-tv' = 'best-picture'): DownloadProfile => ({...builtin('hd-1080'), media: {kind: 'video-audio', goal, tier: '1080', fileType, audio: {native: {kind: 'default'}}}})
		const applyTo = (profile: DownloadProfile, formats: FormatOption[]) => applyProfileToWizard({profile, formats, selection: selectionSourceFromOptions(formats), subtitles: {}, automaticCaptions: {}, isAudioOnlySource: false, nativeAudioPreference: 'compatible', baseOutputDir: '/d', globalFilenameTemplate: undefined})

		it("starts from the profile's file type", () => {
			expect(applyTo(profileWith('mkv'), WEBM_FORMATS).snapshot.fileType).toBe('mkv')
			expect(applyTo(profileWith('auto'), WEBM_FORMATS).snapshot.fileType).toBe('auto')
		})

		it('keeps a WebM profile on WebM when its picked streams fit', () => {
			const {snapshot, notices} = applyTo(profileWith('webm'), WEBM_FORMATS)
			expect(snapshot).toMatchObject({videoFormatId: '248', fileType: 'webm'})
			expect(notices).toEqual([])
		})

		it('starts a WebM profile on Auto, with a notice, when the video has no WebM-ready pick', () => {
			const h264Only = WEBM_FORMATS.filter(f => f.formatId !== '248')
			const {snapshot, notices} = applyTo(profileWith('webm'), h264Only)
			expect(snapshot.fileType).toBe('auto')
			expect(notices).toContainEqual({kind: 'webm-unavailable', blocker: 'H.264'})
		})

		it('has no file type for audio and subtitles runs', () => {
			const audioProfile = {...builtin('audio-only')}
			expect(applyTo(audioProfile, WEBM_FORMATS).snapshot.fileType).toBe('auto')
		})

		it('treats a changed file type as a format change, but only for video', () => {
			const {snapshot} = applyTo(profileWith('auto'), WEBM_FORMATS)
			expect(changedFromProfile(snapshot, {...snapshot, fileType: 'mp4'})).toEqual(['format'])
			expect(changedFromProfile({...snapshot, mediaKind: 'audio'}, {...snapshot, mediaKind: 'audio', fileType: 'mp4'})).toEqual([])
		})

		it('saves the file type the user chose', () => {
			const base = profileWith('auto')
			const baseline = applyTo(base, WEBM_FORMATS).snapshot
			const saved = profileFromWizard(base, baseline, {...baseline, fileType: 'mkv'}, WEBM_FORMATS, {id: 'x', name: 'Mine', now: '2026-10-17T00:00:00.000Z', defaultOutputDir: '/d', globalFilenameTemplate: undefined, subtitles: {}, automaticCaptions: {}})
			expect(saved.media).toMatchObject({kind: 'video-audio', fileType: 'mkv'})
		})

		it('keeps asking for WebM when the profile fell back to Auto on one video and nothing changed', () => {
			const base = profileWith('webm')
			const h264Only = WEBM_FORMATS.filter(f => f.formatId !== '248')
			const baseline = applyTo(base, h264Only).snapshot
			const saved = profileFromWizard(base, baseline, {...baseline, filenameTemplate: '{title}'}, h264Only, {id: 'x', name: 'Mine', now: '2026-10-17T00:00:00.000Z', defaultOutputDir: '/d', globalFilenameTemplate: undefined, subtitles: {}, automaticCaptions: {}})
			expect(saved.media).toEqual(base.media)
		})

		it('saves an explicit Smart TV profile as Smart TV only while the pick stays H.264', () => {
			const base = profileWith('auto', 'smart-tv')
			const baseline = applyTo(base, WEBM_FORMATS).snapshot
			const ctx = {id: 'x', name: 'Mine', now: '2026-10-17T00:00:00.000Z', defaultOutputDir: '/d', globalFilenameTemplate: undefined, subtitles: {}, automaticCaptions: {}}
			expect(profileFromWizard(base, baseline, {...baseline, videoFormatId: '248'}, WEBM_FORMATS, ctx).media).toMatchObject({goal: 'best-picture'})
			expect(profileFromWizard(base, baseline, {...baseline, videoFormatId: '137'}, WEBM_FORMATS, ctx).media).toMatchObject({goal: 'smart-tv'})
		})
	})
})
