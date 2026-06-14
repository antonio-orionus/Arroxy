import {describe, expect, it} from 'vitest'
import {downloadProfileSchema} from '@shared/schemas.js'
import {
	BUILTIN_DOWNLOAD_PROFILES,
	DEFAULT_DOWNLOAD_PROFILE_REF,
	DEFAULT_DOWNLOAD_PROFILES_PREFS,
	allDownloadProfiles,
	downloadProfileLabel,
	downloadProfileOrigin,
	downloadProfileRefFor,
	removeDownloadProfileFromPrefs,
	resolveActiveDownloadProfile,
	resolveDownloadProfileBaseDir,
	resolveDownloadProfile,
	resolveDownloadProfileOutputDir,
	saveDownloadProfileToPrefs
} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR} from '../shared/nativeAudioSelectors.js'

function customProfile(overrides: Partial<DownloadProfile> = {}): DownloadProfile {
	return {
		...BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!,
		id: 'study-captions',
		name: 'Study Captions',
		icon: 'captions',
		media: {kind: 'video-audio', codec: 'mp4', tiers: ['1080', '720'], audio: {format: 'm4a'}},
		subtitles: {enabled: true, languages: ['en', 'uk'], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		sponsorBlock: {mode: 'remove', categories: ['sponsor']},
		embed: {chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true},
		output: {kind: 'fixed', dir: '/home/user/Videos/Classes'},
		subfolder: {enabled: true, name: 'Course'},
		createdAt: '2026-06-07T00:00:00.000Z',
		updatedAt: '2026-06-07T00:00:00.000Z',
		...overrides
	}
}

describe('download profiles', () => {
	it('built-ins are immutable profile-shaped defaults', () => {
		expect(BUILTIN_DOWNLOAD_PROFILES.map(profile => profile.id)).toEqual(['best-quality', 'best-2160', 'best-1440', 'hd-1080', 'balanced', 'small-file', 'mp4-1080', 'mp4-720', 'mp4-480', 'audio-only'])
		expect(BUILTIN_DOWNLOAD_PROFILES.map(profile => [profile.id, profile.name])).toEqual([
			['best-quality', 'Best available'],
			['best-2160', '4K UHD 2160p'],
			['best-1440', 'QHD 1440p'],
			['hd-1080', 'Full HD 1080p'],
			['balanced', 'Balanced 720p'],
			['small-file', 'Small file 480p'],
			['mp4-1080', 'Smart TV MP4 Full HD 1080p'],
			['mp4-720', 'Smart TV MP4 HD 720p'],
			['mp4-480', 'Smart TV MP4 SD 480p'],
			['audio-only', 'Audio only']
		])
		for (const profile of BUILTIN_DOWNLOAD_PROFILES) {
			expect(downloadProfileSchema.safeParse(profile).success).toBe(true)
			expect(profile.output).toEqual({kind: 'default'})
			expect(profile.subfolder).toEqual({enabled: true, name: profile.name})
			expect(profile.subtitles).toEqual({enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'})
			expect(profile.embed).toEqual({chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false})

			if (profile.media.kind === 'audio-only') {
				expect(profile.media.audio.format).toBe('best')
				expect(profile.media.audio.bitrateKbps).toBeUndefined()
			} else if (profile.media.kind === 'video-audio' || profile.media.kind === 'video-only') {
				expect(profile.media.tiers).toHaveLength(1)
				if (profile.media.kind === 'video-audio') expect(profile.media.audio.format).toBe(profile.media.codec === 'mp4' ? 'm4a' : 'best')
				if (!profile.id.startsWith('mp4-')) expect(profile.media.codec).toBe('best')
			}

			const resolved = resolveDownloadProfile(profile, {kind: 'builtin', id: profile.id})
			expect(resolved.subtitles).toBeUndefined()
			expect(resolved.embed).toEqual({chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false})
		}
	})

	it('keeps Smart TV H.264 MP4 built-ins at 1080p and below', () => {
		expect(BUILTIN_DOWNLOAD_PROFILES.some(profile => profile.id === 'mp4-2160')).toBe(false)
		expect(BUILTIN_DOWNLOAD_PROFILES.some(profile => profile.id === 'mp4-1440')).toBe(false)
		for (const [id, tier] of [
			['mp4-1080', '1080'],
			['mp4-720', '720'],
			['mp4-480', '480']
		] as const) {
			const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === id)
			expect(profile?.media).toEqual({kind: 'video-audio', codec: 'mp4', tiers: [tier], audio: {format: 'm4a'}})

			const resolved = resolveDownloadProfile(profile!, {kind: 'builtin', id})
			expect(resolved.spec?.formatSelector).toBe('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best')
			expect(resolved.spec?.formatSort).toBe(`vcodec:h264,ext:mp4,res:${tier},fps,acodec:m4a`)
			expect(resolved.spec?.mergeOutputFormat).toBe('mp4')
		}
	})

	it('keeps small-file as a single 480p tier and relies on yt-dlp fallback sorting', () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'small-file')
		expect(profile?.media).toEqual({kind: 'video-audio', codec: 'best', tiers: ['480'], audio: {format: 'best'}})

		const resolved = resolveDownloadProfile(profile!, {kind: 'builtin', id: 'small-file'})
		expect(resolved.spec?.formatSelector).toBe(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR)
		expect(resolved.spec?.formatSort).toBe('res:480,fps')
		expect(resolved.spec?.mergeOutputFormat).toBeUndefined()
	})

	it('derives a builtin ref when resolving a builtin profile without an explicit ref', () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		expect(profile).toBeDefined()

		const resolved = resolveDownloadProfile(profile!)

		expect(resolved.ref).toEqual({kind: 'builtin', id: 'balanced'})
	})

	it('resolves the active profile and falls back to the default built-in when missing', () => {
		const prefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, active: {kind: 'custom' as const, id: 'missing'}}
		expect(resolveActiveDownloadProfile(prefs).ref).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF)
		expect(resolveActiveDownloadProfile(prefs).profile.id).toBe(DEFAULT_DOWNLOAD_PROFILE_REF.id)
	})

	it('resolves profile output from fixed destination, current default root, and subfolder policy', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		if (!balanced) throw new Error('expected balanced profile')

		expect(resolveDownloadProfileOutputDir(balanced, {currentOutputDir: '', defaultOutputDir: '/home/user/Downloads'})).toBe('/home/user/Downloads/Balanced 720p')
		expect(resolveDownloadProfileOutputDir(balanced, {currentOutputDir: '/media/archive', defaultOutputDir: '/home/user/Downloads'})).toBe('/media/archive/Balanced 720p')

		const fixed = customProfile({output: {kind: 'fixed', dir: '/mnt/classes'}, subfolder: {enabled: true, name: 'Lectures'}})
		expect(resolveDownloadProfileOutputDir(fixed, {currentOutputDir: '/media/archive', defaultOutputDir: '/home/user/Downloads'})).toBe('/mnt/classes/Lectures')

		const flat = customProfile({output: {kind: 'default'}, subfolder: {enabled: false, name: 'Ignored'}})
		expect(resolveDownloadProfileOutputDir(flat, {currentOutputDir: '', defaultOutputDir: '/home/user/Downloads'})).toBe('/home/user/Downloads')
	})

	it('rejects default profile output when no output root is available', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		if (!balanced) throw new Error('expected balanced profile')

		expect(() => resolveDownloadProfileBaseDir(balanced, {currentOutputDir: '', defaultOutputDir: ''})).toThrow('Download profile output directory is required')
		expect(() => resolveDownloadProfileOutputDir(balanced, {currentOutputDir: '', defaultOutputDir: ''})).toThrow('Download profile output directory is required')
	})

	it('upserts and removes custom profiles while preserving active fallback', () => {
		const profile = customProfile()
		const withCustom = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, profile)
		expect(allDownloadProfiles(withCustom).some(item => item.id === profile.id)).toBe(true)

		const activeCustom = {...withCustom, active: {kind: 'custom' as const, id: profile.id}}
		const removed = removeDownloadProfileFromPrefs(activeCustom, profile.id)
		expect(removed.custom).toHaveLength(0)
		expect(removed.active).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF)
	})

	it('overrides built-in profiles without turning callers into builtin/custom policy owners', () => {
		const override = customProfile({id: 'balanced', name: 'Balanced for lectures', icon: 'classes', media: {kind: 'video-audio', codec: 'mp4', tiers: ['1080'], audio: {format: 'm4a'}}})

		const overridden = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, override)

		expect(overridden.active).toEqual({kind: 'builtin', id: 'balanced'})
		expect(overridden.custom).toHaveLength(0)
		expect(overridden.overrides).toEqual([override])
		expect(resolveActiveDownloadProfile(overridden).profile.name).toBe('Balanced for lectures')
		expect(allDownloadProfiles(overridden).find(profile => profile.id === 'balanced')?.media).toEqual({kind: 'video-audio', codec: 'mp4', tiers: ['1080'], audio: {format: 'm4a'}})
		expect(downloadProfileOrigin(override, overridden)).toEqual({kind: 'builtin', overridden: true})
		expect(downloadProfileRefFor(override, overridden)).toEqual({kind: 'builtin', id: 'balanced'})

		const reset = removeDownloadProfileFromPrefs(overridden, 'balanced')
		expect(reset.overrides).toHaveLength(0)
		expect(reset.active).toEqual({kind: 'builtin', id: 'balanced'})
		expect(resolveActiveDownloadProfile(reset).profile.name).toBe('Balanced 720p')
	})

	it('resolves media, subtitles, output artifacts, and SponsorBlock into queue-ready options', () => {
		const profile = customProfile()
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.intent).toEqual({kind: 'video-audio', codec: 'mp4', tiers: ['1080', '720'], audio: {format: 'm4a'}})
		expect(resolved.spec?.formatSelector).toBe('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best')
		expect(resolved.spec?.formatSort).toBe('vcodec:h264,ext:mp4,res:1080,fps,acodec:m4a')
		expect(resolved.subtitles).toEqual({languages: ['en', 'uk'], mode: 'sidecar', format: 'srt', writeAuto: true})
		expect(resolved.sponsorBlock).toEqual({mode: 'remove', categories: ['sponsor']})
		expect(resolved.embed).toEqual({chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true})
		expect(downloadProfileLabel(profile)).toBe('Video + audio · Smart TV H.264 MP4 · up to 1080p · AAC audio')
	})

	it('treats subtitles-only profiles as non-media jobs with sanitized embed and SponsorBlock options', () => {
		const profile = customProfile({media: {kind: 'subtitles-only'}, subtitles: {enabled: true, languages: ['en'], source: 'manual-only', mode: 'embed', format: 'vtt'}, sponsorBlock: {mode: 'mark', categories: ['sponsor']}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.intent).toBeNull()
		expect(resolved.spec).toBeNull()
		expect(resolved.isSubtitleOnly).toBe(true)
		expect(resolved.subtitles).toEqual({languages: ['en'], mode: 'sidecar', format: 'vtt', writeAuto: false})
		expect(resolved.sponsorBlock).toEqual({mode: 'off'})
		expect(resolved.embed).toEqual({chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false})
	})

	it('forces audio-only profile subtitles to sidecar instead of embed', () => {
		const profile = customProfile({media: {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}}, subtitles: {enabled: true, languages: ['en'], source: 'auto-only', mode: 'embed', format: 'srt'}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.spec?.producesVideo).toBe(false)
		expect(resolved.subtitles).toEqual({languages: ['en'], mode: 'sidecar', format: 'srt', writeAuto: true})
	})

	it('resolves WAV audio-only profiles as lossless conversion with no bitrate', () => {
		const profile = customProfile({media: {kind: 'audio-only', audio: {format: 'wav'}}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.spec?.audioConvert).toEqual({target: 'wav'})
		expect(downloadProfileLabel(profile)).toBe('Audio only · WAV')
	})
})
