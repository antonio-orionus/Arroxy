import {DEFAULTS} from '@shared/constants.js'
import {allDownloadProfiles, downloadProfileLabel, downloadProfileRefFor, resolveActiveDownloadProfile, resolveDownloadProfile, resolveDownloadProfileBaseDir, resolveDownloadProfileOutputDir, type ResolvedDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef, NativeAudioPreference, PlaylistEntry, PlaylistSelection, ProbeResult, QueueItem, QueueLane} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {EmbedOptions, SubtitleOptions} from '@shared/preparedJob.js'
import {prepareJob} from '@shared/prepareJob.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {sanitizeJobOptions} from '@shared/sanitizeJobOptions.js'
import {playlistBaseDir} from '@shared/subfolder.js'
import {templateOutputDir} from '@shared/filenameTemplate.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import i18next from 'i18next'
import type {AppState} from '../types.js'
import {buildAudioConvertPayload, buildFormatId, buildFormatLabel, generateId, resolveVideoResolution} from '../helpers.js'
import {resolveOutputContainer} from './resolveContainer.js'
import {resolvePlaylistDir} from './playlistDir.js'
import {bindJobFilenameTemplate, canWriteM3u, playlistEntryTemplateMeta, resolveJobFilenameTemplate, singleTemplateMeta, templateOwnsDirs} from './outputTemplates.js'
import {sortPlaylistEntries} from './playlistSort.js'
import {playlistTitleFallback} from './playlistTitle.js'
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
}

function buildSingleQueueItemFromState(state: AppState, lane: QueueLane): QueueItem | null {
	const {wizardUrl, wizardTitle, wizardThumbnail, wizardOutputDir} = state
	const {wizardSubfolderEnabled, wizardSubfolderName} = state
	const {selectedVideoFormatId, audioSelection, activePreset, wizardFormats} = state
	const template = resolveJobFilenameTemplate(undefined, state.settings?.common?.filenameTemplate)
	const templateMeta = singleTemplateMeta(state)
	// A nesting template renders its directories below the subfolder root; a flat
	// one leaves the root as-is. The job then carries the filename segment alone,
	// with the tokens yt-dlp cannot know already bound.
	const outputDir = templateOutputDir(effectiveOutputDir(wizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName), template, templateMeta)
	const filenameTemplate = bindJobFilenameTemplate(template, templateMeta, outputDir)

	const audioFormats = wizardFormats.filter(f => f.isAudioOnly)
	const videoResolution = resolveVideoResolution(selectedVideoFormatId, wizardFormats, 'audio-only')

	const formatId = buildFormatId(selectedVideoFormatId, audioSelection)
	const audioConvert = buildAudioConvertPayload(audioSelection)
	const formatLabel = buildFormatLabel(selectedVideoFormatId, videoResolution, audioSelection, audioFormats, activePreset)

	const nativeAudioId = audioSelection.kind === 'native' ? audioSelection.formatId : null
	const selectedIds = [selectedVideoFormatId, nativeAudioId].filter(Boolean) as string[]
	const selectedSizes = selectedIds.map(id => wizardFormats.find(f => f.formatId === id)?.filesize)
	const expectedBytes = !audioConvert && selectedIds.length > 0 && selectedSizes.every((s): s is number => s !== undefined) ? selectedSizes.reduce((a, b) => a + b, 0) : undefined

	const subtitleLanguages = state.wizardSubtitleSkipped ? [] : state.wizardSubtitleLanguages
	const writeAutoSubs = subtitleLanguages.some(l => !!state.wizardAutomaticCaptions[l] && !state.wizardSubtitles[l])
	const embed: EmbedOptions = {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail}

	const resolvedContainer = resolveOutputContainer(selectedVideoFormatId, audioSelection, state.wizardSubtitleMode, wizardFormats, activePreset)
	const {overrides} = sanitizeJobOptions({isSubtitleOnly: activePreset === 'subtitle-only', hasVideoTrack: selectedVideoFormatId !== '', resolvedOutputContainer: resolvedContainer, subtitleMode: state.wizardSubtitleMode, subtitleLanguages, embed, sponsorBlockMode: state.wizardSponsorBlockMode})

	const subtitles: SubtitleOptions | undefined = subtitleLanguages.length > 0 ? {languages: subtitleLanguages, mode: overrides.subtitleMode, format: state.wizardSubtitleFormat, writeAuto: writeAutoSubs} : undefined

	const job = prepareJob({
		mode: 'single',
		extractor: state.wizardExtractor,
		extractorKey: state.wizardExtractorKey,
		formatId,
		audioConvert,
		activePreset,
		expectedBytes,
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
		writeM3u: state.wizardWriteM3u && canWriteM3u(undefined, state.settings?.common?.filenameTemplate),
		...(state.wizardProbeInfoJsonRef ? {probeInfoJsonRef: state.wizardProbeInfoJsonRef} : {}),
		job
	}
}

function resolvePlaylistFormatLabel(s: PlaylistSelection): string {
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
	const filenameTemplate = bindJobFilenameTemplate(template, templateMeta, baseDir)

	const embed: EmbedOptions = {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail}

	const nativeAudioPreference = state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const job = prepareJob({mode: 'playlist', extractor: state.wizardExtractor, extractorKey: state.wizardExtractorKey, playlistSelection, nativeAudioPreference, filenameTemplate, sponsorBlockMode: state.wizardSponsorBlockMode, sponsorBlockCategories: state.wizardSponsorBlockCategories, embed})

	return {
		id: generateId(),
		retryCount: 0,
		url: entry.url,
		title: entry.title || entry.url,
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
		writeM3u: state.wizardMode === 'playlist' && state.wizardWriteM3u && canWriteM3u(undefined, state.settings?.common?.filenameTemplate),
		job
	}
}

function playlistManifestPayload(state: AppState, playlistGroupId: string, outputDir: string): PlaylistManifestPayload {
	const removed = new Set(state.removedPlaylistItemIds)
	const items = state.playlistItems.filter(entry => !removed.has(entry.id)).filter(isQueueableEntry)
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
		return item ? {items: [item]} : null
	}

	const playlistGroupId = generateId()
	const selected = sortPlaylistEntries(selectedPlaylistEntries(state), state.playlistSortMode)
	if (selected.length === 0) return null
	// Contiguous 001..N over the sorted selected rows — no gaps from unselected
	// or removed entries. Display-only: entry.playlistIndex is untouched.
	const items = selected.map((e, index) => buildPlaylistQueueItem(e, state, playlistGroupId, lane, index + 1))
	// The playlist root, not the first item's folder — a nesting template can put
	// item 0 in an uploader-specific subfolder that does not represent the set.
	const baseDir = resolvePlaylistDir(state)
	return {items, ...(state.wizardMode === 'playlist' ? {manifest: playlistManifestPayload(state, playlistGroupId, baseDir)} : {})}
}

