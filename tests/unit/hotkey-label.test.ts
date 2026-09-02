import {describe, expect, it} from 'vitest'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'

// The stored value is an Electron accelerator, written either by DEFAULTS, by
// the in-app recorder (Ctrl/Alt/Shift/Super), or by a settings.json hand-edit.
// Display has to be platform-correct for all three spellings.
describe('formatHotkeyChord', () => {
	it('renders the default chord with mac glyphs on darwin', () => {
		expect(formatHotkeyChord('CommandOrControl+Shift+D', 'darwin')).toEqual(['⌘', '⇧', 'D'])
	})

	it('renders the default chord with word modifiers off darwin', () => {
		expect(formatHotkeyChord('CommandOrControl+Shift+D', 'win32')).toEqual(['Ctrl', 'Shift', 'D'])
	})

	it('maps recorder output, which spells the meta key Super', () => {
		expect(formatHotkeyChord('Ctrl+Alt+Shift+F5', 'darwin')).toEqual(['⌃', '⌥', '⇧', 'F5'])
		expect(formatHotkeyChord('Super+Shift+D', 'win32')).toEqual(['Win', 'Shift', 'D'])
		expect(formatHotkeyChord('Super+Shift+D', 'linux')).toEqual(['Super', 'Shift', 'D'])
	})

	it('accepts the alternate Electron spellings a hand-edited settings.json can hold', () => {
		expect(formatHotkeyChord('CmdOrCtrl+Shift+D', 'darwin')).toEqual(['⌘', '⇧', 'D'])
		expect(formatHotkeyChord('Command+Option+K', 'darwin')).toEqual(['⌘', '⌥', 'K'])
		expect(formatHotkeyChord('Control+Alt+K', 'win32')).toEqual(['Ctrl', 'Alt', 'K'])
	})

	it('passes unknown key names through untouched', () => {
		expect(formatHotkeyChord('Ctrl+Shift+Backquote', 'linux')).toEqual(['Ctrl', 'Shift', 'Backquote'])
	})

	it('returns no tokens for an empty accelerator', () => {
		expect(formatHotkeyChord('', 'darwin')).toEqual([])
		expect(formatHotkeyChord('   ', 'darwin')).toEqual([])
	})
})
