import {describe, expect, it} from 'vitest'
import {DEFAULT_FILENAME_TEMPLATE, compileFilenameTemplate, previewFilenameTemplate, renderTemplateDirs, templateHasDirs, templateDirsVaryPerEntry, templateHasId, templateOutputDir, validateFilenameTemplate, bindFilenameTemplate, type TemplateMetadata} from '@shared/filenameTemplate.js'
import {FILENAME_TOKENS} from '@shared/schemas.js'

function utf8Bytes(value: string): number {
	return new TextEncoder().encode(value).length
}

function compiled(template: string): string {
	const result = compileFilenameTemplate(template)
	if (!result.ok) throw new Error(`expected compile to succeed: ${result.code}`)
	return result.template
}

const PLAYLIST_META: TemplateMetadata = {title: 'Big Buck Bunny', id: 'YE7VzlLtp-4', uploader: 'Blender Foundation', uploadDate: '20260803', playlistTitle: 'Nature Docs', playlistId: 'PL123', playlistIndex: 7}

const SINGLE_META: TemplateMetadata = {title: 'Big Buck Bunny', id: 'YE7VzlLtp-4', uploader: 'Blender Foundation', uploadDate: '20260803'}

describe('FILENAME_TOKENS', () => {
	it('exposes the core typeable token surface — ext is implicit, never typed', () => {
		expect([...FILENAME_TOKENS]).toEqual(['title', 'uploader', 'id', 'date', 'resolution', 'playlist_index', 'playlist_title', 'playlist_id'])
	})
})

describe('validateFilenameTemplate', () => {
	it('accepts the default template', () => {
		expect(validateFilenameTemplate(DEFAULT_FILENAME_TEMPLATE)).toEqual({ok: true})
	})

	it('accepts a template mixing literals and tokens', () => {
		expect(validateFilenameTemplate('{uploader} - {title} ({date})')).toEqual({ok: true})
	})

	it('rejects an empty template', () => {
		expect(validateFilenameTemplate('   ')).toEqual({ok: false, code: 'empty'})
	})

	it('rejects unknown tokens and names the offender', () => {
		// The issue text itself typo'd "uploadr" — this must produce a useful error.
		expect(validateFilenameTemplate('{uploadr} - {title}')).toEqual({ok: false, code: 'unknown-token', token: 'uploadr'})
	})

	it('rejects {ext} because the extension is appended automatically', () => {
		expect(validateFilenameTemplate('{title}.{ext}')).toEqual({ok: false, code: 'unknown-token', token: 'ext'})
	})

	it('rejects stray braces', () => {
		expect(validateFilenameTemplate('{title} }')).toEqual({ok: false, code: 'stray-brace'})
		expect(validateFilenameTemplate('{title} {')).toEqual({ok: false, code: 'stray-brace'})
	})

	it('rejects characters that break Windows filenames', () => {
		for (const ch of '<>:"|?*') {
			expect(validateFilenameTemplate(`{title}${ch}`)).toEqual({ok: false, code: 'forbidden-char'})
		}
	})

	it('rejects a template with no distinguishing token', () => {
		// Every download would collide on one filename.
		expect(validateFilenameTemplate('{date} {resolution}')).toEqual({ok: false, code: 'no-unique-token'})
		expect(validateFilenameTemplate('my video')).toEqual({ok: false, code: 'no-unique-token'})
	})

	it('accepts a template distinguished by either title or id alone', () => {
		expect(validateFilenameTemplate('{title}')).toEqual({ok: true})
		expect(validateFilenameTemplate('{id}')).toEqual({ok: true})
	})

	it('rejects over-long templates', () => {
		expect(validateFilenameTemplate(`{title}${'x'.repeat(250)}`)).toEqual({ok: false, code: 'too-long'})
	})
})

