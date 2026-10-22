// Turning a probe into queue rows with a download profile: the background
// quick download, Bulk URLs' quick run and the playlist cap dialog. Pure: what
// the window or the machine supplies (the screen's HDR, the filesystem, ids)
// comes in through `QueuePreparationEnv`, so the same preparation can run
// wherever intake runs.

import {DEFAULTS} from '@shared/constants.js'
import {resolveChosenDownloadProfile, resolveDownloadProfile, resolveDownloadProfileBaseDir, resolveDownloadProfileOutputDir, type ResolvedDownloadProfile} from '@shared/downloadProfiles.js'
import {templateOutputDir} from '@shared/filenameTemplate.js'
import {resolveHdrSetting} from '@shared/hdrSetting.js'
import {bindJobFilename, canWriteM3u, playlistEntryTemplateMeta, profileInFlight, resolveJobFilenameTemplate, templateOwnsDirs, videoProbeTemplateMeta, type FilenameBinding} from '@shared/outputTemplates.js'
import {playlistTitleFallback} from '@shared/playlistTitle.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import {prepareJob} from '@shared/prepareJob.js'
import {isLiveQueueItem} from '@shared/queueActions.js'
import {placeholderTitleFlag} from '@shared/queueTitle.js'
import type {PinnedDownloadProfile} from '@shared/intake/intakeSchemas.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {playlistBaseDir} from '@shared/subfolder.js'
import type {AppSettings, DownloadProfile, DownloadProfileRef, HdrPreference, JobAuth, NativeAudioPreference, PlaylistEntry, ProbeResult, QueueItem, QueueLane} from '@shared/types.js'

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

/** What preparing rows needs from the host it runs in. */
export interface QueuePreparationEnv {
	newId(): string
	// A profile's format for its queue rows, in the app language.
	profileFormatLabel(profile: DownloadProfile): string
	// Whether the screen shows HDR, which settles the Auto HDR setting.
	displayShowsHdr: boolean
	filenames: FilenameBinding
}

/** The settings and queue a preparation reads. */
export interface QueuePreparationInputs {
	settings: AppSettings | null | undefined
	queue: readonly QueueItem[]
}

/**
 * The queue admits a video once (its URL is the key), but a playlist or mix may
 * list one video at several positions and the probe keeps each position as its
 * own row. Every batch is reduced to the first occurrence of each URL before
 * items are built, so numbering and the playlist manifest describe exactly what
 * is queued; otherwise admission rejects the repeat as an in-batch duplicate
 * and the whole batch is lost.
 */
