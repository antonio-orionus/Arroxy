import log from 'electron-log/main.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {exploreCookieScopeFor, type ExploreCookieScope} from '@shared/sites/exploreCookieScope.js'
import type {Site} from '@shared/sites/index.js'
import type {ExploreSignInState} from '@shared/schemas.js'
import type {YtDlpResult} from '../YtDlp.js'
import {decideEscalation, escalationReason, type EscalationDecision} from '../exploreEscalation.js'
import {interruptedOutcome} from './phaseHelpers.js'
import type {PhaseContext, PhaseOutcome} from './types.js'

const logger = log.scope('downloads')

// What a phase holds about its latest yt-dlp run: the result, plus whatever
// else the phase tracks alongside it.
export interface SignedInRun {
	result: YtDlpResult
}

export interface SignedInFlow<R extends SignedInRun> {
	site: Site
	// One run on the Explore session; null when the pre-spawn guard refused it.
	runSignedIn(): Promise<R | null>
	// Whether this phase escalates this failure at all. Absent: it never does.
	escalates?: (run: R) => boolean
}

// `signedOut`: the session is gone (a refused spawn, or the site said so). Each
// phase decides what that means for it.
export type SignedInFlowResult<R> = {kind: 'run'; run: R} | {kind: 'stopped'; outcome: PhaseOutcome} | {kind: 'signedOut'}

// The sign-in check could not tell whether the session is still good (proxy,
// timeout, load failure): a network failure, so the queue's normal retry applies.
function sessionCheckInconclusive(): YtDlpResult {
	return {kind: 'exit-error', exitCode: -1, errorKind: 'network', rawError: 'Could not confirm the Explore session', stdout: '', stderr: ''}
}

// Whether a failed run on a job not yet signed in escalates, and why not; null
// for a run that never could (a success, a signed-in job, a phase that never
// escalates). A YouTube bot wall returned by YtDlp has already been through the
// whole PoT ladder; other sites have no ladder, so their bot walls never escalate.
async function downloadEscalation<R extends SignedInRun>(ctx: PhaseContext, run: R, flow: SignedInFlow<R>, scope: ExploreCookieScope | null): Promise<EscalationDecision | null> {
	const {result} = run
	if (result.kind !== 'exit-error' || ctx.active.input.auth === 'exploreSession' || flow.escalates?.(run) !== true) return null
	const reason = escalationReason({stage: 'download', errorKind: result.errorKind, rawError: result.rawError, ladderExhausted: flow.site.needsPotToken})
	const decision = await decideEscalation(reason, scope, ctx.exploreGate)
	logger.info('Download failure escalation', {jobId: ctx.active.job.id, scope, failure: result.errorKind, ...decision})
	return decision
}

// Everything that happens to a download run because of the Explore session,
// shared by every phase that spawns yt-dlp for a job:
//   1. Escalation: a failure an account can fix is retried once signed in. The
//      job's auth is persisted (through the status) before that spawn, and
//      stays signed in for the rest of the job.
//   2. Rejected cookies: yt-dlp said the account cookies are no longer valid.
//      One page load tells which: still signed in → one more try; signed out →
//      `signedOut`, never an anonymous run; a check that could not tell → a
//      normal retryable failure. A run that succeeded anyway is kept — the work
//      is done — and is checked in the background: a signed-out session still
//      gets reported, and keeps the job's later signed-in spawns off it.
// A pause or cancel landing in between always wins.
export async function settleWithExploreSession<R extends SignedInRun>(ctx: PhaseContext, first: R, flow: SignedInFlow<R>): Promise<SignedInFlowResult<R>> {
	const {active} = ctx
	const jobId = active.job.id
	// The job's URL decides which Explore cookies it runs on, as in YtDlp.
	const scope = exploreCookieScopeFor(active.input.url)
	let run = first

	const runSignedIn = async (): Promise<SignedInFlowResult<R> | null> => {
		const next = await flow.runSignedIn()
		const stopped = interruptedOutcome(active)
		if (stopped) return {kind: 'stopped', outcome: stopped}
		if (next === null) return {kind: 'signedOut'}
		run = next
		return null
	}

	if ((await downloadEscalation(ctx, run, flow, scope))?.escalated === true) {
		const stopped = interruptedOutcome(active)
		if (stopped) return {kind: 'stopped', outcome: stopped}
		// QueueService persists the job's auth on this status, synchronously,
		// so the item is recorded as signed in before the signed-in spawn.
		ctx.emitStatus('download', STATUS_KEY.signingInWithExplore)
		active.input = {...active.input, auth: 'exploreSession'}
		const escalated = await runSignedIn()
		if (escalated) return escalated
	}

	if (run.result.accountCookiesRejected !== true || active.input.auth !== 'exploreSession' || scope === null) return {kind: 'run', run}
	if (run.result.kind === 'success') {
		logger.info('yt-dlp rejected the Explore cookies on a run that succeeded anyway; keeping it and checking the session', {jobId})
		active.exploreSessionCheck = ctx.exploreSession.verifySignedIn(scope).catch((): ExploreSignInState => 'unknown')
		return {kind: 'run', run}
	}
	const signIn = await ctx.exploreSession.verifySignedIn(scope)
	const stopped = interruptedOutcome(active)
	if (stopped) return {kind: 'stopped', outcome: stopped}
	if (signIn === 'signedOut') return {kind: 'signedOut'}
	if (signIn === 'unknown') {
		logger.warn('Could not confirm the Explore session after yt-dlp rejected its cookies; failing as retryable', {jobId})
		return {kind: 'run', run: {...run, result: sessionCheckInconclusive()}}
	}
	logger.info('Explore session still signed in after yt-dlp rejected its cookies; retrying once', {jobId})
	return (await runSignedIn()) ?? {kind: 'run', run}
}
