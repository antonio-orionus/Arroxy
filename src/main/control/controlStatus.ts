// The app's status as a Control API client sees it, from the sources that
// own each part: the binaries, the queue's scheduler and the sites Arroxy is
// holding off. The event feed sends it again whenever one of them changes.

import type {AppStatus} from 'arroxy-control'
import type {SiteCooldown} from '@shared/types.js'

type Unsubscribe = () => void

// yt-dlp's and FFmpeg's state. Nothing in main tracks it as one value yet;
// the entry point that wires the Control API supplies it.
export interface ControlBinaries {
	current(): AppStatus['binaries']
	onChange(listener: () => void): Unsubscribe
}

export interface ControlStatusSources {
	binaries: ControlBinaries
	// SiteRequestState: the current route's running cooldowns.
	cooldowns: {snapshot(): SiteCooldown[]; onChange(listener: (cooldowns: SiteCooldown[]) => void): Unsubscribe}
	scheduler: {paused(): boolean; onChange(listener: () => void): Unsubscribe}
}

export interface ControlStatus {
	current(): AppStatus
	onChange(listener: () => void): Unsubscribe
}

export function createControlStatus(sources: ControlStatusSources): ControlStatus {
	return {
		current: () => {
			const binaries = sources.binaries.current()
			return {
				// The queue can start work once both binaries are in place.
				ready: binaries.ytDlp === 'ready' && binaries.ffmpeg === 'ready',
				binaries,
				scheduler: sources.scheduler.paused() ? 'paused' : 'running',
				cooldowns: sources.cooldowns.snapshot().map(cooldown => ({site: cooldown.site, until: Date.parse(cooldown.until)}))
			}
		},
		onChange: listener => {
			const stops = [sources.binaries.onChange(listener), sources.cooldowns.onChange(() => listener()), sources.scheduler.onChange(listener)]
			return () => {
				for (const stop of stops) stop()
			}
		}
	}
}
