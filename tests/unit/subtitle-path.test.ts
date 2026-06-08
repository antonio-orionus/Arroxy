import {describe, expect, it} from 'vitest'
import {isSubtitleFile, detectSubtitleLang, EMBED_CONTAINER_EXT} from '@shared/subtitlePath.js'

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

describe('detectSubtitleLang', () => {
	it('detects lang from .<lang>.<ext> suffix', () => {
		expect(detectSubtitleLang('video.en.srt', ['en'])).toBe('en')
		expect(detectSubtitleLang('video.es.vtt', ['en', 'es'])).toBe('es')
		expect(detectSubtitleLang('video.zh-Hans.ass', ['zh-Hans'])).toBe('zh-Hans')
	})

	it('returns first matching lang when multiple candidates', () => {
		const result = detectSubtitleLang('video.es.srt', ['en', 'es', 'fr'])
		expect(result).toBe('es')
	})

	it('returns null when lang not in requestedLangs', () => {
		expect(detectSubtitleLang('video.fr.srt', ['en', 'es'])).toBeNull()
	})

	it('returns null for empty requestedLangs', () => {
		expect(detectSubtitleLang('video.en.srt', [])).toBeNull()
	})

	it('returns null when path has no subtitle extension', () => {
		expect(detectSubtitleLang('video.en.mp4', ['en'])).toBeNull()
	})

	it('returns null for path with no .<lang>.<ext> pattern', () => {
		expect(detectSubtitleLang('video.srt', ['en'])).toBeNull()
	})

	// The source comment explicitly guards against a generic `\.([^.]+)\.<ext>$`
	// regex which would match `0` (from `1.0`) as the lang for "Tutorial 1.0.en.srt".
	// The strict per-lang regex must match `en` correctly AND not produce `0`.
	it('strict match: Tutorial 1.0.en.srt with [en] → en', () => {
		expect(detectSubtitleLang('Tutorial 1.0.en.srt', ['en'])).toBe('en')
	})

	it('false-positive guard: Tutorial 1.0.en.srt with ["0"] → null', () => {
		expect(detectSubtitleLang('Tutorial 1.0.en.srt', ['0'])).toBeNull()
	})

	it('is case-insensitive for subtitle extension', () => {
		expect(detectSubtitleLang('video.en.SRT', ['en'])).toBe('en')
	})
})

describe('EMBED_CONTAINER_EXT', () => {
	it('is mkv — ytDlpArgs and muxer must stay in sync', () => {
		expect(EMBED_CONTAINER_EXT).toBe('mkv')
	})
})
