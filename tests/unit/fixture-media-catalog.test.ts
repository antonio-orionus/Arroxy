import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import catalog from '../e2e/fixture-media-catalog.json' with {type: 'json'}
import {AWKWARD_TITLE, AWKWARD_TITLE_VIDEO_ID, FIXTURE_PLAYLIST_ID, FIXTURE_PLAYLIST_VIDEO_IDS, FIXTURE_VIDEO_IDS, SPLIT_MEDIA_VIDEO_ID, fixtureMediaContentType, fixtureMediaPathExtension} from '../e2e/fixtureMediaCatalog.js'

describe('fixture media catalog', () => {
	it('owns fixture ids, playlist membership, titles, and format facts', () => {
		expect(FIXTURE_VIDEO_IDS).toHaveLength(10)
		expect(FIXTURE_VIDEO_IDS[0]).toBe('ARX00000001')
		expect(SPLIT_MEDIA_VIDEO_ID).toBe('ARX00000011')
		expect(FIXTURE_PLAYLIST_ID).toBe('PLarroxyfixture')
		expect(FIXTURE_PLAYLIST_VIDEO_IDS).toEqual(FIXTURE_VIDEO_IDS.slice(0, 3))
		expect(catalog.playlist.title).toBe('Fixture Playlist')
		expect(catalog.videos.find(video => video.id === SPLIT_MEDIA_VIDEO_ID)?.number).toBe(11)
		expect(AWKWARD_TITLE_VIDEO_ID).toBe('ARX00000012')
		expect(FIXTURE_VIDEO_IDS).not.toContain(AWKWARD_TITLE_VIDEO_ID)
		expect(catalog.formatSets.muxed.map(format => format.id)).toEqual(['18', '22'])
		expect(catalog.formatSets.split.map(format => format.id)).toEqual(['137', '140'])
		expect(fixtureMediaPathExtension('140')).toBe('m4a')
		expect(fixtureMediaContentType('140')).toBe('audio/mp4')
	})

	it('keeps the awkward title genuinely awkward', () => {
		// Guards the fixture against quietly decaying into an ordinary title and
		// leaving the filename budget E2E proving nothing. Each property below is
		// one of the hazards that budget exists for.
		expect(AWKWARD_TITLE).toContain(':') // yt-dlp's sanitizer turns this into two characters
		expect(AWKWARD_TITLE).toContain('|') // ...and this into a 3-byte full-width form
		expect(AWKWARD_TITLE).toMatch(/\p{Extended_Pictographic}/u) // a surrogate pair to split
		// Long enough to force shortening under either counting unit.
		expect(AWKWARD_TITLE.length).toBeGreaterThan(255)
		expect(new TextEncoder().encode(AWKWARD_TITLE).length).toBeGreaterThan(255)
	})

	it('keeps concrete fixture ids out of the Python extractor adapter', () => {
		const source = readFileSync('tests/e2e/yt-dlp-plugins/yt_dlp_plugins/extractor/arroxy_fixture.py', 'utf8')
		expect(source).not.toMatch(/ARX000000\d\d/)
		expect(source).not.toContain('PLarroxyfixture')
	})
})
