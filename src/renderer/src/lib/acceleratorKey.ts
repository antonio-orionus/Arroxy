/**
 * KeyboardEvent → Electron accelerator key name.
 *
 * The recorder starts from the physical key (KeyboardEvent.code), not the
 * produced character: that changes with the held modifiers (Shift+1 → "!",
 * macOS Option+A → "å"). Punctuation uses its unshifted US character, which
 * Electron maps to the same virtual key. "+" is the chord separator, so it is
 * never emitted as a key (Equal → "=", NumpadAdd → "numadd").
 *
 * Letters follow how each platform registers a global shortcut. macOS
 * (RegisterEventHotKey) binds the physical ANSI key position, so the code is
 * right there. Windows (RegisterHotKey) and X11 bind the layout's virtual key,
 * so on AZERTY the key labelled A (code KeyQ) must be saved as A: there the
 * layout's letter, when the event produced one, wins over the position.
 *
 * Names follow Electron's accelerator key list; anything else returns null.
 */
const NAMED_CODES: Readonly<Record<string, string>> = {
	Space: 'Space',
	Tab: 'Tab',
	Enter: 'Return',
	NumpadEnter: 'Return',
	Backspace: 'Backspace',
	Delete: 'Delete',
	Insert: 'Insert',
	Home: 'Home',
	End: 'End',
	PageUp: 'PageUp',
	PageDown: 'PageDown',
	ArrowUp: 'Up',
	ArrowDown: 'Down',
	ArrowLeft: 'Left',
	ArrowRight: 'Right',
	CapsLock: 'Capslock',
	NumLock: 'Numlock',
	ScrollLock: 'Scrolllock',
	PrintScreen: 'PrintScreen',
	Minus: '-',
	Equal: '=',
	BracketLeft: '[',
	BracketRight: ']',
	Backslash: '\\',
	Semicolon: ';',
	Quote: "'",
	Comma: ',',
	Period: '.',
	Slash: '/',
	Backquote: '`',
	NumpadDecimal: 'numdec',
	NumpadAdd: 'numadd',
	NumpadSubtract: 'numsub',
	NumpadMultiply: 'nummult',
	NumpadDivide: 'numdiv'
}

export function acceleratorKeyFromEvent(event: {code: string; key: string}, platform: NodeJS.Platform): string | null {
	const letter = /^Key([A-Z])$/.exec(event.code)
	if (letter) return platform !== 'darwin' && /^[a-z]$/i.test(event.key) ? event.key.toUpperCase() : letter[1]
	const digit = /^Digit([0-9])$/.exec(event.code)
	if (digit) return digit[1]
	const numpadDigit = /^Numpad([0-9])$/.exec(event.code)
	if (numpadDigit) return `num${numpadDigit[1]}`
	if (/^F([1-9]|1[0-9]|2[0-4])$/.test(event.code)) return event.code
	return NAMED_CODES[event.code] ?? null
}
