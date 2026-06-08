// Renderer-side queue slice — pure projection of QueueService (main).
// All mutations route through IPC commands; the queue array is hydrated
// from main's snapshot + diff events.
//
// Shims like addToQueue / addAndDownloadImmediately still build QueueItems
// from wizard state because the wizard data lives in the renderer; once
// built, the items are pushed to main via queue.cmd.add.

import type {DownloadProfile, DownloadProfileRef, PlaylistEntry, PlaylistSelection, ProbeResult, QueueItem, QueueLane} from '@shared/types.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {buildAudioConvertPayload, buildFormatId, buildFormatLabel, generateId, resolveVideoResolution} from './helpers.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import {playlistBaseDir} from '@shared/subfolder.js'
import {resolvePlaylistDir} from './wizard/playlistDir.js'
import {prepareJob} from '@shared/prepareJob.js'
import type {EmbedOptions, PreparedJob, SubtitleOptions} from '@shared/preparedJob.js'
import {sanitizeJobOptions} from '@shared/sanitizeJobOptions.js'
import {downloadProfileLabel, resolveActiveDownloadProfile, resolveDownloadProfile, type ResolvedDownloadProfile} from '@shared/downloadProfiles.js'
import {resolveOutputContainer} from './wizard/resolveContainer.js'
import i18next from 'i18next'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import type {GetState, SetState, QueueSlice} from './types.js'
import {persistFormatPrefs} from './wizard/persistFormatPrefs.js'
import {WizardCommands} from './wizard/commands.js'
import {playlistTitleFallback} from './wizard/playlistTitle.js'

export function maybeShowQueueTip(set: SetState): void {
	if (!localStorage.getItem('arroxy_seen_queue_tip')) {
		localStorage.setItem('arroxy_seen_queue_tip', '1')
		set({drawerOpen: true, showQueueTip: true})
	}
}

