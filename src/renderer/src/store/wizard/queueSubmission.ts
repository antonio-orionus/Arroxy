import {DEFAULTS} from '@shared/constants.js'
import {
	allDownloadProfiles,
	downloadProfileLabel,
	downloadProfileRefFor,
	resolveActiveDownloadProfile,
	resolveChosenDownloadProfile,
	resolveDownloadProfile,
	resolveDownloadProfileBaseDir,
	resolveDownloadProfileOutputDir,
	type DownloadProfileOutputContext,
	type ResolvedDownloadProfile
} from '@shared/downloadProfiles.js'
import type {AudioSelection, DownloadProfile, DownloadProfileRef, JobAuth, HdrPreference, NativeAudioPreference, PlaylistEntry, PlaylistSelection, ProbeResult, QueueItem, QueueLane} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {EmbedOptions, SubtitleOptions} from '@shared/preparedJob.js'
import {prepareJob} from '@shared/prepareJob.js'
import {planSubtitleTracks, type SubtitlePlan} from '@shared/subtitleTracks.js'
import {placeholderTitleFlag} from '@shared/queueTitle.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {sanitizeJobOptions} from '@shared/sanitizeJobOptions.js'
import {fileTypeContainerArgs} from '@shared/selectionOrder.js'
import {playlistBaseDir} from '@shared/subfolder.js'
import {templateOutputDir} from '@shared/filenameTemplate.js'
import {requestedFormats} from '@shared/nameBudget.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import i18next from 'i18next'
import type {AppState} from '../types.js'
import {buildAudioConvertPayload, buildFormatId, buildFormatLabel, generateId, resolveVideoResolution} from '../helpers.js'
import {resolveOutputContainer} from './resolveContainer.js'
import {resolveAppHdr} from '@renderer/lib/displayHdr.js'
import {resolvePlaylistDir} from './playlistDir.js'
import {bindJobFilenameTemplate, canWriteM3u, playlistEntryTemplateMeta, playlistSelectionInFlight, profileInFlight, resolveJobFilenameTemplate, singleTemplateMeta, templateOwnsDirs} from './outputTemplates.js'
import {sortPlaylistEntries} from './playlistSort.js'
import {playlistTitleFallback} from './playlistTitle.js'
import {wizardVideoPart} from './videoPart.js'
import {wizardPickedTracks} from './profileApplication.js'
import {scaleBytesToPart, videoPartSuffix} from '@shared/videoPart.js'
import {resolveAssignedProfile} from './playlistProfileAssignments.js'

export interface PlaylistManifestPayload {
	playlistGroupId: string
	playlistTitle: string
	outputDir: string
	items: {videoId: string | null; title: string; duration?: number}[]
}

export interface PreparedQueueSubmission {
	items: QueueItem[]
	manifest?: PlaylistManifestPayload
	/**
	 * Entries left out because the same video is already live in the queue. Zero
	 * `items` with a positive count means everything was already queued: not a
	 * failure, and not an empty selection (that is `null`).
	 */
	skippedAlreadyQueued: number
}

function wizardSubtitlePlan(state: AppState): SubtitlePlan {
	const maps = {subtitles: state.wizardSubtitles, automaticCaptions: state.wizardAutomaticCaptions}
	const tracks = wizardPickedTracks(state.wizardSubtitleLanguages, maps, state.wizardProfile, state.wizardProfileBaseline?.subtitleLanguages ?? null)
	return planSubtitleTracks({kind: 'tracks', tracks}, maps)
}

