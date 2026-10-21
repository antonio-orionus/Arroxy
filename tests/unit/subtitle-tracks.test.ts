import {describe, expect, it} from 'vite-plus/test'
import {matchesSubtitleLanguage, pickedTrack, planSubtitleTracks, type SubtitleMaps, type SubtitlePlan} from '@shared/subtitleTracks.js'

// Track keys observed on a real YouTube video (`yt-dlp --list-subs`), plus
// regional variants uploaders commonly set. `de-en` is German auto-translated
// from English — a translation, not a regional variant.
const TRACK_KEYS = ['de', 'de-DE', 'de-AT', 'de-en', 'de-ja', 'de-es-419', 'en', 'en-US', 'en-GB', 'en-de-DE', 'es', 'es-419', 'pt', 'pt-BR', 'pt-PT', 'zh-Hans', 'zh-Hant', 'uk', 'iw', 'en-orig']

describe('matchesSubtitleLanguage', () => {
	it.each([
		['de', ['de', 'de-DE', 'de-AT']],
		['en', ['en', 'en-US', 'en-GB']],
		['es', ['es', 'es-419']],
		['pt', ['pt', 'pt-BR', 'pt-PT']],
		['zh', ['zh-Hans', 'zh-Hant']],
		['zh-Hans', ['zh-Hans']],
		['uk', ['uk']]
	])('matches %s to its regional variants only', (code, expected) => {
		expect(TRACK_KEYS.filter(key => matchesSubtitleLanguage(code, key))).toEqual(expected)
	})

	it('compares the language part case-insensitively', () => {
		expect(matchesSubtitleLanguage('pt-br', 'pt-BR')).toBe(true)
		expect(matchesSubtitleLanguage('DE', 'de-DE')).toBe(true)
	})
})

const picked = (plan: SubtitlePlan): {tracks: string[]; missing: string[]} => ({tracks: plan.tracks.map(track => track.key), missing: plan.missing})

describe('planSubtitleTracks: a languages request', () => {
	// A Japanese video as the Format screen sees it: YouTube's auto captions cut to `-orig`.
	const maps: SubtitleMaps = {subtitles: {'en-US': [{ext: 'vtt'}]}, automaticCaptions: {'ja-orig': [{ext: 'vtt'}]}}

	it('picks manual tracks and real automatic captions, reporting codes the video lacks', () => {
		expect(picked(planSubtitleTracks({kind: 'languages', languages: ['ja', 'en', 'de'], source: 'manual-first'}, maps))).toEqual({tracks: ['ja-orig', 'en-US'], missing: ['de']})
	})

	it('honours the source', () => {
		expect(picked(planSubtitleTracks({kind: 'languages', languages: ['ja', 'en'], source: 'manual-only'}, maps))).toEqual({tracks: ['en-US'], missing: ['ja']})
		expect(picked(planSubtitleTracks({kind: 'languages', languages: ['ja', 'en'], source: 'auto-only'}, maps))).toEqual({tracks: ['ja-orig'], missing: ['en']})
	})

	it('picks the automatic caption next to the manual track for manual-and-auto', () => {
		const both: SubtitleMaps = {subtitles: {en: [{ext: 'vtt'}]}, automaticCaptions: {'en-orig': [{ext: 'vtt'}]}}
		expect(picked(planSubtitleTracks({kind: 'languages', languages: ['en'], source: 'manual-first'}, both))).toEqual({tracks: ['en'], missing: []})
		expect(picked(planSubtitleTracks({kind: 'languages', languages: ['en', 'ja'], source: 'manual-and-auto'}, both))).toEqual({tracks: ['en', 'en-orig'], missing: ['ja']})
	})

	it('says which map each track comes from, a key both hold being the manual one wherever manual tracks are fetched', () => {
		// A non-YouTube site keys both tracks plain `en`.
		const shared: SubtitleMaps = {subtitles: {en: [{ext: 'vtt'}]}, automaticCaptions: {en: [{ext: 'vtt'}], 'de-DE': [{ext: 'vtt'}]}}
		expect(planSubtitleTracks({kind: 'languages', languages: ['en', 'de'], source: 'manual-and-auto'}, shared).tracks.map(({key, auto}) => ({key, auto}))).toEqual([
			{key: 'en', auto: false},
			{key: 'de-DE', auto: true}
		])
		expect(planSubtitleTracks({kind: 'languages', languages: ['en'], source: 'auto-only'}, shared).tracks.map(({key, auto}) => ({key, auto}))).toEqual([{key: 'en', auto: true}])
	})

	it('names each track by its base language', () => {
		expect(planSubtitleTracks({kind: 'languages', languages: ['ja', 'en'], source: 'manual-first'}, maps).tracks.map(track => track.language)).toEqual(['ja', 'en-US'])
	})
})