export function prepareMultiProfileQueueSubmission(state: AppState, lane: QueueLane): PreparedQueueSubmission | null {
	const selected = sortPlaylistEntries(selectedPlaylistEntries(state), state.playlistSortMode)
	if (selected.length === 0) return null

	const profiles = allDownloadProfiles(state.settings?.profiles)
	const {profile: baseline} = resolveActiveDownloadProfile(state.settings?.profiles)
	const nativeAudioPreference = state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const outputContext = {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}

	const items = selected.map((entry, index) => {
		const profile = resolveAssignedProfile(entry.id, state.playlistProfileAssignments, profiles, baseline)
		const ref = downloadProfileRefFor(profile, state.settings?.profiles)
		const resolved = resolveDownloadProfile(profile, ref, nativeAudioPreference)
		const template = resolveJobFilenameTemplate(profile, state.settings?.common?.filenameTemplate)
		const templateMeta = playlistEntryTemplateMeta(entry, state.playlistTitle, state.playlistId, index + 1)
		const outputDir = templateOutputDir(resolveDownloadProfileOutputDir(profile, outputContext), template, templateMeta)
		return buildProfileEntryQueueItem({
			entry: {url: entry.url, title: entry.title, thumbnail: entry.thumbnail},
			...(entry.probeInfoJsonRef ? {probeInfoJsonRef: entry.probeInfoJsonRef} : {}),
			outputDir,
			extractor: state.wizardExtractor,
			extractorKey: state.wizardExtractorKey,
			resolved,
			profile,
			filenameTemplate: bindJobFilenameTemplate(template, templateMeta, outputDir),
			nativeAudioPreference,
			// No playlistGroupId: QueueService only writes an .m3u for grouped items,
			// and a playlist file cannot describe videos spread across profile dirs.
			writeM3u: false,
			lane
		})
	})

	return {items}
}

function downloadProfileRefLabel(ref: DownloadProfileRef): string {
	return `${ref.kind}:${ref.id}`
}

function profileJob(resolved: ResolvedDownloadProfile, extractor: string, extractorKey: string, filenameTemplate: string, nativeAudioPreference: NativeAudioPreference): PreparedJob {
	if (resolved.isSubtitleOnly) {
		return prepareJob({mode: 'single', extractor, extractorKey, activePreset: 'subtitle-only', filenameTemplate, subtitles: resolved.subtitles, sponsorBlockMode: 'off', sponsorBlockCategories: [], embed: resolved.embed})
	}

	if (!resolved.intent) throw new Error(`download profile media intent missing for ${downloadProfileRefLabel(resolved.ref)}`)
	return prepareJob({
		mode: 'playlist',
		extractor,
		extractorKey,
		mediaIntent: resolved.intent,
		nativeAudioPreference,
		filenameTemplate,
		subtitles: resolved.subtitles,
		sponsorBlockMode: resolved.sponsorBlock.mode,
		sponsorBlockCategories: resolved.sponsorBlock.mode === 'off' ? [] : resolved.sponsorBlock.categories,
		embed: resolved.embed
	})
}

