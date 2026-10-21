import {templateSite, type TemplateMetadata} from '@shared/filenameTemplate.js'
import type {InFlightFiles} from '@shared/nameBudget.js'
import {bindJobFilename, mediaTagsMeta, omitBlank, type FilenameBinding} from '@shared/outputTemplates.js'
import {notify} from '@renderer/lib/notify.js'
import {hostPlatform} from '@renderer/lib/platform.js'
import type {AppState} from '../types.js'

// Names are sized to this machine's filesystem, and a shortened or failed name
// is reported through the app's notifications.
export function rendererFilenameBinding(): FilenameBinding {
	return {platform: hostPlatform(), shortened: (title, tokens) => notify.filenameShortened(title, tokens), budgetFailed: (reason, outputDir) => notify.filenameBudgetFailed(reason, outputDir)}
}

export function bindJobFilenameTemplate(template: string, meta: TemplateMetadata, outputDir: string, inFlight: InFlightFiles, suffix?: string): string {
	return bindJobFilename(template, meta, outputDir, inFlight, rendererFilenameBinding(), suffix)
}

export type SingleTemplateState = Pick<AppState, 'wizardTitle' | 'wizardVideoId' | 'wizardUploader' | 'wizardUploadDate' | 'wizardWebpageUrl' | 'wizardMediaTags'>

/** Metadata for the single-video wizard path. */
export function singleTemplateMeta(state: SingleTemplateState): TemplateMetadata {
	return {title: omitBlank(state.wizardTitle), id: omitBlank(state.wizardVideoId), uploader: omitBlank(state.wizardUploader), uploadDate: omitBlank(state.wizardUploadDate), site: templateSite(state.wizardWebpageUrl), ...mediaTagsMeta(state.wizardMediaTags)}
}
