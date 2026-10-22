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
import {resolveActiveDownloadProfile, resolveChosenDownloadProfile, resolveDownloadProfileOutputDir} from '@shared/downloadProfiles.js'
import {resolvePinnedQuickProbe, scopeForTake, widenForSkip, type QuickProbeEnv, type QuickProbeResolution} from '@shared/intake/probeResolution.js'
import {youtubeLinkVideoId} from '@shared/urlIntent.js'
import type {IntakeEvent, IntakePlacement, QuickDownloadEvent} from '@shared/intake/intakeEvents.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import type {PlaylistManifestPayload} from '@shared/queueSubmission.js'
import {fail, type Result} from '@shared/result.js'
import type {IntakeCaller, IntakeOrigin, IntakeOriginKind, IntakeTake, IntakeWindowContext, PinnedDownloadProfile} from '@shared/intake/intakeSchemas.js'
import {PLAYLIST_PROBE_LIMIT_MAX, QUEUE_STATUS, type JobAuth, type QueueChoice, type QuickProbeTake} from '@shared/schemas.js'
import type {AppSettings, DownloadProfile, DownloadProfileRef, KeptProbe, LocalizedError, PlaylistScope, ProbeError, ProbePlaylistMode, ProbeResult, QueueItem} from '@shared/types.js'
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
	// A choice's answer (`take`) is stored on the row, as a count chosen at intake is.
	reprobe(itemId: string, take?: QuickProbeTake): Result<void>
	clearListOffer(itemId: string): Result<void>
}

export interface IntakeProbeRequest {
	url: string
	playlistMode: ProbePlaylistMode
	// The placeholder row's id: cancelling the row aborts exactly this probe.
	ownerKey: string
	// Always the count asked for, never left to the setting yt-dlp reads at spawn.
	playlistScope: PlaylistScope
}

export interface IntakeServiceDeps {
	queue: IntakeQueue
	probe(request: IntakeProbeRequest): Promise<Result<ProbeResult, ProbeError>>
	// Never rejects: a playlist whose manifest is lost only skips its .m3u.
	registerManifest(manifest: PlaylistManifestPayload): Promise<void>
	settings(): Promise<AppSettings>
	// Words in the window's language for a failure that brings none of its own.
	text(key: 'wizard.url.quickProbeFailed' | 'wizard.url.quickPrepareFailed' | 'wizard.url.profile.outputMissing'): string
	// A profile's format for its rows, in the window's language (profileFormatLabel).
	profileFormatLabel(profile: DownloadProfile): string
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
	// How much of a collection to keep, when the user already chose (the
	// Mixed URL prompt's list answer). Kept on the row, so a Retry and a
	// restart keep to it and nothing asks "how many?" again.
	take?: QuickProbeTake
	// The hotkey's video from a link that also names a list: that link, offered on the row.
	listOffer?: string
	// A list placed by a row's list offer: the video already taken, left out.
	skipVideoId?: string
	origin: IntakeCaller
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
	// Settles when the window first reports its context.
	private readonly windowReported: Promise<void>
	private markWindowReported: () => void = () => undefined
	private stopping = false
	// When the last placeholder row was placed: each next one is stamped
	// strictly later, so Downloads (newest first) never ties a batch's rows.
	private lastPlacedAt = Number.NEGATIVE_INFINITY

	constructor(private readonly deps: IntakeServiceDeps) {
		this.kept = new KeptProbes(deps.now)
		this.windowReported = new Promise(resolve => {
			this.markWindowReported = resolve
		})
	}

	// The window reports its wizard folder, screen and active profile whenever they change.
	setWindowContext(context: IntakeWindowContext): void {
		this.window = context
		this.markWindowReported()
	}

	// At launch: every placeholder row still probing when the app quit probes
	// again, in queue order (a pasted batch resumes as it was pasted), exactly
	// as its Retry would, and the probe slots pace them. Each outcome goes to
	// the row's own origin under a request of its own. Waits for the window's
	// first report: preparing a row reads its screen (Auto HDR), and a row saved
	// without a pinned profile its folder. Resolves with how many resumed.
	// The app is quitting and its probes are stopped: no probe is asked for from
	// now on, and one that ends writes nothing, so its row stays probing and
	// resumes at the next launch.
	stopForExit(): void {
		this.stopping = true
	}

