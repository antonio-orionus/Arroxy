import {humanSize} from '@shared/format.js'
import {mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import {sanitizeJobOptions, type ConflictCode, type SanitizeConflict} from '@shared/sanitizeJobOptions.js'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {resolveDownloadProfileOutputDir, type DownloadProfileOutputContext} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileIcon} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import {buildDownloadProfileActionModel} from '@renderer/components/wizard/downloadProfileActions.js'
import {profileAssignmentCounts} from '@renderer/components/wizard/playlistProfileAssignments.js'
import {orderProfileOptionsForAssignment} from '@renderer/components/wizard/playlistProfileOrder.js'
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
	inMultiProfile: boolean
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

export interface MultiProfileBreakdownRow {
	profileId: string
	name: string
	icon: DownloadProfileIcon
	count: number
	outputDir: string
}

// Per-profile grouping for the confirm screen in multi-profile mode, where a
// single formatLabel/preset can't represent the batch — each item may carry
// a different DownloadProfile. Ordered the same way the playlistProfiles
// assignment screen orders its action bar (baseline, then custom, then
// builtin) so the summary matches what the user just saw while assigning.
export function multiProfileBreakdown(state: AppState): MultiProfileBreakdownRow[] {
	const removed = new Set(state.removedPlaylistItemIds)
	const selectedItemIds = state.playlistItems.filter(entry => state.selectedPlaylistItemIds.includes(entry.id) && !removed.has(entry.id)).map(entry => entry.id)

	const model = buildDownloadProfileActionModel(state.settings?.profiles)
	const orderedProfiles = orderProfileOptionsForAssignment(model.options, model.activeRef).map(option => option.profile)
	const counts = profileAssignmentCounts(selectedItemIds, state.playlistProfileAssignments, orderedProfiles, model.activeRef)
	const outputContext: DownloadProfileOutputContext = {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}

	return orderedProfiles.filter(profile => (counts.get(profile.id) ?? 0) > 0).map(profile => ({profileId: profile.id, name: profile.name, icon: profile.icon, count: counts.get(profile.id) ?? 0, outputDir: safeProfileOutputDir(profile, outputContext, state.commonPaths)}))
}

// Mirrors the try/catch at store/downloadHomeView.ts:107-111 — the only other
// renderer call site. resolveDownloadProfileOutputDir throws when a profile
// has no resolvable output dir (downloadProfiles.ts:166,:172), and this runs
// unguarded during React render, so an unhandled throw would white-screen
// StepConfirm instead of just leaving one row's destination blank.
function safeProfileOutputDir(profile: DownloadProfile, outputContext: DownloadProfileOutputContext, commonPaths: AppState['commonPaths']): string {
	try {
		return formatHomeRelativePath(resolveDownloadProfileOutputDir(profile, outputContext), commonPaths)
	} catch {
		return ''
	}
}

export function buildDownloadReview(state: AppState, ctx: DownloadReviewLocaleContext): DownloadReview {
	const inPlaylist = state.wizardMode === 'playlist'
	const inBulk = state.wizardMode === 'bulk'
	const inBatch = inPlaylist || inBulk
	// Multi-profile mode skips the format-selection steps, so `playlistSelection`
	// (if present at all) is stale — it describes whatever the wizard last set,
	// not the heterogeneous per-item profiles this batch actually carries.
	// Computing a single preset label from it would misrepresent the batch.
	const inMultiProfile = inBatch && state.multiProfileMode
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
	const playlistPreset = inMultiProfile ? '' : playlistPresetLabel(state, ctx.t)

	const isAudioPlaylistPreset = !inMultiProfile && !!state.playlistSelection && !mediaIntentSpec(playlistSelectionToMediaIntent(state.playlistSelection)).producesVideo
	const itemsAreAudio = isAudioOnlySource(state.wizardExtractor) || isAudioPlaylistPreset
	const countLabel = inBatch ? itemCountLabel(state, inBulk, itemsAreAudio) : null
	const itemsValue = countLabel ? ctx.t(countLabel.key, countLabel.params) : ''

	const summaryRows: DownloadReviewRow[] = inBatch
		? [
				{key: 'playlist', label: ctx.t(inBulk ? 'wizard.confirm.labelBulk' : 'wizard.confirm.labelPlaylist'), value: inBulk ? ctx.t('wizard.bulk.title') : state.playlistTitle || '—'},
				// No single preset represents a heterogeneous per-item-profile batch —
				// StepConfirm renders the per-profile breakdown instead of this row.
				...(inMultiProfile ? [] : [{key: 'preset', label: ctx.t('wizard.confirm.labelPreset'), value: playlistPreset || '—'}]),
				{key: 'items', label: ctx.t('wizard.confirm.labelItems'), value: itemsValue},
				// Multi-profile mode has no single save-to directory — each item lands
				// in its own assigned profile's output dir. The per-profile breakdown
				// carries that instead of this row misstating one shared destination.
				...(inMultiProfile ? [] : [{key: 'saveTo', label: ctx.t('wizard.confirm.labelSaveTo'), value: shortPath}])
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

	return {
		inPlaylist,
		inBulk,
		inBatch,
		inMultiProfile,
		shortPath,
		videoResolution,
		videoSummary,
		subtitleValue,
		playlistPresetLabel: playlistPreset,
		itemCountLabel: countLabel,
		summaryRows,
		conflictWarnings,
		hasNothingSelected,
		allowedActions: {addToQueue: !hasNothingSelected, downloadNow: !inBatch && !hasNothingSelected}
	}
}
