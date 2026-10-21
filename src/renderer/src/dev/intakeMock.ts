// Browser-mock stand-in for main's IntakeService (src/main/intake): the same
// placeholder row, probe, shared resolution and outcome events, over the mock
// queue, so quick downloads behave in dev:mock as they do in the app.

import i18next from 'i18next'
import type {AppApi} from '@shared/api.js'
import {downloadProfileLabel, resolveActiveDownloadProfile, resolveChosenDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import type {IntakeEvent, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import {resolvePinnedQuickProbe, type QuickProbeEnv, type QuickProbeResolution, type QuickProbeTake} from '@shared/intake/probeResolution.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import type {QueueEvent} from '@shared/queueTransition.js'
import {fail, ok, type Result} from '@shared/result.js'
import {PLAYLIST_PROBE_LIMIT_MAX, QUEUE_STATUS, type IntakeWindowContext, type PinnedDownloadProfile} from '@shared/schemas.js'
import type {AppSettings, PlaylistProbeResult, PlaylistScope, ProbePlaylistMode, QueueItem} from '@shared/types.js'

export interface IntakeMockDeps {
	probe: AppApi['downloads']['probe']
	add: AppApi['queue']['cmd']['add']
	replaceProbing: AppApi['queue']['cmd']['replaceProbing']
	items: () => readonly QueueItem[]
	// A probe-stage transition on a mock row (probe-failed, needs-choice, probe-restarted).
	transition: (itemId: string, event: QueueEvent) => Promise<Result<void>>
	settings: () => AppSettings
}

interface Probe {
	url: string
	playlistMode: ProbePlaylistMode
	title: string
	scope?: PlaylistScope
	take?: QuickProbeTake
}

export function createIntakeMock(deps: IntakeMockDeps): AppApi['intake'] {
	const listeners = new Set<(event: IntakeEvent) => void>()
	const kept = new Map<string, PlaylistProbeResult>()
	let windowContext: IntakeWindowContext = {currentOutputDir: '', displayShowsHdr: false}
	const find = (itemId: string): QueueItem | undefined => deps.items().find(item => item.id === itemId)
	const emit = (event: IntakeEvent): void => listeners.forEach(listener => listener(event))
	const activePinned = (): PinnedDownloadProfile => ({ref: resolveActiveDownloadProfile(deps.settings().profiles).ref, outputContext: {currentOutputDir: windowContext.currentOutputDir, defaultOutputDir: deps.settings().common.defaultOutputDir}})
	const env = (): QuickProbeEnv => ({
		newId: () => crypto.randomUUID(),
		displayShowsHdr: windowContext.displayShowsHdr,
		filenames: {platform: window.platform, shortened: () => undefined, budgetFailed: (reason, outputDir) => emit({kind: 'filename-budget-failed', reason, outputDir})},
		probeFailedText: () => i18next.t('wizard.url.quickProbeFailed'),
		prepareFailedText: () => i18next.t('wizard.url.quickPrepareFailed')
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
				tell({kind: 'needs-choice', itemId, choice: resolution.choice, capped: resolution.capped})
				return
			case 'failed':
				if ((await deps.transition(itemId, {kind: 'probe-failed', error: resolution.error})).ok) tell({kind: 'failed', itemId, title, probeError: resolution.probeError})
				return
		}
	}

	async function runProbe(itemId: string, probe: Probe, requestId: string, answer?: PlaylistProbeResult): Promise<void> {
		const tell = (outcome: QuickDownloadEvent): void => emit({kind: 'outcome', requestId, intakeId: find(itemId)?.origin?.intakeId ?? null, origin: 'window', outcome})
		const limit = probe.take?.kind === 'all' ? PLAYLIST_PROBE_LIMIT_MAX : probe.take?.kind === 'first' ? probe.take.count : resolvePlaylistProbeLimit(deps.settings().common)
		const result = answer ? ok(answer) : await deps.probe({url: probe.url, playlistMode: probe.playlistMode, ownerKey: itemId, ...(probe.scope ? {playlistScope: probe.scope} : {})})
		const profile = find(itemId)?.pinnedProfile ?? activePinned()
		const resolution = resolvePinnedQuickProbe(result, {url: probe.url, playlistMode: probe.playlistMode, limit, ...(probe.take ? {take: probe.take} : {}), profile}, {settings: deps.settings(), queue: deps.items()}, env())
		await write(itemId, probe.title, resolution, tell)
	}

	async function restart(itemId: string, requestId: string, widen: Pick<Probe, 'scope' | 'take'>, answer?: PlaylistProbeResult): Promise<Result<void>> {
		const row = find(itemId)
		if (!row?.probeMode) return fail({code: 'validation', message: `queue item ${itemId} has no probe to restart`})
		const restarted = await deps.transition(itemId, {kind: 'probe-restarted'})
		if (!restarted.ok) return restarted
		kept.delete(itemId)
		void runProbe(itemId, {url: row.url, playlistMode: row.probeMode, title: row.title, ...widen}, requestId, answer)
		return restarted
	}

	return {
		add: async ({requestId, url, playlistMode, title}) => {
			const live = deps.items().find(item => isLiveQueueItem(item) && item.url === url)
			if (live) return ok({kind: 'already-queued', itemId: live.id})
			const pinned = activePinned()
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
				formatLabel: downloadProfileLabel(profile),
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
				pinnedProfile: pinned,
				origin: {kind: 'window', intakeId: crypto.randomUUID()},
				job: {kind: 'unresolved', extractor: '', extractorKey: ''}
			}
			const added = await deps.add([row])
			if (!added.ok) return ok(added.error.code === 'conflict' ? {kind: 'already-queued', itemId: null} : {kind: 'not-added'})
			void runProbe(row.id, {url, playlistMode, title: row.title}, requestId)
			return ok({kind: 'added', itemId: row.id, title: row.title})
		},
		retry: ({requestId, itemId}) => restart(itemId, requestId, {}),
		choose: ({requestId, itemId, take}) => {
			const choice = find(itemId)?.choice
			if (take === 'all') return restart(itemId, requestId, {scope: {items: {kind: 'first', count: PLAYLIST_PROBE_LIMIT_MAX}}, take: {kind: 'all'}})
			if (choice?.kind !== 'playlist-cap') return Promise.resolve(fail({code: 'validation', message: 'only a playlist over the load limit offers its first videos'}))
			const first = {kind: 'first', count: choice.loaded} as const
			return restart(itemId, requestId, {scope: {items: first}, take: first}, kept.get(itemId))
		},
		keptProbe: ({itemId}) => Promise.resolve(ok(kept.get(itemId) ?? null)),
		setWindowContext: context => {
			windowContext = context
			return Promise.resolve(ok(undefined))
		},
		onEvent: listener => {
			listeners.add(listener)
			return () => listeners.delete(listener)
		}
	}
}
