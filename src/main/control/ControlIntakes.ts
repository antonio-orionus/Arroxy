// A client's links and the intakes they become: links.add places a row
// through intake once per (client, requestId); intake.choose, intake.retry
// and intake.cancel move an intake on through its placeholder row, the way
// the window's row actions do.

import log from 'electron-log/main.js'
import type {ControlParams, IntakeView} from 'arroxy-control'
import {cleanUrl} from '@shared/cleanUrl.js'
import {rewriteYouTubeChannelRoot} from '@shared/intake/urlIntake.js'
import {policyForUrlIntent} from '@shared/intake/urlIntentPolicy.js'
import {requestSiteFor} from '@shared/sites/index.js'
import {classifyUrlIntent} from '@shared/urlIntent.js'
import type {IntakePlacement} from '@shared/intake/intakeEvents.js'
import type {ProbePlaylistMode} from '@shared/types.js'
import {ControlFailure, controlErrorForApp, controlFailure, internalError} from './controlErrors.js'
import {activeProfileRef, enabledProfileRef} from './controlProfiles.js'
import {intakeView} from './controlProjections.js'
import type {ControlServiceDeps} from './controlTypes.js'
import {CONTROL_PROBING_INTAKES_PER_CLIENT} from './intakeAdmission.js'
import type {IntakeRecord} from './IntakeRegistry.js'
import {LinksAddRequests} from './LinksAddRequests.js'

const logger = log.scope('control')

interface LinksAdded {
	intakeId: string
	placeholderId: string
}

export class ControlIntakes {
	// Shared by every session: a client that reconnects may retransmit.
	private readonly requests: LinksAddRequests<LinksAdded>

	constructor(private readonly deps: ControlServiceDeps) {
		this.requests = new LinksAddRequests(() => deps.now())
	}

	record(intakeId: string): IntakeRecord {
		const record = this.deps.registry.get(intakeId)
		if (!record) throw controlFailure('not_found', 'No intake has that id.')
		return record
	}

	add(clientId: string, params: ControlParams<'links.add'>): Promise<LinksAdded> {
		return this.requests.run(clientId, params.requestId, () => this.place(clientId, params))
	}

	choose(params: ControlParams<'intake.choose'>): {intake: IntakeView} {
		const record = this.record(params.intakeId)
		const {state} = record
		if (state.state !== 'needsYourChoice') throw controlFailure('invalid_state', `The intake is ${state.state}; only one that needs your choice takes one.`)
		if (params.take === 'first') {
			if (state.kind === 'playlistReview') throw controlFailure('desktop_required', 'Picking some videos of a playlist to review happens in the Arroxy window; here it takes all.')
			// Intake takes the videos it loaded; any other count would need a new probe.
			if (params.count !== state.offered) throw controlFailure('invalid_request', `Take the first ${state.offered}, the number that was loaded, or take all.`)
		}
		const chosen = this.deps.intake.choose({requestId: this.deps.newId(), itemId: record.placeholderId, origin: 'localClient', take: params.take})
		if (!chosen.ok) throw new ControlFailure(controlErrorForApp(chosen.error))
		return {intake: intakeView(this.record(params.intakeId))}
	}

	retry(params: ControlParams<'intake.retry'>): {intake: IntakeView} {
		const record = this.record(params.intakeId)
		if (record.state.state !== 'probeFailed') throw controlFailure('invalid_state', `The intake is ${record.state.state}; only a probe failure is retried.`)
		const retried = this.deps.intake.retry({requestId: this.deps.newId(), itemId: record.placeholderId, origin: 'localClient'})
		if (!retried.ok) throw new ControlFailure(controlErrorForApp(retried.error))
		return {intake: intakeView(this.record(params.intakeId))}
	}

	// Through the queue, as the window's Cancel: the registry hears the row go.
	async cancel(params: ControlParams<'intake.cancel'>): Promise<{intake: IntakeView}> {
		const record = this.record(params.intakeId)
		const {state} = record.state
		if (state !== 'probing' && state !== 'needsYourChoice') throw controlFailure('invalid_state', `The intake is ${state}; only one still probing or needing your choice is cancelled.`)
		const cancelled = await this.deps.queue.cancel(record.placeholderId)
		if (!cancelled.ok) throw new ControlFailure(controlErrorForApp(cancelled.error))
		return {intake: intakeView(this.record(params.intakeId))}
	}

	private async place(clientId: string, params: ControlParams<'links.add'>): Promise<LinksAdded> {
		// Before the first await, so concurrent calls count each other as placing.
		if (this.deps.registry.probingCapReached(clientId, this.requests.placing(clientId))) {
			throw controlFailure('limit_exceeded', `This client already has ${CONTROL_PROBING_INTAKES_PER_CLIENT} links probing; wait for some to settle.`, {retryable: true, details: {limit: CONTROL_PROBING_INTAKES_PER_CLIENT}})
		}
		// Cleaned as the window and the hotkey clean a link, so the same video
		// is the same link (already-queued) and yt-dlp gets an address it reads.
		const url = rewriteYouTubeChannelRoot(cleanUrl(params.url))
		const settings = await this.deps.settings()
		const profile = params.profile ? enabledProfileRef(settings, params.profile) : activeProfileRef(settings, this.deps.intake.windowProfile())
		if (!profile) throw controlFailure('profile_unavailable', 'No enabled profile has that ref.')
		this.refuseCoolingSite(url)
		let placement: IntakePlacement
		try {
			placement = await this.deps.intake.add({requestId: this.deps.newId(), url, playlistMode: params.playlistMode ?? hotkeyPlaylistMode(url), profile, origin: {kind: 'localClient', clientId}})
		} catch (error) {
			logger.warn('taking a link in failed', {clientId, error: error instanceof Error ? error.message : String(error)})
			throw new ControlFailure(internalError())
		}
		switch (placement.kind) {
			case 'added':
				return {intakeId: placement.intakeId, placeholderId: placement.itemId}
			case 'already-queued': {
				if (placement.itemId === null) break
				const record = this.deps.registry.adoptLive(clientId, placement.itemId)
				return {intakeId: record.intakeId, placeholderId: record.placeholderId}
			}
			case 'not-added':
				break
		}
		logger.warn('the queue refused a client link', {clientId, placement: placement.kind})
		throw new ControlFailure(internalError())
	}

	// A probe now would only be held by the cooldown and fail; the client can
	// come back when it ends.
	private refuseCoolingSite(url: string): void {
		const site = requestSiteFor(url)
		const cooldown = this.deps.status.current().cooldowns.find(candidate => candidate.site === site)
		const retryAfterMs = cooldown ? cooldown.until - this.deps.now() : 0
		if (retryAfterMs > 0) throw controlFailure('rate_limited', `${site} asked Arroxy to slow down; links to it wait until the cooldown ends.`, {details: {retryAfterMs}})
	}
}

// The hotkey's rule: a video in a playlist is the video (a radio list always
// counts as one), a plain collection the collection, anything else as the
// probe finds it.
function hotkeyPlaylistMode(url: string): ProbePlaylistMode {
	const action = policyForUrlIntent(classifyUrlIntent(url), 'hotkey')
	return 'playlistMode' in action ? action.playlistMode : 'video'
}