function buildProfileEntryQueueItem(params: {
	entry: Pick<PlaylistEntry, 'url' | 'title' | 'thumbnail'>
	probeInfoJsonRef?: PlaylistEntry['probeInfoJsonRef']
	outputDir: string
	extractor: string
	extractorKey: string
	resolved: ResolvedDownloadProfile
	profile: DownloadProfile
	filenameTemplate: string
	nativeAudioPreference: NativeAudioPreference
	playlistGroupId?: string
	writeM3u: boolean
	lane: QueueLane
}): QueueItem {
	return {
		id: generateId(),
		url: params.entry.url,
		title: params.entry.title || params.entry.url,
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
		writeM3u: params.writeM3u,
		retryCount: 0,
		job: profileJob(params.resolved, params.extractor, params.extractorKey, params.filenameTemplate, params.nativeAudioPreference)
	}
}

export function prepareActiveProfileQueueSubmission(probe: ProbeResult, state: AppState, lane: QueueLane): PreparedQueueSubmission | null {
	const {profile, ref} = resolveActiveDownloadProfile(state.settings?.profiles)
	const nativeAudioPreference = state.settings?.common?.nativeAudioPreference ?? DEFAULTS.nativeAudioPreference
	const resolved = resolveDownloadProfile(profile, ref, nativeAudioPreference)
	const outputContext = {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}
	const baseDir = resolveDownloadProfileBaseDir(profile, outputContext)
	const singleOutputDir = resolveDownloadProfileOutputDir(profile, outputContext)

	if (probe.kind === 'video') {
		const template = resolveJobFilenameTemplate(profile, state.settings?.common?.filenameTemplate)
		const templateMeta = {title: probe.title, id: probe.videoId, uploader: probe.uploader, uploadDate: probe.uploadDate}
		const item = buildProfileEntryQueueItem({
			entry: {url: probe.webpageUrl || state.wizardUrl, title: probe.title, thumbnail: probe.thumbnail},
			probeInfoJsonRef: probe.probeInfoJsonRef,
			outputDir: templateOutputDir(singleOutputDir, template, templateMeta),
			extractor: probe.extractor,
			extractorKey: probe.extractorKey,
			resolved,
			profile,
			filenameTemplate: bindJobFilenameTemplate(template, templateMeta, templateOutputDir(singleOutputDir, template, templateMeta)),
			nativeAudioPreference,
			writeM3u: false,
			lane
		})
		return {items: [item]}
	}

	const playlistGroupId = generateId()
	const profileTemplate = resolveJobFilenameTemplate(profile, state.settings?.common?.filenameTemplate)
	const ownsDirs = templateOwnsDirs(profile, state.settings?.common?.filenameTemplate)
	// When the template owns layout the auto-folder steps aside, otherwise a
	// `{playlist_title}/…` template would nest the playlist title twice.
	const playlistRoot = ownsDirs ? resolveDownloadProfileOutputDir(profile, outputContext) : playlistBaseDir(baseDir, profile.subfolder.enabled, profile.subfolder.name, probe.playlistTitle)
	const writeM3u = (state.settings?.common?.writeM3u ?? DEFAULTS.writeM3u) && canWriteM3u(profile, state.settings?.common?.filenameTemplate)
	// Quick Download queues a probe result directly, with no picker in between,
	// so this is the seam where container entries have to be dropped. Numbering
	// is contiguous over the queued entries in the current view sort.
	const entries = sortPlaylistEntries(probe.entries.filter(isQueueableEntry), state.playlistSortMode)
	const items = entries.map((entry, index) => {
		const entryMeta = playlistEntryTemplateMeta(entry, probe.playlistTitle, probe.playlistId, index + 1)
		return buildProfileEntryQueueItem({
			entry,
			probeInfoJsonRef: entry.probeInfoJsonRef,
			outputDir: ownsDirs ? templateOutputDir(playlistRoot, profileTemplate, entryMeta) : playlistRoot,
			extractor: probe.extractor,
			extractorKey: probe.extractorKey,
			resolved,
			profile,
			filenameTemplate: bindJobFilenameTemplate(profileTemplate, entryMeta, ownsDirs ? templateOutputDir(playlistRoot, profileTemplate, entryMeta) : playlistRoot),
			nativeAudioPreference,
			playlistGroupId,
			writeM3u,
			lane
		})
	})
	if (items.length === 0) return null
	return {items, manifest: {playlistGroupId, playlistTitle: playlistTitleFallback(probe.playlistTitle, state.playlistTitle), outputDir: playlistRoot, items: entries.map(entry => ({videoId: entry.videoId, title: entry.title, duration: entry.duration}))}}
}
