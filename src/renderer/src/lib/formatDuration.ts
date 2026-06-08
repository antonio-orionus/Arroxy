// Format a duration in seconds as `h:mm:ss` or `m:ss`. When `liveLabel` is
// provided and `seconds === 0`, returns `liveLabel` — yt-dlp's convention for
// ongoing streams. Pass `undefined`/missing duration handling at the call
// site (callers decide whether to render an em-dash, hide the slot, etc.).
export function formatDuration(seconds: number, liveLabel?: string): string {
	if (seconds === 0 && liveLabel !== undefined) return liveLabel
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	return `${m}:${String(s).padStart(2, '0')}`
}
