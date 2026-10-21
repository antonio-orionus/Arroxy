import {useSyncExternalStore} from 'react'
import log from 'electron-log/renderer.js'
import type {QuickTimeHost} from '@shared/fileTypeFit.js'
import {hostPlatform} from './platform.js'

const quickTimeLogger = log.scope('quicktime')

type ElectronLogWindow = Window & {__electronLog?: unknown}

// AV1 in an MP4 at 1080p, the kind of file a download ends as.
const AV1_MP4: MediaDecodingConfiguration = {type: 'file', video: {contentType: 'video/mp4; codecs="av01.0.08M.08"', width: 1920, height: 1080, bitrate: 4_000_000, framerate: 30}}

// Whether this machine decodes AV1 in hardware, which is what QuickTime needs:
// Apple has no software AV1 decoder. Chromium ships one, so `supported` is
// always true; `powerEfficient` is true only when the chip decodes it (M3 and
// later). Anything that cannot answer reads as no hardware, so the warning stays.
// So does a Mac where the user turned GPU acceleration off: Chromium then sees
// no hardware decoder, though QuickTime still uses it.
export async function decodesAv1InHardware(): Promise<boolean> {
	try {
		const info = await navigator.mediaCapabilities.decodingInfo(AV1_MP4)
		return info.powerEfficient
	} catch (error) {
		if ((window as ElectronLogWindow).__electronLog) quickTimeLogger.warn('AV1 decode probe failed; the AV1 warning stays', error)
		return false
	}
}

// The chip does not change while the app runs: ask once, on first use.
let av1Hardware: boolean | null = null
let probe: Promise<void> | null = null
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
	listeners.add(listener)
	probe ??= decodesAv1InHardware().then(answer => {
		av1Hardware = answer
		for (const notify of listeners) notify()
	})
	return () => {
		listeners.delete(listener)
	}
}

function noProbe(): () => void {
	return () => undefined
}

// This machine as QuickTime sees it. Off a Mac nothing is asked. On a Mac the
// AV1 warning waits for the chip's answer: a warning that shows a moment late
// beats a false alarm that flashes on every Mac that plays the file.
export function useQuickTimeHost(): QuickTimeHost {
	const mac = hostPlatform() === 'darwin'
	const hardware = useSyncExternalStore(mac ? subscribe : noProbe, () => av1Hardware)
	return {mac, av1Hardware: mac && (hardware ?? true)}
}
