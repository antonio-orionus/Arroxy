import type {ProbeResult} from '@shared/types.js'

// Compact, log-friendly summary of a ProbeResult. Intentionally drops large
// fields (full formats array, full subtitle map) and keeps the shapes a human
// scanning logs would care about: kind, extractor, counts, degradation flags.
export function summarizeProbeResult(r: ProbeResult): Record<string, unknown> {
	if (r.kind === 'video') {
		return {
			kind: r.kind,
			extractor: r.extractor,
			extractorKey: r.extractorKey,
			webpageUrl: r.webpageUrl,
			isAudioOnlySource: r.isAudioOnlySource,
			title: r.title,
			duration: r.duration,
			formatCount: r.formats.length,
			formatIds: r.formats.map(f => f.formatId),
			subtitleLangs: Object.keys(r.subtitles ?? {}),
			autoCaptionLangs: Object.keys(r.automaticCaptions ?? {}),
			isLive: r.isLive,
			hasDrm: r.hasDrm,
			availability: r.availability,
			ageLimit: r.ageLimit,
			degraded: r.degraded?.reasons ?? null,
			thumbnail: r.thumbnail || null
		}
	}
	return {kind: r.kind, extractor: r.extractor, extractorKey: r.extractorKey, webpageUrl: r.webpageUrl, isAudioOnlySource: r.isAudioOnlySource, isMultiVideo: r.isMultiVideo, playlistId: r.playlistId, playlistTitle: r.playlistTitle, entryCount: r.entries.length, firstEntryUrl: r.entries[0]?.url ?? null}
}
