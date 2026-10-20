import {mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

vi.mock('@main/services/subtitlePostProcess.js', () => ({logger: {info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn()}}))

import {readSubtitleTrackNames} from '@main/services/phases/subtitleTracks.js'

const BOTH = {manual: true, auto: true}

async function trackNames(fetch: {manual: boolean; auto: boolean}, infoJsonPaths: (string | undefined)[]): Promise<ReadonlyMap<string, string>> {
	return readSubtitleTrackNames({fetch, format: 'srt', infoJsonPaths})
}

let dir: string
beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), 'arroxy-track-names-'))
})
afterEach(async () => {
	await rm(dir, {recursive: true, force: true})
})

async function infoJson(name: string, info: unknown): Promise<string> {
	const path = join(dir, name)
	await writeFile(path, typeof info === 'string' ? info : JSON.stringify(info))
	return path
}

// The name yt-dlp would embed for each track key: its `requested_subtitles`
// entry, which `process_subtitles` takes from the manual tracks first, then the
// automatic captions, and the format `--sub-format <format>/best` picks.
describe('readSubtitleTrackNames', () => {
	it('names each track key, a manual track before an automatic caption of the same key', async () => {
		const path = await infoJson('a.info.json', {subtitles: {en: [{ext: 'vtt', name: 'English'}], 'pt-BR': [{ext: 'vtt', name: 'Portuguese (Brazil)'}]}, automatic_captions: {en: [{ext: 'vtt', name: 'English (auto)'}], 'en-orig': [{ext: 'vtt', name: 'English (Original)'}], ja: [{ext: 'vtt', name: 'Japanese'}]}})
		const names = await trackNames(BOTH, [path])
		expect(Object.fromEntries(names)).toEqual({en: 'English', 'pt-BR': 'Portuguese (Brazil)', 'en-orig': 'English (Original)', ja: 'Japanese'})
	})

	it('an auto-only run names a key after its automatic caption, never the manual track', async () => {
		const path = await infoJson('a.info.json', {subtitles: {en: [{ext: 'vtt', name: 'English'}]}, automatic_captions: {en: [{ext: 'vtt', name: 'English (auto)'}]}})
		const names = await trackNames({manual: false, auto: true}, [path])
		expect(Object.fromEntries(names)).toEqual({en: 'English (auto)'})
	})

	it('a run without automatic captions names no automatic caption', async () => {
		const path = await infoJson('a.info.json', {subtitles: {en: [{ext: 'vtt', name: 'English'}]}, automatic_captions: {ja: [{ext: 'vtt', name: 'Japanese'}]}})
		const names = await trackNames({manual: true, auto: false}, [path])
		expect(Object.fromEntries(names)).toEqual({en: 'English'})
	})

	it('takes the name of the format yt-dlp picks: the last in the requested format, else the last', async () => {
		const path = await infoJson('a.info.json', {
			subtitles: {
				en: [
					{ext: 'srt', name: 'English srt 1'},
					{ext: 'srt', name: 'English srt 2'},
					{ext: 'vtt', name: 'English vtt'}
				],
				de: [
					{ext: 'json3', name: 'German json3'},
					{ext: 'vtt', name: 'German vtt'}
				]
			}
		})
		const names = await trackNames(BOTH, [path])
		expect(Object.fromEntries(names)).toEqual({en: 'English srt 2', de: 'German vtt'})
	})

	it('trims names and drops blank or missing ones', async () => {
		const path = await infoJson('a.info.json', {subtitles: {en: [{ext: 'vtt', name: '  English  '}], de: [{ext: 'vtt', name: '   '}], fr: [{ext: 'vtt'}], es: [{ext: 'vtt', name: null}]}})
		const names = await trackNames(BOTH, [path])
		expect(Object.fromEntries(names)).toEqual({en: 'English'})
	})

	it('skips a missing, unparsable or malformed info-json for the next one', async () => {
		const broken = await infoJson('broken.info.json', '{not json')
		const malformed = await infoJson('malformed.info.json', {subtitles: {en: 'English'}})
		const good = await infoJson('good.info.json', {subtitles: {en: [{ext: 'vtt', name: 'English'}]}})
		const names = await trackNames(BOTH, [undefined, join(dir, 'missing.info.json'), broken, malformed, good])
		expect(Object.fromEntries(names)).toEqual({en: 'English'})
	})

	it('names nothing when no info-json is readable', async () => {
		expect((await trackNames(BOTH, [undefined, join(dir, 'missing.info.json')])).size).toBe(0)
	})

	it('a key named like an Object.prototype member is just another key', async () => {
		const path = await infoJson('a.info.json', {subtitles: {constructor: [{ext: 'vtt', name: 'Constructor'}]}, automatic_captions: {toString: [{ext: 'vtt', name: 'To string'}]}})
		const names = await trackNames(BOTH, [path])
		expect(Object.fromEntries(names)).toEqual({constructor: 'Constructor', toString: 'To string'})
		expect(names.get('hasOwnProperty')).toBeUndefined()
	})
})