function buildSingleQueueItemFromState(state: AppState, lane: QueueLane): QueueItem | null {
	const {wizardUrl, wizardTitle, wizardThumbnail, wizardOutputDir} = state
	const {wizardSubfolderEnabled, wizardSubfolderName} = state
	const {audioSelection, wizardMediaKind, wizardFormats} = state
	// The Video / Audio / Subtitles kind decides what is kept; a stale video id
	// from an earlier kind never leaks into an audio or subtitles job.
	const selectedVideoFormatId = wizardMediaKind === 'video' ? state.selectedVideoFormatId : ''
	const effectiveAudio: AudioSelection = wizardMediaKind === 'subtitles' ? {kind: 'none'} : audioSelection
	const videoPart = wizardVideoPart(state)
	const template = state.wizardFilenameTemplate
	const templateMeta = singleTemplateMeta(state)
	// A nesting template renders its directories below the subfolder root; a flat
	// one leaves the root as-is. The job then carries the filename segment alone,
	// with the tokens yt-dlp cannot know already bound.
	const outputDir = templateOutputDir(effectiveOutputDir(wizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName), template, templateMeta)
	const formatId = wizardMediaKind === 'subtitles' ? undefined : buildFormatId(selectedVideoFormatId, effectiveAudio)
	const subtitleLanguages = state.wizardSubtitleLanguages
	const subtitlePlan = wizardSubtitlePlan(state)
	// The same track goes by the same key, and so gets the same file name and
	// embedded track, as when a profile picks it.
	const subtitleKeys = subtitlePlan.tracks.map(track => track.requestKey)
	const inFlight = {formats: wizardMediaKind === 'subtitles' ? [] : requestedFormats(formatId, wizardFormats), subtitleLanguages: subtitleKeys}
	// The range goes after the `[id]`, so playlist sync never takes a part for
	// the whole video; it is bound with the name, not typed into the template.
	const filenameTemplate = bindJobFilenameTemplate(template, templateMeta, outputDir, inFlight, videoPart ? videoPartSuffix(videoPart) : undefined)

	const audioFormats = wizardFormats.filter(f => f.isAudioOnly)
	const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, 'audio-only')

	const audioConvert = wizardMediaKind === 'subtitles' ? undefined : buildAudioConvertPayload(effectiveAudio, wizardMediaKind)
	const formatLabel = wizardMediaKind === 'subtitles' ? i18next.t('wizard.formats.kind.subtitles') : buildFormatLabel(selectedVideoFormatId, videoResolution, effectiveAudio, audioFormats, state.wizardFormatSelection)

	// Extracting as it is (`best`) downloads the stream it names, whose size is known.
	const nativeAudioId = effectiveAudio.kind === 'native' || effectiveAudio.kind === 'extract' ? (effectiveAudio.formatId ?? null) : null
	const selectedIds = [selectedVideoFormatId, nativeAudioId].filter(Boolean) as string[]
	const selectedSizes = selectedIds.map(id => wizardFormats.find(f => f.formatId === id)?.filesize)
	const wholeBytes = (!audioConvert || audioConvert.target === 'best') && selectedIds.length > 0 && selectedSizes.every((s): s is number => s !== undefined) ? selectedSizes.reduce((a, b) => a + b, 0) : undefined
	const expectedBytes = scaleBytesToPart(wholeBytes, videoPart, state.wizardDuration)

	const embed: EmbedOptions = {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail}

	const fileType = wizardMediaKind === 'video' ? state.wizardFileType : 'auto'
	const resolvedContainer = resolveOutputContainer(selectedVideoFormatId, effectiveAudio, state.wizardSubtitleMode, wizardFormats, wizardMediaKind, state.wizardEmbedThumbnail, fileType)
	const {overrides} = sanitizeJobOptions({
		requestedFileType: fileType,
		isSubtitleOnly: wizardMediaKind === 'subtitles',
		hasVideoTrack: selectedVideoFormatId !== '',
		resolvedOutputContainer: resolvedContainer,
		subtitleMode: state.wizardSubtitleMode,
		subtitleLanguages,
		embed,
		sponsorBlockMode: wizardMediaKind === 'video' ? state.wizardSponsorBlockMode : 'off'
	})

	const subtitles: SubtitleOptions | undefined = subtitleLanguages.length > 0 ? {request: {kind: 'tracks', tracks: subtitlePlan.tracks.map(({key, auto}) => ({key, auto}))}, mode: overrides.subtitleMode, format: state.wizardSubtitleFormat} : undefined

	const job = prepareJob({
		mode: 'single',
		extractor: state.wizardExtractor,
		extractorKey: state.wizardExtractorKey,
		formatId,
		...(fileType !== 'auto' && formatId ? {container: fileTypeContainerArgs(fileType)} : {}),
		audioConvert,
		subtitleOnly: wizardMediaKind === 'subtitles',
		expectedBytes,
		...(videoPart ? {videoPart} : {}),
		filenameTemplate,
		subtitles,
		sponsorBlockMode: overrides.sponsorBlockMode,
		sponsorBlockCategories: state.wizardSponsorBlockCategories,
		embed: overrides.embed
	})

	return {
		id: generateId(),
		retryCount: 0,
		url: wizardUrl,
		title: wizardTitle || wizardUrl,
		thumbnail: wizardThumbnail,
		outputDir,
		formatLabel,
		status: QUEUE_STATUS.pending,
		lane,
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: new Date().toISOString(),
		finishedAt: null,
		artifacts: [],
		writeM3u: state.wizardWriteM3u && canWriteM3u(undefined, template),
		...(state.wizardProbeInfoJsonRef ? {probeInfoJsonRef: state.wizardProbeInfoJsonRef} : {}),
		...(state.wizardProbeAuth ? {auth: state.wizardProbeAuth} : {}),
		job
	}
}

