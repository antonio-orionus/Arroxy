import {describe, expect, it} from 'vite-plus/test'
import {readdirSync, readFileSync} from 'node:fs'
import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {classifyYtDlpStderr, classifyAll, extractLastError, isPostprocessFailure, errorKindMetadata, YT_DLP_ERROR_KINDS, ERROR_KIND_METADATA} from '../src/index.js'
import type {YtDlpErrorKind} from '../src/index.js'

const FIXTURES_ROOT = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'yt-dlp-stderr')

// The "no pattern matched" fallback has no fixture of its own pattern.
const NON_CLASSIFIER_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['unknown', 'outputPathExpands'])

interface Fixture {
	kind: YtDlpErrorKind
	filename: string
	content: string
}

function loadFixtures(): Fixture[] {
	const out: Fixture[] = []
	for (const dir of readdirSync(FIXTURES_ROOT, {withFileTypes: true})) {
		if (!dir.isDirectory()) continue
		const kind = dir.name as YtDlpErrorKind
		if (!YT_DLP_ERROR_KINDS.includes(kind)) {
			throw new Error(`Fixture dir "${dir.name}" is not a member of YT_DLP_ERROR_KINDS`)
		}
		for (const file of readdirSync(join(FIXTURES_ROOT, dir.name))) {
			if (!file.endsWith('.txt')) continue
			out.push({kind, filename: file, content: readFileSync(join(FIXTURES_ROOT, dir.name, file), 'utf8')})
		}
	}
	return out
}

describe('classifyYtDlpStderr — fixture corpus', () => {
	const fixtures = loadFixtures()

	for (const fx of fixtures) {
		it(`${fx.kind} / ${fx.filename}`, () => {
			const result = classifyYtDlpStderr(fx.content)
			expect(result.kind).toBe(fx.kind)
			expect(result.raw).toBe(fx.content)
		})
	}

	it('every classifier-producible kind has at least one fixture', () => {
		const kindsSeen = new Set(fixtures.map(f => f.kind))
		for (const kind of YT_DLP_ERROR_KINDS) {
			if (NON_CLASSIFIER_KINDS.has(kind)) continue
			expect(kindsSeen, `missing fixture for kind "${kind}"`).toContain(kind)
		}
	})

	it('never classifies outputPathExpands: yt-dlp expands the folder without a word', () => {
		expect(fixtures.filter(f => f.kind === 'outputPathExpands')).toEqual([])
		expect(classifyYtDlpStderr("ERROR: unable to open for writing: [Errno 2] No such file or directory: '/home/u/x.part'").kind).not.toBe('outputPathExpands')
		expect(() => classifyYtDlpStderr('x', {extraPatterns: {['outputPathExpands' as string]: /x/}})).toThrow('Unsupported extraPatterns kind')
	})

	it('returns kind "unknown" with raw passthrough for unmatched stderr', () => {
		expect(classifyYtDlpStderr('').kind).toBe('unknown')
		const raw = "ERROR: some weird message yt-dlp wouldn't otherwise classify"
		const result = classifyYtDlpStderr(raw)
		expect(result.kind).toBe('unknown')
		expect(result.raw).toBe(raw)
	})

	it('unsupportedUrl wins over words in the rejected URL', () => {
		expect(classifyYtDlpStderr('ERROR: Unsupported URL: https://example.com/429-too-many-requests').kind).toBe('unsupportedUrl')
	})

	it('does not read an unsupported request scheme as an unsupported URL', () => {
		expect(classifyYtDlpStderr('ERROR: Unable to download webpage: Unsupported url scheme: "file"').kind).toBe('unknown')
	})

	it('chunkTransferFailure is matched before network for retry-exhaustion lines', () => {
		// "Giving up after N retries" + ECONNRESET both apply; ordering puts
		// chunkTransferFailure first to preserve UX hint specificity.
		const raw = '[download] Got error: ECONNRESET. Giving up after 10 retries'
		expect(classifyYtDlpStderr(raw).kind).toBe('chunkTransferFailure')
	})
})