// yt-dlp lists YouTube's original-language caption under its bare key too (`en`,
// same URL), and that key names the file `….en.srt` and the embedded track `eng`.
describe('planSubtitleTracks: request keys', () => {
	const maps: SubtitleMaps = {subtitles: {en: [{ext: 'vtt'}]}, automaticCaptions: {'en-orig': [{ext: 'vtt'}], 'ja-orig': [{ext: 'vtt'}]}}
	const requestKeys = (tracks: {key: string; auto: boolean}[]): string[] => planSubtitleTracks({kind: 'tracks', tracks}, maps).tracks.map(track => track.requestKey)

	it('asks for an original-language caption by its bare key', () => {
		expect(
			requestKeys([
				{key: 'ja-orig', auto: true},
				{key: 'en', auto: false}
			])
		).toEqual(['ja', 'en'])
	})

	// yt-dlp fills a key with the manual track first, so the bare key would bring the manual one back.
	it('keeps the -orig key when the plan fetches a manual track and the video has one under the bare key', () => {
		expect(
			requestKeys([
				{key: 'en', auto: false},
				{key: 'en-orig', auto: true}
			])
		).toEqual(['en', 'en-orig'])
	})

	it('uses the bare key when the plan fetches no manual track', () => {
		expect(requestKeys([{key: 'en-orig', auto: true}])).toEqual(['en'])
		expect(planSubtitleTracks({kind: 'languages', languages: ['en'], source: 'auto-only'}, maps).tracks.map(track => track.requestKey)).toEqual(['en'])
	})
})

describe('planSubtitleTracks: a tracks request', () => {
	it('keeps the picked tracks as they are, missing nothing', () => {
		const maps: SubtitleMaps = {subtitles: {'de-DE': [{ext: 'vtt'}]}, automaticCaptions: {}}
		expect(planSubtitleTracks({kind: 'tracks', tracks: [{key: 'de-DE', auto: false}]}, maps)).toEqual({tracks: [{key: 'de-DE', requestKey: 'de-DE', auto: false, language: 'de-DE'}], missing: []})
	})
})

describe('pickedTrack', () => {
	it('is the uploaded track when the manual subtitles hold the key, the automatic caption otherwise', () => {
		const maps = {subtitles: {en: [{ext: 'vtt'}]}}
		expect(pickedTrack('en', maps)).toEqual({key: 'en', auto: false})
		expect(pickedTrack('en-orig', maps)).toEqual({key: 'en-orig', auto: true})
		expect(pickedTrack('constructor', maps)).toEqual({key: 'constructor', auto: true})
	})
})

describe('language codes with two spellings', () => {
	// YouTube serves Hebrew as iw and Norwegian Bokmål as no; other sites and
	// the app's own language use he and nb.
	it('match each other in either direction, regions included', () => {
		expect(matchesSubtitleLanguage('iw', 'he')).toBe(true)
		expect(matchesSubtitleLanguage('he', 'iw')).toBe(true)
		expect(matchesSubtitleLanguage('no', 'nb')).toBe(true)
		expect(matchesSubtitleLanguage('nb', 'no')).toBe(true)
		expect(matchesSubtitleLanguage('yi', 'ji')).toBe(true)
		expect(matchesSubtitleLanguage('he', 'iw-IL')).toBe(true)
	})

	it('match with a region on either side', () => {
		expect(matchesSubtitleLanguage('he-IL', 'iw-IL')).toBe(true)
		expect(matchesSubtitleLanguage('iw-IL', 'he-IL')).toBe(true)
	})

	it('count as one language when manual tracks win', () => {
		const plan = planSubtitleTracks({kind: 'languages', languages: ['he'], source: 'manual-first'}, {subtitles: {he: [{ext: 'vtt'}]}, automaticCaptions: {'iw-orig': [{ext: 'vtt'}]}})
		expect(plan.tracks.map(track => track.key)).toEqual(['he'])
	})

	it('match nothing else', () => {
		expect(matchesSubtitleLanguage('iw', 'id')).toBe(false)
		expect(matchesSubtitleLanguage('no', 'nl')).toBe(false)
		expect(matchesSubtitleLanguage('he', 'iw-en')).toBe(false)
	})
})