function resolvePlaylistFormatLabel(s: PlaylistSelection): string {
	if (s.kind === 'subtitles') return [i18next.t('wizard.formats.kind.subtitles'), s.languages.join(', '), s.format.toUpperCase()].join(' · ')
	if (s.kind === 'audio') {
		if (s.format === 'best') return i18next.t('playlistPresets.audioFormat.best')
		return i18next.t('playlistPresets.audioFormatBitrate', {format: s.format.toUpperCase(), kbps: s.bitrateKbps ?? 192})
	}
	const tierLabel = i18next.t(`playlistPresets.tier.${s.tier}` as const)
	if (s.codec === 'mp4') return `${i18next.t('playlistPresets.videoFormat.mp4')} · ${tierLabel}`
	return tierLabel
}

function buildPlaylistQueueItem(entry: PlaylistEntry, state: AppState, playlistGroupId: string, lane: QueueLane, displayIndex?: number): QueueItem {
	const {playlistSelection} = state
	if (!playlistSelection) throw new Error('playlist selection missing')

	const formatLabel = resolvePlaylistFormatLabel(playlistSelection)
	const template = resolveJobFilenameTemplate(undefined, state.settings?.common?.filenameTemplate)
	// Display number within the sorted selected set (001..N contiguous). Passed
	// only as template metadata — never written back onto the entry, whose
	// playlistIndex stays immutable probe-order identity.
	const templateMeta = playlistEntryTemplateMeta(entry, state.playlistTitle, state.playlistId, displayIndex)
	// Per entry, not per playlist: a nesting template may sort entries into
	// different folders (by uploader, by date) within the same playlist.
	const baseDir = templateOwnsDirs(undefined, state.settings?.common?.filenameTemplate) ? templateOutputDir(effectiveOutputDir(state.wizardOutputDir, state.wizardSubfolderEnabled, state.wizardSubfolderName), template, templateMeta) : resolvePlaylistDir(state)
	const filenameTemplate = bindJobFilenameTemplate(template, templateMeta, baseDir, playlistSelectionInFlight(playlistSelection, entry.probedFormats ?? []))

	// A subtitles batch skips the output and SponsorBlock steps, so the wizard
	// state for them is stale; prepareJob ignores both for subtitle-only jobs.
	const embed: EmbedOptions = {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail}

	const nativeAudioPreference = state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const hdrPreference = resolveAppHdr(state.settings?.common?.hdrPreference).preference
	const job = prepareJob({mode: 'playlist', extractor: state.wizardExtractor, extractorKey: state.wizardExtractorKey, playlistSelection, nativeAudioPreference, hdrPreference, filenameTemplate, sponsorBlockMode: state.wizardSponsorBlockMode, sponsorBlockCategories: state.wizardSponsorBlockCategories, embed})
	// An .m3u lists media files; a subtitles batch writes none.
	const writeM3u = state.wizardMode === 'playlist' && playlistSelection.kind !== 'subtitles' && state.wizardWriteM3u && canWriteM3u(undefined, state.settings?.common?.filenameTemplate)

	return {
		id: generateId(),
		retryCount: 0,
		url: entry.url,
		title: entry.title || entry.url,
		...placeholderTitleFlag(entry.titleIsPlaceholder),
		thumbnail: entry.thumbnail,
		outputDir: baseDir,
		formatLabel,
		status: QUEUE_STATUS.pending,
		lane,
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: new Date().toISOString(),
		finishedAt: null,
		artifacts: [],
		...(state.wizardMode === 'playlist' ? {playlistGroupId} : {}),
		...(entry.probeInfoJsonRef ? {probeInfoJsonRef: entry.probeInfoJsonRef} : {}),
		...(entry.auth ? {auth: entry.auth} : {}),
		writeM3u,
		job
	}
}

