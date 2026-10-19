// A probe's subtitle map as the wizard offers it: live chat dropped, tracks
// without a format dropped, and on YouTube only the real auto captions.

import {LIVE_CHAT_LANG} from '@shared/constants.js'
import type {Site} from '@shared/sites/index.js'
import type {SubtitleMap} from '@shared/types.js'
import type {YtDlpSubtitleTrack} from '@shared/ytdlp/infoDict.js'

export function sanitizeSubtitleMap(raw: Record<string, YtDlpSubtitleTrack[]> | undefined, opts: {isAutomaticCaptions: boolean; site: Site}): SubtitleMap {
	if (!raw) return {}
	const result: SubtitleMap = {}
	// Site adapter decides whether auto-caption keys must end in `-orig`. YouTube
	// bundles real generated tracks with on-demand translation options under the
	// same map; only `-orig` are real. Other sites emit auto-captions under bare
	// lang codes — applying the filter would discard every track.
	const requireOrig = opts.isAutomaticCaptions && opts.site.autoCaptionRequiresOrigSuffix
	for (const [lang, tracks] of Object.entries(raw)) {
		if (lang === LIVE_CHAT_LANG) continue
		if (requireOrig && !lang.endsWith('-orig')) continue
		const valid = tracks.flatMap(t => (typeof t.ext === 'string' && t.ext.length > 0 ? [{ext: t.ext, ...(t.name ? {name: t.name} : {})}] : []))
		if (valid.length > 0) result[lang] = valid
	}
	return result
}
