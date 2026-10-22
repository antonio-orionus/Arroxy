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

// Bitrates count in 1000s: 850 kbps, 2.6 Mbps. `locale` as for humanSize.
export function humanBitrate(kbps: number, locale?: string): string {
	if (kbps < 1000) return `${new Intl.NumberFormat(locale ?? 'en-US', {maximumFractionDigits: 0}).format(kbps)} kbps`
	return `${new Intl.NumberFormat(locale ?? 'en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(kbps / 1000)} Mbps`
}

// A frame's width × height: 1920×800. The locale's digits, without grouping, which no one writes in a frame size.
export function frameSize(width: number, height: number, locale?: string): string {
	const digits = new Intl.NumberFormat(locale ?? 'en-US', {useGrouping: false, maximumFractionDigits: 0})
	return `${digits.format(width)}×${digits.format(height)}`
}

// About three significant digits, for narrow columns: 1.5 KiB, 137 MiB.
export function compactSize(bytes: number, locale?: string): string {
	return prettyBytes(bytes, {binary: true, locale})
}