function buildSingleQueueItemFromState(get: GetState, lane: QueueLane): QueueItem | null {
	const state = get()
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

export function singleOutputTemplate(includeId: boolean): string {
	return includeId ? '%(title).200B [%(id)s].%(ext)s' : '%(title).200B.%(ext)s'
}

export function playlistOutputTemplate(): string {
	return '%(title).200B [%(id)s].%(ext)s'
}

function profileBaseOutputDir(profile: DownloadProfile, get: GetState): string {
	const state = get()
	if (profile.output.kind === 'fixed') return profile.output.dir
	const currentOutputDir = state.wizardOutputDir.trim()
	if (currentOutputDir) return currentOutputDir
	return state.settings?.common?.defaultOutputDir ?? ''
}

function profileJob(resolved: ResolvedDownloadProfile, extractor: string, extractorKey: string, outputTemplate: string): PreparedJob {
	if (resolved.isSubtitleOnly) {
		return prepareJob({mode: 'single', extractor, extractorKey, activePreset: 'subtitle-only', outputTemplate, subtitles: resolved.subtitles, sponsorBlockMode: 'off', sponsorBlockCategories: [], embed: resolved.embed})
	}

	if (!resolved.intent) throw new Error(`download profile media intent missing for ${downloadProfileRefLabel(resolved.ref)}`)
	return prepareJob({mode: 'playlist', extractor, extractorKey, mediaIntent: resolved.intent, outputTemplate, subtitles: resolved.subtitles, sponsorBlockMode: resolved.sponsorBlock.mode, sponsorBlockCategories: resolved.sponsorBlock.mode === 'off' ? [] : resolved.sponsorBlock.categories, embed: resolved.embed})
}

function downloadProfileRefLabel(ref: DownloadProfileRef): string {
	return `${ref.kind}:${ref.id}`
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

export function buildActiveProfileQueueItemsFromProbe(probe: ProbeResult, get: GetState, lane: QueueLane): {items: QueueItem[]; playlistGroupId?: string; playlistTitle?: string} {
	const {profile, ref} = resolveActiveDownloadProfile(get().settings?.profiles)
	const resolved = resolveDownloadProfile(profile, ref)
	const baseDir = profileBaseOutputDir(profile, get)

	if (probe.kind === 'video') {
		const outputDir = effectiveOutputDir(baseDir, profile.subfolder.enabled, profile.subfolder.name)
		const outputTemplate = singleOutputTemplate(get().settings?.common?.includeIdInSingleFilenames ?? DEFAULTS.includeIdInSingleFilenames)
		const item = buildProfileEntryQueueItem({entry: {url: get().wizardUrl || probe.webpageUrl, title: probe.title, thumbnail: probe.thumbnail}, outputDir, extractor: probe.extractor, extractorKey: probe.extractorKey, resolved, profile, outputTemplate, writeM3u: false, lane})
		return {items: [item]}
	}

	const playlistGroupId = generateId()
	const outputDir = playlistBaseDir(baseDir, profile.subfolder.enabled, profile.subfolder.name, probe.playlistTitle)
	const writeM3u = get().settings?.common?.writeM3u ?? DEFAULTS.writeM3u
	return {playlistGroupId, playlistTitle: probe.playlistTitle, items: probe.entries.map(entry => buildProfileEntryQueueItem({entry, outputDir, extractor: probe.extractor, extractorKey: probe.extractorKey, resolved, profile, outputTemplate: playlistOutputTemplate(), playlistGroupId, writeM3u, lane}))}
}

function resolvePlaylistFormatLabel(s: PlaylistSelection): string {
	if (s.kind === 'audio') {
		if (s.format === 'best') return i18next.t('playlistPresets.audioFormat.best')
		return i18next.t('playlistPresets.audioFormatBitrate', {format: s.format.toUpperCase(), kbps: s.bitrateKbps ?? 192})
	}
	const tierLabel = i18next.t(`playlistPresets.tier.${s.tier}` as const)
	if (s.codec === 'mp4') return `MP4 / Smart TV · ${tierLabel}`
	return tierLabel
}

function buildPlaylistQueueItem(entry: PlaylistEntry, get: GetState, playlistGroupId: string, lane: QueueLane): QueueItem {
	const state = get()
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

async function submitWizardToQueue(set: SetState, get: GetState, lane: QueueLane): Promise<void> {
	// Re-entry guard: large playlists (e.g. 290 entries) take a perceptible
	// moment to enumerate, serialize over IPC, and commit on the main process.
	// Without this, a user who thinks the app froze will click the button again
	// and end up with duplicate queue items. Pair with `isSubmittingToQueue`
	// being read by StepConfirm to also disable the buttons.
	if (get().isSubmittingToQueue) return
	const stateBeforeSubmit = get()
	if (stateBeforeSubmit.wizardMode === 'bulk') {
		bulkLogger.info('Bulk queue submission requested', {
			lane,
			selectedCount: stateBeforeSubmit.selectedPlaylistItemIds.length,
			total: stateBeforeSubmit.playlistItems.length,
			metadataStatus: stateBeforeSubmit.bulkMetadataStatus,
			metadataCompleted: stateBeforeSubmit.bulkMetadataCompleted,
			metadataTotal: stateBeforeSubmit.bulkMetadataTotal
		})
		get().cancelBulkMetadata('queue-submit')
	}
	set({isSubmittingToQueue: true})
	try {
		const {playlistItems, selectedPlaylistItemIds} = get()
		if (get().wizardMode !== 'single') {
			const groupId = generateId()
			const selected = playlistItems.filter(e => selectedPlaylistItemIds.includes(e.id))
			if (selected.length === 0) return
			const items = selected.map(e => buildPlaylistQueueItem(e, get, groupId, lane))
			const baseDir = items[0]?.outputDir ?? get().wizardOutputDir
			// Manifest drives post-completion M3U generation; a failure (returned or
			// thrown) only forfeits that convenience artifact, so log and never let it
			// block enqueueing the actual download.
			//
			// Register the FULL probed playlist (`playlistItems`), not just the queued
			// `selected` subset: the M3U is rebuilt from the manifest ∩ files-on-disk
			// (see buildM3u), so carrying every entry lets a sync re-add of a grown
			// playlist append the new videos to the complete ordered M3U.
			if (get().wizardMode === 'playlist') {
				try {
					const manifestRes = await window.appApi.playlist.registerManifest({playlistGroupId: groupId, playlistTitle: get().playlistTitle || 'Playlist', outputDir: baseDir, items: playlistItems.map(e => ({videoId: e.videoId, title: e.title, duration: e.duration}))})
					if (!manifestRes.ok) console.warn('playlist manifest registration failed; M3U will be skipped', manifestRes.error)
				} catch (err) {
					console.warn('playlist manifest registration threw; M3U will be skipped', err)
				}
			}
			await window.appApi.queue.cmd.add(items)
		} else {
			const item = buildSingleQueueItemFromState(get, lane)
			if (!item) return
			await window.appApi.queue.cmd.add([item])
		}
		maybeShowQueueTip(set)
		await persistFormatPrefs(set, get)
		get().reset()
	} finally {
		set({isSubmittingToQueue: false})
	}
}

async function queueLoadedPlaylistWithActiveProfile(set: SetState, get: GetState, lane: QueueLane): Promise<void> {
	if (get().isSubmittingToQueue) return
	const state = get()
	if (state.playlistItems.length === 0) return

	set({isSubmittingToQueue: true})
	try {
		const probe: Extract<ProbeResult, {kind: 'playlist'}> = {
			kind: 'playlist',
			extractor: state.wizardExtractor,
			extractorKey: state.wizardExtractorKey,
			webpageUrl: state.wizardWebpageUrl || state.wizardUrl,
			isAudioOnlySource: false,
			playlistTitle: state.playlistTitle || 'Playlist',
			playlistId: state.playlistId,
			isMultiVideo: state.playlistIsMultiVideo,
			entries: state.playlistItems
		}
		const prepared = buildActiveProfileQueueItemsFromProbe(probe, get, lane)
		if (prepared.items.length === 0) return

		if (prepared.playlistGroupId) {
			try {
				const manifestRes = await window.appApi.playlist.registerManifest({
					playlistGroupId: prepared.playlistGroupId,
					playlistTitle: playlistTitleFallback(prepared.playlistTitle, state.playlistTitle),
					outputDir: prepared.items[0]?.outputDir ?? state.wizardOutputDir,
					items: state.playlistItems.map(e => ({videoId: e.videoId, title: e.title, duration: e.duration}))
				})
				if (!manifestRes.ok) console.warn('playlist manifest registration failed; M3U will be skipped', manifestRes.error)
			} catch (err) {
				console.warn('playlist manifest registration threw; M3U will be skipped', err)
			}
		}

		const addResult = await window.appApi.queue.cmd.add(prepared.items)
		if (!addResult.ok) {
			set({quickDownloadStatus: 'error', quickDownloadError: addResult.error.message, quickPlaylistCapDialogOpen: false})
			return
		}

		maybeShowQueueTip(set)
		WizardCommands.resetAll(set)
		set({quickDownloadStatus: 'queued', quickDownloadError: null})
	} finally {
		set({isSubmittingToQueue: false})
	}
}

export function createQueueSlice(set: SetState, get: GetState): QueueSlice {
	return {
		queue: [],
		isSubmittingToQueue: false,

		// "+ Queue" → normal lane: respects cap=1, waits for the active slot.
		// "Pull it!" → priority lane: spawns alongside running normal items,
		// gated by maxConcurrent ceiling. Both go through the same builder; the
		// only difference is the lane stamped on the QueueItem.
		addToQueue: () => submitWizardToQueue(set, get, 'normal'),

		addAndDownloadImmediately: () => submitWizardToQueue(set, get, 'priority'),

		queueLoadedPlaylistWithActiveProfile: () => queueLoadedPlaylistWithActiveProfile(set, get, 'normal'),

		setItemLane: async (itemId, lane) => {
			await window.appApi.queue.cmd.setLane({itemId, lane})
		},

		cancelItemDownload: async itemId => {
			await window.appApi.queue.cmd.cancel({itemId})
		},

		pauseItemDownload: async itemId => {
			await window.appApi.queue.cmd.pause({itemId})
		},

		resumeItemDownload: async itemId => {
			await window.appApi.queue.cmd.resume({itemId})
		},

		removeQueueItem: async itemId => {
			await window.appApi.queue.cmd.remove({itemId})
		},

		retryQueueItem: async itemId => {
			await window.appApi.queue.cmd.retry({itemId})
		},

		clearCompleted: async () => {
			await window.appApi.queue.cmd.clearCompleted()
		},

		// Delegated to QueueService — the global pauseAll/resumeAll route flips
		// the scheduler-paused flag atomically with the per-item pause/resume so
		// pause-all can't auto-spawn the next pending item mid-flight.
		pauseAll: async () => {
			await window.appApi.queue.cmd.pauseAll()
		},

		resumeAll: async () => {
			await window.appApi.queue.cmd.resumeAll()
		},

		cancelAll: async () => {
			await window.appApi.queue.cmd.cancel({itemId: null})
		},

		openItemFolder: async itemId => {
			const item = get().queue.find(i => i.id === itemId)
			if (!item) return
			await window.appApi.shell.openFolder(item.outputDir)
		},

		openItemUrl: itemId => {
			const item = get().queue.find(i => i.id === itemId)
			if (!item) return
			void window.appApi.shell.openExternal(item.url)
		}
	}
}
