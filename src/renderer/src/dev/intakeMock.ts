// Browser-mock stand-in for main's IntakeService (src/main/intake): the same
// placeholder row, probe, shared resolution and outcome events, over the mock
// queue, so quick downloads behave in dev:mock as they do in the app. Links the
// hotkey takes in (hotkeyMock) keep their outcomes away from the window, as
// main does.

import i18next from 'i18next'
import type {AppApi} from '@shared/api.js'
import {resolveActiveDownloadProfile, resolveChosenDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import type {IntakeEvent, IntakePlacement, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import {resolvePinnedQuickProbe, scopeForTake, widenForSkip, type QuickProbeEnv, type QuickProbeResolution} from '@shared/intake/probeResolution.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import {youtubeLinkVideoId} from '@shared/urlIntent.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import type {QueueEvent} from '@shared/queueTransition.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {IntakeAddInput, IntakeCaller, IntakeOriginKind, IntakeWindowContext, PinnedDownloadProfile} from '@shared/intake/intakeSchemas.js'
import {PLAYLIST_PROBE_LIMIT_MAX, QUEUE_STATUS, type QuickProbeTake} from '@shared/schemas.js'
import type {AppSettings, DownloadProfileRef, PlaylistProbeResult, PlaylistScope, ProbePlaylistMode, QueueItem} from '@shared/types.js'

export interface IntakeMockDeps {
	probe: AppApi['downloads']['probe']
	add: AppApi['queue']['cmd']['add']
	replaceProbing: AppApi['queue']['cmd']['replaceProbing']
	items: () => readonly QueueItem[]
	// A probe-stage transition on a mock row (probe-failed, needs-choice, probe-restarted).
	transition: (itemId: string, event: QueueEvent) => Promise<Result<void>>
	settings: () => AppSettings
	clearListOffer: (itemId: string) => void
}

// What main's intake takes beyond the window's own add: the hotkey's list
// offer, and the video a list placed by that offer leaves out.
type PlaceRequest = IntakeAddInput & {listOffer?: string; skipVideoId?: string}

interface Probe {
	url: string
	playlistMode: ProbePlaylistMode
	title: string
	scope?: PlaylistScope
	take?: QuickProbeTake
}

type IntakeOutcomeEvent = Extract<IntakeEvent, {kind: 'outcome'}>

// The hotkey's way in, as main's HotkeyIntake uses IntakeService.
export interface HotkeyIntakeMock {
	add(request: PlaceRequest): Promise<IntakePlacement>
	windowProfile(): DownloadProfileRef | undefined
	onEvent(listener: (event: IntakeOutcomeEvent) => void): () => void
}

export type IntakeMock = AppApi['intake'] & {hotkey: HotkeyIntakeMock}

// The count a row was placed with, and how far its probe looks for it.
function ownTake(row: QueueItem): Pick<Probe, 'scope' | 'take'> {
	return row.probeTake ? {scope: scopeForTake(row.probeTake), take: row.probeTake} : {}
}

export function createIntakeMock(deps: IntakeMockDeps): IntakeMock {
	const listeners = new Set<(event: IntakeEvent) => void>()
	const hotkeyListeners = new Set<(event: IntakeOutcomeEvent) => void>()
	const kept = new Map<string, PlaylistProbeResult>()
	let windowContext: IntakeWindowContext = {currentOutputDir: '', displayShowsHdr: false}
	const find = (itemId: string): QueueItem | undefined => deps.items().find(item => item.id === itemId)
	const emit = (event: IntakeEvent): void => {
		if (event.kind === 'outcome' && event.origin === 'hotkey') hotkeyListeners.forEach(listener => listener(event))
		else listeners.forEach(listener => listener(event))
	}
	const activePinned = (ref: DownloadProfileRef = resolveActiveDownloadProfile(deps.settings().profiles).ref): PinnedDownloadProfile => ({ref, outputContext: {currentOutputDir: windowContext.currentOutputDir, defaultOutputDir: deps.settings().common.defaultOutputDir}})
	const env = (): QuickProbeEnv => ({
		newId: () => crypto.randomUUID(),
		profileFormatLabel: profile => profileFormatLabel(profile, i18next.t, i18next.language),
		displayShowsHdr: windowContext.displayShowsHdr,
		filenames: {platform: window.platform, shortened: () => undefined, budgetFailed: (reason, outputDir) => emit({kind: 'filename-budget-failed', reason, outputDir})},
		probeFailedText: () => i18next.t('wizard.url.quickProbeFailed'),
		prepareFailedText: () => i18next.t('wizard.url.quickPrepareFailed'),
		outputMissingText: () => i18next.t('wizard.url.profile.outputMissing')
	})

	async function write(itemId: string, title: string, resolution: QuickProbeResolution, tell: (outcome: QuickDownloadEvent) => void): Promise<void> {
		switch (resolution.kind) {
			case 'queue': {
				const [first, ...rest] = resolution.prepared.items
				const replaced = await deps.replaceProbing({itemId, items: first ? [{...first, id: itemId}, ...rest] : []})
				if (replaced.ok) tell({kind: 'queued', itemId, skippedAlreadyQueued: resolution.prepared.skippedAlreadyQueued + replaced.data.skippedAlreadyQueued})
				return
			}
			case 'nothing-new':
				if ((await deps.replaceProbing({itemId, items: []})).ok) tell({kind: 'nothing-new', skippedAlreadyQueued: resolution.skippedAlreadyQueued})
				return
			case 'needs-choice':
				if (!(await deps.transition(itemId, {kind: 'needs-choice', choice: resolution.choice, title: resolution.title})).ok) return
				kept.set(itemId, resolution.probe)
				tell({kind: 'needs-choice', itemId, choice: resolution.choice})
				return
			case 'failed':
				if ((await deps.transition(itemId, {kind: 'probe-failed', error: resolution.error})).ok) tell({kind: 'failed', itemId, title, probeError: resolution.probeError})
				return
		}
	}

	async function runProbe(itemId: string, probe: Probe, requestId: string, origin: IntakeOriginKind, answer?: PlaylistProbeResult): Promise<void> {
		const tell = (outcome: QuickDownloadEvent): void => emit({kind: 'outcome', requestId, intakeId: find(itemId)?.origin?.intakeId ?? null, origin, outcome})
		const limit = probe.take?.kind === 'all' ? PLAYLIST_PROBE_LIMIT_MAX : probe.take?.kind === 'first' ? probe.take.count : resolvePlaylistProbeLimit(deps.settings().common)
		const skipVideoId = find(itemId)?.skipVideoId
		const scope = skipVideoId ? widenForSkip(probe.scope ?? {items: {kind: 'first', count: limit}}) : probe.scope
		const result = answer ? ok(answer) : await deps.probe({url: probe.url, playlistMode: probe.playlistMode, ownerKey: itemId, ...(scope ? {playlistScope: scope} : {})})
		const profile = find(itemId)?.pinnedProfile ?? activePinned()
		const resolution = resolvePinnedQuickProbe(result, {url: probe.url, playlistMode: probe.playlistMode, limit, ...(probe.take ? {take: probe.take} : {}), ...(skipVideoId ? {skipVideoId} : {}), profile}, {settings: deps.settings(), queue: deps.items()}, env())
		await write(itemId, probe.title, resolution, tell)
	}

	async function restart(itemId: string, requestId: string, widen: Pick<Probe, 'scope' | 'take'>, answer?: PlaylistProbeResult): Promise<Result<void>> {
		const row = find(itemId)
		if (!row?.probeMode) return fail({code: 'validation', message: `queue item ${itemId} has no probe to restart`})
		const restarted = await deps.transition(itemId, {kind: 'probe-restarted', ...(widen.take ? {probeTake: widen.take} : {})})
		if (!restarted.ok) return restarted
		kept.delete(itemId)
		void runProbe(itemId, {url: row.url, playlistMode: row.probeMode, title: row.title, ...widen}, requestId, 'window', answer)
		return restarted
	}

	async function place({requestId, url, playlistMode, title, profile: requested, take, listOffer, skipVideoId}: PlaceRequest, caller: IntakeCaller): Promise<IntakePlacement> {
		const live = deps.items().find(item => isLiveQueueItem(item) && item.url === url)
		if (live) return {kind: 'already-queued', itemId: live.id}
		const intakeId = crypto.randomUUID()
		const pinned = activePinned(requested)
		const {profile} = resolveChosenDownloadProfile(pinned.ref, deps.settings().profiles)
		let outputDir = ''
		try {
			outputDir = resolveDownloadProfileOutputDir(profile, pinned.outputContext)
		} catch {
			// A fixed folder left blank: the probe's preparation reports it on the row.
		}
		const row: QueueItem = {
			id: crypto.randomUUID(),
			url,
			title: title?.trim() ? title.trim() : url,
			thumbnail: '',
			outputDir,
			formatLabel: profileFormatLabel(profile, i18next.t, i18next.language),
			status: QUEUE_STATUS.probing,
			lane: 'normal',
			progressPercent: 0,
			progressDetail: null,
			lastStatus: null,
			error: null,
			addedAt: new Date().toISOString(),
			finishedAt: null,
			artifacts: [],
			writeM3u: false,
			retryCount: 0,
			probeMode: playlistMode,
			...(take ? {probeTake: take} : {}),
			...(listOffer ? {listOffer} : {}),
			...(skipVideoId ? {skipVideoId} : {}),
			pinnedProfile: pinned,
			origin: {...caller, intakeId},
			job: {kind: 'unresolved', extractor: '', extractorKey: ''}
		}
		const added = await deps.add([row])
		if (!added.ok) return added.error.code === 'conflict' ? {kind: 'already-queued', itemId: null} : {kind: 'not-added'}
		void runProbe(row.id, {url, playlistMode, title: row.title, ...ownTake(row)}, requestId, caller.kind)
		return {kind: 'added', itemId: row.id, title: row.title, intakeId}
	}

	return {
		add: async request => ok(await place(request, {kind: 'window'})),
		retry: ({requestId, itemId}) => {
			const row = find(itemId)
			return restart(itemId, requestId, row ? ownTake(row) : {})
		},
		choose: ({requestId, itemId, take}) => {
			const row = find(itemId)
			if (row?.status !== QUEUE_STATUS.needsChoice || !row.choice) return Promise.resolve(fail({code: 'validation', message: `queue item ${itemId} is not waiting for a choice`}))
			const {choice} = row
			// The answer overrides any count the row was placed with.
			if (take === 'all') return restart(itemId, requestId, {scope: scopeForTake({kind: 'all'}), take: {kind: 'all'}})
			if (!choice.capped) return Promise.resolve(fail({code: 'validation', message: 'only a list past the load limit offers its first videos'}))
			const first = {kind: 'first', count: choice.loaded} as const
			return restart(itemId, requestId, {scope: scopeForTake(first), take: first}, kept.get(itemId))
		},
		keptProbe: ({itemId}) => Promise.resolve(ok(kept.get(itemId) ?? null)),
		takeListOffer: async ({requestId, itemId}) => {
			const row = find(itemId)
			const listUrl = row?.listOffer
			if (!row || !listUrl || row.job.kind === 'unresolved') return fail({code: 'validation', message: `queue item ${itemId} offers no list`})
			const skipVideoId = youtubeLinkVideoId(listUrl)
			const placement = await place({requestId, url: listUrl, playlistMode: 'playlist', ...(skipVideoId ? {skipVideoId} : {}), ...(windowContext.activeProfile ? {profile: windowContext.activeProfile} : {})}, {kind: 'window'})
			if (placement.kind === 'added') deps.clearListOffer(itemId)
			return ok(placement)
		},
		dismissListOffer: ({itemId}) => {
			deps.clearListOffer(itemId)
			return Promise.resolve(ok(undefined))
		},
		setWindowContext: context => {
			windowContext = context
			return Promise.resolve(ok(undefined))
		},
		onEvent: listener => {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
		hotkey: {
			add: request => place(request, {kind: 'hotkey'}),
			windowProfile: () => windowContext.activeProfile,
			onEvent: listener => {
				hotkeyListeners.add(listener)
				return () => hotkeyListeners.delete(listener)
			}
		}
	}
}