describe('validateFilenameTemplate — path segments', () => {
	it('accepts the nesting shape the feature request asked for', () => {
		expect(validateFilenameTemplate('{playlist_title}/{playlist_index} - {title}')).toEqual({ok: true})
	})

	it('accepts a channel-per-folder layout', () => {
		expect(validateFilenameTemplate('{uploader}/{title}')).toEqual({ok: true})
	})

	it('accepts multi-level nesting', () => {
		expect(validateFilenameTemplate('{uploader}/{playlist_title}/{playlist_index} - {title}')).toEqual({ok: true})
	})

	it('still rejects backslash so there is exactly one separator syntax', () => {
		expect(validateFilenameTemplate('{uploader}\\{title}')).toEqual({ok: false, code: 'forbidden-char'})
	})

	it('rejects empty segments from leading, trailing, or doubled separators', () => {
		expect(validateFilenameTemplate('/{title}')).toEqual({ok: false, code: 'empty-segment'})
		expect(validateFilenameTemplate('{title}/')).toEqual({ok: false, code: 'empty-segment'})
		expect(validateFilenameTemplate('{uploader}//{title}')).toEqual({ok: false, code: 'empty-segment'})
	})

	it('rejects literal dot segments that would climb out of the output directory', () => {
		expect(validateFilenameTemplate('../{title}')).toEqual({ok: false, code: 'invalid-segment'})
		expect(validateFilenameTemplate('{title}/../../evil')).toEqual({ok: false, code: 'invalid-segment'})
		expect(validateFilenameTemplate('./{title}')).toEqual({ok: false, code: 'invalid-segment'})
	})

	it('rejects reserved DOS device names as literal folder names', () => {
		expect(validateFilenameTemplate('CON/{title}')).toEqual({ok: false, code: 'invalid-segment'})
		expect(validateFilenameTemplate('nul/{title}')).toEqual({ok: false, code: 'invalid-segment'})
	})

	it('rejects {resolution} in a directory because height is unknown until the stream downloads', () => {
		expect(validateFilenameTemplate('{resolution}/{title}')).toEqual({ok: false, code: 'resolution-in-dir'})
	})

	it('still allows {resolution} in the filename segment', () => {
		expect(validateFilenameTemplate('{uploader}/{title} {resolution}')).toEqual({ok: true})
	})

	it('requires the distinguishing token in the filename, not merely somewhere in the path', () => {
		// `{id}/{date}` would still collide every download inside the id folder.
		expect(validateFilenameTemplate('{id}/{date}')).toEqual({ok: false, code: 'no-unique-token'})
	})

	it('trims whitespace around each segment', () => {
		expect(validateFilenameTemplate('{uploader} / {title}')).toEqual({ok: true})
	})
})

describe('templateHasDirs', () => {
	it('reports whether a template takes over directory layout', () => {
		expect(templateHasDirs('{playlist_title}/{title}')).toBe(true)
		expect(templateHasDirs('{title} [{id}]')).toBe(false)
	})

	it('is false for an invalid template so callers keep the existing folder behavior', () => {
		expect(templateHasDirs('{title}/')).toBe(false)
	})
})

describe('compileFilenameTemplate', () => {
	it('appends the extension and never asks the user to type it', () => {
		expect(compiled('{title}')).toBe('%(title).150B.%(ext)s')
	})

	it('resolves uploader through a fallback chain so absent fields do not print NA', () => {
		expect(compiled('{uploader}{id}')).toBe('%(uploader,channel,creator,uploader_id).60B%(id)s.%(ext)s')
	})

	it('gives every optional token an empty default rather than NA', () => {
		// Verified against yt-dlp 2026.07.04: without the `|` an audio-only
		// download under `{title} {resolution}` writes "Song NAp.m4a".
		expect(compiled('{date}{resolution}{playlist_index}{id}')).toBe('%(upload_date>%Y-%m-%d|)s%(height&{}p|)s%(playlist_index|)03d%(id)s.%(ext)s')
	})

	it('compiles the new playlist tokens with empty defaults', () => {
		expect(compiled('{playlist_title} {playlist_id} {id}')).toBe('%(playlist_title|).60B %(playlist_id|)s %(id)s.%(ext)s')
	})

	it('compiles the default template', () => {
		expect(compiled(DEFAULT_FILENAME_TEMPLATE)).toBe('%(title).150B [%(id)s].%(ext)s')
	})

	it('escapes literal percent signs so they survive yt-dlp expansion', () => {
		expect(compiled('100% {title}')).toBe('100%% %(title).150B.%(ext)s')
	})

	it('propagates validation failures instead of emitting a broken -o string', () => {
		expect(compileFilenameTemplate('{nope}')).toEqual({ok: false, code: 'unknown-token', token: 'nope'})
	})

	it('trims surrounding whitespace', () => {
		expect(compiled('  {title}  ')).toBe('%(title).150B.%(ext)s')
	})

	it('compiles only the filename segment — directories are Arroxy-rendered', () => {
		expect(compiled('{playlist_title}/{playlist_index} - {title}')).toBe('%(playlist_index|)03d - %(title).150B.%(ext)s')
	})

	it('never emits a separator into -o, whatever the template nesting', () => {
		// This is the security property: a compiled -o addresses exactly one path
		// component, so it cannot redirect yt-dlp anywhere.
		for (const template of ['{uploader}/{title}', '{uploader}/{playlist_title}/{title} [{id}]', '{title}']) {
			const out = compiled(template)
			expect(out).not.toContain('/')
			expect(out).not.toContain('\\')
		}
	})
})

