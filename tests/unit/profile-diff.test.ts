import {describe, expect, it} from 'vite-plus/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {profileDiffRows} from '@renderer/store/wizard/profileDiff.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {i18next} from '@shared/i18n/index.js'

const t = (key: string): string => key
const CTX = {t, language: 'en', profileFormat: (profile: DownloadProfile): string => profileFormatLabel(profile, i18next.t, 'en'), defaultOutputDir: '/home/user/Downloads', globalFilenameTemplate: undefined, commonPaths: undefined}

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`no built-in ${id}`)
	return structuredClone(profile)
}

describe('profileDiffRows', () => {
	// A codec-only edit from the Format screen is an edit: Update must offer it.
	it('lists a change of an advanced video setting alone', () => {
		const before = builtin('hd-1080')
		const after: DownloadProfile = {...before, media: {...before.media, videoCodec: 'h264'} as DownloadProfile['media']}
		expect(profileDiffRows(before, after, CTX)).toEqual([{area: 'format', before: 'Up to 1080p · Best picture', after: 'Up to 1080p · Best picture · H.264 first'}])
	})

	// Swapping a manual track for an automatic one changes only the source.
	it('lists a change of the subtitle source alone', () => {
		const before: DownloadProfile = {...builtin('hd-1080'), subtitles: {enabled: true, languages: ['en'], source: 'manual-first', mode: 'sidecar', format: 'srt'}}
		const after: DownloadProfile = {...before, subtitles: {...before.subtitles, source: 'auto-only'}}
		expect(profileDiffRows(before, after, CTX).map(row => row.area)).toEqual(['subtitles'])
	})

	// A subtitles-only job writes files in the saved format even with Embed saved.
	it('lists a subtitle format change on a subtitles-only profile saved with Embed', () => {
		const base = builtin('subtitles-only')
		const before: DownloadProfile = {...base, subtitles: {...base.subtitles, mode: 'embed', format: 'ass'}}
		const after: DownloadProfile = {...before, subtitles: {...before.subtitles, format: 'srt'}}
		expect(profileDiffRows(before, after, CTX)).toEqual([
			{area: 'format', before: 'Subtitles only · English · ASS', after: 'Subtitles only · English · SRT'},
			{area: 'subtitles', before: 'English · ASS · wizard.subtitles.saveMode.embed', after: 'English · SRT · wizard.subtitles.saveMode.embed'}
		])
	})

	it('is empty for identical profiles', () => {
		expect(profileDiffRows(builtin('hd-1080'), builtin('hd-1080'), CTX)).toEqual([])
	})

	it('lists only the areas that differ, old value then new', () => {
		const before = builtin('hd-1080')
		const after = {...builtin('hd-1080'), embed: {...before.embed, thumbnailSidecar: true}}
		expect(profileDiffRows(before, after, CTX)).toEqual([{area: 'extras', before: '', after: '+ wizard.output.writeThumbnail.label'}])
	})

	it('describes the media, subtitles, SponsorBlock, folder and file name', () => {
		const before = builtin('hd-1080')
		const after: DownloadProfile = {
			...builtin('balanced'),
			id: before.id,
			subtitles: {...before.subtitles, enabled: true, languages: ['en', 'de'], format: 'srt', mode: 'sidecar'},
			sponsorBlock: {mode: 'remove', categories: ['sponsor']},
			output: {kind: 'fixed', dir: '/media/videos'},
			subfolder: {enabled: false, name: before.subfolder.name},
			filename: {kind: 'custom', template: '{title}'}
		}
		const rows = profileDiffRows(before, after, CTX)
		expect(rows.map(row => row.area)).toEqual(['format', 'subtitles', 'sponsorBlock', 'saveTo', 'fileName'])
		expect(rows[0]).toEqual({area: 'format', before: 'Up to 1080p · Best picture', after: 'Up to 720p · Best picture'})
		expect(rows[1]).toEqual({area: 'subtitles', before: 'wizard.review.value.subtitlesOff', after: 'English and German · SRT · wizard.subtitles.saveMode.sidecar'})
		expect(rows[2]).toEqual({area: 'sponsorBlock', before: 'wizard.review.value.sponsorBlockOff', after: 'wizard.sponsorblock.mode.remove · wizard.sponsorblock.cat.sponsor'})
		expect(rows[3]).toEqual({area: 'saveTo', before: '/home/user/Downloads/Full HD 1080p', after: '/media/videos'})
		expect(rows[4].after).toBe('{title}')
	})

	it('shows a change of SponsorBlock categories alone, so the update can be confirmed', () => {
		const before = {...builtin('hd-1080'), sponsorBlock: {mode: 'remove' as const, categories: ['sponsor' as const]}}
		const after = {...before, sponsorBlock: {mode: 'remove' as const, categories: ['sponsor' as const, 'intro' as const]}}
		expect(profileDiffRows(before, after, CTX)).toEqual([{area: 'sponsorBlock', before: 'wizard.sponsorblock.mode.remove · wizard.sponsorblock.cat.sponsor', after: 'wizard.sponsorblock.mode.remove · wizard.sponsorblock.cat.sponsor, wizard.sponsorblock.cat.intro'}])
	})
})
