// What still blocks a single-video Download, if anything. Shared by the Format
// and Review screens, since Download works from both.

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
	if (state.wizardFilenameTemplate.trim() === '') return 'fileName'
	return null
}