describe('renderTemplateDirs', () => {
	it('renders the requested playlist layout', () => {
		expect(renderTemplateDirs('{playlist_title}/{playlist_index} - {title}', PLAYLIST_META)).toEqual(['Nature Docs'])
	})

	it('renders multi-level nesting in order', () => {
		expect(renderTemplateDirs('{uploader}/{playlist_title}/{title}', PLAYLIST_META)).toEqual(['Blender Foundation', 'Nature Docs'])
	})

	it('returns no directories for a flat template', () => {
		expect(renderTemplateDirs('{title} [{id}]', PLAYLIST_META)).toEqual([])
	})

	it('collapses a segment whose tokens are all empty rather than writing an NA folder', () => {
		expect(renderTemplateDirs('{playlist_title}/{title}', SINGLE_META)).toEqual([])
	})

	it('collapses only the empty segment, keeping the populated ones', () => {
		expect(renderTemplateDirs('{uploader}/{playlist_title}/{title}', SINGLE_META)).toEqual(['Blender Foundation'])
	})

	it('keeps a segment whose literals survive even when a token is empty', () => {
		expect(renderTemplateDirs('Season {playlist_index}/{title}', SINGLE_META)).toEqual(['Season'])
	})

	it('sanitizes characters that are illegal in a folder name', () => {
		expect(renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: 'AC/DC: Live? <best>'})).toEqual(['AC_DC_ Live_ _best_'])
	})

	it('neutralizes a title that would climb out of the output directory', () => {
		const dirs = renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: '../../etc'})
		expect(dirs).toEqual(['.._.._etc'])
		for (const dir of dirs) {
			expect(dir).not.toBe('..')
			expect(dir).not.toContain('/')
		}
	})

	it('collapses a segment that sanitizes down to nothing usable', () => {
		expect(renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: '..'})).toEqual([])
		expect(renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: '   '})).toEqual([])
	})

	it('escapes a rendered reserved DOS device name instead of collapsing it', () => {
		expect(renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: 'CON'})).toEqual(['CON_'])
	})

	it('strips trailing dots and spaces that Windows silently drops', () => {
		expect(renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: 'Episode 1. '})).toEqual(['Episode 1'])
	})

	it('caps a folder name at the subfolder length limit', () => {
		const dirs = renderTemplateDirs('{title}/{id}', {...SINGLE_META, title: 'x'.repeat(200)})
		expect(dirs).toHaveLength(1)
		expect(dirs[0]?.length).toBe(64)
	})

	it('zero-pads playlist_index to three digits, matching the compiled token', () => {
		expect(renderTemplateDirs('{playlist_index}/{title}', PLAYLIST_META)).toEqual(['007'])
	})

	it('returns no directories for an invalid template so files land in the base directory', () => {
		expect(renderTemplateDirs('{title}/../evil', PLAYLIST_META)).toEqual([])
	})
})

