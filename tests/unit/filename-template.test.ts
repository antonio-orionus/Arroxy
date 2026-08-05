import {describe, expect, it} from 'vitest'
import {DEFAULT_FILENAME_TEMPLATE, compileFilenameTemplate, previewFilenameTemplate, templateHasId, validateFilenameTemplate} from '@shared/filenameTemplate.js'
import {FILENAME_TOKENS} from '@shared/schemas.js'

function compiled(template: string): string {
	const result = compileFilenameTemplate(template)
	if (!result.ok) throw new Error(`expected compile to succeed: ${result.code}`)
	return result.template
}

describe('FILENAME_TOKENS', () => {
	it('exposes the core typeable token surface — ext is implicit, never typed', () => {
		expect([...FILENAME_TOKENS]).toEqual(['title', 'uploader', 'id', 'date', 'resolution', 'playlist_index'])
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

	it('rejects path separators so subfolders stay the profile subfolder feature', () => {
		expect(validateFilenameTemplate('{uploader}/{title}')).toEqual({ok: false, code: 'forbidden-char'})
		expect(validateFilenameTemplate('{uploader}\\{title}')).toEqual({ok: false, code: 'forbidden-char'})
		expect(validateFilenameTemplate('../{title}')).toEqual({ok: false, code: 'forbidden-char'})
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
		expect(validateFilenameTemplate(`{title}${'x'.repeat(200)}`)).toEqual({ok: false, code: 'too-long'})
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
})

describe('templateHasId', () => {
	it('drives the playlist dedupe and M3U degrade', () => {
		expect(templateHasId('{title} [{id}]')).toBe(true)
		expect(templateHasId('{uploader} - {title}')).toBe(false)
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
		// 120 multibyte characters is within the 120-character cap but is 240
		// UTF-8 bytes on disk — the character cap cannot catch this.
		expect(validateFilenameTemplate(`${'х'.repeat(113)}{title}`)).toEqual({ok: false, code: 'too-long'})
	})
})
