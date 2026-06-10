import {humanSize} from '@shared/format.js'
import {mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import {sanitizeJobOptions, type ConflictCode, type SanitizeConflict} from '@shared/sanitizeJobOptions.js'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import {resolveSubtitleLabel, SUBTITLE_MODE_I18N_KEYS} from '../../lib/subtitleLabel.js'
import {presetLabel, resolveAudioLabel, resolveVideoResolution} from '../helpers.js'
import type {AppState} from '../types.js'
import {resolveOutputContainer} from './resolveContainer.js'

type Translate = (key: string, params?: Record<string, unknown>) => string

export interface DownloadReviewLocaleContext {
	t: Translate
	language: string
	commonPaths: AppState['commonPaths']
}

export interface DownloadReviewRow {
	key: string
	label: string
	value: string
}

export interface ItemCountLabel {
	key: string
	params: {count: number; total: string}
}

export interface DownloadReview {
	inPlaylist: boolean
	inBulk: boolean
	inBatch: boolean
	shortPath: string
	videoResolution: string
	videoSummary: string
	subtitleValue: string
	playlistPresetLabel: string
	itemCountLabel: ItemCountLabel | null
	summaryRows: DownloadReviewRow[]
	conflictWarnings: UserVisibleConflict[]
	hasNothingSelected: boolean
	allowedActions: {addToQueue: boolean; downloadNow: boolean}
}

const USER_VISIBLE_CONFLICT_CODES = ['thumbnailEmbedNotSupported', 'subtitleEmbedAudioOnly'] as const satisfies readonly ConflictCode[]
type UserVisibleConflictCode = (typeof USER_VISIBLE_CONFLICT_CODES)[number]
type UserVisibleConflict = SanitizeConflict & {code: UserVisibleConflictCode}

const CONFLICT_LABEL_KEYS = {thumbnailEmbedNotSupported: 'wizard.confirm.thumbnailEmbedNotSupported', subtitleEmbedAudioOnly: 'wizard.confirm.subtitleEmbedAudioOnly'} as const satisfies Record<UserVisibleConflictCode, string>

const USER_VISIBLE_CONFLICTS: ReadonlySet<ConflictCode> = new Set(USER_VISIBLE_CONFLICT_CODES)

function isUserVisibleConflict(conflict: SanitizeConflict): conflict is UserVisibleConflict {
	return USER_VISIBLE_CONFLICTS.has(conflict.code)
}

export function conflictLabelKey(code: UserVisibleConflictCode): (typeof CONFLICT_LABEL_KEYS)[UserVisibleConflictCode] {
	return CONFLICT_LABEL_KEYS[code]
}

function playlistPresetLabel(state: AppState, t: Translate): string {
	const {playlistSelection} = state
	if (!playlistSelection) return ''
	if (playlistSelection.kind === 'audio') {
		if (playlistSelection.format === 'best') return t('playlistPresets.audioFormat.best')
		return t('playlistPresets.audioFormatBitrate', {format: playlistSelection.format.toUpperCase(), kbps: playlistSelection.bitrateKbps ?? 192})
	}
	const tierLabel = t(`playlistPresets.tier.${playlistSelection.tier}`)
	return playlistSelection.codec === 'mp4' ? `${t('playlistPresets.videoFormat.mp4')} · ${tierLabel}` : tierLabel
}

function buildSubtitleValue(state: AppState, effectiveSubtitleLanguages: string[], ctx: DownloadReviewLocaleContext): string {
	if (effectiveSubtitleLanguages.length === 0) return ctx.t('wizard.confirm.subtitlesNone')
	const langList = effectiveSubtitleLanguages.map(code => resolveSubtitleLabel(code, state.wizardSubtitles, state.wizardAutomaticCaptions, ctx.language)).join(', ')
	const modeLabel = ctx.t(SUBTITLE_MODE_I18N_KEYS[state.wizardSubtitleMode])
	const formatPart = state.wizardSubtitleMode !== 'embed' ? `${state.wizardSubtitleFormat.toUpperCase()} · ` : ''
	return `${langList} · ${formatPart}${modeLabel}`
}

function itemCountLabel(state: AppState, inBulk: boolean, itemsAreAudio: boolean): ItemCountLabel {
	return {key: inBulk ? 'wizard.confirm.itemsValueBulk' : itemsAreAudio ? 'wizard.confirm.itemsValueAudio' : 'wizard.confirm.itemsValue', params: {count: state.selectedPlaylistItemIds.length, total: String(state.playlistItems.length)}}
}

export function buildDownloadReview(state: AppState, ctx: DownloadReviewLocaleContext): DownloadReview {
	const inPlaylist = state.wizardMode === 'playlist'
	const inBulk = state.wizardMode === 'bulk'
	const inBatch = inPlaylist || inBulk
	const effectiveSubtitleLanguages = state.wizardSubtitleSkipped ? [] : state.wizardSubtitleLanguages

	const audioFormats = state.wizardFormats.filter(f => f.isAudioOnly)
	const videoResolution = resolveVideoResolution(state.selectedVideoFormatId, state.wizardFormats, ctx.t('wizard.confirm.audioOnly'))
	const audioLabel = resolveAudioLabel(state.audioSelection, audioFormats)
	const videoSummary = state.activePreset ? presetLabel(state.activePreset) : state.selectedVideoFormatId === '' ? ctx.t('wizard.confirm.audioOnly') : videoResolution

	const selectedFormat = state.wizardFormats.find(f => f.formatId === state.selectedVideoFormatId)
	const estimatedSize = selectedFormat?.filesize ? `~${humanSize(selectedFormat.filesize)}` : ctx.t('wizard.confirm.sizeUnknown')

	const finalDir = effectiveOutputDir(state.wizardOutputDir, state.wizardSubfolderEnabled, state.wizardSubfolderName)
	const shortPath = formatHomeRelativePath(finalDir, ctx.commonPaths)
	const subtitleValue = buildSubtitleValue(state, effectiveSubtitleLanguages, ctx)
	const playlistPreset = playlistPresetLabel(state, ctx.t)

	const isAudioPlaylistPreset = !!state.playlistSelection && !mediaIntentSpec(playlistSelectionToMediaIntent(state.playlistSelection)).producesVideo
	const itemsAreAudio = isAudioOnlySource(state.wizardExtractor) || isAudioPlaylistPreset
	const countLabel = inBatch ? itemCountLabel(state, inBulk, itemsAreAudio) : null
	const itemsValue = countLabel ? ctx.t(countLabel.key, countLabel.params) : ''

	const summaryRows: DownloadReviewRow[] = inBatch
		? [
				{key: 'playlist', label: ctx.t(inBulk ? 'wizard.confirm.labelBulk' : 'wizard.confirm.labelPlaylist'), value: inBulk ? ctx.t('wizard.bulk.title') : state.playlistTitle || '—'},
				{key: 'preset', label: ctx.t('wizard.confirm.labelPreset'), value: playlistPreset || '—'},
				{key: 'items', label: ctx.t('wizard.confirm.labelItems'), value: itemsValue},
				{key: 'saveTo', label: ctx.t('wizard.confirm.labelSaveTo'), value: shortPath}
			]
		: [
				{key: 'video', label: ctx.t('wizard.confirm.labelVideo'), value: videoSummary},
				{key: 'audio', label: ctx.t('wizard.confirm.labelAudio'), value: audioLabel},
				{key: 'subtitles', label: ctx.t('wizard.confirm.labelSubtitles'), value: subtitleValue},
				{key: 'saveTo', label: ctx.t('wizard.confirm.labelSaveTo'), value: shortPath},
				{key: 'size', label: ctx.t('wizard.confirm.labelSize'), value: estimatedSize}
			]

	const hasNothingSelected = inBatch ? !state.playlistSelection || state.selectedPlaylistItemIds.length === 0 : state.selectedVideoFormatId === '' && state.audioSelection.kind === 'none' && effectiveSubtitleLanguages.length === 0

	const allConflicts: SanitizeConflict[] = !inBatch
		? sanitizeJobOptions({
				isSubtitleOnly: state.activePreset === 'subtitle-only',
				hasVideoTrack: state.selectedVideoFormatId !== '',
				resolvedOutputContainer: resolveOutputContainer(state.selectedVideoFormatId, state.audioSelection, state.wizardSubtitleMode, state.wizardFormats, state.activePreset),
				subtitleMode: state.wizardSubtitleMode,
				subtitleLanguages: effectiveSubtitleLanguages,
				embed: {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail},
				sponsorBlockMode: state.wizardSponsorBlockMode
			}).conflicts
		: []
	const conflictWarnings: UserVisibleConflict[] = allConflicts.filter(isUserVisibleConflict)

	return {inPlaylist, inBulk, inBatch, shortPath, videoResolution, videoSummary, subtitleValue, playlistPresetLabel: playlistPreset, itemCountLabel: countLabel, summaryRows, conflictWarnings, hasNothingSelected, allowedActions: {addToQueue: !hasNothingSelected, downloadNow: !inBatch && !hasNothingSelected}}
}
