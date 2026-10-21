import {describe, expect, it} from 'vite-plus/test'
import {builtinDownloadProfileIdSchema, downloadProfileSchema} from '@shared/schemas.js'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {
	BUILTIN_DOWNLOAD_PROFILES,
	DEFAULT_DOWNLOAD_PROFILE_REF,
	DownloadProfileOutputMissingError,
	DEFAULT_DOWNLOAD_PROFILES_PREFS,
	allDownloadProfiles,
	downloadProfileFilenameFailure,
	downloadProfileLabel,
	downloadProfileOrigin,
	downloadProfileRefFor,
	enabledDownloadProfiles,
	moveDownloadProfile,
	normalizeDownloadProfilesPrefs,
	removeDownloadProfileFromPrefs,
	resolveActiveDownloadProfile,
	resolveDownloadProfileBaseDir,
	resolveDownloadProfile,
	resolveDownloadProfileOutputDir,
	resolveFilenameTemplate,
	saveDownloadProfileToPrefs,
	setDownloadProfileEnabled
} from '@shared/downloadProfiles.js'
import {downloadProfileName} from '@shared/downloadProfileName.js'
import type {DownloadProfile} from '@shared/types.js'
import {COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR, skippingAiUpscaled} from '../shared/nativeAudioSelectors.js'
import {h264First} from '../shared/smartTvSelectors.js'
import {englishProfileName} from '../shared/profileNames.js'

