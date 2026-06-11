import {DEFAULTS} from '@shared/constants.js'
import {downloadProfileLabel, resolveActiveDownloadProfile, resolveDownloadProfile, resolveDownloadProfileBaseDir, resolveDownloadProfileOutputDir, type ResolvedDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef, PlaylistEntry, PlaylistSelection, ProbeResult, QueueItem, QueueLane} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {EmbedOptions, SubtitleOptions} from '@shared/preparedJob.js'
import {prepareJob} from '@shared/prepareJob.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {sanitizeJobOptions} from '@shared/sanitizeJobOptions.js'
import {playlistBaseDir} from '@shared/subfolder.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import i18next from 'i18next'
import type {AppState} from '../types.js'
import {buildAudioConvertPayload, buildFormatId, buildFormatLabel, generateId, resolveVideoResolution} from '../helpers.js'
import {resolveOutputContainer} from './resolveContainer.js'
import {resolvePlaylistDir} from './playlistDir.js'
import {playlistOutputTemplate, singleOutputTemplate} from './outputTemplates.js'
import {playlistTitleFallback} from './playlistTitle.js'

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
	const outputDir = effectiveOutputDir(wizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName)

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
		outputTemplate: singleOutputTemplate(state.settings?.common?.includeIdInSingleFilenames ?? DEFAULTS.includeIdInSingleFilenames),
		subtitles,
		sponsorBlockMode: overrides.sponsorBlockMode,
		sponsorBlockCategories: state.wizardSponsorBlockCategories,
		embed: overrides.embed
	})

	return {id: generateId(), url: wizardUrl, title: wizardTitle || wizardUrl, thumbnail: wizardThumbnail, outputDir, formatLabel, status: QUEUE_STATUS.pending, lane, progressPercent: 0, progressDetail: null, lastStatus: null, error: null, finishedAt: null, writeM3u: state.wizardWriteM3u, job}
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

function buildPlaylistQueueItem(entry: PlaylistEntry, state: AppState, playlistGroupId: string, lane: QueueLane): QueueItem {
	const {playlistSelection} = state
	if (!playlistSelection) throw new Error('playlist selection missing')

	const baseDir = resolvePlaylistDir(state)

	const formatLabel = resolvePlaylistFormatLabel(playlistSelection)
	const outputTemplate = playlistOutputTemplate()

	const embed: EmbedOptions = {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail}

	const job = prepareJob({mode: 'playlist', extractor: state.wizardExtractor, extractorKey: state.wizardExtractorKey, playlistSelection, outputTemplate, sponsorBlockMode: state.wizardSponsorBlockMode, sponsorBlockCategories: state.wizardSponsorBlockCategories, embed})

	return {
		id: generateId(),
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
		finishedAt: null,
		...(state.wizardMode === 'playlist' ? {playlistGroupId} : {}),
		writeM3u: state.wizardMode === 'playlist' ? state.wizardWriteM3u : false,
		job
	}
}

function playlistManifestPayload(state: AppState, playlistGroupId: string, outputDir: string): PlaylistManifestPayload {
	return {playlistGroupId, playlistTitle: state.playlistTitle || 'Playlist', outputDir, items: state.playlistItems.map(e => ({videoId: e.videoId, title: e.title, duration: e.duration}))}
}

export function prepareManualQueueSubmission(state: AppState, lane: QueueLane): PreparedQueueSubmission | null {
	if (state.wizardMode === 'single') {
		const item = buildSingleQueueItemFromState(state, lane)
		return item ? {items: [item]} : null
	}

	const playlistGroupId = generateId()
	const selected = state.playlistItems.filter(e => state.selectedPlaylistItemIds.includes(e.id))
	if (selected.length === 0) return null
	const items = selected.map(e => buildPlaylistQueueItem(e, state, playlistGroupId, lane))
	const baseDir = items[0]?.outputDir ?? state.wizardOutputDir
	return {items, ...(state.wizardMode === 'playlist' ? {manifest: playlistManifestPayload(state, playlistGroupId, baseDir)} : {})}
}

function downloadProfileRefLabel(ref: DownloadProfileRef): string {
	return `${ref.kind}:${ref.id}`
}

function profileJob(resolved: ResolvedDownloadProfile, extractor: string, extractorKey: string, outputTemplate: string): PreparedJob {
	if (resolved.isSubtitleOnly) {
		return prepareJob({mode: 'single', extractor, extractorKey, activePreset: 'subtitle-only', outputTemplate, subtitles: resolved.subtitles, sponsorBlockMode: 'off', sponsorBlockCategories: [], embed: resolved.embed})
	}

	if (!resolved.intent) throw new Error(`download profile media intent missing for ${downloadProfileRefLabel(resolved.ref)}`)
	return prepareJob({mode: 'playlist', extractor, extractorKey, mediaIntent: resolved.intent, outputTemplate, subtitles: resolved.subtitles, sponsorBlockMode: resolved.sponsorBlock.mode, sponsorBlockCategories: resolved.sponsorBlock.mode === 'off' ? [] : resolved.sponsorBlock.categories, embed: resolved.embed})
}

function buildProfileEntryQueueItem(params: {
	entry: Pick<PlaylistEntry, 'url' | 'title' | 'thumbnail'>
	outputDir: string
	extractor: string
	extractorKey: string
	resolved: ResolvedDownloadProfile
	profile: DownloadProfile
	outputTemplate: string
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
		finishedAt: null,
		...(params.playlistGroupId ? {playlistGroupId: params.playlistGroupId} : {}),
		writeM3u: params.writeM3u,
		job: profileJob(params.resolved, params.extractor, params.extractorKey, params.outputTemplate)
	}
}

export function prepareActiveProfileQueueSubmission(probe: ProbeResult, state: AppState, lane: QueueLane): PreparedQueueSubmission | null {
	const {profile, ref} = resolveActiveDownloadProfile(state.settings?.profiles)
	const resolved = resolveDownloadProfile(profile, ref)
	const outputContext = {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}
	const baseDir = resolveDownloadProfileBaseDir(profile, outputContext)
	const singleOutputDir = resolveDownloadProfileOutputDir(profile, outputContext)

	if (probe.kind === 'video') {
		const outputTemplate = singleOutputTemplate(state.settings?.common?.includeIdInSingleFilenames ?? DEFAULTS.includeIdInSingleFilenames)
		const item = buildProfileEntryQueueItem({entry: {url: state.wizardUrl || probe.webpageUrl, title: probe.title, thumbnail: probe.thumbnail}, outputDir: singleOutputDir, extractor: probe.extractor, extractorKey: probe.extractorKey, resolved, profile, outputTemplate, writeM3u: false, lane})
		return {items: [item]}
	}

	const playlistGroupId = generateId()
	const outputDir = playlistBaseDir(baseDir, profile.subfolder.enabled, profile.subfolder.name, probe.playlistTitle)
	const writeM3u = state.settings?.common?.writeM3u ?? DEFAULTS.writeM3u
	const items = probe.entries.map(entry => buildProfileEntryQueueItem({entry, outputDir, extractor: probe.extractor, extractorKey: probe.extractorKey, resolved, profile, outputTemplate: playlistOutputTemplate(), playlistGroupId, writeM3u, lane}))
	if (items.length === 0) return null
	return {items, manifest: {playlistGroupId, playlistTitle: playlistTitleFallback(probe.playlistTitle, state.playlistTitle), outputDir, items: probe.entries.map(entry => ({videoId: entry.videoId, title: entry.title, duration: entry.duration}))}}
}
