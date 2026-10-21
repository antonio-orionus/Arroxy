// What still blocks a single-video Download, if anything: Review's Download,
// and Format's Continue for the parts Format owns.

import {validateFilenameTemplate} from '@shared/filenameTemplate.js'
import {isValidSubfolder} from '@renderer/lib/path.js'
import type {AppState} from '../types.js'
import {wizardPartValidation} from './videoPart.js'

export type SingleDownloadBlocker = 'media' | 'part' | 'subtitles' | 'folder' | 'fileName'

export function folderSelectionInvalid(dir: string, subfolderEnabled: boolean, subfolderName: string): boolean {
	return !dir || (subfolderEnabled && subfolderName.trim() !== '' && !isValidSubfolder(subfolderName))
}

type ReadinessFields = Pick<AppState, 'wizardMediaKind' | 'selectedVideoFormatId' | 'audioSelection' | 'wizardSubtitleLanguages' | 'wizardOutputDir' | 'wizardSubfolderEnabled' | 'wizardSubfolderName' | 'wizardFilenameTemplate' | 'wizardPart' | 'wizardDuration'>

export function singleDownloadBlocker(state: ReadinessFields): SingleDownloadBlocker | null {
	if (state.wizardMediaKind === 'subtitles' && state.wizardSubtitleLanguages.length === 0) return 'subtitles'
	if (state.wizardMediaKind === 'audio' && state.audioSelection.kind === 'none') return 'media'
	if (state.wizardMediaKind === 'video' && state.selectedVideoFormatId === '') return 'media'
	if (wizardPartValidation(state)?.ok === false) return 'part'
	if (folderSelectionInvalid(state.wizardOutputDir, state.wizardSubfolderEnabled, state.wizardSubfolderName)) return 'folder'
	if (!validateFilenameTemplate(state.wizardFilenameTemplate).ok) return 'fileName'
	return null
}

// The hint on a disabled Download or Continue, for the blockers the user may
// not see the cause of.
export function blockerHintKey(blocker: SingleDownloadBlocker | null): 'wizard.formats.footer.subtitlesRequired' | 'wizard.part.downloadBlocked' | null {
	if (blocker === 'subtitles') return 'wizard.formats.footer.subtitlesRequired'
	if (blocker === 'part') return 'wizard.part.downloadBlocked'
	return null
}

// The blockers fixed on the Format screen. Folder and file name are fixed on
// Review, so they never hold back Continue.
export function formatStepBlocker(state: ReadinessFields): Extract<SingleDownloadBlocker, 'media' | 'part' | 'subtitles'> | null {
	const blocker = singleDownloadBlocker(state)
	return blocker === 'media' || blocker === 'part' || blocker === 'subtitles' ? blocker : null
}