describe('classifyYtDlpStderr — extension hook', () => {
	it('merges extraPatterns ahead of built-ins so custom rules win', () => {
		const result = classifyYtDlpStderr('ERROR: tooManyRequests: please slow down', {extraPatterns: {rateLimit: /tooManyRequests/}})
		expect(result.kind).toBe('rateLimit')
	})

	it('accepts an array of regexes per kind', () => {
		const result = classifyYtDlpStderr('ERROR: customSiteSpecificBan triggered', {extraPatterns: {ipBlock: [/anotherPattern/, /customSiteSpecificBan/]}})
		expect(result.kind).toBe('ipBlock')
	})

	it('falls through to built-ins when extras do not match', () => {
		const raw = 'ERROR: [youtube] abc: Sign in to confirm you’re not a bot'
		const result = classifyYtDlpStderr(raw, {extraPatterns: {ipBlock: /nope-no-match/}})
		expect(result.kind).toBe('botBlock')
	})

	it('rejects unsupported extraPatterns keys from JavaScript callers', () => {
		expect(() => classifyYtDlpStderr('ERROR: anything', {extraPatterns: {badKind: /anything/} as never})).toThrow(/Unsupported extraPatterns kind/)
	})

	it('rejects unsupported extraPatterns values from JavaScript callers', () => {
		expect(() => classifyYtDlpStderr('ERROR: anything', {extraPatterns: {ipBlock: 'anything'} as never})).toThrow(/Unsupported extraPatterns value/)
	})

	it('resets stateful extra pattern regexes before testing', () => {
		const stateful = /customSiteSpecificBan/g
		expect(classifyYtDlpStderr('ERROR: customSiteSpecificBan triggered', {extraPatterns: {ipBlock: stateful}}).kind).toBe('ipBlock')
		expect(classifyYtDlpStderr('ERROR: customSiteSpecificBan triggered', {extraPatterns: {ipBlock: stateful}}).kind).toBe('ipBlock')
	})
})

describe('classifyAll', () => {
	it('returns one ClassifiedError per ERROR: line', () => {
		const raw = ['ERROR: [youtube] a: This video is unavailable', '[download] something happens here', "ERROR: [youtube] b: Sign in to confirm you're not a bot"].join('\n')
		const results = classifyAll(raw)
		expect(results).toHaveLength(2)
		expect(results[0]!.kind).toBe('unavailable')
		expect(results[1]!.kind).toBe('botBlock')
	})

	it('returns single classification when no ERROR: lines but stderr non-empty', () => {
		const results = classifyAll('[download] Got error: ECONNRESET. Giving up after 10 retries')
		expect(results).toHaveLength(1)
		expect(results[0]!.kind).toBe('chunkTransferFailure')
	})

	it('returns empty array for empty input', () => {
		expect(classifyAll('')).toHaveLength(0)
	})
})

describe('extractLastError', () => {
	it('returns the ERROR: line from single-line stderr', () => {
		expect(extractLastError('ERROR: [youtube] abc: Sign in to confirm')).toBe('ERROR: [youtube] abc: Sign in to confirm')
	})

	it('falls back to last non-empty stderr line when no ERROR: prefix found', () => {
		expect(extractLastError('WARNING: some warning\n[download] 50%')).toBe('[download] 50%')
	})

	it('returns the last of multiple ERROR: lines', () => {
		expect(extractLastError('ERROR: first error\nsome output\nERROR: second error')).toBe('ERROR: second error')
	})

	it('returns null for empty string', () => {
		expect(extractLastError('')).toBeNull()
	})
})

describe('isPostprocessFailure', () => {
	it('matches yt-dlp Postprocessing wrapper', () => {
		expect(isPostprocessFailure('ERROR: Postprocessing: Conversion failed!')).toBe(true)
	})

	it('matches an ERROR: ffmpeg muxer error line', () => {
		expect(isPostprocessFailure('ERROR: Error muxing a packet')).toBe(true)
	})

	it('does NOT match phrases without the ERROR: prefix', () => {
		expect(isPostprocessFailure('Conversion failed!')).toBe(false)
		expect(isPostprocessFailure('Error muxing a packet')).toBe(false)
	})

	it('returns false for null', () => {
		expect(isPostprocessFailure(null)).toBe(false)
	})
})

describe('errorKindMetadata', () => {
	it('returns metadata for every kind in the enum', () => {
		for (const kind of YT_DLP_ERROR_KINDS) {
			const md = errorKindMetadata(kind)
			expect(md.code).toMatch(/^YTDLP_[A-Z_]+$/)
			expect(typeof md.recoverable).toBe('boolean')
			expect(typeof md.userActionable).toBe('boolean')
		}
	})

	it('codes are unique across kinds', () => {
		const codes = new Set<string>()
		for (const md of Object.values(ERROR_KIND_METADATA)) {
			expect(codes.has(md.code), `duplicate code: ${md.code}`).toBe(false)
			codes.add(md.code)
		}
	})

	it('botBlock suggests cookies-from-browser', () => {
		const md = errorKindMetadata('botBlock')
		expect(md.suggestedFlags).toContain('--cookies-from-browser')
		expect(md.recoverable).toBe(true)
		expect(md.userActionable).toBe(true)
	})
})