function playlistManifestPayload(state: AppState, playlistGroupId: string, outputDir: string): PlaylistManifestPayload {
	const removed = new Set(state.removedPlaylistItemIds)
	const items = firstOccurrencePerUrl(state.playlistItems.filter(entry => !removed.has(entry.id)).filter(isQueueableEntry))
	return {playlistGroupId, playlistTitle: state.playlistTitle || 'Playlist', outputDir, items: items.map(e => ({videoId: e.videoId, title: e.title, duration: e.duration}))}
}

// Hoists Sets once per call instead of `.includes` inside the filter — at the
// design's 1000-item target, `.includes` against a selection that can itself
// be 1000 ids long turns each of the two call sites below into ~10^6
// comparisons; a Set lookup is O(1) regardless of playlist size.
function selectedPlaylistEntries(state: AppState): PlaylistEntry[] {
	const selected = new Set(state.selectedPlaylistItemIds)
	const removed = new Set(state.removedPlaylistItemIds)
	return state.playlistItems.filter(entry => selected.has(entry.id) && !removed.has(entry.id)).filter(isQueueableEntry)
}

// The order rows are numbered and queued in. Playlist mode follows the picker's
// visible sort so 001..N matches what the user saw; bulk mode has no sort
// control, so intake order is the order.
function submissionOrderEntries(state: AppState): PlaylistEntry[] {
	const selected = selectedPlaylistEntries(state)
	return firstOccurrencePerUrl(state.wizardMode === 'bulk' ? selected : sortPlaylistEntries(selected, state.playlistSortMode))
}

/**
 * The queue admits a video once (its URL is the key), but a playlist or mix may
 * list one video at several positions and the probe keeps each position as its
 * own row. Every batch is reduced to the first occurrence of each URL before
 * items are built, so numbering and the playlist manifest describe exactly what
 * is queued; otherwise admission rejects the repeat as an in-batch duplicate
 * and the whole batch is lost.
 */
function firstOccurrencePerUrl(entries: readonly PlaylistEntry[]): PlaylistEntry[] {
	const seen = new Set<string>()
	return entries.filter(entry => {
		if (seen.has(entry.url)) return false
		seen.add(entry.url)
		return true
	})
}

/**
 * Admission refuses a video whose URL is already live in the queue, and fails
 * the whole batch for it. A playlist that overlaps what is queued must not be
 * lost for that reason, so those entries are left out here and counted, and the
 * caller tells the user. Admission itself stays the last-line guard for a
 * renderer queue that has gone stale. Terminal items do not block: a finished or
 * cancelled video can be queued again.
 */
function withoutAlreadyQueued(entries: readonly PlaylistEntry[], queue: readonly QueueItem[]): {entries: PlaylistEntry[]; skippedAlreadyQueued: number} {
	const liveUrls = new Set(queue.filter(isLiveQueueItem).map(item => item.url))
	const admitted = entries.filter(entry => !liveUrls.has(entry.url))
	return {entries: admitted, skippedAlreadyQueued: entries.length - admitted.length}
}

/**
 * A container row addresses a channel/playlist/album, not a video. The probe
 * keeps those rows so an all-container result still renders a picker, and they
 * start unselected — but selection is reachable by hand (select-all, range,
 * shift-click), so every submission seam filters here rather than trusting the
 * selection. Queueing one would hand yt-dlp a collection URL carrying a single
 * pre-bound filename: `--no-playlist` is inert on it, and the whole set would
 * download under that one name.
 */
