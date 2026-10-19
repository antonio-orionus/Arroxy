// What updating a profile changes: one row per Review area whose value differs
// between the saved profile and its updated version, in Review's order.

import {downloadProfileLabel, resolveFilenameTemplate} from '@shared/downloadProfiles.js'
import type {CommonSettings, DownloadProfile} from '@shared/types.js'
import {formatHomeRelativePath} from '@renderer/lib/utils.js'
import {effectiveOutputDir} from '@renderer/lib/path.js'
import {SUBTITLE_MODE_I18N_KEYS} from '../../lib/subtitleLabel.js'
import type {TranslationPort} from '../../lib/translation.js'
import type {ChangedArea} from './profileApplication.js'

export interface ProfileDiffRow {
	area: ChangedArea
	before: string
	after: string
}

export interface ProfileDiffContext {
	t: TranslationPort
	defaultOutputDir: string
	globalFilenameTemplate: string | undefined
	commonPaths: CommonSettings['commonPaths']
}

const EXTRA_LABEL_KEYS = [
	['chapters', 'wizard.output.embedChapters.label'],
	['metadata', 'wizard.output.embedMetadata.label'],
	['thumbnail', 'wizard.output.embedThumbnail.label'],
	['description', 'wizard.output.writeDescription.label'],
	['thumbnailSidecar', 'wizard.output.writeThumbnail.label']
] as const satisfies readonly (readonly [keyof DownloadProfile['embed'], string])[]

function areaValues(profile: DownloadProfile, ctx: ProfileDiffContext): Record<ChangedArea, string> {
	const {t} = ctx
	const {subtitles, sponsorBlock} = profile
	const subtitlesOn = subtitles.enabled || profile.media.kind === 'subtitles-only'
	const extras = EXTRA_LABEL_KEYS.filter(([field]) => profile.embed[field]).map(([, key]) => t(key))
	const baseDir = profile.output.kind === 'fixed' ? profile.output.dir : ctx.defaultOutputDir
	return {
		format: downloadProfileLabel(profile),
		subtitles: subtitlesOn ? [subtitles.languages.join(', '), subtitles.mode === 'embed' ? null : subtitles.format.toUpperCase(), t(SUBTITLE_MODE_I18N_KEYS[subtitles.mode])].filter(Boolean).join(' · ') : t('wizard.review.value.subtitlesOff'),
		// The categories too: changing only them is an edit the update must show.
		sponsorBlock: sponsorBlock.mode === 'off' ? t('wizard.review.value.sponsorBlockOff') : [t(`wizard.sponsorblock.mode.${sponsorBlock.mode}`), sponsorBlock.categories.map(category => t(`wizard.sponsorblock.cat.${category}`)).join(', ')].filter(Boolean).join(' · '),
		extras: extras.length > 0 ? extras.join(', ') : t('wizard.review.value.extrasNone'),
		saveTo: formatHomeRelativePath(effectiveOutputDir(baseDir, profile.subfolder.enabled, profile.subfolder.name), ctx.commonPaths),
		fileName: resolveFilenameTemplate(profile, ctx.globalFilenameTemplate)
	}
}

const AREA_ORDER = ['format', 'subtitles', 'sponsorBlock', 'extras', 'saveTo', 'fileName'] as const satisfies readonly ChangedArea[]

// Extras as a delta: what was turned off (shown struck through) and what was
// turned on ("+ Save thumbnail"), not the whole list twice.
function extrasDelta(before: DownloadProfile, after: DownloadProfile, ctx: ProfileDiffContext): ProfileDiffRow {
	const changed = EXTRA_LABEL_KEYS.filter(([field]) => before.embed[field] !== after.embed[field])
	const removed = changed.filter(([field]) => before.embed[field]).map(([, key]) => ctx.t(key))
	const added = changed.filter(([field]) => after.embed[field]).map(([, key]) => `+ ${ctx.t(key)}`)
	return {area: 'extras', before: removed.join(', '), after: added.join(', ')}
}

// `before` or `after` is empty when an Extras change only removes or only adds.
export function profileDiffRows(before: DownloadProfile, after: DownloadProfile, ctx: ProfileDiffContext): ProfileDiffRow[] {
	const was = areaValues(before, ctx)
	const now = areaValues(after, ctx)
	return AREA_ORDER.filter(area => was[area] !== now[area]).map(area => (area === 'extras' ? extrasDelta(before, after, ctx) : {area, before: was[area], after: now[area]}))
}
