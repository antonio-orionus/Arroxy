import {humanSize} from '@shared/format.js'
import {scaleBytesToPart} from '@shared/videoPart.js'
import {sanitizeJobOptions, type ConflictCode, type SanitizeConflict} from '@shared/sanitizeJobOptions.js'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {allDownloadProfiles, resolveActiveDownloadProfile, resolveDownloadProfileOutputDir, type DownloadProfileOutputContext} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileIcon} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import {profileDisplayName} from '@renderer/lib/profileName.js'
import {profilePickerOptions} from '@renderer/components/wizard/profilePickerOptions.js'
import {formatList, resolveSubtitleLabel, SUBTITLE_MODE_I18N_KEYS} from '../../lib/subtitleLabel.js'
import {resolveAudioLabel, resolveVideoResolution} from '../helpers.js'
import type {AppState, AudioSelection} from '../types.js'
import type {WizardReviewState} from './wizardReviewState.js'
import {resolveOutputContainer} from './resolveContainer.js'
import {profileAssignmentCounts} from './playlistProfileAssignments.js'
import {wizardVideoPart} from './videoPart.js'

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

const USER_VISIBLE_CONFLICT_CODES = ['thumbnailEmbedNotSupported', 'subtitleEmbedAudioOnly', 'subtitleEmbedForcesMkv'] as const satisfies readonly ConflictCode[]
type UserVisibleConflictCode = (typeof USER_VISIBLE_CONFLICT_CODES)[number]
type UserVisibleConflict = SanitizeConflict & {code: UserVisibleConflictCode}

const CONFLICT_LABEL_KEYS = {thumbnailEmbedNotSupported: 'wizard.confirm.thumbnailEmbedNotSupported', subtitleEmbedAudioOnly: 'wizard.confirm.subtitleEmbedAudioOnly', subtitleEmbedForcesMkv: 'wizard.confirm.subtitleEmbedForcesMkv'} as const satisfies Record<UserVisibleConflictCode, string>

const USER_VISIBLE_CONFLICTS: ReadonlySet<ConflictCode> = new Set(USER_VISIBLE_CONFLICT_CODES)

function isUserVisibleConflict(conflict: SanitizeConflict): conflict is UserVisibleConflict {
	return USER_VISIBLE_CONFLICTS.has(conflict.code)
}

export function conflictLabelKey(code: UserVisibleConflictCode): (typeof CONFLICT_LABEL_KEYS)[UserVisibleConflictCode] {
	return CONFLICT_LABEL_KEYS[code]
}

function playlistPresetLabel(state: WizardReviewState, t: Translate, language: string): string {
	const {playlistSelection} = state
	if (!playlistSelection) return ''
	if (playlistSelection.kind === 'subtitles') {
		const languages = formatList(
			playlistSelection.languages.map(code => resolveSubtitleLabel(code, {}, {}, language)),
			language,
			'conjunction'
		)
		return [t('wizard.formats.kind.subtitles'), languages, playlistSelection.format.toUpperCase()].filter(part => part.length > 0).join(' · ')
	}
	if (playlistSelection.kind === 'audio') {
		if (playlistSelection.format === 'best') return t('playlistPresets.audioFormat.best')
		return t('playlistPresets.audioFormatBitrate', {format: playlistSelection.format.toUpperCase(), kbps: playlistSelection.bitrateKbps ?? 192})
	}
	const tierLabel = t(`playlistPresets.tier.${playlistSelection.tier}`)
	return playlistSelection.codec === 'mp4' ? `${t('playlistPresets.videoFormat.mp4')} · ${tierLabel}` : tierLabel
}

function buildSubtitleValue(state: WizardReviewState, effectiveSubtitleLanguages: string[], ctx: DownloadReviewLocaleContext): string {
	if (effectiveSubtitleLanguages.length === 0) return ctx.t('wizard.confirm.subtitlesNone')
	const langList = formatList(
		effectiveSubtitleLanguages.map(code => resolveSubtitleLabel(code, state.wizardSubtitles, state.wizardAutomaticCaptions, ctx.language)),
		ctx.language,
		'conjunction'
	)
	const modeLabel = ctx.t(SUBTITLE_MODE_I18N_KEYS[state.wizardSubtitleMode])
	const formatPart = state.wizardSubtitleMode !== 'embed' ? `${state.wizardSubtitleFormat.toUpperCase()} · ` : ''
	return `${langList} · ${formatPart}${modeLabel}`
}

