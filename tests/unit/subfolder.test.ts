import {describe, expect, it} from 'vitest'
import {SUBFOLDER_NAME_MAX, effectiveOutputDir, escapeReservedName, isValidSubfolder, joinSubfolder, playlistBaseDir, safeFolderName, splitDir} from '@shared/subfolder.js'

describe('isValidSubfolder', () => {
	it('accepts ordinary names', () => {
		expect(isValidSubfolder('lo-fi rips')).toBe(true)
		expect(isValidSubfolder('mix_2025')).toBe(true)
	})

	it('rejects empty/whitespace-only input', () => {
		expect(isValidSubfolder('')).toBe(false)
		expect(isValidSubfolder('   ')).toBe(false)
	})

	it('rejects . and ..', () => {
		expect(isValidSubfolder('.')).toBe(false)
		expect(isValidSubfolder('..')).toBe(false)
	})

	it('rejects forbidden filename chars', () => {
		for (const ch of '<>:"/\\|?*') {
			expect(isValidSubfolder(`bad${ch}name`)).toBe(false)
		}
	})

	it('rejects DOS reserved names regardless of case', () => {
		expect(isValidSubfolder('CON')).toBe(false)
		expect(isValidSubfolder('com1')).toBe(false)
		expect(isValidSubfolder('lpt9.txt')).toBe(false)
	})

	it('rejects the superscript COM/LPT variants Windows also reserves', () => {
		// Windows reads the ISO 8859-1 superscript digits as digits, so COM\u00b9 is COM1.
		expect(isValidSubfolder('com\u00b9')).toBe(false)
		expect(isValidSubfolder('LPT\u00b3')).toBe(false)
	})

	it('accepts names outside the documented device list', () => {
		expect(isValidSubfolder('Console')).toBe(true)
		expect(isValidSubfolder('Auxiliary')).toBe(true)
		// Device numbering starts at 1, so these are ordinary names.
		expect(isValidSubfolder('com0')).toBe(true)
		expect(isValidSubfolder('lpt0')).toBe(true)
		expect(isValidSubfolder('com10')).toBe(true)
	})

	it('rejects names ending in . (Windows) — trailing spaces are trimmed first so they pass', () => {
		expect(isValidSubfolder('trail.')).toBe(false)
		// Trailing whitespace is trimmed before validation — accepted UX.
		expect(isValidSubfolder('trail ')).toBe(true)
	})

	it('rejects names exceeding 64 chars', () => {
		expect(isValidSubfolder('a'.repeat(65))).toBe(false)
		expect(isValidSubfolder('a'.repeat(64))).toBe(true)
	})
})

describe('escapeReservedName', () => {
	it('escapes reserved device names with a trailing underscore', () => {
		expect(escapeReservedName('CON')).toBe('CON_')
		expect(escapeReservedName('aux')).toBe('aux_')
		expect(escapeReservedName('com1')).toBe('com1_')
		expect(escapeReservedName('lpt9')).toBe('lpt9_')
	})

	it('escapes the stem of a reserved name carrying an extension', () => {
		// `NUL.mp4` is the null device, and so is `NUL.mp4_` — the reservation ignores
		// the extension, so the underscore has to go on the stem to escape anything.
		expect(escapeReservedName('NUL.mp4')).toBe('NUL_.mp4')
		expect(isValidSubfolder(escapeReservedName('NUL.mp4'))).toBe(true)
		expect(escapeReservedName('lpt9.txt')).toBe('lpt9_.txt')
	})

	it('leaves unreserved names untouched', () => {
		expect(escapeReservedName('Music')).toBe('Music')
		expect(escapeReservedName('Console')).toBe('Console')
		expect(escapeReservedName('com0')).toBe('com0')
	})
})

describe('safeFolderName', () => {
	it('keeps ordinary playlist titles and substitutes illegal characters', () => {
		expect(safeFolderName('Top Hits 2026')).toBe('Top Hits 2026')
		expect(safeFolderName('Rock / Pop : Live? *2026*')).toBe('Rock _ Pop _ Live_ _2026_')
	})

	it('escapes reserved device names instead of handing Windows an uncreatable folder', () => {
		expect(safeFolderName('CON')).toBe('CON_')
		expect(safeFolderName('aux')).toBe('aux_')
		expect(safeFolderName('com1')).toBe('com1_')
	})

	it('strips trailing dots and spaces, including any re-exposed by truncation', () => {
		expect(safeFolderName('Chill Mix....')).toBe('Chill Mix')
		expect(safeFolderName('Study Session   ')).toBe('Study Session')
		expect(safeFolderName('Soundtrack. . .')).toBe('Soundtrack')
		expect(safeFolderName(`${'a'.repeat(60)}....`)).toBe('a'.repeat(60))
	})

	it('falls back to Playlist when nothing usable survives', () => {
		expect(safeFolderName('')).toBe('Playlist')
		expect(safeFolderName('   ')).toBe('Playlist')
		expect(safeFolderName('...')).toBe('Playlist')
		expect(safeFolderName('..')).toBe('Playlist')
		expect(safeFolderName('.')).toBe('Playlist')
	})

	it('never emits a name its own validator would reject', () => {
		// Escaping appends a character, so a reserved name at the length limit has to
		// lose one before the underscore goes on.
		const reservedAtLimit = `NUL.${'a'.repeat(SUBFOLDER_NAME_MAX)}`
		const name = safeFolderName(reservedAtLimit)

		expect(name).toHaveLength(SUBFOLDER_NAME_MAX)
		expect(name.startsWith('NUL_.')).toBe(true)
		expect(isValidSubfolder(name)).toBe(true)
	})
})