describe('templateOutputDir', () => {
	it('appends rendered directories below the base directory', () => {
		expect(templateOutputDir('/Users/x/Downloads', '{playlist_title}/{title}', PLAYLIST_META)).toBe('/Users/x/Downloads/Nature Docs')
	})

	it('nests multiple levels in order', () => {
		expect(templateOutputDir('/Users/x/Downloads', '{uploader}/{playlist_title}/{title}', PLAYLIST_META)).toBe('/Users/x/Downloads/Blender Foundation/Nature Docs')
	})

	it('returns the base directory untouched for a flat template', () => {
		expect(templateOutputDir('/Users/x/Downloads', '{title} [{id}]', PLAYLIST_META)).toBe('/Users/x/Downloads')
	})

	it('returns the base directory when every segment collapses', () => {
		expect(templateOutputDir('/Users/x/Downloads', '{playlist_title}/{title}', SINGLE_META)).toBe('/Users/x/Downloads')
	})

	it('follows the separator the base directory already uses, so Windows paths stay Windows paths', () => {
		expect(templateOutputDir('C:\\Users\\x\\Downloads', '{playlist_title}/{title}', PLAYLIST_META)).toBe('C:\\Users\\x\\Downloads\\Nature Docs')
	})

	it('cannot escape the base directory even when metadata is hostile', () => {
		const hostile = {...SINGLE_META, title: '../../../etc'}
		const dir = templateOutputDir('/Users/x/Downloads', '{title}/{id}', hostile)

		expect(dir.startsWith('/Users/x/Downloads/')).toBe(true)
		// `..` surviving as a substring is harmless ('.._.._.._etc' is one folder);
		// what must never happen is a path *component* that walks upward.
		expect(dir.split('/')).not.toContain('..')
		expect(dir.slice('/Users/x/Downloads/'.length).split('/')).toHaveLength(1)
	})
})

describe('bindFilenameTemplate', () => {
	// Arroxy queues each playlist entry as its own single-video download, so
	// yt-dlp expands the filename with no playlist context at all: %(playlist_index)s
	// and friends come back empty. Arroxy knows those values and bakes them in.
	it('bakes the playlist index in as a zero-padded literal', () => {
		expect(bindFilenameTemplate('{playlist_index} - {title}', PLAYLIST_META)).toBe('007 - {title}')
	})

	it('bakes the playlist title and id in', () => {
		expect(bindFilenameTemplate('{playlist_title} {playlist_id} {title}', PLAYLIST_META)).toBe('Nature Docs PL123 {title}')
	})

	it('leaves per-video tokens for yt-dlp, which knows them and truncates properly', () => {
		expect(bindFilenameTemplate('{uploader} - {title} [{id}] {date} {resolution}', PLAYLIST_META)).toBe('{uploader} - {title} [{id}] {date} {resolution}')
	})

	it('drops directory segments — the caller has already folded those into the output dir', () => {
		expect(bindFilenameTemplate('{playlist_title}/{playlist_index} - {title}', PLAYLIST_META)).toBe('007 - {title}')
	})

	it('binds playlist tokens to empty for a single video, leaving no NA behind', () => {
		expect(bindFilenameTemplate('{playlist_index}{title}', SINGLE_META)).toBe('{title}')
	})

	it('neutralizes a separator inside a bound value so it cannot invent a folder', () => {
		expect(bindFilenameTemplate('{playlist_title} - {title}', {...PLAYLIST_META, playlistTitle: 'AC/DC: Live'})).toBe('AC_DC_ Live - {title}')
	})

	it('neutralizes braces inside a bound value so it cannot invent a token', () => {
		expect(bindFilenameTemplate('{playlist_title} {title}', {...PLAYLIST_META, playlistTitle: '{title}'})).toBe('_title_ {title}')
	})

	it('still compiles to a valid output template after binding', () => {
		const bound = bindFilenameTemplate('{playlist_title}/{playlist_index} - {title} [{id}]', PLAYLIST_META)
		expect(compiled(bound)).toBe('007 - %(title).150B [%(id)s].%(ext)s')
	})

	it('escapes a percent sign in a bound value so yt-dlp does not expand it', () => {
		const bound = bindFilenameTemplate('{playlist_title} {title}', {...PLAYLIST_META, playlistTitle: '100% Hits'})
		expect(compiled(bound)).toBe('100%% Hits %(title).150B.%(ext)s')
	})

	it('returns the template unchanged when it is invalid, leaving errors to the validator', () => {
		expect(bindFilenameTemplate('{bogus}', PLAYLIST_META)).toBe('{bogus}')
	})

	// A bound value stops being a token and becomes literal template text, which
	// the byte budget then counts in full. Truncating by characters let a CJK
	// title blow the budget, fail to compile, and silently fall back to the
	// built-in default — losing the user's whole naming scheme.
	it('truncates a bound value by UTF-8 bytes, not characters', () => {
		const bound = bindFilenameTemplate('{playlist_title} - {title} [{id}]', {...PLAYLIST_META, playlistTitle: '龍'.repeat(60)})
		expect(utf8Bytes(bound)).toBeLessThanOrEqual(60 + ' - {title} [{id}]'.length)
	})

	it('still compiles for a multibyte playlist title instead of falling back to the default', () => {
		for (const title of ['я'.repeat(60), '龍'.repeat(60), '😀'.repeat(40)]) {
			const bound = bindFilenameTemplate('{playlist_title} - {title} [{id}]', {...PLAYLIST_META, playlistTitle: title})
			const compiledResult = compileFilenameTemplate(bound)
			expect(compiledResult.ok).toBe(true)
			if (compiledResult.ok) expect(utf8Bytes(compiledResult.template)).toBeLessThanOrEqual(240)
		}
	})

	it('never splits a surrogate pair when truncating', () => {
		// Slicing by UTF-16 code units at a boundary that lands mid-emoji leaves a
		// lone surrogate, which is not a valid character in a filename.
		const bound = bindFilenameTemplate('{playlist_title} {title}', {...PLAYLIST_META, playlistTitle: `${'a'.repeat(59)}😀${'b'.repeat(20)}`})
		expect(bound).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/)
	})

	it('gives each bound token its own byte allowance', () => {
		// playlist_id is allowed more bytes than a 6-byte index; neither should
		// borrow the playlist_title budget.
		const bound = bindFilenameTemplate('{playlist_index}-{playlist_id} {title}', {...PLAYLIST_META, playlistId: 'P'.repeat(80)})
		expect(bound.startsWith('007-')).toBe(true)
		expect(bound).toContain('{title}')
	})
})

