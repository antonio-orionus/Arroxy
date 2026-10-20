// yt-dlp's `get_compatible_ext` (yt_dlp/utils/_utils.py), translated: the
// container its merger writes for a set of streams. Codecs decide first, after
// yt-dlp's own normalising (`av01` → `av1`, `vp09` → `vp9`); file extensions
// decide when a codec is not named; several streams of one kind, or nothing
// that fits, give MKV. `preferences` is `--merge-output-format` split on `/`.

const COMPATIBLE_CODECS: Readonly<Record<string, ReadonlySet<string>>> = {mp4: new Set(['av1', 'hevc', 'avc1', 'mp4a', 'ac-4', 'h264', 'aacl', 'ec-3']), webm: new Set(['av1', 'vp9', 'vp8', 'opus', 'vrbs', 'vp9x', 'vp8x'])}

const COMPATIBLE_EXTS: readonly ReadonlySet<string>[] = [new Set(['mp3', 'mp4', 'm4a', 'm4p', 'm4b', 'm4r', 'm4v', 'ismv', 'isma', 'mov']), new Set(['webm', 'weba'])]

export interface CompatibleExtInput {
	vcodecs: readonly (string | undefined)[]
	acodecs: readonly (string | undefined)[]
	vexts: readonly string[]
	aexts: readonly string[]
	preferences?: readonly string[]
}

// `x[0].split('.')[0].replace('0', '').lower()`, or none when there is no first codec.
function sanitizeCodec(codecs: readonly (string | undefined)[]): string | undefined {
	return codecs[0]?.split('.')[0]?.replaceAll('0', '').toLowerCase()
}

export function compatibleExt({vcodecs, acodecs, vexts, aexts, preferences}: CompatibleExtInput): string {
	const allowMkv = !preferences || preferences.length === 0 || preferences.includes('mkv')
	if (allowMkv && Math.max(acodecs.length, vcodecs.length) > 1) return 'mkv'

	const vcodec = sanitizeCodec(vcodecs)
	const acodec = sanitizeCodec(acodecs)
	const byCodec = preferences && preferences.length > 0 ? preferences : Object.keys(COMPATIBLE_CODECS)
	for (const ext of byCodec) {
		const codecs = COMPATIBLE_CODECS[ext]
		if (ext === 'mkv' || (codecs && vcodec !== undefined && acodec !== undefined && codecs.has(vcodec) && codecs.has(acodec))) return ext
	}

	for (const ext of preferences && preferences.length > 0 ? preferences : vexts) {
		const current = new Set([ext, ...vexts, ...aexts])
		if (ext === 'mkv' || (current.size === 1 && current.has(ext)) || COMPATIBLE_EXTS.some(group => [...current].every(item => group.has(item)))) return ext
	}
	return allowMkv ? 'mkv' : (preferences?.at(-1) ?? 'mkv')
}
