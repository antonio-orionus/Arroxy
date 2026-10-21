import {describe, expect, it} from 'vite-plus/test'
import {isSubtitleFile} from '@shared/subtitlePath.js'

describe('isSubtitleFile', () => {
	it.each([
		['video.srt', true],
		['video.vtt', true],
		['video.ass', true],
		['video.SRT', true],
		['video.VTT', true],
		['video.ASS', true],
		['video.mp4', false],
		['video', false],
		['video.txt', false],
		['video.srt.bak', false],
		['', false]
	])('isSubtitleFile(%s) → %s', (path, expected) => {
		expect(isSubtitleFile(path)).toBe(expected)
	})
})
