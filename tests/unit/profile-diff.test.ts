import {describe, expect, it} from 'vite-plus/test'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {profileDiffRows} from '@renderer/store/wizard/profileDiff.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {i18next} from '@shared/i18n/index.js'

const t = (key: string): string => key
const CTX = {t, profileFormat: (profile: DownloadProfile): string => profileFormatLabel(profile, i18next.t, 'en'), defaultOutputDir: '/home/user/Downloads', globalFilenameTemplate: undefined, commonPaths: undefined}

function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`no built-in ${id}`)
	return structuredClone(profile)
}

describe('profileDiffRows', () => {
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
		expect(rows[1]).toEqual({area: 'subtitles', before: 'wizard.review.value.subtitlesOff', after: 'en, de · SRT · wizard.subtitles.saveMode.sidecar'})
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