describe('joinSubfolder', () => {
	it('uses / when base contains /', () => {
		expect(joinSubfolder('/home/user', 'sub')).toBe('/home/user/sub')
	})

	it('uses \\ when base contains \\', () => {
		expect(joinSubfolder('C:\\Users\\x', 'sub')).toBe('C:\\Users\\x\\sub')
	})

	it('strips trailing separator from base before joining', () => {
		expect(joinSubfolder('/home/user/', 'sub')).toBe('/home/user/sub')
		expect(joinSubfolder('/home/user//', 'sub')).toBe('/home/user/sub')
	})

	it('returns base unchanged when sub is empty', () => {
		expect(joinSubfolder('/home/user', '')).toBe('/home/user')
	})
})

describe('effectiveOutputDir', () => {
	it('returns base when toggle is off', () => {
		expect(effectiveOutputDir('/home/user', false, 'sub')).toBe('/home/user')
	})

	it('returns base when subfolder is empty', () => {
		expect(effectiveOutputDir('/home/user', true, '')).toBe('/home/user')
		expect(effectiveOutputDir('/home/user', true, '   ')).toBe('/home/user')
	})

	it('returns base when subfolder is invalid (defensive — UI should disable continue)', () => {
		expect(effectiveOutputDir('/home/user', true, 'bad/name')).toBe('/home/user')
		expect(effectiveOutputDir('/home/user', true, 'CON')).toBe('/home/user')
	})

	it('joins valid subfolder', () => {
		expect(effectiveOutputDir('/home/user', true, 'mixes')).toBe('/home/user/mixes')
	})
})

describe('playlistBaseDir', () => {
	it('uses the explicit subfolder when valid', () => {
		expect(playlistBaseDir('/home/user', true, 'mixes', 'Playlist Title')).toBe('/home/user/mixes')
	})

	it('falls back to the playlist title when the explicit subfolder is invalid', () => {
		expect(playlistBaseDir('/home/user', true, 'CON', 'Road Trip')).toBe('/home/user/Road Trip')
	})

	it('escapes a reserved device name used as the fallback playlist title', () => {
		expect(playlistBaseDir('/home/user', false, '', 'CON')).toBe('/home/user/CON_')
	})
})

describe('splitDir', () => {
	it('splits a POSIX path into parent + leaf', () => {
		expect(splitDir('/home/user/Videos')).toEqual({parent: '/home/user', leaf: 'Videos'})
	})

	it('splits a Windows path into parent + leaf', () => {
		expect(splitDir('C:\\Users\\bob\\Videos')).toEqual({parent: 'C:\\Users\\bob', leaf: 'Videos'})
	})

	it('tolerates a trailing separator', () => {
		expect(splitDir('/home/user/Videos/')).toEqual({parent: '/home/user', leaf: 'Videos'})
	})

	it('keeps a top-level POSIX segment anchored to root', () => {
		expect(splitDir('/foo')).toEqual({parent: '/', leaf: 'foo'})
	})

	// Drive/POSIX roots: leaf must be empty so joinSubfolder(parent, leaf)
	// round-trips back to the root instead of producing a mangled path
	// (e.g. the old code turned "C:\\" into parent='' leaf='C:').
	it('treats a Windows drive root as root parent with empty leaf', () => {
		expect(splitDir('C:\\')).toEqual({parent: 'C:\\', leaf: ''})
		expect(splitDir('C:')).toEqual({parent: 'C:\\', leaf: ''})
	})

	it('treats a POSIX root as root parent with empty leaf', () => {
		expect(splitDir('/')).toEqual({parent: '/', leaf: ''})
	})

	it('is the inverse of joinSubfolder for non-root dirs', () => {
		for (const dir of ['/home/user/Videos', 'C:\\Users\\bob\\Videos', 'C:\\Users', '/foo']) {
			const {parent, leaf} = splitDir(dir)
			expect(joinSubfolder(parent, leaf)).toBe(dir)
		}
	})

	it('round-trips roots back to themselves', () => {
		for (const dir of ['C:\\', '/']) {
			const {parent, leaf} = splitDir(dir)
			expect(joinSubfolder(parent, leaf)).toBe(dir)
		}
	})
})