function customProfile(overrides: Partial<DownloadProfile> = {}): DownloadProfile {
	return {
		...BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!,
		id: 'study-captions',
		name: 'Study Captions',
		icon: 'captions',
		media: {kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}},
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

// The Smart TV built-ins were renamed; their download folders keep the old
// names so files already downloaded stay where playlist sync looks for them.
const LEGACY_SUBFOLDERS: Record<string, string> = {'mp4-1080': 'Smart TV MP4 Full HD 1080p', 'mp4-720': 'Smart TV MP4 HD 720p', 'mp4-480': 'Smart TV MP4 SD 480p'}

describe('download profiles', () => {
	// Names are looked up by a key built from the id, so nothing else checks
	// that each built-in has exactly one.
	it('has an English name for every built-in and none for anything else', () => {
		expect(Object.keys(en.wizard.url.profile.builtinName).toSorted()).toEqual([...builtinDownloadProfileIdSchema.options].toSorted())
	})

	it('shows a built-in name in the app language and a typed name as typed', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		expect(downloadProfileName(balanced, key => `<${key}>`)).toBe('<wizard.url.profile.builtinName.balanced>')
		expect(downloadProfileName({...balanced, name: 'Lectures'}, key => `<${key}>`)).toBe('Lectures')
		expect(downloadProfileName(customProfile(), key => `<${key}>`)).toBe('Study Captions')
	})

	it('built-ins are immutable profile-shaped defaults', () => {
		expect(BUILTIN_DOWNLOAD_PROFILES.map(profile => profile.id)).toEqual(['best-quality', 'best-2160', 'best-1440', 'hd-1080', 'balanced', 'small-file', 'mp4-1080', 'mp4-720', 'mp4-480', 'audio-only', 'subtitles-only', 'low-240', 'low-144'])
		// Built-ins store no name: it is shown from the catalog in the app language.
		expect(BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.name !== undefined)).toEqual([])
		expect(BUILTIN_DOWNLOAD_PROFILES.map(profile => [profile.id, englishProfileName(profile)])).toEqual([
			['best-quality', 'Best available'],
			['best-2160', '4K UHD 2160p'],
			['best-1440', 'QHD 1440p'],
			['hd-1080', 'Full HD 1080p'],
			['balanced', 'Balanced 720p'],
			['small-file', 'Small file 480p'],
			['mp4-1080', 'Smart TV 1080p'],
			['mp4-720', 'Smart TV 720p'],
			['mp4-480', 'Smart TV 480p'],
			['audio-only', 'Audio only'],
			['subtitles-only', 'Subtitles only'],
			['low-240', 'Low data 240p'],
			['low-144', 'Lowest 144p']
		])
		expect(BUILTIN_DOWNLOAD_PROFILES.filter(profile => !profile.enabled).map(profile => profile.id)).toEqual(['low-240', 'low-144'])
		for (const profile of BUILTIN_DOWNLOAD_PROFILES) {
			expect(downloadProfileSchema.safeParse(profile).success).toBe(true)
			expect(profile.output).toEqual({kind: 'default'})
			expect(profile.subfolder).toEqual({enabled: true, name: LEGACY_SUBFOLDERS[profile.id] ?? englishProfileName(profile)})
			expect(profile.embed).toEqual({chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false})

			if (profile.media.kind === 'subtitles-only') {
				// Ships with a language so the quick-download path can queue it as-is;
				// English is the most common caption track and the profile is editable.
				expect(profile.subtitles).toEqual({enabled: true, languages: ['en'], source: 'manual-first', mode: 'sidecar', format: 'srt'})
				const resolved = resolveDownloadProfile(profile, {kind: 'builtin', id: profile.id})
				expect(resolved.isSubtitleOnly).toBe(true)
				expect(resolved.subtitles).toEqual({request: {kind: 'languages', languages: ['en'], source: 'manual-first'}, mode: 'sidecar', format: 'srt'})
				expect(resolved.embed).toEqual({chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false})
				continue
			}
			expect(profile.subtitles).toEqual({enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'})

			if (profile.media.kind === 'audio-only') {
				expect(profile.media.audio.format).toBe('best')
				expect(profile.media.audio.bitrateKbps).toBeUndefined()
			} else if (profile.media.kind === 'video-audio' || profile.media.kind === 'video-only') {
				expect(profile.media.goal).toBe(profile.id.startsWith('mp4-') ? 'smart-tv' : 'best-picture')
				expect(profile.media.fileType).toBe('auto')
				if (profile.media.kind === 'video-audio') expect(profile.media.audio.native).toEqual({kind: 'default'})
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
			expect(profile?.media).toEqual({kind: 'video-audio', goal: 'smart-tv', tier: tier, fileType: 'auto', audio: {native: {kind: 'default'}}})

			const resolved = resolveDownloadProfile(profile!, {kind: 'builtin', id})
			expect(resolved.spec?.formatSelector).toBe(skippingAiUpscaled(h264First('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best')))
			expect(resolved.spec?.formatSort).toBe(`res:${tier},fps,hdr:sdr,acodec:m4a`)
			expect(resolved.spec?.mergeOutputFormat).toBe('mp4')
		}
	})

	it('keeps small-file as a single 480p tier and relies on yt-dlp fallback sorting', () => {
		const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'small-file')
		expect(profile?.media).toEqual({kind: 'video-audio', goal: 'best-picture', tier: '480', fileType: 'auto', audio: {native: {kind: 'default'}}})

		const resolved = resolveDownloadProfile(profile!, {kind: 'builtin', id: 'small-file'})
		expect(resolved.spec?.formatSelector).toBe(skippingAiUpscaled(COMPATIBLE_BEST_VIDEO_AUDIO_SELECTOR))
		expect(resolved.spec?.formatSort).toBe('res:480,fps,hdr:sdr')
		expect(resolved.spec?.mergeOutputFormat).toBeUndefined()
	})

	it('leads profile labels with the visible format difference', () => {
		expect(downloadProfileLabel(BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'best-quality')!)).toBe('Best available · Best picture')
		expect(downloadProfileLabel(BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')!)).toBe('Up to 720p · Best picture')
		expect(downloadProfileLabel(BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'small-file')!)).toBe('Up to 480p · Best picture')
		expect(downloadProfileLabel(BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'mp4-720')!)).toBe('Up to 720p · Smart TV')
		expect(downloadProfileLabel(BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'subtitles-only')!)).toBe('Subtitles only · en · SRT')
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

	// A blank folder is absent; any other is the folder as picked. A trailing
	// space is part of a macOS or Linux folder's name, and trimming it would
	// send the files to a sibling folder without it.
	it('keeps a picked folder as given, trailing space included', () => {
		const fixed = customProfile({output: {kind: 'fixed', dir: '/mnt/Down '}, subfolder: {enabled: false, name: 'x'}})
		const flat = customProfile({output: {kind: 'default'}, subfolder: {enabled: false, name: 'x'}})

		expect(resolveDownloadProfileBaseDir(fixed, {currentOutputDir: '', defaultOutputDir: '/d'})).toBe('/mnt/Down ')
		expect(resolveDownloadProfileBaseDir(flat, {currentOutputDir: '/media/Down ', defaultOutputDir: '/d'})).toBe('/media/Down ')
		expect(resolveDownloadProfileBaseDir(flat, {currentOutputDir: '  ', defaultOutputDir: '/home/Down '})).toBe('/home/Down ')
	})

	it('rejects default profile output when no output root is available', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
		if (!balanced) throw new Error('expected balanced profile')

		expect(() => resolveDownloadProfileBaseDir(balanced, {currentOutputDir: '', defaultOutputDir: ''})).toThrow(DownloadProfileOutputMissingError)
		expect(() => resolveDownloadProfileOutputDir(balanced, {currentOutputDir: '', defaultOutputDir: ''})).toThrow(DownloadProfileOutputMissingError)
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
		const override = customProfile({id: 'balanced', name: 'Balanced for lectures', icon: 'classes', media: {kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}}})

		const overridden = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, override)

		expect(overridden.active).toEqual({kind: 'builtin', id: 'balanced'})
		expect(overridden.custom).toHaveLength(0)
		expect(overridden.overrides).toEqual([override])
		expect(resolveActiveDownloadProfile(overridden).profile.name).toBe('Balanced for lectures')
		expect(allDownloadProfiles(overridden).find(profile => profile.id === 'balanced')?.media).toEqual({kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(downloadProfileOrigin(override, overridden)).toEqual({kind: 'builtin', overridden: true})
		expect(downloadProfileRefFor(override, overridden)).toEqual({kind: 'builtin', id: 'balanced'})

		const reset = removeDownloadProfileFromPrefs(overridden, 'balanced')
		expect(reset.overrides).toHaveLength(0)
		expect(reset.active).toEqual({kind: 'builtin', id: 'balanced'})
		expect(resolveActiveDownloadProfile(reset).profile.name).toBeUndefined()
	})

	it('saving an edit to a disabled built-in leaves prefs.active unchanged', () => {
		const lowRes = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'low-240')!
		// enabled:true on the incoming snapshot must be ignored for a builtin — prefs.enabledOverrides
		// (absent here, so the catalog default of false applies) is the only source of truth.
		const edit = {...lowRes, name: 'Edited low data', enabled: true}

		const next = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, edit)

		expect(next.active).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF)
		expect(next.enabledOverrides).toEqual({})
		expect(next.overrides.find(item => item.id === 'low-240')?.name).toBe('Edited low data')
		expect(resolveActiveDownloadProfile(next).ref).toEqual(next.active)
	})

	it('saving an edit to a disabled custom profile leaves prefs.active unchanged', () => {
		const disabledCustom = customProfile({enabled: false})

		const next = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, disabledCustom)

		expect(next.active).toEqual(DEFAULT_DOWNLOAD_PROFILE_REF)
		expect(next.custom.find(item => item.id === disabledCustom.id)).toEqual(disabledCustom)
		expect(resolveActiveDownloadProfile(next).ref).toEqual(next.active)
	})

	it('still activates an enabled profile on save', () => {
		const enabledCustom = customProfile({id: 'enabled-custom'})

		const next = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, enabledCustom)

		expect(next.active).toEqual({kind: 'custom', id: 'enabled-custom'})
		expect(resolveActiveDownloadProfile(next).ref).toEqual(next.active)
	})

	it('resolves media, subtitles, output artifacts, and SponsorBlock into queue-ready options', () => {
		const profile = customProfile()
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.intent).toEqual({kind: 'video-audio', goal: 'smart-tv', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}})
		expect(resolved.spec?.formatSelector).toBe(skippingAiUpscaled(h264First('bestvideo+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best')))
		expect(resolved.spec?.formatSort).toBe('res:1080,fps,hdr:sdr,acodec:m4a')
		expect(resolved.subtitles).toEqual({request: {kind: 'languages', languages: ['en', 'uk'], source: 'manual-first'}, mode: 'sidecar', format: 'srt'})
		expect(resolved.sponsorBlock).toEqual({mode: 'remove', categories: ['sponsor']})
		expect(resolved.embed).toEqual({chapters: true, metadata: true, thumbnail: false, description: true, thumbnailSidecar: true})
		expect(downloadProfileLabel(profile)).toBe('Up to 1080p · Smart TV')
	})

	it('treats subtitles-only profiles as non-media jobs with sanitized embed and SponsorBlock options', () => {
		const profile = customProfile({media: {kind: 'subtitles-only'}, subtitles: {enabled: true, languages: ['en'], source: 'manual-only', mode: 'embed', format: 'vtt'}, sponsorBlock: {mode: 'mark', categories: ['sponsor']}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.intent).toBeNull()
		expect(resolved.spec).toBeNull()
		expect(resolved.isSubtitleOnly).toBe(true)
		expect(resolved.subtitles).toEqual({request: {kind: 'languages', languages: ['en'], source: 'manual-only'}, mode: 'sidecar', format: 'vtt'})
		expect(resolved.sponsorBlock).toEqual({mode: 'off'})
		expect(resolved.embed).toEqual({chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false})
	})

	it('forces audio-only profile subtitles to sidecar instead of embed', () => {
		const profile = customProfile({media: {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 192}}, subtitles: {enabled: true, languages: ['en'], source: 'auto-only', mode: 'embed', format: 'srt'}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.spec?.producesVideo).toBe(false)
		expect(resolved.subtitles).toEqual({request: {kind: 'languages', languages: ['en'], source: 'auto-only'}, mode: 'sidecar', format: 'srt'})
	})

	it.each(['manual-first', 'manual-only', 'auto-only', 'manual-and-auto'] as const)('carries the %s subtitle source on the job request', source => {
		const profile = customProfile({subtitles: {enabled: true, languages: ['en'], source, mode: 'sidecar', format: 'srt'}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.subtitles).toEqual({request: {kind: 'languages', languages: ['en'], source}, mode: 'sidecar', format: 'srt'})
	})

	it('resolves WAV audio-only profiles as lossless conversion with no bitrate', () => {
		const profile = customProfile({media: {kind: 'audio-only', audio: {format: 'wav'}}})
		const resolved = resolveDownloadProfile(profile, {kind: 'custom', id: profile.id})

		expect(resolved.spec?.audioConvert).toEqual({target: 'wav'})
		expect(downloadProfileLabel(profile)).toBe('Audio only · WAV')
	})

	it('uses the default filename shape after normalizing a legacy profile', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const {filename: _filename, ...legacy} = balanced
		const profile = downloadProfileSchema.parse(legacy)

		expect(profile.filename).toEqual({kind: 'default'})
		expect(resolveFilenameTemplate(profile, '{title}')).toBe('{title}')
	})

	it('defaults enabled to true for profiles persisted before the visibility switch', () => {
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')!
		const {enabled: _enabled, ...legacy} = balanced
		const profile = downloadProfileSchema.parse(legacy)

		expect(profile.enabled).toBe(true)
	})

	it('hides opt-in low-data built-ins from enabled profiles by default', () => {
		const enabled = enabledDownloadProfiles(DEFAULT_DOWNLOAD_PROFILES_PREFS)
		expect(enabled.some(profile => profile.id === 'low-240')).toBe(false)
		expect(enabled.some(profile => profile.id === 'low-144')).toBe(false)
		expect(allDownloadProfiles(DEFAULT_DOWNLOAD_PROFILES_PREFS).some(profile => profile.id === 'low-240')).toBe(true)

		const withLow = setDownloadProfileEnabled(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'low-240', true)
		expect(enabledDownloadProfiles(withLow).some(profile => profile.id === 'low-240')).toBe(true)
		expect(enabledDownloadProfiles(withLow).some(profile => profile.id === 'low-144')).toBe(false)
	})

	it('falls through a disabled active profile to the default builtin', () => {
		const disabledActive = setDownloadProfileEnabled({...DEFAULT_DOWNLOAD_PROFILES_PREFS, active: {kind: 'builtin', id: 'low-240'}}, 'low-240', true)
		const toggledOff = setDownloadProfileEnabled(disabledActive, 'low-240', false)
		// active pointed at low-240 which is now disabled → must fall through, not return it
		const prefs = {...toggledOff, active: {kind: 'builtin' as const, id: 'low-240'}}
		const resolved = resolveActiveDownloadProfile(prefs)
		expect(resolved.profile.id).toBe('balanced')
		expect(resolved.profile.enabled).toBe(true)
	})

	it('moves active to the default builtin, not catalog order, when the active profile is disabled', () => {
		const prefsWithAudioActive = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, active: {kind: 'builtin' as const, id: 'audio-only'}}
		const next = setDownloadProfileEnabled(prefsWithAudioActive, 'audio-only', false)
		// resolveActiveDownloadProfile prefers DEFAULT_DOWNLOAD_PROFILE_REF ('balanced') over
		// catalog order ('best-quality' would be enabledDownloadProfiles(next)[0])
		expect(next.active).toEqual({kind: 'builtin', id: 'balanced'})
	})

	it('moves active off a toggled-off profile and leaves updatedAt alone', () => {
		const custom = customProfile({updatedAt: '2026-06-07T00:00:00.000Z'})
		const withCustom = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, custom)
		const activeCustom = {...withCustom, active: {kind: 'custom' as const, id: custom.id}}
		const next = setDownloadProfileEnabled(activeCustom, custom.id, false)
		expect(next.active).not.toEqual({kind: 'custom', id: custom.id})
		expect(resolveActiveDownloadProfile(next).profile.enabled).toBe(true)
		const toggled = next.custom.find(profile => profile.id === custom.id)
		expect(toggled?.enabled).toBe(false)
		expect(toggled?.updatedAt).toBe('2026-06-07T00:00:00.000Z')
	})

	it('ignores toggling off the last enabled profile', () => {
		const onlyOne = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [], overrides: [], enabledOverrides: Object.fromEntries(BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.id !== 'balanced').map(profile => [profile.id, false]))}
		expect(enabledDownloadProfiles(onlyOne)).toHaveLength(1)
		const next = setDownloadProfileEnabled(onlyOne, 'balanced', false)
		expect(enabledDownloadProfiles(next)).toHaveLength(1)
		expect(next.enabledOverrides.balanced).toBeUndefined()
	})

	it('enabling a built-in does not create an overrides snapshot', () => {
		const next = setDownloadProfileEnabled(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'low-240', true)
		expect(next.overrides).toHaveLength(0)
		expect(next.enabledOverrides).toEqual({'low-240': true})
		const profile = allDownloadProfiles(next).find(item => item.id === 'low-240')!
		expect(downloadProfileOrigin(profile, next)).toEqual({kind: 'builtin', overridden: false})
	})

	it('clearing a built-in back to its default deletes the enabledOverrides key', () => {
		const enabled = setDownloadProfileEnabled(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'low-240', true)
		expect(enabled.enabledOverrides).toEqual({'low-240': true})
		const cleared = setDownloadProfileEnabled(enabled, 'low-240', false)
		expect(cleared.enabledOverrides).toEqual({})
		expect('low-240' in cleared.enabledOverrides).toBe(false)
	})

	it('returns no enabled profiles without throwing the active resolver on hand-edited prefs', () => {
		const prefs = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, custom: [], overrides: [], enabledOverrides: Object.fromEntries(BUILTIN_DOWNLOAD_PROFILES.map(profile => [profile.id, false])), active: {kind: 'builtin' as const, id: 'balanced'}}
		expect(enabledDownloadProfiles(prefs)).toEqual([])
		expect(() => resolveActiveDownloadProfile(prefs)).not.toThrow()
		expect(resolveActiveDownloadProfile(prefs).profile).toBeDefined()
	})
})

