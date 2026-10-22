import {createInstance} from 'i18next'
import {describe, expect, it} from 'vite-plus/test'
import {profileSummaryRows} from '@renderer/lib/profileSummary.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {i18next} from '@shared/i18n/index.js'
import type {DownloadProfile} from '@shared/types.js'

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`no built-in ${id}`)
	return profile
}

const en = (profile: DownloadProfile): string => profileFormatLabel(profile, i18next.t, 'en')

describe('profile format label', () => {
	it('says what each kind of profile downloads, with the words the editor uses', () => {
		expect(en(builtin('best-quality'))).toBe('Best quality · Best picture')
		expect(en(builtin('balanced'))).toBe('Up to 720p · Best picture')
		expect(en(builtin('best-2160'))).toBe('Up to 4K · Best picture')
		expect(en(builtin('mp4-720'))).toBe('Up to 720p · Smart TV')
		expect(en({...builtin('balanced'), media: {kind: 'video-only', goal: 'best-picture', tier: '480', fileType: 'mkv'}})).toBe('Up to 480p · Best picture · MKV · No audio')
		expect(en(builtin('audio-only'))).toBe('Audio only · Keep as-is')
		expect(en({...builtin('audio-only'), media: {kind: 'audio-only', audio: {format: 'wav'}}})).toBe('Audio only · WAV (uncompressed)')
		expect(en(builtin('subtitles-only'))).toBe('Subtitles only · English · SRT')
	})

	it('names the advanced video settings a profile overrides, and only those', () => {
		const tuned: DownloadProfile = {...builtin('hd-1080'), media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', videoCodec: 'h264', hdr: {kind: 'custom', preference: 'sdr'}, aiUpscaled: 'allow', audio: {native: {kind: 'custom', preference: 'surround'}}}}
		expect(en(tuned)).toBe('Up to 1080p · Best picture · H.264 first · SDR · AI-upscaled allowed · Prefer surround / Dolby')
		expect(en(builtin('hd-1080'))).toBe('Up to 1080p · Best picture')
	})

	it('names each override on its own, video-only profiles included', () => {
		const base = builtin('hd-1080')
		expect(en({...base, media: {kind: 'video-only', goal: 'best-picture', tier: '1080', fileType: 'auto', videoCodec: 'vp9', aiUpscaled: 'allow'}})).toBe('Up to 1080p · Best picture · VP9 first · AI-upscaled allowed · No audio')
		expect(en({...base, media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', hdr: {kind: 'custom', preference: 'hdr'}, audio: {native: {kind: 'default'}}}})).toBe('Up to 1080p · Best picture · HDR')
		expect(en({...base, media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', hdr: {kind: 'default'}, aiUpscaled: 'skip', audio: {native: {kind: 'default'}}}})).toBe('Up to 1080p · Best picture')
	})

	it('names a subtitle source other than the default', () => {
		const subtitles = {...builtin('subtitles-only').subtitles, source: 'auto-only' as const}
		expect(en({...builtin('subtitles-only'), subtitles})).toBe('Subtitles only · English · SRT · Auto-generated only')
	})

	// Media without video has nothing to embed into: the job writes the subtitle
	// files in their format, so the label names it whatever mode is saved.
	it('names the subtitle format when Embed is saved but there is no video to embed into', () => {
		const subtitlesOnly = {...builtin('subtitles-only'), subtitles: {...builtin('subtitles-only').subtitles, mode: 'embed' as const, format: 'ass' as const}}
		expect(en(subtitlesOnly)).toBe('Subtitles only · English · ASS')
		expect(profileSummaryRows(subtitlesOnly, i18next.t, 'en')[0]).toEqual({label: 'Subtitles', value: 'English · ASS'})

		const subtitles = {enabled: true, languages: ['en'], source: 'manual-first' as const, mode: 'embed' as const, format: 'vtt' as const}
		expect(profileSummaryRows({...builtin('audio-only'), subtitles}, i18next.t, 'en')[1]).toEqual({label: 'Subtitles', value: 'English · VTT'})
		expect(profileSummaryRows({...builtin('hd-1080'), subtitles}, i18next.t, 'en')[1]).toEqual({label: 'Subtitles', value: 'English'})
	})

	it('uses the default bitrate for a lossy audio profile with none set', () => {
		expect(en({...builtin('audio-only'), media: {kind: 'audio-only', audio: {format: 'mp3'}}})).toBe('Audio only · MP3 192 kbps')
	})

	it('words everything from the catalog it is given, languages and lists in its language', async () => {
		const catalog = createInstance()
		await catalog.init({lng: 'de', resources: {de: {translation: {playlistPresets: {tier: {'720': 'Bis 720p'}}, wizard: {profileEditor: {goal: {bestPicture: {name: 'Bestes Bild'}}}}}}}})
		expect(profileFormatLabel(builtin('balanced'), catalog.t, 'de')).toBe('Bis 720p · Bestes Bild')

		const subtitles = {...builtin('subtitles-only'), subtitles: {...builtin('subtitles-only').subtitles, languages: ['en', 'de']}}
		expect(profileSummaryRows(subtitles, i18next.t, 'de')[0]?.value).toBe('Englisch und Deutsch · SRT')
	})
})

describe('profile summary rows', () => {
	it('lists what a profile downloads, its subtitles, where it saves and its extras', () => {
		expect(profileSummaryRows(builtin('balanced'), i18next.t, 'en')).toEqual([
			{label: 'Video', value: 'Up to 720p · Best picture'},
			{label: 'Subtitles', value: 'Off'},
			{label: 'Save to', value: 'Default downloads folder / Balanced 720p'},
			{label: 'Extras', value: 'Chapters and Metadata'}
		])
	})

	it('names the kind only in the row label, not the value', () => {
		expect(profileSummaryRows(builtin('audio-only'), i18next.t, 'en')[0]).toEqual({label: 'Audio', value: 'Keep as-is'})
	})

	it('gives a subtitles-only profile neither a subtitles nor an extras row', () => {
		expect(profileSummaryRows(builtin('subtitles-only'), i18next.t, 'en').map(row => row.label)).toEqual(['Subtitles', 'Save to'])
	})

	it('joins a Windows fixed folder and its subfolder with the Windows separator', () => {
		const fixed = {...builtin('hd-1080'), output: {kind: 'fixed' as const, dir: 'C:\\Videos'}}
		expect(profileSummaryRows(fixed, i18next.t, 'en').find(row => row.label === 'Save to')?.value).toBe('C:\\Videos\\Full HD 1080p')
	})

	it('shows a fixed folder as given, with its subfolder', () => {
		const fixed = {...builtin('hd-1080'), output: {kind: 'fixed' as const, dir: '/mnt/media'}}
		expect(profileSummaryRows(fixed, i18next.t, 'en').find(row => row.label === 'Save to')?.value).toBe('/mnt/media/Full HD 1080p')
	})
})