function isQueueableEntry(entry: PlaylistEntry): boolean {
	return entry.isContainer !== true
}

export function prepareManualQueueSubmission(state: AppState, lane: QueueLane): PreparedQueueSubmission | null {
	if (state.wizardMode === 'single') {
		const item = buildSingleQueueItemFromState(state, lane)
		return item ? {items: [item], skippedAlreadyQueued: 0} : null
	}

	const playlistGroupId = generateId()
	// Bulk rows render in intake order (the sort control is playlist-only), so
	// submission keeps intake order even if playlistSortMode retains a stale
	// upload mode from an earlier playlist. Playlist mode submits view order.
	const ordered = submissionOrderEntries(state)
	if (ordered.length === 0) return null
	const {entries: selected, skippedAlreadyQueued} = withoutAlreadyQueued(ordered, state.queue)
	if (selected.length === 0) return {items: [], skippedAlreadyQueued}
	// Contiguous 001..N over the queued rows — no gaps from unselected, removed
	// or already-queued entries. Display-only: entry.playlistIndex is untouched.
	const items = selected.map((e, index) => buildPlaylistQueueItem(e, state, playlistGroupId, lane, index + 1))
	// The playlist root, not the first item's folder — a nesting template can put
	// item 0 in an uploader-specific subfolder that does not represent the set.
	const baseDir = resolvePlaylistDir(state)
	return {items, skippedAlreadyQueued, ...(state.wizardMode === 'playlist' ? {manifest: playlistManifestPayload(state, playlistGroupId, baseDir)} : {})}
}

export function prepareMultiProfileQueueSubmission(state: AppState, lane: QueueLane): PreparedQueueSubmission | null {
	// Same intake-order rule as prepareManualQueueSubmission above.
	const ordered = submissionOrderEntries(state)
	if (ordered.length === 0) return null
	const {entries: selected, skippedAlreadyQueued} = withoutAlreadyQueued(ordered, state.queue)
	if (selected.length === 0) return {items: [], skippedAlreadyQueued}

	const profiles = allDownloadProfiles(state.settings?.profiles)
	const {profile: baseline} = resolveActiveDownloadProfile(state.settings?.profiles)
	const nativeAudioPreference = state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const hdrPreference = resolveAppHdr(state.settings?.common?.hdrPreference).preference
	const outputContext = {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}

	const items = selected.map((entry, index) => {
		const profile = resolveAssignedProfile(entry.id, state.playlistProfileAssignments, profiles, baseline)
		const ref = downloadProfileRefFor(profile, state.settings?.profiles)
		const resolved = resolveDownloadProfile(profile, ref, nativeAudioPreference, hdrPreference)
		const template = resolveJobFilenameTemplate(profile, state.settings?.common?.filenameTemplate)
		const templateMeta = playlistEntryTemplateMeta(entry, state.playlistTitle, state.playlistId, index + 1)
		const outputDir = templateOutputDir(resolveDownloadProfileOutputDir(profile, outputContext), template, templateMeta)
		return buildProfileEntryQueueItem({
			entry: {url: entry.url, title: entry.title, thumbnail: entry.thumbnail, ...placeholderTitleFlag(entry.titleIsPlaceholder)},
			...(entry.probeInfoJsonRef ? {probeInfoJsonRef: entry.probeInfoJsonRef} : {}),
			auth: entry.auth,
			outputDir,
			extractor: state.wizardExtractor,
			extractorKey: state.wizardExtractorKey,
			resolved,
			profile,
			filenameTemplate: bindJobFilenameTemplate(template, templateMeta, outputDir, profileInFlight(resolved, entry.probedFormats ?? [])),
			nativeAudioPreference,
			hdrPreference,
			// No playlistGroupId: QueueService only writes an .m3u for grouped items,
			// and a playlist file cannot describe videos spread across profile dirs.
			writeM3u: false,
			lane
		})
	})

	return {items, skippedAlreadyQueued}
}

function downloadProfileRefLabel(ref: DownloadProfileRef): string {
	return `${ref.kind}:${ref.id}`
}

