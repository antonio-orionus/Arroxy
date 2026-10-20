import {describe, expect, it} from 'vite-plus/test'
import {createFormatSorter, prepareForSort, sortFormats} from '@shared/ytdlp/formatSorter.js'
import type {YtDlpSelectableFormat} from '@shared/ytdlp/selectableFormat.js'

const FORMATS: YtDlpSelectableFormat[] = [
	{format_id: 'tall', vcodec: 'avc1', acodec: 'none', width: 1920, height: 1080, source_preference: -1},
	{format_id: 'short', vcodec: 'avc1', acodec: 'none', width: 1280, height: 720, source_preference: 5}
]

// Best last, as yt-dlp sorts.
function ids(userSort: readonly string[], extractorSort: readonly string[]): string[] {
	return sortFormats(prepareForSort(FORMATS, undefined), createFormatSorter(userSort, extractorSort)).map(format => format.format_id ?? '')
}

describe('yt-dlp format sort', () => {
	it("takes an extractor sort field it has no setting for as yt-dlp's arbitrary field, not an error", () => {
		expect(ids([], ['res', 'nosuchfield'])).toEqual(ids([], ['res']))
	})

	it("ranks by the format's own value of an arbitrary field, as yt-dlp does", () => {
		// `source_preference` itself has no setting (yt-dlp's `source` field reads it).
		expect(ids(['source_preference'], []).at(-1)).toBe('short')
		expect(ids(['+source_preference'], []).at(-1)).toBe('tall')
	})
})
