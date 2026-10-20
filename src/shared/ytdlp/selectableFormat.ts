// A format as yt-dlp's own selection sees it: the raw fields its format sort
// and format filters read, in the probe's order. Kept beside the Format
// screen's options (which are labelled, re-sorted and enriched for display) so
// the profile pick runs on exactly what the yt-dlp download will run on.

import {z} from 'zod'

const optNumber = z
	.number()
	.nullish()
	.transform(value => value ?? undefined)
const optString = z
	.string()
	.nullish()
	.transform(value => value ?? undefined)

export const ytDlpSelectableFormatSchema = z.object({
	format_id: optString,
	ext: optString,
	vcodec: optString,
	acodec: optString,
	protocol: optString,
	width: optNumber,
	height: optNumber,
	fps: optNumber,
	dynamic_range: optString,
	tbr: optNumber,
	vbr: optNumber,
	abr: optNumber,
	asr: optNumber,
	audio_channels: optNumber,
	filesize: optNumber,
	filesize_approx: optNumber,
	quality: optNumber,
	preference: optNumber,
	source_preference: optNumber,
	language_preference: optNumber,
	language: optString,
	format_note: optString,
	// Only whether there is one matters (yt-dlp estimates no size for it).
	manifest_url: z
		.string()
		.nullish()
		.transform(value => (value ? true : undefined)),
	has_drm: z
		.union([z.boolean(), z.literal('maybe')])
		.nullish()
		.transform(value => value === true || undefined),
	video_ext: optString,
	audio_ext: optString
})

// Every field is optional: yt-dlp leaves out what a site doesn't say.
export type YtDlpSelectableFormat = Partial<z.output<typeof ytDlpSelectableFormatSchema>>

// What the profile pick needs from a probe to choose as yt-dlp would.
export interface FormatSelectionSource {
	formats: readonly YtDlpSelectableFormat[]
	// The extractor's own sort (`_format_sort_fields`), applied after `-S`.
	sortFields: readonly string[]
	durationSeconds?: number
}

export const EMPTY_FORMAT_SELECTION: FormatSelectionSource = {formats: [], sortFields: []}

// Raw formats that don't parse as a format are left out, as the Format screen leaves them out.
export function selectableFormats(raw: readonly unknown[]): YtDlpSelectableFormat[] {
	return raw.flatMap(format => {
		const parsed = ytDlpSelectableFormatSchema.safeParse(format)
		return parsed.success ? [parsed.data] : []
	})
}

export function formatSortFields(raw: unknown): string[] {
	const parsed = z.array(z.string()).safeParse(raw)
	return parsed.success ? parsed.data : []
}

// Read from a probe's info dict: its formats in order, the extractor's sort, the length.
export function formatSelectionSource(info: {formats?: readonly unknown[]; duration?: number}, sortFields: unknown): FormatSelectionSource {
	return {formats: selectableFormats(info.formats ?? []), sortFields: formatSortFields(sortFields), ...(info.duration === undefined ? {} : {durationSeconds: info.duration})}
}
