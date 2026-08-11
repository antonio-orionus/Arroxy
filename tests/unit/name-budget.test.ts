import {describe, expect, it} from 'vitest'
import {SUFFIX_RESERVE, SHRINK_ORDER, TOKEN_FLOOR, fitName, type BudgetPiece} from '@shared/nameBudget.js'
import {limitsFor, measure} from '@shared/pathLimits.js'
import type {FilenameToken} from '@shared/schemas.js'

function lit(text: string): BudgetPiece {
	return {kind: 'literal', text}
}

function tok(token: FilenameToken, text: string): BudgetPiece {
	return {kind: 'token', token, text}
}

/** A token left for yt-dlp: emitted but not measured, charged as `reserve`. */
function late(token: FilenameToken, reserve: number): BudgetPiece {
	return {kind: 'placeholder', text: `{${token}}`, reserve}
}

function nameOf(result: ReturnType<typeof fitName>): string {
	if (!result.ok) throw new Error(`expected fit to succeed: ${result.reason}`)
	return result.pieces.map(p => p.text).join('')
}

// The template from the bug report, which the old worst-case budget rejected
// outright even though it renders to 77 bytes.
const SEVEN_TOKENS: BudgetPiece[] = [tok('title', 'Big Buck Bunny'), lit(' '), tok('id', 'YE7VzlLtp-4'), lit(' '), tok('uploader', 'Blender Foundation'), lit(' '), late('resolution', 6), lit(' '), tok('playlist_id', 'PL123'), lit(' '), tok('playlist_title', 'Nature Docs'), lit(' '), tok('playlist_index', '007')]

describe('reserves', () => {
	it('reserves enough for the longest name yt-dlp writes mid-download', () => {
		// yt-dlp writes `<name>.f<format_id>.<ext>.part` while downloading split
		// video/audio streams, not just `<name>.<ext>`. The old budget reserved 6,
		// which covers ".webm" and nothing else.
		expect(SUFFIX_RESERVE).toBeGreaterThanOrEqual('.f251'.length + '.webm'.length + '.part'.length)
	})
})

describe('fitName — names that already fit', () => {
	it('accepts the seven-token template the old budget rejected', () => {
		const result = fitName({pieces: SEVEN_TOKENS, outputDir: '/Users/antonio/Videos', limits: limitsFor('darwin')})
		expect(result.ok).toBe(true)
		expect(nameOf(result)).toBe('Big Buck Bunny YE7VzlLtp-4 Blender Foundation {resolution} PL123 Nature Docs 007')
	})

	it('reports nothing truncated when everything fits', () => {
		const result = fitName({pieces: SEVEN_TOKENS, outputDir: '/Users/antonio/Videos', limits: limitsFor('darwin')})
		expect(result.ok && result.truncated).toEqual([])
	})
})