function profileJob(resolved: ResolvedDownloadProfile, extractor: string, extractorKey: string, filenameTemplate: string, nativeAudioPreference: NativeAudioPreference, hdrPreference: HdrPreference): PreparedJob {
	const {subtitles} = resolved
	if (resolved.isSubtitleOnly) {
		return prepareJob({mode: 'single', extractor, extractorKey, subtitleOnly: true, filenameTemplate, subtitles, sponsorBlockMode: 'off', sponsorBlockCategories: [], embed: resolved.embed})
	}

	if (!resolved.intent) throw new Error(`download profile media intent missing for ${downloadProfileRefLabel(resolved.ref)}`)
	return prepareJob({
		mode: 'playlist',
		extractor,
		extractorKey,
		mediaIntent: resolved.intent,
		nativeAudioPreference,
		hdrPreference,
		filenameTemplate,
		subtitles,
		sponsorBlockMode: resolved.sponsorBlock.mode,
		sponsorBlockCategories: resolved.sponsorBlock.mode === 'off' ? [] : resolved.sponsorBlock.categories,
		embed: resolved.embed
	})
}

function buildProfileEntryQueueItem(params: {
	entry: Pick<PlaylistEntry, 'url' | 'title' | 'thumbnail' | 'titleIsPlaceholder'>
	probeInfoJsonRef?: PlaylistEntry['probeInfoJsonRef']
	auth: JobAuth | undefined
	outputDir: string
	extractor: string
	extractorKey: string
	resolved: ResolvedDownloadProfile
	profile: DownloadProfile
	filenameTemplate: string
	nativeAudioPreference: NativeAudioPreference
	hdrPreference: HdrPreference
	playlistGroupId?: string
	writeM3u: boolean
	lane: QueueLane
}): QueueItem {
	return {
		id: generateId(),
		url: params.entry.url,
		title: params.entry.title || params.entry.url,
		...placeholderTitleFlag(params.entry.titleIsPlaceholder),
		thumbnail: params.entry.thumbnail,
		outputDir: params.outputDir,
		formatLabel: downloadProfileLabel(params.profile),
		status: QUEUE_STATUS.pending,
		lane: params.lane,
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: new Date().toISOString(),
		finishedAt: null,
		artifacts: [],
		...(params.playlistGroupId ? {playlistGroupId: params.playlistGroupId} : {}),
		...(params.probeInfoJsonRef ? {probeInfoJsonRef: params.probeInfoJsonRef} : {}),
		...(params.auth ? {auth: params.auth} : {}),
		writeM3u: params.writeM3u,
		retryCount: 0,
		job: profileJob(params.resolved, params.extractor, params.extractorKey, params.filenameTemplate, params.nativeAudioPreference, params.hdrPreference)
	}
}

/**
 * The download profile a background quick download was placed with, and the
 * folders it resolved against then. Its row is labelled with them, so the
 * download keeps them when the user switches profile or folder while the
 * probe runs.
 */
export interface PinnedDownloadProfile {
	ref: DownloadProfileRef
	outputContext: DownloadProfileOutputContext
}

export function pinActiveDownloadProfile(state: AppState): PinnedDownloadProfile {
	return {ref: resolveActiveDownloadProfile(state.settings?.profiles).ref, outputContext: {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}}
}