function itemCountLabel(state: WizardReviewState, inBulk: boolean, itemsAreAudio: boolean): ItemCountLabel {
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
// a different DownloadProfile. In the user's saved profile order, like the
// assignment screen's pickers.
export function multiProfileBreakdown(state: WizardReviewState): MultiProfileBreakdownRow[] {
	const selectedIdSet = new Set(state.selectedPlaylistItemIds)
	const removedIdSet = new Set(state.removedPlaylistItemIds)
	const selectedItemIds = state.playlistItems.filter(entry => selectedIdSet.has(entry.id) && !removedIdSet.has(entry.id)).map(entry => entry.id)

	// Resolved like the queued downloads are (every saved profile, hidden ones too), listed like every profile picker.
	const prefs = state.settings?.profiles
	const profiles = allDownloadProfiles(prefs)
	const counts = profileAssignmentCounts(selectedItemIds, state.playlistProfileAssignments, profiles, resolveActiveDownloadProfile(prefs).ref)
	const orderedProfiles = profilePickerOptions(prefs, {current: null, inUse: profiles.filter(profile => counts.has(profile.id))}).map(option => option.profile)
	const outputContext: DownloadProfileOutputContext = {currentOutputDir: state.wizardOutputDir, defaultOutputDir: state.settings?.common?.defaultOutputDir ?? ''}

	return orderedProfiles.filter(profile => (counts.get(profile.id) ?? 0) > 0).map(profile => ({profileId: profile.id, name: profileDisplayName(profile), icon: profile.icon, count: counts.get(profile.id) ?? 0, outputDir: safeProfileOutputDir(profile, outputContext, state.commonPaths)}))
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

// What the single-video run's options can't do together (a thumbnail an audio
// file can't hold, subtitles inside a file with no video). Cheap on its own, for
// a footer that must not rebuild the whole review on every store change.
export function singleConflictWarnings(state: WizardReviewState): UserVisibleConflict[] {
	const kind = state.wizardMediaKind
	const videoId = kind === 'video' ? state.selectedVideoFormatId : ''
	const audio: AudioSelection = kind === 'subtitles' ? {kind: 'none'} : state.audioSelection
	const conflicts: SanitizeConflict[] = sanitizeJobOptions({
		isSubtitleOnly: kind === 'subtitles',
		hasVideoTrack: videoId !== '',
		resolvedOutputContainer: resolveOutputContainer(videoId, audio, state.wizardSubtitleMode, state.wizardFormats, kind, state.wizardEmbedThumbnail, kind === 'video' ? state.wizardFileType : 'auto'),
		requestedFileType: kind === 'video' ? state.wizardFileType : 'auto',
		subtitleMode: state.wizardSubtitleMode,
		subtitleLanguages: state.wizardSubtitleLanguages,
		embed: {chapters: state.wizardEmbedChapters, metadata: state.wizardEmbedMetadata, thumbnail: state.wizardEmbedThumbnail, description: state.wizardWriteDescription, thumbnailSidecar: state.wizardWriteThumbnail},
		sponsorBlockMode: state.wizardSponsorBlockMode
	}).conflicts
	return conflicts.filter(isUserVisibleConflict)
}

export function buildDownloadReview(state: WizardReviewState, ctx: DownloadReviewLocaleContext): DownloadReview {
	const inPlaylist = state.wizardMode === 'playlist'
	const inBulk = state.wizardMode === 'bulk'
	const inBatch = inPlaylist || inBulk
	// Multi-profile mode skips the format-selection steps, so `playlistSelection`
	// (if present at all) is stale — it describes whatever the wizard last set,
	// not the heterogeneous per-item profiles this batch actually carries.
	// Computing a single preset label from it would misrepresent the batch.
	const inMultiProfile = inBatch && state.multiProfileMode
	const effectiveSubtitleLanguages = state.wizardSubtitleLanguages
	const kind = state.wizardMediaKind
	const videoId = kind === 'video' ? state.selectedVideoFormatId : ''
	const audio: AudioSelection = kind === 'subtitles' ? {kind: 'none'} : state.audioSelection

	const audioFormats = state.wizardFormats.filter(f => f.isAudioOnly)
	const videoResolution = resolveVideoResolution(videoId, state.wizardFormats, ctx.t('wizard.confirm.audioOnly'))
	const audioLabel = resolveAudioLabel(audio, audioFormats, state.wizardFormatSelection)
	const videoSummary = kind === 'subtitles' ? ctx.t('wizard.formats.kind.subtitles') : kind === 'audio' ? ctx.t('wizard.confirm.audioOnly') : videoResolution

	const nativeAudioId = audio.kind === 'native' ? audio.formatId : null
	const sizes = [videoId, nativeAudioId].flatMap(id => (id ? [state.wizardFormats.find(f => f.formatId === id)?.filesize] : []))
	const wholeSize = sizes.length > 0 && sizes.every((size): size is number => size !== undefined) ? sizes.reduce((a, b) => a + b, 0) : undefined
	const totalSize = scaleBytesToPart(wholeSize, inBatch ? null : wizardVideoPart(state), state.wizardDuration)
	const estimatedSize = totalSize ? `~${humanSize(totalSize, ctx.language)}` : ctx.t('wizard.confirm.sizeUnknown')

	const finalDir = effectiveOutputDir(state.wizardOutputDir, state.wizardSubfolderEnabled, state.wizardSubfolderName)
	const shortPath = formatHomeRelativePath(finalDir, ctx.commonPaths)
	const subtitleValue = buildSubtitleValue(state, effectiveSubtitleLanguages, ctx)
	const playlistPreset = inMultiProfile ? '' : playlistPresetLabel(state, ctx.t, ctx.language)

	const isAudioPlaylistPreset = !inMultiProfile && state.playlistSelection?.kind === 'audio'
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

	// Multi-profile mode never visits the presets step, so a leftover empty
	// subtitles selection says nothing about a batch whose items carry profiles.
	const batchHasNoLanguages = !inMultiProfile && state.playlistSelection?.kind === 'subtitles' && state.playlistSelection.languages.length === 0
	const hasNothingSelected = inBatch ? !state.playlistSelection || batchHasNoLanguages || state.selectedPlaylistItemIds.length === 0 : kind === 'subtitles' ? effectiveSubtitleLanguages.length === 0 : kind === 'audio' ? audio.kind === 'none' : videoId === ''

	const conflictWarnings: UserVisibleConflict[] = inBatch ? [] : singleConflictWarnings(state)

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
