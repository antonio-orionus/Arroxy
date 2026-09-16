import {z} from 'zod'

const SELECTED_FORMAT = /^\[info\] [\w-]+: Downloading \d+ format\(s\): (\S+)/
const PLAYER_API = /^\[youtube\] [\w-]+: Downloading (.+?) player API JSON/
const SABR_SKIPPED = /Some (\S+) client https formats have been skipped as they are missing a URL/
const INFO_JSON_WRITTEN = /^\[info\] Writing video metadata as JSON to: /
const TRANSFER_STARTING = /^\[download\] (Destination: |Sleeping )/
const MAX_WARNINGS = 50

export interface DownloadSmokeObservation {
	selectedFormat: string | null
	playerApiClients: string[]
	sabrSkippedClients: string[]
	warnings: string[]
	shouldStop: boolean
}

export interface DownloadSmokeObserver {
	push(text: string): void
	snapshot(): DownloadSmokeObservation
}

function addDistinct(list: string[], value: string): void {
	if (!list.includes(value)) list.push(value)
}

// Stop rule: yt-dlp writes the info-json synchronously, so any line printed
// after "Writing video metadata" proves the file is complete. Stopping there
// captures the chosen formats without transferring the media. stdout and stderr
// share one observer; a stderr line after the write stops the run just as well.
export function createDownloadSmokeObserver(): DownloadSmokeObserver {
	const state: DownloadSmokeObservation = {selectedFormat: null, playerApiClients: [], sabrSkippedClients: [], warnings: [], shouldStop: false}
	let infoJsonWritten = false
	return {
		push(text) {
			for (const line of text.split(/\r?\n|\r/)) {
				if (!line) continue
				if (infoJsonWritten || TRANSFER_STARTING.test(line)) state.shouldStop = true
				const selected = SELECTED_FORMAT.exec(line)
				if (selected?.[1]) state.selectedFormat = selected[1]
				const client = PLAYER_API.exec(line)
				if (client?.[1]) addDistinct(state.playerApiClients, client[1])
				const sabr = SABR_SKIPPED.exec(line)
				if (sabr?.[1]) addDistinct(state.sabrSkippedClients, sabr[1])
				if (line.startsWith('WARNING:') && state.warnings.length < MAX_WARNINGS) addDistinct(state.warnings, line)
				if (INFO_JSON_WRITTEN.test(line)) infoJsonWritten = true
			}
		},
		snapshot() {
			return {...state, playerApiClients: [...state.playerApiClients], sabrSkippedClients: [...state.sabrSkippedClients], warnings: [...state.warnings]}
		}
	}
}

export interface SelectedFormat {
	formatId: string
	height: number | null
	vcodec: string | null
	acodec: string | null
}

const formatFieldsSchema = z.object({format_id: z.string(), height: z.number().nullish(), vcodec: z.string().nullish(), acodec: z.string().nullish()})
const infoJsonSelectionSchema = formatFieldsSchema.extend({requested_formats: z.array(formatFieldsSchema).optional()})

function toSelected(f: z.infer<typeof formatFieldsSchema>): SelectedFormat {
	return {formatId: f.format_id, height: f.height ?? null, vcodec: f.vcodec ?? null, acodec: f.acodec ?? null}
}

// The info-json is yt-dlp output read back from disk, so it is parsed rather
// than trusted: a merged selection lists its parts in requested_formats, a
// single-file one carries the format on the top level.
export function parseSelectedFormats(infoJsonText: string): SelectedFormat[] | null {
	let raw: unknown
	try {
		raw = JSON.parse(infoJsonText)
	} catch {
		return null
	}
	const parsed = infoJsonSelectionSchema.safeParse(raw)
	if (!parsed.success) return null
	return parsed.data.requested_formats?.length ? parsed.data.requested_formats.map(toSelected) : [toSelected(parsed.data)]
}
