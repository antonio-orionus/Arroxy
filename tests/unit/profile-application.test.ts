import {describe, expect, it} from 'vite-plus/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {applyProfileToWizard, changedFromProfile, profileFromWizard, type WizardSettingsSnapshot} from '@renderer/store/wizard/profileApplication.js'
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
	return applyProfileToWizard({profile, formats: FORMATS, subtitles: {en: [{ext: 'vtt'}], de: [{ext: 'vtt'}]}, automaticCaptions: {'ja-orig': [{ext: 'vtt'}]}, isAudioOnlySource: false, nativeAudioPreference: 'compatible', baseOutputDir: '/home/me/Downloads', globalFilenameTemplate: undefined})
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
			filenameTemplate: '{title} [{id}]'
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
		expect(changedFromProfile(baseline, {...baseline, sponsorBlockMode: 'remove'})).toEqual(['sponsorBlock'])
	})
})

describe('profileFromWizard', () => {
	const context = {id: 'custom-1', name: 'My 1080p', now: '2026-10-17T00:00:00.000Z', defaultOutputDir: '/home/me/Downloads', globalFilenameTemplate: undefined}

	it('round-trips an unchanged profile', () => {
		const profile = builtin('mp4-720')
		const saved = profileFromWizard(profile, apply(profile).snapshot, FORMATS, context)
		expect(saved.media).toEqual(profile.media)
		expect(saved.subtitles).toEqual(profile.subtitles)
		expect(saved.output).toEqual({kind: 'default'})
		expect(saved.filename).toEqual({kind: 'default'})
		expect(saved).toMatchObject({id: 'custom-1', name: 'My 1080p', enabled: true, icon: profile.icon, createdAt: context.now, updatedAt: context.now})
	})

	it('turns a picked stream into the tier it sits in', () => {
		const base = builtin('balanced')
		const snapshot = {...apply(base).snapshot, videoFormatId: '137'}
		expect(profileFromWizard(base, snapshot, FORMATS, context).media).toEqual({kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'best'}})
	})

	it('keeps "best" when the best stream is picked', () => {
		const base = builtin('best-quality')
		expect(profileFromWizard(base, apply(base).snapshot, FORMATS, context).media).toEqual(base.media)
	})

	it('saves audio conversions, subtitles, folder and file name', () => {
		const base = builtin('balanced')
		const snapshot: WizardSettingsSnapshot = {...apply(base).snapshot, mediaKind: 'audio', videoFormatId: '', audioSelection: {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 320}, subtitleLanguages: ['en', 'ja-orig'], outputDir: '/music', filenameTemplate: '{title}'}
		const saved = profileFromWizard(base, snapshot, FORMATS, context)
		expect(saved.media).toEqual({kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 320}})
		expect(saved.subtitles).toMatchObject({enabled: true, languages: ['en', 'ja']})
		expect(saved.output).toEqual({kind: 'fixed', dir: '/music'})
		expect(saved.filename).toEqual({kind: 'custom', template: '{title}'})
	})

	it('saves subtitles-only and video without audio', () => {
		const base = builtin('balanced')
		const subs = profileFromWizard(base, {...apply(base).snapshot, mediaKind: 'subtitles', videoFormatId: '', audioSelection: {kind: 'none'}, subtitleLanguages: ['de']}, FORMATS, context)
		expect(subs.media).toEqual({kind: 'subtitles-only'})
		const silent = profileFromWizard(base, {...apply(base).snapshot, audioSelection: {kind: 'none'}}, FORMATS, context)
		expect(silent.media).toEqual({kind: 'video-only', codec: 'best', tiers: ['720']})
	})
})
