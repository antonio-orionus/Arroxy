import {resolutionLabel} from '@renderer/lib/resolutionLabel.js'
import {videoCodecName} from '@shared/fileTypeFit.js'
import type {VideoCodecFilter} from '@shared/schemas.js'
import type {FormatOption} from '@shared/types.js'
import {groupVideoFormats} from './helpers.js'

// "2160p" → 2160; a stream with no size is 0.
function heightOf(format: FormatOption): number {
	const match = /^(\d+)p/.exec(resolutionLabel(format.resolution).label)
	return match ? Number(match[1]) : 0
}

// The Format screen's codec filter never hides the pick: the chip that takes its
// place is the shown codec's at the same height and range, else at the same
// height, else at the nearest height (the taller on a tie). Null when the pick
// stays: it is of that codec, every codec shows, the video has none of it, or
// nothing is picked.
export function codecFilterPick(formats: FormatOption[], selectedId: string, filter: VideoCodecFilter): string | null {
	if (filter === 'all' || selectedId === '') return null
	const byId = new Map(formats.map(format => [format.formatId, format]))
	// The chips the Video list shows, the pick among them.
	const listed = groupVideoFormats(formats, [selectedId]).flatMap(group => byId.get(group.formatId) ?? [])
	const selected = listed.find(format => format.formatId === selectedId)
	if (!selected || videoCodecName(selected.videoCodec) === filter) return null
	const height = heightOf(selected)
	const rank = (format: FormatOption): [number, number, number] => [Math.abs(heightOf(format) - height), format.dynamicRange === selected.dynamicRange ? 0 : 1, -heightOf(format)]
	const closest = listed
		.filter(format => videoCodecName(format.videoCodec) === filter)
		.map(format => ({format, rank: rank(format)}))
		.toSorted((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.rank[2] - b.rank[2])[0]
	return closest?.format.formatId ?? null
}
