// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {escalationReason} from '@main/services/exploreEscalation.js'
import {signedInFailure} from '@main/services/signedInEvidence.js'
import type {YtDlpErrorKind} from 'ytdlp-errors'

const RULING = "ERROR: [Instagram] DQx1: This content isn't available to everyone. Some content is restricted to certain audiences."
const X_DEAD = 'ERROR: [twitter] 1: Error(s) while querying API: Could not authenticate you'

const download = (errorKind: YtDlpErrorKind, rawError: string) => ({stage: 'download' as const, errorKind, rawError, ladderExhausted: false})

describe('Instagram’s ruling text', () => {
	it('is account-only content, so it escalates and counts as account required', () => {
		expect(escalationReason(download('unknown', RULING))).toBe('accountOnlyVideo')
		expect(escalationReason({stage: 'probe', url: 'https://www.instagram.com/reel/DQx1/', error: {kind: 'ytdlp', error: {kind: 'unknown', raw: RULING}}})).toBe('accountOnlyVideo')
	})
})

describe('signedInFailure: what a signed-in failure says about the sign-in', () => {
	it('calls a wall the account can open account required', () => {
		expect(signedInFailure(download('loginRequired', 'ERROR: login required'))).toBe('accountRequired')
		expect(signedInFailure(download('unknown', RULING))).toBe('accountRequired')
	})

	it('keeps an unclassified failure apart, as X’s dead session arrives', () => {
		expect(signedInFailure(download('unknown', X_DEAD))).toBe('unknown')
	})

	it('names an account wall: a checkpoint or a challenge on the account itself', () => {
		expect(signedInFailure(download('unknown', 'ERROR: [Instagram] x: checkpoint_required'))).toBe('accountWall')
		expect(signedInFailure(download('loginRequired', 'ERROR: [Instagram] x: challenge_required'))).toBe('accountWall')
		expect(signedInFailure(download('unknown', 'ERROR: [twitter] 1: Your account is temporarily locked'))).toBe('accountWall')
	})

	it('leaves everything else to its usual handling', () => {
		expect(signedInFailure(download('rateLimit', 'HTTP Error 429'))).toBe('other')
		expect(signedInFailure(download('unavailable', 'Video unavailable. This video has been removed'))).toBe('other')
		expect(signedInFailure(download('network', 'Connection reset'))).toBe('other')
		expect(signedInFailure(download('botBlock', "Sign in to confirm you're not a bot"))).toBe('other')
	})
})