describe('templateDirsVaryPerEntry', () => {
	// Folder sync resolves one directory for the whole playlist. That only holds
	// when every directory segment is playlist-level; a per-entry field puts each
	// item somewhere else, so the scan must degrade rather than look in the wrong
	// place and report nothing downloaded.
	it('is true when a directory names a per-entry field', () => {
		expect(templateDirsVaryPerEntry('{uploader}/{title} [{id}]')).toBe(true)
		expect(templateDirsVaryPerEntry('{date}/{title} [{id}]')).toBe(true)
		expect(templateDirsVaryPerEntry('{playlist_index}/{title} [{id}]')).toBe(true)
		expect(templateDirsVaryPerEntry('{playlist_title}/{uploader}/{title} [{id}]')).toBe(true)
	})

	it('is false when every directory is playlist-level', () => {
		expect(templateDirsVaryPerEntry('{playlist_title}/{title} [{id}]')).toBe(false)
		expect(templateDirsVaryPerEntry('{playlist_title}/{playlist_id}/{title} [{id}]')).toBe(false)
	})

	it('is false for a flat template and for an invalid one', () => {
		expect(templateDirsVaryPerEntry('{title} [{id}]')).toBe(false)
		expect(templateDirsVaryPerEntry('{title}/')).toBe(false)
	})

	it('ignores per-entry tokens in the filename, which do not affect the directory', () => {
		expect(templateDirsVaryPerEntry('{playlist_title}/{uploader} - {title} [{id}]')).toBe(false)
	})
})

describe('render parity between directory and filename position', () => {
	// A token must mean the same thing wherever it appears. Arroxy renders
	// directories; yt-dlp renders the filename. These two must not drift.
	it('formats {date} as YYYY-MM-DD in a directory, matching the compiled strftime', () => {
		expect(renderTemplateDirs('{date}/{title}', SINGLE_META)).toEqual(['2026-08-03'])
		expect(compiled('{date}{id}')).toContain('%(upload_date>%Y-%m-%d|)s')
	})

	it('falls back through the uploader chain in a directory, as the compiled token does', () => {
		expect(renderTemplateDirs('{uploader}/{title}', {...SINGLE_META, uploader: undefined, channel: 'Fallback Channel'})).toEqual(['Fallback Channel'])
		expect(compiled('{uploader}{id}')).toContain('%(uploader,channel,creator,uploader_id).60B')
	})
})

describe('templateHasId', () => {
	it('drives the playlist dedupe and M3U degrade', () => {
		expect(templateHasId('{title} [{id}]')).toBe(true)
		expect(templateHasId('{uploader} - {title}')).toBe(false)
	})

	it('only counts {id} in the filename, since dedupe matches the filename', () => {
		expect(templateHasId('{id}/{title}')).toBe(false)
		expect(templateHasId('{uploader}/{title} [{id}]')).toBe(true)
	})
})

