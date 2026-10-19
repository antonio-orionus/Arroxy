/**
 * KeyboardEvent.code → Electron accelerator key name.
 *
 * The recorder reads the physical key, not KeyboardEvent.key: the produced
 * character changes with the held modifiers (Shift+1 → "!", macOS Option+A →
 * "å") and the layout, while Electron registers the key itself plus the
 * modifiers named in the chord. Punctuation uses its unshifted US character,
 * which Electron maps to the same virtual key. "+" is the chord separator, so
 * it is never emitted as a key (Equal → "=", NumpadAdd → "numadd").
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

export function acceleratorKeyFromCode(code: string): string | null {
	const letter = /^Key([A-Z])$/.exec(code)
	if (letter) return letter[1]
	const digit = /^Digit([0-9])$/.exec(code)
	if (digit) return digit[1]
	const numpadDigit = /^Numpad([0-9])$/.exec(code)
	if (numpadDigit) return `num${numpadDigit[1]}`
	if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) return code
	return NAMED_CODES[code] ?? null
}
