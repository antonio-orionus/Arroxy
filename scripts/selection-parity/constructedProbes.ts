// Format lists no recorded probe has (src/renderer/src/dev/probeSources), as
// yt-dlp info dicts, so the selection parity check runs yt-dlp on them too.
// Each is a shape some site serves; a recorded probe of a real site replaces
// it when one turns up.

const muxed = (formatId: string, width: number, height: number, codecs: {vcodec: string; acodec: string; tbr: number} | null): Record<string, unknown> => ({format_id: formatId, ext: 'mp4', width, height, protocol: 'https', ...codecs})

export interface ConstructedProbe {
	info: unknown
	// What yt-dlp must download for a Smart TV profile of each height.
	smartTv: Readonly<Record<'1080' | '720' | '480', string>>
}

export const CONSTRUCTED_PROBES: Readonly<Record<string, ConstructedProbe>> = {
	// Muxed files only, none H.264: two that name no codec (a plain list of
	// <video> sources) beside VP9 and AV1. Smart TV's `-S vcodec:h264` took the
	// codec-less 720p here for 1080p too, and over the VP9 720p. With no H.264,
	// yt-dlp's own order decides: the height, then a known codec over none.
	'muxed-no-h264': {
		smartTv: {1080: 'av1-1080', 720: 'vp9-720', 480: 'sd'},
		info: {
			_type: 'video',
			id: 'muxed-no-h264',
			title: 'Muxed, no H.264',
			extractor: 'generic',
			extractor_key: 'Generic',
			webpage_url: 'https://parity.invalid/muxed-no-h264',
			duration: 60,
			formats: [muxed('sd', 640, 360, null), muxed('hd', 1280, 720, null), muxed('vp9-720', 1280, 720, {vcodec: 'vp09.00.31.08', acodec: 'mp4a.40.2', tbr: 1500}), muxed('av1-1080', 1920, 1080, {vcodec: 'av01.0.08M.08', acodec: 'mp4a.40.2', tbr: 2500})]
		}
	}
}
