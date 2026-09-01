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

function modifierTable(platform: NodeJS.Platform): Record<string, string> {
	if (platform === 'darwin') return MAC_MODIFIERS
	if (platform === 'win32') return WIN_MODIFIERS
	return LINUX_MODIFIERS
}

export function formatHotkeyChord(accelerator: string, platform: NodeJS.Platform = hostPlatform()): string[] {
	const trimmed = accelerator.trim()
	if (!trimmed) return []
	const table = modifierTable(platform)
	return trimmed
		.split('+')
		.map(part => part.trim())
		.filter(part => part.length > 0)
		.map(part => table[part.toLowerCase()] ?? part)
}
