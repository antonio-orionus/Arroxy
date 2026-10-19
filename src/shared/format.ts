import prettyBytes from 'pretty-bytes'

// Returns the input only if it's a non-empty string; otherwise undefined.
// Used in lieu of `||` where we want empty-string-as-falsy semantics
// (which `??` does not provide) without per-call eslint-disables.
export function nonEmpty(s: string | null | undefined): string | undefined {
	return s && s.length > 0 ? s : undefined
}

// Sizes are counted in 1024s, so they carry binary unit names (KiB, MiB, GiB).
// `locale` is the UI language; without one the digits stay plain en-US.
export function humanSize(bytes: number, locale?: string): string {
	return prettyBytes(bytes, {binary: true, locale, minimumFractionDigits: 1, maximumFractionDigits: 1})
}

// About three significant digits, for narrow columns: 1.5 KiB, 137 MiB.
export function compactSize(bytes: number, locale?: string): string {
	return prettyBytes(bytes, {binary: true, locale})
}
