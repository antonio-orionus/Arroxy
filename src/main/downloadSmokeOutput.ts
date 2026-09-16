import {sabrSkippedClient} from './services/download/formatLimitSignals.js'

const SELECTED_FORMAT = /^\[info\] [\w-]+: Downloading \d+ format\(s\): (\S+)/
const PLAYER_API = /^\[youtube\] [\w-]+: Downloading (.+?) player API JSON/
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
				const sabr = sabrSkippedClient(line)
				if (sabr) addDistinct(state.sabrSkippedClients, sabr)
				if (line.startsWith('WARNING:') && state.warnings.length < MAX_WARNINGS) addDistinct(state.warnings, line)
				if (INFO_JSON_WRITTEN.test(line)) infoJsonWritten = true
			}
		},
		snapshot() {
			return {...state, playerApiClients: [...state.playerApiClients], sabrSkippedClients: [...state.sabrSkippedClients], warnings: [...state.warnings]}
		}
	}
}