describe('previewFilenameTemplate', () => {
	it('renders a sample filename without spawning yt-dlp', () => {
		expect(previewFilenameTemplate('{uploader} - {title}')).toBe('Blender Foundation - Big Buck Bunny.mp4')
	})

	it('renders the default template', () => {
		expect(previewFilenameTemplate(DEFAULT_FILENAME_TEMPLATE)).toBe('Big Buck Bunny [YE7VzlLtp-4].mp4')
	})

	it('renders optional tokens as the values a single video download would produce', () => {
		expect(previewFilenameTemplate('{title} {date} {resolution}')).toBe('Big Buck Bunny 2026-08-03 1080p.mp4')
	})

	it('renders playlist_index as empty for the single-download sample', () => {
		expect(previewFilenameTemplate('{title}{playlist_index}')).toBe('Big Buck Bunny.mp4')
	})

	it('returns null for an invalid template so the UI can fall back to the error', () => {
		expect(previewFilenameTemplate('{bogus}')).toBeNull()
	})

	it('shows the collapsed single-video path so users see there is no empty folder', () => {
		// The directory collapses, but the filename keeps its orphaned " - "
		// separator. That wart predates path segments — `{playlist_index}` has
		// always compiled to an empty default — and the preview exists precisely
		// so the user sees it before downloading. Tracked as a separate fix.
		expect(previewFilenameTemplate('{playlist_title}/{playlist_index} - {title}', 'video')).toBe(' - Big Buck Bunny.mp4')
	})

	it('shows the nested playlist path for the same template', () => {
		expect(previewFilenameTemplate('{playlist_title}/{playlist_index} - {title}', 'playlist')).toBe('Nature Docs/007 - Big Buck Bunny.mp4')
	})

	it('renders a channel folder identically in both samples', () => {
		expect(previewFilenameTemplate('{uploader}/{title}', 'video')).toBe('Blender Foundation/Big Buck Bunny.mp4')
		expect(previewFilenameTemplate('{uploader}/{title}', 'playlist')).toBe('Blender Foundation/Big Buck Bunny.mp4')
	})
})

describe('injection resistance', () => {
	it('refuses anything that could redirect yt-dlp -o outside the output directory', () => {
		// The main process compiles templates precisely so a compromised renderer
		// cannot hand yt-dlp a raw `-o`. These are the shapes that would matter.
		for (const evil of ['/etc/cron.d/{title}', '../../{title}', '{title}/../../evil', 'C:\\Windows\\{title}', '%(title)s']) {
			expect(compileFilenameTemplate(evil).ok).toBe(false)
		}
	})
})

describe('rendered-component byte budget', () => {
	it('keeps the default templates on the full title cap', () => {
		// Capping shrinks only when the rest of the template needs the room, so
		// everyday templates are unaffected.
		expect(compiled('{title} [{id}]')).toContain('%(title).150B')
		expect(compiled('{uploader} - {title}')).toContain('%(title).150B')
	})

	it('shrinks the title cap when other tokens claim the budget', () => {
		const template = compiled('{uploader} - {title} [{id}] {date} {resolution}')
		const cap = Number(/%\(title\)\.(\d+)B/.exec(template)?.[1])
		expect(cap).toBeLessThan(150)
		expect(cap).toBeGreaterThanOrEqual(40)
	})

	it('splits the budget when title repeats', () => {
		const once = Number(/%\(title\)\.(\d+)B/.exec(compiled('{title} [{id}]'))?.[1])
		const twice = Number(/%\(title\)\.(\d+)B/.exec(compiled('{title} {title} [{id}]'))?.[1])
		expect(twice).toBeLessThan(once)
	})

	it('rejects a template whose literals alone overflow the component limit', () => {
		// 120 multibyte characters is within the character cap but is 240
		// UTF-8 bytes on disk — the character cap cannot catch this.
		expect(validateFilenameTemplate(`${'х'.repeat(113)}{title}`)).toEqual({ok: false, code: 'too-long'})
	})

	it('budgets each path segment independently, so directories do not starve the filename', () => {
		// The whole point of per-segment budgets: a long folder name is its own
		// path component and must not shrink the title cap in the filename.
		expect(compiled(`${'d'.repeat(60)}/{title} [{id}]`)).toContain('%(title).150B')
	})
})