	// Only the rows probing when it is called: a link taken in while it waits has its own probe.
	async resumePlaceholderProbes(): Promise<number> {
		const left = new Set(this.deps.queue.snapshot().flatMap(item => (item.status === QUEUE_STATUS.probing ? [item.id] : [])))
		await this.windowReported
		const rows = this.deps.queue.snapshot().flatMap(item => {
			const row = left.has(item.id) && item.status === QUEUE_STATUS.probing ? this.placeholder(item.id) : undefined
			return row ? [row] : []
		})
		let resumed = 0
		for (const row of rows) {
			// The quit began: the rest stay probing for the launch after.
			if (this.stopping) break
			resumed += 1
			const caller: Caller = {requestId: this.deps.newId(), origin: row.origin?.kind ?? 'window'}
			// One at a time until each probe is asked for, so they take their probe slots in queue order.
			await new Promise<void>(asked => {
				void this.runProbe(row.id, {url: row.url, playlistMode: row.probeMode, title: row.title, ...ownTake(row)}, caller, asked).finally(asked)
			})
		}
		if (resumed > 0) logger.info('resumed the probes of placeholder rows left probing at quit', {count: resumed})
		return resumed
	}

	// The profile the window shows as active, once it has said.
	windowProfile(): DownloadProfileRef | undefined {
		return this.window.activeProfile
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
		void this.runProbe(row.id, {url: row.url, playlistMode: request.playlistMode, title: row.title, ...ownTake(row)}, {requestId: request.requestId, origin: origin.kind})
		return {kind: 'added', itemId: row.id, title: row.title, intakeId: origin.intakeId}
	}

	// A probe-error row probes again, the way it was taken in: with the count
	// it was placed with, if any.
	retry(call: IntakeCall): Result<void> {
		const row = this.placeholder(call.itemId)
		const restarted = this.deps.queue.reprobe(call.itemId)
		if (!restarted.ok || !row) return restarted
		this.kept.forget(call.itemId)
		void this.runProbe(row.id, {url: row.url, playlistMode: row.probeMode, title: row.title, ...ownTake(row)}, call)
		return restarted
	}

	// A needs-choice row's answer: every video, or the first N a capped list offered.
	// The answer overrides any count the row was placed with, and is stored on
	// the row before its probe starts, so a Retry and a restart keep to it.
	choose(call: IntakeCall & {take: IntakeTake}): Result<void> {
		const row = this.placeholder(call.itemId)
		// A refused answer leaves the row as it is: restarting it here would
		// leave it probing with no probe running.
		if (row?.status !== QUEUE_STATUS.needsChoice || !row.choice) return fail(createAppError('validation', `queue item ${call.itemId} is not waiting for a choice`))
		const kept = this.kept.get(call.itemId)
		const probe = {url: row.url, playlistMode: row.probeMode, title: row.title}
		if (call.take === 'all') return this.reprobe(row, {...probe, scope: scopeForTake({kind: 'all'}), take: {kind: 'all'}}, call)
		if (!row.choice.capped) return fail(createAppError('validation', 'only a list past the load limit offers its first videos'))
		const take = {kind: 'first', count: row.choice.loaded} as const
		if (!kept) return this.reprobe(row, {...probe, scope: scopeForTake(take), take}, call)
		// The kept probe already holds the first N: no second probe. The row
		// still goes back to probing, so a failure can land on it as usual.
		const restarted = this.deps.queue.reprobe(call.itemId, take)
		if (!restarted.ok) return restarted
		this.kept.forget(call.itemId)
		void this.settle(row.id, probe, call, async () => this.resolve(row.id, {ok: true, data: kept.probe}, {...probe, take}, take.count))
		return restarted
	}

	// A hotkey video's offer of its list, taken: the list goes in as its own
	// row, as if its link had been pasted, leaving out the video already taken.
	// Nobody chose a count, so past the load limit it asks. The offer is gone
	// once the list row is placed; the video's row is otherwise untouched.
	async takeListOffer(call: IntakeCall): Promise<Result<IntakePlacement>> {
		const row = this.find(call.itemId)
		const listUrl = row?.listOffer
		if (!row || !listUrl || row.job.kind === 'unresolved') return fail(createAppError('validation', `queue item ${call.itemId} offers no list`))
		const skipVideoId = youtubeLinkVideoId(listUrl)
		const placement = await this.add({requestId: call.requestId, url: listUrl, playlistMode: 'playlist', ...(skipVideoId ? {skipVideoId} : {}), ...(this.window.activeProfile ? {profile: this.window.activeProfile} : {}), origin: {kind: 'window'}})
		if (placement.kind === 'added') this.deps.queue.clearListOffer(call.itemId)
		return {ok: true, data: placement}
	}

	dismissListOffer(itemId: string): Result<void> {
		return this.deps.queue.clearListOffer(itemId)
	}

	// The probe a needs-choice row asked about, for its review in the window;
	// gone with the row (cancelled, removed, resolved).
	keptProbe(itemId: string): KeptProbe | null {
		if (this.find(itemId)?.status !== QUEUE_STATUS.needsChoice) {
			this.kept.forget(itemId)
			return null
		}
		return this.kept.get(itemId) ?? null
	}

	private reprobe(row: PlaceholderRow, probe: PlaceholderProbe, caller: Caller): Result<void> {
		const restarted = this.deps.queue.reprobe(row.id, probe.take)
		if (!restarted.ok) return restarted
		this.kept.forget(row.id)
		void this.runProbe(row.id, probe, caller)
		return restarted
	}

