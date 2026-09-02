import {hostPlatform} from './platform.js'

/**
 * Electron accelerator → per-key display tokens.
 *
 * Three producers write the stored string — DEFAULTS, the in-app recorder
 * (Ctrl/Alt/Shift/Super), and a hand-edited settings.json — so every Electron
 * modifier spelling is accepted. Unknown key names pass through rather than
 * being dropped: showing `Backquote` is honest, showing nothing is a lie.
 */
const MAC_MODIFIERS: Record<string, string> = {commandorcontrol: '⌘', cmdorctrl: '⌘', command: '⌘', cmd: '⌘', super: '⌘', meta: '⌘', control: '⌃', ctrl: '⌃', alt: '⌥', option: '⌥', shift: '⇧'}

const WIN_MODIFIERS: Record<string, string> = {commandorcontrol: 'Ctrl', cmdorctrl: 'Ctrl', command: 'Win', cmd: 'Win', super: 'Win', meta: 'Win', control: 'Ctrl', ctrl: 'Ctrl', alt: 'Alt', option: 'Alt', shift: 'Shift'}

const LINUX_MODIFIERS: Record<string, string> = {...WIN_MODIFIERS, command: 'Super', cmd: 'Super', super: 'Super', meta: 'Super'}

const MAC_SPOKEN_MODIFIERS: Record<string, string> = {commandorcontrol: 'Command', cmdorctrl: 'Command', command: 'Command', cmd: 'Command', super: 'Command', meta: 'Command', control: 'Control', ctrl: 'Control', alt: 'Option', option: 'Option', shift: 'Shift'}

const WIN_SPOKEN_MODIFIERS: Record<string, string> = {commandorcontrol: 'Control', cmdorctrl: 'Control', command: 'Windows', cmd: 'Windows', super: 'Windows', meta: 'Windows', control: 'Control', ctrl: 'Control', alt: 'Alt', option: 'Alt', shift: 'Shift'}

const LINUX_SPOKEN_MODIFIERS: Record<string, string> = {...WIN_SPOKEN_MODIFIERS, command: 'Super', cmd: 'Super', super: 'Super', meta: 'Super'}

function modifierTable(platform: NodeJS.Platform): Record<string, string> {
	if (platform === 'darwin') return MAC_MODIFIERS
	if (platform === 'win32') return WIN_MODIFIERS
	return LINUX_MODIFIERS
}

function spokenModifierTable(platform: NodeJS.Platform): Record<string, string> {
	if (platform === 'darwin') return MAC_SPOKEN_MODIFIERS
	if (platform === 'win32') return WIN_SPOKEN_MODIFIERS
	return LINUX_SPOKEN_MODIFIERS
}

function formatHotkeyParts(accelerator: string, table: Record<string, string>): string[] {
	const trimmed = accelerator.trim()
	if (!trimmed) return []
	return trimmed
		.split('+')
		.map(part => part.trim())
		.filter(part => part.length > 0)
		.map(part => table[part.toLowerCase()] ?? part)
}

export function formatHotkeyChord(accelerator: string, platform: NodeJS.Platform = hostPlatform()): string[] {
	return formatHotkeyParts(accelerator, modifierTable(platform))
}

export function formatHotkeyChordSpoken(accelerator: string, platform: NodeJS.Platform = hostPlatform()): string[] {
	return formatHotkeyParts(accelerator, spokenModifierTable(platform))
}
