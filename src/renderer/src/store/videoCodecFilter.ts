import type {StoreApi} from 'zustand'
import {resolutionLabel} from '@renderer/lib/resolutionLabel.js'
import {DEFAULTS} from '@shared/constants.js'
import {VIDEO_CODEC_ORDER, videoCodecName} from '@shared/fileTypeFit.js'
import type {VideoCodecFilter, VideoCodecName} from '@shared/schemas.js'
import type {AppSettings, FormatOption} from '@shared/types.js'
import {groupVideoFormats} from './helpers.js'
import type {AppState} from './types.js'

// The saved filter, or every codec before settings load.
export function videoCodecFilterOf(state: {settings: AppSettings | null}): VideoCodecFilter {
	return state.settings?.common?.videoCodecFilter ?? DEFAULTS.videoCodecFilter
}

// The codec the Video list shows alone, or null for every codec: filtering
// takes two codecs to choose from, and one this video has.
export function activeCodecFilter(codecs: readonly VideoCodecName[], filter: VideoCodecFilter): VideoCodecName | null {
	return filter !== 'all' && codecs.length >= 2 && codecs.includes(filter) ? filter : null
}

// "2160p" → 2160; a stream with no size is 0.
function heightOf(format: FormatOption): number {
	const match = /^(\d+)p/.exec(resolutionLabel(format.resolution).label)
	return match ? Number(match[1]) : 0
}

// The Format screen's codec filter never hides the pick: the chip that takes its
// place is the shown codec's at the same height and range, else at the same
// height, else at the nearest height (the taller on a tie). Null when the pick
// stays: it is of that codec, the filter doesn't apply, or nothing is picked.
// `preferIds` are the other streams the grid keeps visible (the profile's pick),
// so the chips here are the ones it draws.
export function codecFilterPick(formats: FormatOption[], selectedId: string, filter: VideoCodecFilter, preferIds: readonly string[] = []): string | null {
	if (selectedId === '') return null
	const byId = new Map(formats.map(format => [format.formatId, format]))
	const listed = groupVideoFormats(formats, [selectedId, ...preferIds]).flatMap(group => byId.get(group.formatId) ?? [])
	const offered = new Set(listed.flatMap(format => videoCodecName(format.videoCodec) ?? []))
	const codec = activeCodecFilter(
		VIDEO_CODEC_ORDER.filter(name => offered.has(name)),
		filter
	)
	const selected = listed.find(format => format.formatId === selectedId)
	if (codec === null || !selected || videoCodecName(selected.videoCodec) === codec) return null
	const height = heightOf(selected)
	const rank = (format: FormatOption): [number, number, number] => [Math.abs(heightOf(format) - height), format.dynamicRange === selected.dynamicRange ? 0 : 1, -heightOf(format)]
	const closest = listed
		.filter(format => videoCodecName(format.videoCodec) === codec)
		.map(format => ({format, rank: rank(format)}))
		.toSorted((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.rank[2] - b.rank[2])[0]
	return closest?.format.formatId ?? null
}

// The saved filter never hides the pick, however it changes: picked here, rolled
// back after a failed write, or a queued write's response landing later.
export function watchVideoCodecFilter(store: Pick<StoreApi<AppState>, 'subscribe'>): () => void {
	return store.subscribe((state, previous) => {
		if (videoCodecFilterOf(state) !== videoCodecFilterOf(previous)) state.keepPickInCodecFilter()
	})
}
