import type {YtDlpErrorKind} from 'ytdlp-errors'
import type {ProbeError} from '@shared/types.js'
import type {EscalationReason} from '@shared/schemas.js'

// Decides whether a failed run should be retried with the Explore session.
// ytdlp-errors kinds alone are not enough: a private or members-only video
// classifies as `unavailable` or `unknown`, and Watch Later / Liked surface as
// a missing or empty playlist, so the raw message and URL are consulted for those cases.

export type EscalationInput = {stage: 'probe'; url: string; error: ProbeError} | {stage: 'download'; errorKind: YtDlpErrorKind; rawError: string | null; ladderExhausted: boolean}

// Account-only videos. The same message can arrive as `unavailable` or `unknown`
// depending on the yt-dlp line; removed videos carry neither message.
const ACCOUNT_ONLY_VIDEO_KINDS: ReadonlySet<YtDlpErrorKind> = new Set<YtDlpErrorKind>(['unavailable', 'unknown'])
const ACCOUNT_ONLY_VIDEO_MESSAGE = /private video|members[- ]only|channel['’]s members|join this channel/i
const PLAYLIST_MISSING = /the playlist does not exist/i
// Watch Later and Liked are only reachable with the account's session.
const ACCOUNT_ONLY_PLAYLISTS: ReadonlySet<string> = new Set(['WL', 'LL'])

function isAccountOnlyPlaylist(url: string): boolean {
	try {
		const list = new URL(url).searchParams.get('list')
		return list !== null && ACCOUNT_ONLY_PLAYLISTS.has(list)
	} catch {
		return false
	}
}

// Kind-based rules shared by both stages. The playlist message match is probe-only (see escalationReason).
function classifiedFailureReason(kind: YtDlpErrorKind, raw: string, botBlockEscalates: boolean): EscalationReason | null {
	// Kinds that a signed-in account resolves outright.
	if (kind === 'loginRequired' || kind === 'ageRestricted') return kind
	if (kind === 'botBlock') return botBlockEscalates ? 'botBlock' : null
	if (ACCOUNT_ONLY_VIDEO_KINDS.has(kind) && ACCOUNT_ONLY_VIDEO_MESSAGE.test(raw)) return 'accountOnlyVideo'
	return null
}

// Why the run should be retried with the Explore session, or null when an account would not help.
export function escalationReason(input: EscalationInput): EscalationReason | null {
	if (input.stage === 'download') {
		return classifiedFailureReason(input.errorKind, input.rawError ?? '', input.ladderExhausted)
	}
	const {error, url} = input
	if (error.kind === 'other') {
		return error.code === 'playlist_empty' && isAccountOnlyPlaylist(url) ? 'accountOnlyPlaylist' : null
	}
	// A probe bot wall escalates at once: single-video probes have already run YtDlp's 3-attempt ladder (invokeWithRetry), and playlist probes have none (intended).
	return classifiedFailureReason(error.error.kind, error.error.raw, true) ?? (PLAYLIST_MISSING.test(error.error.raw) ? 'playlistMissing' : null)
}

// Whether a playlist that escalated for this reason needs the account for its
// items as well. A bot wall is about the request, not the content: the items
// start anonymous and escalate one by one if they hit a wall of their own.
export function reachesPlaylistItems(reason: EscalationReason): boolean {
	return reason !== 'botBlock'
}
