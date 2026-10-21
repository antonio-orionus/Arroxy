// Link intake, in main (Control API step zero). One path for every way a link
// comes in: the window's Download button and Explore, a row's Retry and
// choices, and the global hotkey.
//
// A link becomes a placeholder row at once, labelled with the profile and
// folders it is pinned to; its probe runs here, keyed by the row's id so
// cancelling the row aborts exactly that probe. When the probe answers, the
// row is swapped for the prepared rows, or turns into a probe-error or
// needs-choice row that a Retry or a choice picks up again here. Nothing
// depends on the window being open, visible or loaded: a reload keeps the
// pinned profile (it is on the row), and the window only hears outcomes.

import log from 'electron-log/main.js'
import {downloadProfileLabel, resolveActiveDownloadProfile, resolveChosenDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import {resolvePinnedQuickProbe, type QuickProbeEnv, type QuickProbeResolution, type QuickProbeTake} from '@shared/intake/probeResolution.js'
import type {IntakeEvent, IntakePlacement, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import type {PlaylistManifestPayload} from '@shared/queueSubmission.js'
import {fail, type Result} from '@shared/result.js'
import type {IntakeOrigin, IntakeOriginKind, IntakeTake, IntakeWindowContext, PinnedDownloadProfile} from '@shared/intake/intakeSchemas.js'
import {PLAYLIST_PROBE_LIMIT_MAX, QUEUE_STATUS, type JobAuth, type QueueChoice} from '@shared/schemas.js'
import type {AppSettings, DownloadProfileRef, LocalizedError, PlaylistProbeResult, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, QueueItem} from '@shared/types.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {KeptProbes} from './KeptProbes.js'

const logger = log.scope('intake')

type QueueAddResult = Result<{ids: string[]; skippedAlreadyQueued: number}>

/** The queue of record, as intake uses it. */
export interface IntakeQueue {
	snapshot(): QueueItem[]
	add(items: QueueItem[]): QueueAddResult
	replaceProbing(itemId: string, items: QueueItem[]): Promise<QueueAddResult>
	needsChoice(itemId: string, choice: QueueChoice, title: string): Result<void>
	probeFailed(itemId: string, error: LocalizedError, auth?: JobAuth): Result<void>
	reprobe(itemId: string): Result<void>
}

export interface IntakeProbeRequest {
	url: string
	playlistMode: ProbePlaylistMode
	// The placeholder row's id: cancelling the row aborts exactly this probe.
	ownerKey: string
	playlistScope?: PlaylistScope
}

export interface IntakeServiceDeps {
	queue: IntakeQueue
	probe(request: IntakeProbeRequest): Promise<Result<ProbeResult, ProbeError>>
	// Never rejects: a playlist whose manifest is lost only skips its .m3u.
	registerManifest(manifest: PlaylistManifestPayload): Promise<void>
	settings(): Promise<AppSettings>
	// Words in the window's language for a failure that brings none of its own.
	text(key: 'wizard.url.quickProbeFailed' | 'wizard.url.quickPrepareFailed' | 'wizard.url.profile.outputMissing'): string
	emit(event: IntakeEvent): void
	platform: NodeJS.Platform
	newId(): string
	now?: () => number
}

export interface IntakeAddRequest {
	requestId: string
	url: string
	playlistMode: ProbePlaylistMode
	// The row's title until the probe knows the real one (Explore's page title).
	title?: string
	// The profile the caller has active. The window saves a profile pick
	// through a queue of settings writes, so main's settings may not hold it
	// yet; without one, the row pins the profile active in main's settings.
	profile?: DownloadProfileRef
	origin: {kind: IntakeOriginKind; clientId?: string}
}

export interface IntakeCall {
	requestId: string
	itemId: string
	origin: IntakeOriginKind
}

interface PlaceholderProbe {
	url: string
	playlistMode: ProbePlaylistMode
	title: string
	// A choice that needs a fresh probe: how wide to look, and what to keep.
	scope?: PlaylistScope
	take?: QuickProbeTake
}

// Who hears about an outcome: the call that caused it.
interface Caller {
	requestId: string
	origin: IntakeOriginKind
}

const NO_WINDOW: IntakeWindowContext = {currentOutputDir: '', displayShowsHdr: false}

export class IntakeService {
	private readonly kept: KeptProbes
	private window: IntakeWindowContext = NO_WINDOW

	constructor(private readonly deps: IntakeServiceDeps) {
		this.kept = new KeptProbes(deps.now)
	}

	// The window reports its wizard folder and screen whenever they change.
	setWindowContext(context: IntakeWindowContext): void {
		this.window = context
	}

	// Places the row and starts its probe; resolves once the row is placed (or
	// refused), not when the probe ends.
	async add(request: IntakeAddRequest): Promise<IntakePlacement> {
		const live = this.liveRowFor(request.url)
		if (live) return {kind: 'already-queued', itemId: live.id}
		const settings = await this.deps.settings()
		const origin: IntakeOrigin = {...request.origin, intakeId: this.deps.newId()}
		const row = this.placeholderRow(request, this.activePinned(settings, request.profile), origin, settings)
		const added = this.deps.queue.add([row])
		if (!added.ok) {
			// The queue of record refused: a conflict means another row holds the link.
			if (added.error.code === 'conflict') return {kind: 'already-queued', itemId: this.liveRowFor(request.url)?.id ?? null}
			logger.warn('placing the row failed', {error: added.error.message})
			return {kind: 'not-added'}
		}
		logger.info('link taken in', {itemId: row.id, intakeId: origin.intakeId, origin: origin.kind, playlistMode: request.playlistMode})
		void this.runProbe(row.id, {url: row.url, playlistMode: request.playlistMode, title: row.title}, {requestId: request.requestId, origin: origin.kind})
		return {kind: 'added', itemId: row.id, title: row.title}
	}

	// A probe-error row probes again, the way it was taken in.
	retry(call: IntakeCall): Result<void> {
		const row = this.placeholder(call.itemId)
		const restarted = this.deps.queue.reprobe(call.itemId)
		if (!restarted.ok || !row) return restarted
		this.kept.forget(call.itemId)
		void this.runProbe(row.id, {url: row.url, playlistMode: row.probeMode, title: row.title}, call)
		return restarted
	}

	// A needs-choice row's answer: every video, or the first N it was offered.
	choose(call: IntakeCall & {take: IntakeTake}): Result<void> {
		const row = this.placeholder(call.itemId)
		// A refused answer leaves the row as it is: restarting it here would
		// leave it probing with no probe running.
		if (row?.status !== QUEUE_STATUS.needsChoice || !row.choice) return fail(createAppError('validation', `queue item ${call.itemId} is not waiting for a choice`))
		const kept = this.kept.get(call.itemId)
		const probe = {url: row.url, playlistMode: row.probeMode, title: row.title}
		if (call.take === 'all') return this.reprobe(row, {...probe, scope: {items: {kind: 'first', count: PLAYLIST_PROBE_LIMIT_MAX}}, take: {kind: 'all'}}, call)
		if (row.choice.kind !== 'playlist-cap') return fail(createAppError('validation', 'only a playlist over the load limit offers its first videos'))
		const take = {kind: 'first', count: row.choice.loaded} as const
		if (!kept) return this.reprobe(row, {...probe, scope: {items: take}, take}, call)
		// The kept probe already holds the first N: no second probe. The row
		// still goes back to probing, so a failure can land on it as usual.
		const restarted = this.deps.queue.reprobe(call.itemId)
		if (!restarted.ok) return restarted
		this.kept.forget(call.itemId)
		void this.settle(row.id, probe, call, async () => this.resolve(row.id, {ok: true, data: kept}, {...probe, take}, take.count))
		return restarted
	}

	// The probe a needs-choice row asked about, for its review in the window;
	// gone with the row (cancelled, removed, resolved).
	keptProbe(itemId: string): PlaylistProbeResult | null {
		if (this.find(itemId)?.status !== QUEUE_STATUS.needsChoice) {
			this.kept.forget(itemId)
			return null
		}
		return this.kept.get(itemId) ?? null
	}

	private reprobe(row: PlaceholderRow, probe: PlaceholderProbe, caller: Caller): Result<void> {
		const restarted = this.deps.queue.reprobe(row.id)
		if (!restarted.ok) return restarted
		this.kept.forget(row.id)
		void this.runProbe(row.id, probe, caller)
		return restarted
	}

	// Runs (or re-runs) the probe of a placeholder that is `probing` in the queue.
	private async runProbe(itemId: string, probe: PlaceholderProbe, caller: Caller): Promise<void> {
		await this.settle(itemId, probe, caller, async () => {
			// Read before the probe, as the probe reads it: the result is one entry
			// past this limit when the collection goes on, whatever the setting is by then.
			const limit = probe.take?.kind === 'all' ? PLAYLIST_PROBE_LIMIT_MAX : probe.take?.kind === 'first' ? probe.take.count : resolvePlaylistProbeLimit((await this.deps.settings()).common)
			const result = await this.deps.probe({url: probe.url, playlistMode: probe.playlistMode, ownerKey: itemId, ...(probe.scope ? {playlistScope: probe.scope} : {})})
			return this.resolve(itemId, result, probe, limit)
		})
	}

	// Never rejects: whatever goes wrong lands on the row as a probe error.
	private async settle(itemId: string, probe: PlaceholderProbe, caller: Caller, run: () => Promise<QuickProbeResolution>): Promise<void> {
		let resolution: QuickProbeResolution
		try {
			resolution = await run()
		} catch (error) {
			logger.error('probe failed', {itemId, error: error instanceof Error ? error.message : String(error)})
			resolution = failedResolution(error)
		}
		await this.apply(itemId, probe.title, resolution, caller)
	}

	private async resolve(itemId: string, result: Result<ProbeResult, ProbeError>, probe: PlaceholderProbe, limit: number): Promise<QuickProbeResolution> {
		const settings = await this.deps.settings()
		// A row saved before the profile was stored on it prepares with the active one.
		const pinned = this.find(itemId)?.pinnedProfile ?? this.activePinned(settings)
		return resolvePinnedQuickProbe(result, {url: probe.url, playlistMode: probe.playlistMode, limit, ...(probe.take ? {take: probe.take} : {}), profile: pinned}, {settings, queue: this.deps.queue.snapshot()}, this.env())
	}

	// Never rejects. A write that throws is logged, and the row, if still
	// probing, settles as a probe error the user can retry rather than stay stuck.
	private async apply(itemId: string, title: string, resolution: QuickProbeResolution, caller: Caller): Promise<void> {
		try {
			await this.write(itemId, title, resolution, caller)
		} catch (error) {
			logger.error("recording the probe's outcome failed", {itemId, error: error instanceof Error ? error.message : String(error)})
			if (resolution.kind !== 'failed') await this.apply(itemId, title, failedResolution(error), caller)
		}
	}

	// Every write is refused once the row is gone (cancelled or removed while
	// the probe ran), and a refused write says nothing: the user already moved on.
	private async write(itemId: string, title: string, resolution: QuickProbeResolution, caller: Caller): Promise<void> {
		const intakeId = this.find(itemId)?.origin?.intakeId ?? null
		const tell = (outcome: QuickDownloadEvent): void => this.deps.emit({kind: 'outcome', requestId: caller.requestId, intakeId, origin: caller.origin, outcome})
		switch (resolution.kind) {
			case 'queue': {
				const {prepared} = resolution
				if (prepared.manifest) await this.deps.registerManifest(prepared.manifest)
				// The first row keeps the placeholder's id, so whatever names the
				// placeholder (a toast's View) still finds a row after the swap.
				const [first, ...rest] = prepared.items
				const items = first ? [{...first, id: itemId}, ...rest] : []
				const replaced = await this.deps.queue.replaceProbing(itemId, items)
				if (replaced.ok) {
					// The queue leaves out what went live while this was prepared (an
					// overlapping playlist), so both counts are already-queued videos.
					this.kept.forget(itemId)
					tell({kind: 'queued', itemId, skippedAlreadyQueued: prepared.skippedAlreadyQueued + replaced.data.skippedAlreadyQueued})
					return
				}
				if (replaced.error.code === 'conflict') {
					// Every row went live in another form while the probe ran: nothing
					// new remains, which no Retry could fix. Drop the row and say so.
					const dropped = await this.deps.queue.replaceProbing(itemId, [])
					if (!dropped.ok) return
					this.kept.forget(itemId)
					const urls = new Set(items.map(item => item.url))
					tell({kind: 'already-queued', itemId: this.deps.queue.snapshot().find(item => item.id !== itemId && isLiveQueueItem(item) && urls.has(item.url))?.id ?? null})
					return
				}
				await this.write(itemId, title, {kind: 'failed', error: {kind: 'unknown', raw: replaced.error.message}, probeError: null}, caller)
				return
			}
			case 'nothing-new': {
				const removed = await this.deps.queue.replaceProbing(itemId, [])
				if (!removed.ok) return
				this.kept.forget(itemId)
				tell({kind: 'nothing-new', skippedAlreadyQueued: resolution.skippedAlreadyQueued})
				return
			}
			case 'needs-choice': {
				const parked = this.deps.queue.needsChoice(itemId, resolution.choice, resolution.title)
				if (!parked.ok) return
				this.kept.keep(itemId, resolution.probe)
				tell({kind: 'needs-choice', itemId, choice: resolution.choice, capped: resolution.capped})
				return
			}
			case 'failed': {
				const auth = resolution.probeError?.kind === 'ytdlp' ? resolution.probeError.auth : undefined
				const failed = this.deps.queue.probeFailed(itemId, resolution.error, auth)
				if (failed.ok) tell({kind: 'failed', itemId, title, probeError: resolution.probeError})
				return
			}
		}
	}

	private env(): QuickProbeEnv {
		return {
			newId: () => this.deps.newId(),
			displayShowsHdr: this.window.displayShowsHdr,
			filenames: {
				platform: this.deps.platform,
				shortened: (title, tokens) => logger.info(`shortened ${tokens.join(', ')} to fit the filesystem limit`, {title}),
				budgetFailed: (reason, outputDir) => {
					logger.warn(`${reason}; falling back to the default template`, {outputDir})
					this.deps.emit({kind: 'filename-budget-failed', reason, outputDir})
				}
			},
			probeFailedText: () => this.deps.text('wizard.url.quickProbeFailed'),
			prepareFailedText: () => this.deps.text('wizard.url.quickPrepareFailed'),
			outputMissingText: () => this.deps.text('wizard.url.profile.outputMissing')
		}
	}

	// The active profile (the caller's, else main's), with the folders it
	// resolves against right now.
	private activePinned(settings: AppSettings, ref: DownloadProfileRef = resolveActiveDownloadProfile(settings.profiles).ref): PinnedDownloadProfile {
		return {ref, outputContext: {currentOutputDir: this.window.currentOutputDir, defaultOutputDir: settings.common.defaultOutputDir}}
	}

	// The profile placed with supplies format label and folder so the row never
	// lies about where the download will land. The unresolved job keeps the
	// scheduler off it (schema and DownloadService both refuse it).
	private placeholderRow(request: IntakeAddRequest, pinned: PinnedDownloadProfile, origin: IntakeOrigin, settings: AppSettings): QueueItem {
		const {profile} = resolveChosenDownloadProfile(pinned.ref, settings.profiles)
		const titleHint = request.title?.trim() ?? ''
		let outputDir = ''
		try {
			outputDir = resolveDownloadProfileOutputDir(profile, pinned.outputContext)
		} catch {
			// A fixed folder left blank: the probe's preparation reports it on the row.
		}
		return {
			id: this.deps.newId(),
			url: request.url,
			title: titleHint.length > 0 ? titleHint : request.url,
			thumbnail: '',
			outputDir,
			formatLabel: downloadProfileLabel(profile),
			status: QUEUE_STATUS.probing,
			lane: 'normal',
			progressPercent: 0,
			progressDetail: null,
			lastStatus: null,
			error: null,
			addedAt: new Date(this.deps.now?.() ?? Date.now()).toISOString(),
			finishedAt: null,
			artifacts: [],
			writeM3u: false,
			retryCount: 0,
			probeMode: request.playlistMode,
			pinnedProfile: pinned,
			origin,
			job: {kind: 'unresolved', extractor: '', extractorKey: ''}
		}
	}

	private find(itemId: string): QueueItem | undefined {
		return this.deps.queue.snapshot().find(item => item.id === itemId)
	}

	// A placeholder carries the probe mode it was taken in with (the schema
	// requires it on every unresolved row); its Retry and choices reuse it.
	private placeholder(itemId: string): PlaceholderRow | undefined {
		const row = this.find(itemId)
		if (row?.job.kind !== 'unresolved' || row.probeMode === undefined) return undefined
		return {...row, probeMode: row.probeMode}
	}

	private liveRowFor(url: string): QueueItem | undefined {
		return this.deps.queue.snapshot().find(item => isLiveQueueItem(item) && item.url === url)
	}
}

type PlaceholderRow = QueueItem & {probeMode: ProbePlaylistMode}

function failedResolution(error: unknown): QuickProbeResolution {
	return {kind: 'failed', error: {kind: 'unknown', raw: error instanceof Error ? error.message : String(error)}, probeError: null}
}