	// Runs (or re-runs) the probe of a placeholder that is `probing` in the queue.
	// `asked`: told right before the probe is asked for.
	private async runProbe(itemId: string, probe: PlaceholderProbe, caller: Caller, asked?: () => void): Promise<void> {
		await this.settle(itemId, probe, caller, async () => {
			// Read before the probe and asked for explicitly, since the probe may wait
			// minutes for its slot: the result is one entry past this limit when the
			// collection goes on, whatever the setting is by the time yt-dlp starts.
			const limit = probe.take?.kind === 'all' ? PLAYLIST_PROBE_LIMIT_MAX : probe.take?.kind === 'first' ? probe.take.count : resolvePlaylistProbeLimit((await this.deps.settings()).common)
			const pinned = probe.scope ?? {items: {kind: 'first', count: limit}}
			// A list that leaves a video out looks one entry further, so its count holds.
			const scope = this.find(itemId)?.skipVideoId ? widenForSkip(pinned) : pinned
			// Once the quit began no probe is asked for: the row stays probing and resumes at the next launch.
			if (this.stopping) return null
			asked?.()
			const result = await this.deps.probe({url: probe.url, playlistMode: probe.playlistMode, ownerKey: itemId, playlistScope: scope})
			return this.resolve(itemId, result, probe, limit)
		})
	}

	// Never rejects: whatever goes wrong lands on the row as a probe error.
	// `run` answers null when the quit stopped it before its probe was asked for.
	private async settle(itemId: string, probe: PlaceholderProbe, caller: Caller, run: () => Promise<QuickProbeResolution | null>): Promise<void> {
		let resolution: QuickProbeResolution | null
		try {
			resolution = await run()
		} catch (error) {
			logger.error('probe failed', {itemId, error: error instanceof Error ? error.message : String(error)})
			resolution = failedResolution(error)
		}
		if (resolution === null || this.stopping) {
			logger.info('the app is quitting; the row stays probing and resumes at the next launch', {itemId})
			return
		}
		await this.apply(itemId, probe.title, resolution, caller)
	}

	private async resolve(itemId: string, result: Result<ProbeResult, ProbeError>, probe: PlaceholderProbe, limit: number): Promise<QuickProbeResolution> {
		const settings = await this.deps.settings()
		const row = this.find(itemId)
		// A row saved before the profile was stored on it prepares with the active one.
		const pinned = row?.pinnedProfile ?? this.activePinned(settings)
		const skip = row?.skipVideoId ? {skipVideoId: row.skipVideoId} : {}
		return resolvePinnedQuickProbe(result, {url: probe.url, playlistMode: probe.playlistMode, limit, ...(probe.take ? {take: probe.take} : {}), ...skip, profile: pinned}, {settings, queue: this.deps.queue.snapshot()}, this.env())
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
				if (replaced.error.code === 'limit') {
					// More rows than the caller may add from one link: no Retry can fix that.
					const failed = this.deps.queue.probeFailed(itemId, {kind: 'unknown', raw: replaced.error.message})
					if (failed.ok) tell({kind: 'failed', itemId, title, probeError: null, overRowLimit: true})
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
				this.kept.keep(itemId, resolution.kept)
				tell({kind: 'needs-choice', itemId, choice: resolution.choice})
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
			profileFormatLabel: profile => this.deps.profileFormatLabel(profile),
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
			formatLabel: this.deps.profileFormatLabel(profile),
			status: QUEUE_STATUS.probing,
			lane: 'normal',
			progressPercent: 0,
			progressDetail: null,
			lastStatus: null,
			error: null,
			addedAt: new Date(this.nextPlacedAt()).toISOString(),
			finishedAt: null,
			artifacts: [],
			writeM3u: false,
			retryCount: 0,
			probeMode: request.playlistMode,
			...(request.take ? {probeTake: request.take} : {}),
			...(request.listOffer ? {listOffer: request.listOffer} : {}),
			...(request.skipVideoId ? {skipVideoId: request.skipVideoId} : {}),
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
	// The clock, or one millisecond after the last row placed if the clock has
	// not moved past it (a batch placed within one millisecond).
	private nextPlacedAt(): number {
		this.lastPlacedAt = Math.max(this.deps.now?.() ?? Date.now(), this.lastPlacedAt + 1)
		return this.lastPlacedAt
	}

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

// The count a row was placed with, and how far its probe looks for it.
function ownTake(row: QueueItem): Pick<PlaceholderProbe, 'scope' | 'take'> {
	return row.probeTake ? {scope: scopeForTake(row.probeTake), take: row.probeTake} : {}
}

function failedResolution(error: unknown): QuickProbeResolution {
	return {kind: 'failed', error: {kind: 'unknown', raw: error instanceof Error ? error.message : String(error)}, probeError: null}
}
