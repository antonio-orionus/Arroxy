import {isInfoJsonWriteLine, sabrSkippedClient} from './services/download/formatLimitSignals.js'

const SELECTED_FORMAT = /^\[info\] [\w-]+: Downloading \d+ format\(s\): (\S+)/
const PLAYER_API = /^\[youtube\] [\w-]+: Downloading (.+?) player API JSON/
const TRANSFER_STARTING = /^\[download\] (Destination: |Sleeping )/
const MAX_WARNINGS = 50

export interface DownloadSmokeObservation {
	selectedFormat: string | null
	playerApiClients: string[]
	sabrSkippedClients: string[]
	warnings: string[]
	// yt-dlp announced the info-json write. It prints this before writing, so the
	// file is only usable once it can be read back.
	infoJsonWriteSeen: boolean
	// A media transfer is about to begin, which yt-dlp only does after the
	// info-json is on disk.
	transferStarting: boolean
}

export interface DownloadSmokeObserver {
	push(text: string): void
	snapshot(): DownloadSmokeObservation
}

function addDistinct(list: string[], value: string): void {
	if (!list.includes(value)) list.push(value)
}

// Stop rule, applied by the runner: stop once a transfer is about to start, or
// once the info-json has been announced and reads back complete. yt-dlp's
// stdout and stderr arrive through separate callbacks, so a stderr line can
// follow the announcement before the file exists; a line alone proves nothing.
export function createDownloadSmokeObserver(): DownloadSmokeObserver {
	const state: DownloadSmokeObservation = {selectedFormat: null, playerApiClients: [], sabrSkippedClients: [], warnings: [], infoJsonWriteSeen: false, transferStarting: false}
	return {
		push(text) {
			for (const line of text.split(/\r?\n|\r/)) {
				if (!line) continue
				if (TRANSFER_STARTING.test(line)) state.transferStarting = true
				const selected = SELECTED_FORMAT.exec(line)
				if (selected?.[1]) state.selectedFormat = selected[1]
				const client = PLAYER_API.exec(line)
				if (client?.[1]) addDistinct(state.playerApiClients, client[1])
				const sabr = sabrSkippedClient(line)
				if (sabr) addDistinct(state.sabrSkippedClients, sabr)
				if (line.startsWith('WARNING:') && state.warnings.length < MAX_WARNINGS) addDistinct(state.warnings, line)
				if (isInfoJsonWriteLine(line)) state.infoJsonWriteSeen = true
			}
		},
		snapshot() {
			return {...state, playerApiClients: [...state.playerApiClients], sabrSkippedClients: [...state.sabrSkippedClients], warnings: [...state.warnings]}
		}
	}
}