export function firstOccurrencePerUrl(entries: readonly PlaylistEntry[]): PlaylistEntry[] {
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
export function withoutAlreadyQueued(entries: readonly PlaylistEntry[], queue: readonly QueueItem[]): {entries: PlaylistEntry[]; skippedAlreadyQueued: number} {
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
export function isQueueableEntry(entry: PlaylistEntry): boolean {
	return entry.isContainer !== true
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

export function buildProfileEntryQueueItem(params: {
	id: string
	entry: Pick<PlaylistEntry, 'url' | 'title' | 'thumbnail' | 'titleIsPlaceholder'>
	probeInfoJsonRef?: PlaylistEntry['probeInfoJsonRef']
	auth: JobAuth | undefined
	outputDir: string
	extractor: string
	extractorKey: string
	resolved: ResolvedDownloadProfile
	profile: DownloadProfile
	formatLabel: string
	filenameTemplate: string
	nativeAudioPreference: NativeAudioPreference
	hdrPreference: HdrPreference
	playlistGroupId?: string
	writeM3u: boolean
	lane: QueueLane
}): QueueItem {
	return {
		id: params.id,
		url: params.entry.url,
		title: params.entry.title || params.entry.url,
		...placeholderTitleFlag(params.entry.titleIsPlaceholder),
		thumbnail: params.entry.thumbnail,
		outputDir: params.outputDir,
		formatLabel: params.formatLabel,
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

// `source`: what names the result when the probe does not — the link and a
// playlist title. The wizard and Bulk URLs pass theirs; a background quick
// download passes its row's link and no title. `pinned` is the profile and
// folders the rows are prepared with.
export function preparePinnedProfileQueueSubmission(probe: ProbeResult, inputs: QueuePreparationInputs, lane: QueueLane, source: {url: string; playlistTitle: string}, pinned: PinnedDownloadProfile, env: QueuePreparationEnv): PreparedQueueSubmission | null {
	const {settings} = inputs
	const {profile, ref} = resolveChosenDownloadProfile(pinned.ref, settings?.profiles)
	const nativeAudioPreference = settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const hdrPreference = resolveHdrSetting(settings?.common?.hdrPreference ?? DEFAULTS.hdrPreference, env.displayShowsHdr).preference
	const resolved = resolveDownloadProfile(profile, ref, nativeAudioPreference, hdrPreference)
	const formatLabel = env.profileFormatLabel(profile)
	const {outputContext} = pinned
	const baseDir = resolveDownloadProfileBaseDir(profile, outputContext)
	const singleOutputDir = resolveDownloadProfileOutputDir(profile, outputContext)

	if (probe.kind === 'video') {
		const template = resolveJobFilenameTemplate(profile, settings?.common?.filenameTemplate)
		const url = probe.webpageUrl || source.url
		// {site} comes from the link that is queued, which falls back to the source.
		const templateMeta = videoProbeTemplateMeta({...probe, webpageUrl: url})
		const item = buildProfileEntryQueueItem({
			id: env.newId(),
			entry: {url, title: probe.title, thumbnail: probe.thumbnail},
			probeInfoJsonRef: probe.probeInfoJsonRef,
			auth: probe.auth,
			outputDir: templateOutputDir(singleOutputDir, template, templateMeta),
			extractor: probe.extractor,
			extractorKey: probe.extractorKey,
			resolved,
			profile,
			formatLabel,
			filenameTemplate: bindJobFilename(template, templateMeta, templateOutputDir(singleOutputDir, template, templateMeta), profileInFlight(resolved, probe.formats), env.filenames),
			nativeAudioPreference,
			hdrPreference,
			writeM3u: false,
			lane
		})
		return {items: [item], skippedAlreadyQueued: 0}
	}

	const playlistGroupId = env.newId()
	const profileTemplate = resolveJobFilenameTemplate(profile, settings?.common?.filenameTemplate)
	const ownsDirs = templateOwnsDirs(profile, settings?.common?.filenameTemplate)
	// When the template owns layout the auto-folder steps aside, otherwise a
	// `{playlist_title}/…` template would nest the playlist title twice.
	const playlistRoot = ownsDirs ? resolveDownloadProfileOutputDir(profile, outputContext) : playlistBaseDir(baseDir, profile.subfolder.enabled, profile.subfolder.name, probe.playlistTitle)
	// An .m3u lists media files; a subtitles-only profile writes none.
	const writeM3u = !resolved.isSubtitleOnly && (settings?.common?.writeM3u ?? DEFAULTS.writeM3u) && canWriteM3u(profile, settings?.common?.filenameTemplate)
	// Quick Download queues a probe result directly, with no picker in between,
	// so this is the seam where container entries have to be dropped. Probe
	// order is kept verbatim: with no picker the user never chose a sort for
	// this list, and playlistSortMode here is leftover from an earlier one.
	// Numbering is contiguous over the queued entries.
	const listed = firstOccurrencePerUrl(probe.entries.filter(isQueueableEntry))
	if (listed.length === 0) return null
	const {entries, skippedAlreadyQueued} = withoutAlreadyQueued(listed, inputs.queue)
	if (entries.length === 0) return {items: [], skippedAlreadyQueued}
	const items = entries.map((entry, index) => {
		const entryMeta = playlistEntryTemplateMeta(entry, probe.playlistTitle, probe.playlistId, index + 1)
		return buildProfileEntryQueueItem({
			id: env.newId(),
			entry,
			probeInfoJsonRef: entry.probeInfoJsonRef,
			// Main stamps `auth` on the entries that need the account (R20).
			auth: entry.auth,
			outputDir: ownsDirs ? templateOutputDir(playlistRoot, profileTemplate, entryMeta) : playlistRoot,
			extractor: probe.extractor,
			extractorKey: probe.extractorKey,
			resolved,
			profile,
			formatLabel,
			filenameTemplate: bindJobFilename(profileTemplate, entryMeta, ownsDirs ? templateOutputDir(playlistRoot, profileTemplate, entryMeta) : playlistRoot, profileInFlight(resolved, entry.probedFormats ?? []), env.filenames),
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
