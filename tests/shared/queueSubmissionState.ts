import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {FormatOption, PlaylistEntry} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import type {ProbeResult, QueueLane} from '@shared/types.js'
import i18next from 'i18next'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {preparePinnedProfileQueueSubmission, type PreparedQueueSubmission, type QueuePreparationEnv} from '@shared/queueSubmission.js'
import type {PinnedDownloadProfile} from '@shared/intake/intakeSchemas.js'
import {displayShowsHdr} from '@renderer/lib/displayHdr.js'
import {generateId} from '@renderer/store/helpers.js'
import {rendererFilenameBinding} from '@renderer/store/wizard/outputTemplates.js'

// The wizard state queue-submission tests start from: one YouTube video with a
// 1080p video track and an Opus audio track, plus a two-item playlist.
export const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p', ext: 'mp4', resolution: '1080p', fps: 30, isVideoOnly: true, isAudioOnly: false, filesize: 1000},
	{formatId: '251', label: 'opus', ext: 'webm', resolution: 'audio only', isVideoOnly: false, isAudioOnly: true, abr: 160, filesize: 200}
]

export const PLAYLIST_ITEMS: PlaylistEntry[] = [
	{id: 'a', title: 'A', url: 'https://youtu.be/a', thumbnail: '', duration: 1, playlistIndex: 1, videoId: 'a'},
	{id: 'b', title: 'B', url: 'https://youtu.be/b', thumbnail: '', duration: 1, playlistIndex: 2, videoId: 'b'}
]

export function wizardState(overrides: Partial<AppState> = {}): AppState {
	return {
		settings: defaultAppSettings('/downloads'),
		wizardMode: 'single',
		wizardUrl: 'https://www.youtube.com/watch?v=abc',
		wizardTitle: 'Video',
		wizardThumbnail: '',
		wizardOutputDir: '/downloads',
		wizardSubfolderEnabled: false,
		wizardSubfolderName: '',
		selectedVideoFormatId: '137',
		audioSelection: {kind: 'native', formatId: '251'},
		wizardMediaKind: 'video',
		wizardFilenameTemplate: '{title} [{id}]',
		wizardFormats: FORMATS,
		wizardFormatSelection: selectionSourceFromOptions(FORMATS),
		wizardSubtitles: {en: [{ext: 'vtt'}]},
		wizardAutomaticCaptions: {},
		wizardSubtitleLanguages: ['en'],
		wizardSubtitleMode: 'sidecar',
		wizardSubtitleFormat: 'srt',
		wizardExtractor: 'youtube',
		wizardExtractorKey: 'Youtube',
		wizardProbeInfoJsonRef: {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'},
		wizardEmbedChapters: true,
		wizardEmbedMetadata: true,
		wizardEmbedThumbnail: false,
		wizardWriteDescription: false,
		wizardWriteThumbnail: false,
		wizardWriteM3u: true,
		wizardSponsorBlockMode: 'off',
		wizardSponsorBlockCategories: [],
		playlistItems: PLAYLIST_ITEMS,
		selectedPlaylistItemIds: ['a', 'b'],
		playlistTitle: 'Playlist',
		playlistId: 'PL',
		playlistIsMultiVideo: false,
		playlistSelection: {kind: 'video', tier: '1080', codec: 'best'},
		queue: [],
		...overrides
	} as AppState
}

/** The active profile, with the folders it resolves against right now. */
export function pinActiveDownloadProfile(state: AppState): PinnedDownloadProfile {
	return {ref: resolveActiveDownloadProfile(state.settings?.profiles).ref, outputContext: {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}}
}

/** Rows get fresh ids, HDR follows this window's screen, names this machine's filesystem. */
export function rendererPreparationEnv(): QueuePreparationEnv {
	return {newId: generateId, profileFormatLabel: profile => profileFormatLabel(profile, i18next.t, i18next.language), displayShowsHdr: displayShowsHdr(), filenames: rendererFilenameBinding()}
}

// A probe prepared with the active profile and the wizard's folder, as main's
// intake prepares a placeholder row's (preparePinnedProfileQueueSubmission).
export function prepareActiveProfileQueueSubmission(probe: ProbeResult, state: AppState, lane: QueueLane, source: {url: string; playlistTitle: string}): PreparedQueueSubmission | null {
	return preparePinnedProfileQueueSubmission(probe, state, lane, source, pinActiveDownloadProfile(state), rendererPreparationEnv())
}