describe('download profile order', () => {
	const catalogIds = BUILTIN_DOWNLOAD_PROFILES.map(profile => profile.id)
	const ids = (profiles: readonly DownloadProfile[]): string[] => profiles.map(profile => profile.id)

	it('lists built-ins first, then custom profiles, until the user reorders', () => {
		const withCustom = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, customProfile())
		expect(ids(allDownloadProfiles(withCustom))).toEqual([...catalogIds, 'study-captions'])
	})

	it('moves a profile to where the target stands and shifts the ones between', () => {
		const next = moveDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'balanced', 'best-quality')
		expect(ids(allDownloadProfiles(next)).slice(0, 6)).toEqual(['balanced', 'best-quality', 'best-2160', 'best-1440', 'hd-1080', 'small-file'])

		const back = moveDownloadProfile(next, 'balanced', 'hd-1080')
		expect(ids(allDownloadProfiles(back))).toEqual(catalogIds)
	})

	it('mixes custom profiles in among the built-ins', () => {
		const withCustom = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, customProfile())
		const next = moveDownloadProfile(withCustom, 'study-captions', 'best-2160')
		expect(ids(allDownloadProfiles(next)).slice(0, 3)).toEqual(['best-quality', 'study-captions', 'best-2160'])
	})

	it('keeps a hidden profile in place and leaves it out of the enabled list', () => {
		const next = moveDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'low-240', 'best-quality')
		expect(ids(allDownloadProfiles(next))[0]).toBe('low-240')
		expect(ids(enabledDownloadProfiles(next))[0]).toBe('best-quality')

		const shown = setDownloadProfileEnabled(next, 'low-240', true)
		expect(ids(enabledDownloadProfiles(shown))[0]).toBe('low-240')
	})

	it('puts profiles the user never placed after the placed ones, in catalog order', () => {
		const placed = {...DEFAULT_DOWNLOAD_PROFILES_PREFS, order: ['audio-only', 'balanced']}
		const withCustom = saveDownloadProfileToPrefs(placed, customProfile())
		expect(ids(allDownloadProfiles(withCustom))).toEqual(['audio-only', 'balanced', ...catalogIds.filter(id => id !== 'audio-only' && id !== 'balanced'), 'study-captions'])
	})

	it('drops a removed custom profile from the order', () => {
		const withCustom = saveDownloadProfileToPrefs(DEFAULT_DOWNLOAD_PROFILES_PREFS, customProfile())
		const moved = moveDownloadProfile(withCustom, 'study-captions', 'best-quality')
		expect(moved.order?.[0]).toBe('study-captions')

		const removed = removeDownloadProfileFromPrefs(moved, 'study-captions')
		expect(removed.order).not.toContain('study-captions')
		expect(ids(allDownloadProfiles(removed))).toEqual(catalogIds)
	})

	it('drops unknown and repeated ids from a stored order', () => {
		const normalized = normalizeDownloadProfilesPrefs({...DEFAULT_DOWNLOAD_PROFILES_PREFS, order: ['audio-only', 'gone', 'audio-only', 'balanced']})
		expect(normalized.order).toEqual(['audio-only', 'balanced'])
	})

	it('leaves the order alone for an unknown profile or a drop on itself', () => {
		expect(moveDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'gone', 'balanced').order).toBeUndefined()
		expect(moveDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'balanced', 'gone').order).toBeUndefined()
		expect(moveDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS, 'balanced', 'balanced').order).toBeUndefined()
	})
})

describe('download profile filename template', () => {
	const base = BUILTIN_DOWNLOAD_PROFILES[0]

	it('accepts the inherited template and a custom one that validates', () => {
		expect(downloadProfileFilenameFailure({...base, filename: {kind: 'default'}})).toBeNull()
		expect(downloadProfileFilenameFailure({...base, filename: {kind: 'custom', template: '{uploader}/{title} [{id}]'}})).toBeNull()
	})

	it('names why a custom template does not validate', () => {
		expect(downloadProfileFilenameFailure({...base, filename: {kind: 'custom', template: '{titel}'}})).toEqual({ok: false, code: 'unknown-token', token: 'titel'})
		expect(downloadProfileFilenameFailure({...base, filename: {kind: 'custom', template: 'a:b {title}'}})).toEqual({ok: false, code: 'forbidden-char'})
	})
})
