import type {ProbePlaylistMode} from '@shared/types.js'
import {urlIntentHomeLabel, type UrlIntent, type UrlIntentHomeLabel} from '@shared/urlIntent.js'

export type UrlIntentEntryPoint = 'interactive-submit' | 'quick-download' | 'bulk-quick-download' | 'hotkey' | 'home-label'

export type UrlIntentPolicyAction =
	| {kind: 'probe-video'; playlistMode: Extract<ProbePlaylistMode, 'video'>}
	| {kind: 'probe-auto'; playlistMode: Extract<ProbePlaylistMode, 'auto'>}
	| {kind: 'probe-playlist'; playlistMode: Extract<ProbePlaylistMode, 'playlist'>}
	| {kind: 'show-mixed-prompt'}
	| {kind: 'open-bulk-review'}
	| {kind: 'show-label'; label: UrlIntentHomeLabel}

function probeActionForIntent(intent: UrlIntent): Extract<UrlIntentPolicyAction, {playlistMode: ProbePlaylistMode}> | {kind: 'show-mixed-prompt'} {
	if (intent.kind === 'mixed') return {kind: 'show-mixed-prompt'}
	if (intent.kind === 'obvious-single') return {kind: 'probe-video', playlistMode: 'video'}
	if (intent.kind === 'obvious-collection') return {kind: 'probe-playlist', playlistMode: 'playlist'}
	return {kind: 'probe-auto', playlistMode: 'auto'}
}

export function policyForUrlIntent(intent: UrlIntent, entryPoint: UrlIntentEntryPoint): UrlIntentPolicyAction {
	if (entryPoint === 'home-label') return {kind: 'show-label', label: urlIntentHomeLabel(intent)}
	if (entryPoint === 'bulk-quick-download' && intent.kind === 'mixed') return {kind: 'open-bulk-review'}
	// The hotkey fires against a hidden window, so there is nobody to prompt and
	// every review path costs the user a trip back into the app. A mixed URL
	// always names a concrete video, and queueing one unwanted video is far
	// cheaper to undo than queueing an unwanted playlist, so the video wins.
	if (entryPoint === 'hotkey' && intent.kind === 'mixed') return {kind: 'probe-video', playlistMode: 'video'}
	return probeActionForIntent(intent)
}

export function shouldReviewPlaylistProbeResult(intent: UrlIntent): boolean {
	return intent.kind !== 'obvious-collection'
}