describe('fitName — the counting unit is the platform’s own', () => {
	const cjk: BudgetPiece[] = [tok('title', '日'.repeat(200)), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]

	it('keeps a long CJK title whole on macOS, where 200 chars is 200 code units', () => {
		const result = fitName({pieces: cjk, outputDir: '/Users/antonio/Videos', limits: limitsFor('darwin')})
		expect(nameOf(result)).toContain('日'.repeat(200))
	})

	it('shortens the same title on Linux, where 200 chars is 600 bytes', () => {
		const result = fitName({pieces: cjk, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		expect(result.ok && result.truncated).toEqual(['title'])
		expect(measure(nameOf(result), 'utf8-bytes')).toBeLessThanOrEqual(255 - SUFFIX_RESERVE)
	})
})

describe('fitName — the shrink ladder', () => {
	it('sacrifices context before identity', () => {
		expect([...SHRINK_ORDER]).toEqual(['playlist_title', 'uploader', 'title'])
	})

	it('shrinks playlist_title before touching uploader or title', () => {
		const pieces: BudgetPiece[] = [tok('title', 'T'.repeat(120)), lit(' '), tok('uploader', 'U'.repeat(80)), lit(' '), tok('playlist_title', 'P'.repeat(80))]
		const result = fitName({pieces, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		expect(result.ok && result.truncated).toEqual(['playlist_title'])
		// The two it did not need to touch survive whole.
		expect(nameOf(result)).toContain('T'.repeat(120))
		expect(nameOf(result)).toContain('U'.repeat(80))
	})

	it('moves on to uploader once playlist_title is at its floor', () => {
		const pieces: BudgetPiece[] = [tok('title', 'T'.repeat(150)), lit(' '), tok('uploader', 'U'.repeat(80)), lit(' '), tok('playlist_title', 'P'.repeat(80))]
		const result = fitName({pieces, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		expect(result.ok && result.truncated).toEqual(['playlist_title', 'uploader'])
		expect(nameOf(result)).toContain('T'.repeat(150))
	})

	it('never shrinks a token below its floor while a later one can still give', () => {
		const pieces: BudgetPiece[] = [tok('title', 'T'.repeat(200)), lit(' '), tok('playlist_title', 'P'.repeat(100))]
		const result = fitName({pieces, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		const name = nameOf(result)
		const keptPlaylistTitle = /P+/.exec(name)?.[0].length ?? 0
		expect(keptPlaylistTitle).toBeGreaterThanOrEqual(TOKEN_FLOOR.playlist_title)
	})

	it('shrinks every occurrence of a repeated token, not just the first', () => {
		// Shortening one copy and leaving the other whole throws away most of the
		// available saving, and reported template-cannot-fit for a name that
		// shortening both fits with room to spare.
		const pieces: BudgetPiece[] = [tok('title', 'A'.repeat(200)), lit(' - '), tok('title', 'A'.repeat(200))]
		const result = fitName({pieces, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		expect(result.ok).toBe(true)
		expect(measure(nameOf(result), 'utf8-bytes')).toBeLessThanOrEqual(255 - SUFFIX_RESERVE)
		// Evenly, since both hold the same value.
		const [first, second] = nameOf(result).split(' - ')
		expect(first).toBe(second)
	})

	it('never shrinks {id} — playlist dedupe and M3U writing match [videoId]', () => {
		// Everything else is maximal, so a naive shrinker would reach for the id.
		const pieces: BudgetPiece[] = [tok('title', 'T'.repeat(400)), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
		const result = fitName({pieces, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		expect(nameOf(result)).toContain('YE7VzlLtp-4')
		expect(result.ok && result.truncated).toEqual(['title'])
	})
})

describe('fitName — the Windows total-path ceiling', () => {
	it('gives the filename less room inside a deep folder', () => {
		const pieces: BudgetPiece[] = [tok('title', 'T'.repeat(200)), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
		const shallow = fitName({pieces, outputDir: 'C:\\V', limits: limitsFor('win32')})
		const deep = fitName({pieces, outputDir: `C:\\Users\\antonio\\Videos\\Arroxy\\${'sub\\'.repeat(20)}`, limits: limitsFor('win32')})
		expect(nameOf(deep).length).toBeLessThan(nameOf(shallow).length)
	})

	it('keeps the whole path within MAX_PATH', () => {
		const pieces: BudgetPiece[] = [tok('title', 'T'.repeat(300)), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
		const outputDir = 'C:\\Users\\antonio\\Videos\\Arroxy\\Nature Docs'
		const result = fitName({pieces, outputDir, limits: limitsFor('win32')})
		const fullPath = `${outputDir}\\${nameOf(result)}`
		expect(measure(fullPath, 'utf16-units') + SUFFIX_RESERVE).toBeLessThanOrEqual(260)
	})

	it('does not apply the Windows ceiling to other platforms', () => {
		// The same deep folder is unremarkable on Linux, where PATH_MAX is 4096.
		const pieces: BudgetPiece[] = [tok('title', 'Big Buck Bunny'), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
		const outputDir = `/home/antonio/Videos/${'sub/'.repeat(40)}`
		const result = fitName({pieces, outputDir, limits: limitsFor('linux')})
		expect(nameOf(result)).toBe('Big Buck Bunny [YE7VzlLtp-4]')
	})
})

describe('fitName — failures', () => {
	it('reports path-too-deep when the folder alone leaves no room', () => {
		const pieces: BudgetPiece[] = [tok('title', 'Big Buck Bunny'), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
		const result = fitName({pieces, outputDir: `C:\\${'verylongfolder\\'.repeat(16)}`, limits: limitsFor('win32')})
		expect(result).toEqual({ok: false, reason: 'path-too-deep'})
	})

	it('reports template-cannot-fit when unshrinkable pieces overflow on their own', () => {
		// A user literal this long cannot be helped by shrinking any token.
		const pieces: BudgetPiece[] = [lit('L'.repeat(240)), tok('title', 'Big Buck Bunny'), tok('id', 'YE7VzlLtp-4')]
		const result = fitName({pieces, outputDir: '/home/antonio/Videos', limits: limitsFor('linux')})
		expect(result).toEqual({ok: false, reason: 'template-cannot-fit'})
	})
})

describe('fitName — normalization', () => {
	it('composes token text to NFC so decomposed titles do not cost double', () => {
		const decomposed = 'e\u0301'.repeat(100)
		const pieces: BudgetPiece[] = [tok('title', decomposed), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
		const result = fitName({pieces, outputDir: '/Users/antonio/Videos', limits: limitsFor('darwin')})
		// 100 composed characters, not 200 decomposed ones, and nothing truncated.
		expect(result.ok && result.truncated).toEqual([])
		expect(measure(nameOf(result), 'utf16-units')).toBe(100 + ' ['.length + 'YE7VzlLtp-4'.length + 1)
	})
})

describe('fitName — the invariant the whole design exists to hold', () => {
	it('never returns a name that overruns the component limit, for any input', () => {
		const titles = ['', 'Big Buck Bunny', 'T'.repeat(500), '日'.repeat(300), '🎬'.repeat(200), 'e\u0301'.repeat(300), 'Song | Official: Video']
		const uploaders = ['', 'Blender Foundation', 'U'.repeat(200), '日'.repeat(100)]
		const dirs = ['/v', '/home/antonio/Videos', 'C:\\Users\\antonio\\Videos\\Arroxy']
		// Counted so the invariant cannot pass vacuously: every case skipping on a
		// failed fit would otherwise assert nothing at all.
		let fitted = 0

		for (const platform of ['darwin', 'win32', 'linux'] as const) {
			const limits = limitsFor(platform)
			for (const title of titles) {
				for (const uploader of uploaders) {
					for (const outputDir of dirs) {
						const pieces: BudgetPiece[] = [tok('title', title), lit(' '), tok('uploader', uploader), lit(' '), late('resolution', 6), lit(' ['), tok('id', 'YE7VzlLtp-4'), lit(']')]
						const result = fitName({pieces, outputDir, limits})
						if (!result.ok) continue
						fitted++
						// Placeholders are excluded here for the same reason the budget
						// excludes them: what lands on disk is what they expand to, which
						// the reserve already covers.
						const name = result.pieces
							.filter(p => p.kind !== 'placeholder')
							.map(p => p.text)
							.join('')
						expect(measure(name, limits.componentUnit) + SUFFIX_RESERVE + 6).toBeLessThanOrEqual(limits.componentMax)
						expect(measure(`${outputDir}/${name}`, limits.pathUnit) + SUFFIX_RESERVE + 6).toBeLessThanOrEqual(limits.pathMax)
					}
				}
			}
		}

		expect(fitted).toBeGreaterThan(0)
	})
})