// `source`: what names the result when the probe does not — the link and a
// playlist title. The wizard and Bulk URLs pass theirs; a background quick
// download passes its row's link and no title, and the profile it was placed
// with (`pinned`); without one, the active profile and folders are used.
export function prepareActiveProfileQueueSubmission(probe: ProbeResult, state: AppState, lane: QueueLane, source: {url: string; playlistTitle: string}, pinned: PinnedDownloadProfile = pinActiveDownloadProfile(state)): PreparedQueueSubmission | null {
	const {profile, ref} = resolveChosenDownloadProfile(pinned.ref, state.settings?.profiles)
	const nativeAudioPreference = state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const hdrPreference = resolveAppHdr(state.settings?.common?.hdrPreference).preference
	const resolved = resolveDownloadProfile(profile, ref, nativeAudioPreference, hdrPreference)
	const {outputContext} = pinned
	const baseDir = resolveDownloadProfileBaseDir(profile, outputContext)
	const singleOutputDir = resolveDownloadProfileOutputDir(profile, outputContext)

	if (probe.kind === 'video') {
		const template = resolveJobFilenameTemplate(profile, state.settings?.common?.filenameTemplate)
		const templateMeta = {title: probe.title, id: probe.videoId, uploader: probe.uploader, uploadDate: probe.uploadDate}
		const item = buildProfileEntryQueueItem({
			entry: {url: probe.webpageUrl || source.url, title: probe.title, thumbnail: probe.thumbnail},
			probeInfoJsonRef: probe.probeInfoJsonRef,
			auth: probe.auth,
			outputDir: templateOutputDir(singleOutputDir, template, templateMeta),
			extractor: probe.extractor,
			extractorKey: probe.extractorKey,
			resolved,
			profile,
			filenameTemplate: bindJobFilenameTemplate(template, templateMeta, templateOutputDir(singleOutputDir, template, templateMeta), profileInFlight(resolved, probe.formats)),
			nativeAudioPreference,
			hdrPreference,
			writeM3u: false,
			lane
		})
		return {items: [item], skippedAlreadyQueued: 0}
	}

	const playlistGroupId = generateId()
	const profileTemplate = resolveJobFilenameTemplate(profile, state.settings?.common?.filenameTemplate)
	const ownsDirs = templateOwnsDirs(profile, state.settings?.common?.filenameTemplate)
	// When the template owns layout the auto-folder steps aside, otherwise a
	// `{playlist_title}/…` template would nest the playlist title twice.
	const playlistRoot = ownsDirs ? resolveDownloadProfileOutputDir(profile, outputContext) : playlistBaseDir(baseDir, profile.subfolder.enabled, profile.subfolder.name, probe.playlistTitle)
	const writeM3u = (state.settings?.common?.writeM3u ?? DEFAULTS.writeM3u) && canWriteM3u(profile, state.settings?.common?.filenameTemplate)
	// Quick Download queues a probe result directly, with no picker in between,
	// so this is the seam where container entries have to be dropped. Probe
	// order is kept verbatim: with no picker the user never chose a sort for
	// this list, and playlistSortMode here is leftover from an earlier one.
	// Numbering is contiguous over the queued entries.
	const listed = firstOccurrencePerUrl(probe.entries.filter(isQueueableEntry))
	if (listed.length === 0) return null
	const {entries, skippedAlreadyQueued} = withoutAlreadyQueued(listed, state.queue)
	if (entries.length === 0) return {items: [], skippedAlreadyQueued}
	const items = entries.map((entry, index) => {
		const entryMeta = playlistEntryTemplateMeta(entry, probe.playlistTitle, probe.playlistId, index + 1)
		return buildProfileEntryQueueItem({
			entry,
			probeInfoJsonRef: entry.probeInfoJsonRef,
			// Main stamps `auth` on the entries that need the account (R20).
			auth: entry.auth,
			outputDir: ownsDirs ? templateOutputDir(playlistRoot, profileTemplate, entryMeta) : playlistRoot,
			extractor: probe.extractor,
			extractorKey: probe.extractorKey,
			resolved,
			profile,
			filenameTemplate: bindJobFilenameTemplate(profileTemplate, entryMeta, ownsDirs ? templateOutputDir(playlistRoot, profileTemplate, entryMeta) : playlistRoot, profileInFlight(resolved, entry.probedFormats ?? [])),
			nativeAudioPreference,
			hdrPreference,
			playlistGroupId,
			writeM3u,
			lane
		})
	})
	// The manifest lists the whole playlist, skipped videos included: the .m3u is
	// rebuilt from it plus the files on disk, so it must describe the playlist,
	// not just this batch.
	return {items, skippedAlreadyQueued, manifest: {playlistGroupId, playlistTitle: playlistTitleFallback(probe.playlistTitle, source.playlistTitle), outputDir: playlistRoot, items: listed.map(entry => ({videoId: entry.videoId, title: entry.title, duration: entry.duration}))}}
}
