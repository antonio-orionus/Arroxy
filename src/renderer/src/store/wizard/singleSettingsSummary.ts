// One-line values for everything the single-video Review holds, shared by the
// Format screen's summary line and the Review rows' collapsed values.

import {isYouTubeExtractor} from '@shared/ytdlp/extractorPredicates.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import {formatList, resolveSubtitleLabel, SUBTITLE_MODE_I18N_KEYS} from '../../lib/subtitleLabel.js'
import type {AppState} from '../types.js'
import type {WizardReviewState} from './wizardReviewState.js'
import {videoPartSuffix} from '@shared/videoPart.js'
import {wizardVideoPart} from './videoPart.js'
import {EMBED_FIELDS, EMBED_OPTION_KEYS, SPONSOR_BLOCK_MODE_LABEL_KEYS} from '@renderer/lib/outputLabels.js'

type Translate = (key: string, params?: Record<string, unknown>) => string

export interface SingleSettingsSummary {
	subtitles: string
	subtitlesOn: boolean
	subtitlesAvailable: number
	// Null when SponsorBlock doesn't apply (not YouTube, or nothing with video).
	sponsorBlock: string | null
	extras: string
	extrasOn: boolean
	saveTo: string
	fileName: string
}

// The run's extras switches, by the profile embed field each one sets.
const EXTRA_FIELDS = [
	['wizardEmbedChapters', 'chapters'],
	['wizardEmbedMetadata', 'metadata'],
	['wizardEmbedThumbnail', 'thumbnail'],
	['wizardWriteDescription', 'description'],
	['wizardWriteThumbnail', 'thumbnailSidecar']
] as const satisfies readonly (readonly [keyof WizardReviewState, (typeof EMBED_FIELDS)[number]])[]

// Not for a part of the video: SponsorBlock's segments are timed against the
// whole video.
export function sponsorBlockApplies(state: Pick<AppState, 'wizardExtractor' | 'wizardMediaKind' | 'wizardPart'>): boolean {
	return isYouTubeExtractor(state.wizardExtractor) && state.wizardMediaKind === 'video' && state.wizardPart === null
}

export function buildSingleSettingsSummary(state: WizardReviewState, ctx: {t: Translate; language: string}): SingleSettingsSummary {
	const {t} = ctx
	const languages = state.wizardSubtitleLanguages
	const subtitlesAvailable = Object.keys(state.wizardSubtitles).length + Object.keys(state.wizardAutomaticCaptions).filter(code => !state.wizardSubtitles[code]).length
	// Subtitles are never cut: with a part they still cover the whole video.
	const fullLength = state.wizardMediaKind !== 'subtitles' && state.wizardPart !== null ? t('wizard.part.subtitlesFullLength') : null
	const subtitles =
		languages.length === 0
			? t('wizard.review.value.subtitlesOff')
			: [
					formatList(
						languages.map(code => resolveSubtitleLabel(code, state.wizardSubtitles, state.wizardAutomaticCaptions, ctx.language)),
						ctx.language,
						'conjunction'
					),
					state.wizardSubtitleMode === 'embed' ? null : state.wizardSubtitleFormat.toUpperCase(),
					t(SUBTITLE_MODE_I18N_KEYS[state.wizardSubtitleMode]),
					fullLength
				]
					.filter(Boolean)
					.join(' · ')
	const sponsorBlock = sponsorBlockApplies(state) ? (state.wizardSponsorBlockMode === 'off' ? t('wizard.review.value.sponsorBlockOff') : t(SPONSOR_BLOCK_MODE_LABEL_KEYS[state.wizardSponsorBlockMode])) : null
	// A part never gets chapters embedded (yt-dlp would not shift them), so the
	// summary doesn't promise them.
	const extras = EXTRA_FIELDS.filter(([field]) => state[field] && !(field === 'wizardEmbedChapters' && state.wizardPart !== null)).map(([, embed]) => t(EMBED_OPTION_KEYS[embed].labelKey))
	const saveTo = formatHomeRelativePath(effectiveOutputDir(state.wizardOutputDir, state.wizardSubfolderEnabled, state.wizardSubfolderName), state.commonPaths)
	// A part's file name ends in its range, appended when the job is queued.
	const part = wizardVideoPart(state)
	const fileName = part ? `${state.wizardFilenameTemplate} ${videoPartSuffix(part)}` : state.wizardFilenameTemplate
	return {subtitles, subtitlesOn: languages.length > 0, subtitlesAvailable, sponsorBlock, extras: extras.length > 0 ? formatList(extras, ctx.language, 'conjunction') : t('wizard.review.value.extrasNone'), extrasOn: extras.length > 0, saveTo, fileName}
}
