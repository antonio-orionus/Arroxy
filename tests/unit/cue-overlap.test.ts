import {describe, expect, it} from 'vitest'
import {normalizeCueOverlaps} from '@main/services/cueOverlap.js'

describe('normalizeCueOverlaps', () => {
	it('clamps an overlapping cue end to the next cue start', () => {
		const input = ['1', '00:00:00,000 --> 00:00:03,320', "Hey, what's up guys? Now, these", '', '2', '00:00:01,760 --> 00:00:04,960', 'applications are definitely going to', ''].join('\n')

		const {content, clamped} = normalizeCueOverlaps(input)

		expect(clamped).toBe(1)
		expect(content).toBe(['1', '00:00:00,000 --> 00:00:01,760', "Hey, what's up guys? Now, these", '', '2', '00:00:01,760 --> 00:00:04,960', 'applications are definitely going to', ''].join('\n'))
	})

	it('leaves a non-overlapping file byte-identical', () => {
		const input = '1\n00:00:00,000 --> 00:00:01,000\nhello\n\n2\n00:00:01,000 --> 00:00:02,000\nworld\n'

		const {content, clamped} = normalizeCueOverlaps(input)

		expect(clamped).toBe(0)
		expect(content).toBe(input)
	})

	// The whole point of a timing-only pass: everything that is not a clamped
	// end timestamp survives verbatim — headers, STYLE/NOTE blocks, cue
	// identifiers, and the cue settings that trail the end timestamp.
	it('preserves WebVTT headers, blocks, cue identifiers and cue settings', () => {
		const input = ['WEBVTT - Episode 1', 'Kind: captions', '', 'STYLE', '::cue { color: peachpuff }', '', 'NOTE a translator comment', '', 'intro-cue', '00:00:00.000 --> 00:00:03.320 align:start position:10%', 'first line', '', '00:00:01.760 --> 00:00:04.960 line:0', 'second line', ''].join('\n')

		const {content, clamped} = normalizeCueOverlaps(input)

		expect(clamped).toBe(1)
		expect(content).toBe(input.replace('00:00:00.000 --> 00:00:03.320', '00:00:00.000 --> 00:00:01.760'))
	})

	it('preserves CRLF line endings', () => {
		const input = '1\r\n00:00:00,000 --> 00:00:03,320\r\nfirst\r\n\r\n2\r\n00:00:01,760 --> 00:00:04,960\r\nsecond\r\n'

		const {content} = normalizeCueOverlaps(input)

		expect(content).toBe(input.replace('00:00:00,000 --> 00:00:03,320', '00:00:00,000 --> 00:00:01,760'))
		expect(content).not.toContain('\n\n')
	})

	it('handles the WebVTT short form (mm:ss.mmm) and keeps its shape', () => {
		const input = 'WEBVTT\n\n00:00.000 --> 00:03.320\nfirst\n\n00:01.760 --> 00:04.960\nsecond\n'

		const {content, clamped} = normalizeCueOverlaps(input)

		expect(clamped).toBe(1)
		expect(content).toContain('00:00.000 --> 00:01.760')
	})

	// A cue fully contained in its predecessor cannot be fixed by clamping —
	// the clamp would produce a zero-length or negative cue. Leave it alone.
	it('leaves a cue alone when clamping would invert or empty it', () => {
		const contained = '1\n00:00:05,000 --> 00:00:09,000\nfirst\n\n2\n00:00:05,000 --> 00:00:06,000\nsecond\n'

		const {content, clamped} = normalizeCueOverlaps(contained)

		expect(clamped).toBe(0)
		expect(content).toBe(contained)
	})

	it('is idempotent', () => {
		const input = '1\n00:00:00,000 --> 00:00:03,320\nfirst\n\n2\n00:00:01,760 --> 00:00:04,960\nsecond\n'

		const once = normalizeCueOverlaps(input)
		const twice = normalizeCueOverlaps(once.content)

		expect(twice.content).toBe(once.content)
		expect(twice.clamped).toBe(0)
	})

	it('normalizes a whole rolling auto-caption file', () => {
		const stamp = (seconds: number): string => `00:00:${String(seconds).padStart(2, '0')},000`
		const cues = Array.from({length: 5}, (_, i) => {
			const start = i * 2
			return `${i + 1}\n${stamp(start)} --> ${stamp(start + 4)}\nline ${i + 1}\n`
		}).join('\n')

		const {content, clamped} = normalizeCueOverlaps(cues)

		expect(clamped).toBe(4)
		const ranges = [...content.matchAll(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g)]
		for (let i = 0; i + 1 < ranges.length; i++) expect(ranges[i][2] <= ranges[i + 1][1]).toBe(true)
	})

	it('ignores files with no cue timings', () => {
		const input = 'WEBVTT\n\nNOTE nothing to see here\n'

		expect(normalizeCueOverlaps(input)).toEqual({content: input, clamped: 0})
	})
})
