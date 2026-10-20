import {audioConversionCopies, audioConversionSourceSelector} from 'yt-dlp-bridge/audio-conversion'
import type {AudioConvertTarget} from './audioTargets.js'
import {isDrcAudio} from './ytdlp/formatMapping.js'
import {selectFormats} from './ytdlp/formatSelector.js'
import {createFormatSorter, prepareForSort, sortFormats} from './ytdlp/formatSorter.js'
import type {FormatSelectionSource, YtDlpSelectableFormat} from './ytdlp/selectableFormat.js'

// The stream a conversion starts from, and whether yt-dlp copies it as-is
// (already in the target codec: the chosen bitrate does not apply) or
// re-encodes it.
export interface ConversionSource {
	formatId: string
	copies: boolean
	kbps: number | undefined
}

function described(format: YtDlpSelectableFormat, target: AudioConvertTarget): ConversionSource {
	return {formatId: format.format_id ?? '', copies: audioConversionCopies(target, format.acodec), kbps: format.abr}
}

function picked(formats: readonly YtDlpSelectableFormat[], selection: FormatSelectionSource, target: AudioConvertTarget): YtDlpSelectableFormat | undefined {
	if (formats.length === 0) return undefined
	const sorted = sortFormats(prepareForSort(formats, selection.durationSeconds), createFormatSorter([], selection.sortFields))
	return selectFormats(audioConversionSourceSelector(target), sorted)?.formats[0]
}

// The stream yt-dlp converts: the bridge's own `-f` for the conversion, run
// through this app's port of yt-dlp's selection (held to real yt-dlp by
// `scripts/check-selection-parity.ts`). `formatIds` narrows it to one
// language's streams, the pool the wizard names a source from; `preferDrc`
// (the DRC switch) tries that pool's DRC streams first.
export function conversionSource(selection: FormatSelectionSource, target: AudioConvertTarget, options: {formatIds?: ReadonlySet<string>; preferDrc?: boolean} = {}): ConversionSource | undefined {
	const {formatIds, preferDrc} = options
	const pool = formatIds ? selection.formats.filter(format => formatIds.has(format.format_id ?? '')) : selection.formats
	const pools = preferDrc ? [pool.filter(isDrcAudio), pool] : [pool]
	for (const formats of pools) {
		const format = picked(formats, selection, target)
		if (format) return described(format, target)
	}
	return undefined
}

// The source of a conversion the wizard set up: the stream it names (one
// language of several), else the one yt-dlp picks.
export function selectedConversionSource(selection: FormatSelectionSource, target: AudioConvertTarget, sourceFormatId: string | undefined): ConversionSource | undefined {
	const named = sourceFormatId === undefined ? undefined : selection.formats.find(format => format.format_id === sourceFormatId)
	return named ? described(named, target) : conversionSource(selection, target)
}
