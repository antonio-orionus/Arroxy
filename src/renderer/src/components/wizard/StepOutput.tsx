import {type ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {canWriteM3u} from '@shared/outputTemplates.js'
import {canEmbedThumbnail, mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import {Separator} from '../ui/separator.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'
import {EMBED_OPTION_KEYS} from '@renderer/lib/outputLabels.js'

// The embed and sidecar switches: the batch wizard's Output step and the
// single-video Review's Extras row.
export function OutputFields(): ReactNode {
	const {t} = useTranslation()
	const {wizardMode, wizardEmbedChapters, wizardEmbedMetadata, wizardEmbedThumbnail, wizardWriteDescription, wizardWriteThumbnail, wizardWriteM3u, playlistSelection, setEmbedChapters, setEmbedMetadata, setEmbedThumbnail, setWriteDescription, setWriteThumbnail, setWriteM3u, settings} = useAppStore(
		useShallow(state => ({
			wizardMode: state.wizardMode,
			wizardEmbedChapters: state.wizardEmbedChapters,
			wizardEmbedMetadata: state.wizardEmbedMetadata,
			wizardEmbedThumbnail: state.wizardEmbedThumbnail,
			wizardWriteDescription: state.wizardWriteDescription,
			wizardWriteThumbnail: state.wizardWriteThumbnail,
			wizardWriteM3u: state.wizardWriteM3u,
			playlistSelection: state.playlistSelection,
			setEmbedChapters: state.setEmbedChapters,
			setEmbedMetadata: state.setEmbedMetadata,
			setEmbedThumbnail: state.setEmbedThumbnail,
			setWriteDescription: state.setWriteDescription,
			setWriteThumbnail: state.setWriteThumbnail,
			setWriteM3u: state.setWriteM3u,
			settings: state.settings
		}))
	)
	// Playlist files are located by matching `[videoId]`; without {id} in the
	// filename template an M3U would list names that never appear on disk.
	// Gated on both reasons M3U can be impossible: no {id} to match files by, and
	// a nesting template that scatters entries across folders.
	const canMatchById = canWriteM3u(undefined, settings?.common?.filenameTemplate)
	const isPlaylist = wizardMode === 'playlist'
	// A batch fixes its media type before this step, so a choice yt-dlp could
	// not honour is hidden; single mode warns per format on the review step.
	const batchIntent = wizardMode !== 'single' && playlistSelection ? playlistSelectionToMediaIntent(playlistSelection) : null
	const showEmbedThumbnail = batchIntent === null || canEmbedThumbnail(mediaIntentSpec(batchIntent))

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex flex-col gap-3 py-1">
				<SettingSwitch id="output-embed-chapters" label={t(EMBED_OPTION_KEYS.chapters.labelKey)} description={t(EMBED_OPTION_KEYS.chapters.descriptionKey)} checked={wizardEmbedChapters} onCheckedChange={setEmbedChapters} testId="embed-chapters-toggle" />
				<SettingSwitch id="output-embed-metadata" label={t(EMBED_OPTION_KEYS.metadata.labelKey)} description={t(EMBED_OPTION_KEYS.metadata.descriptionKey)} checked={wizardEmbedMetadata} onCheckedChange={setEmbedMetadata} testId="embed-metadata-toggle" />
				{showEmbedThumbnail ? <SettingSwitch id="output-embed-thumbnail" label={t(EMBED_OPTION_KEYS.thumbnail.labelKey)} description={t(EMBED_OPTION_KEYS.thumbnail.descriptionKey)} checked={wizardEmbedThumbnail} onCheckedChange={setEmbedThumbnail} testId="embed-thumbnail-toggle" /> : null}
			</div>

			<Separator className="my-1.5" />

			<div className="flex flex-col gap-3 py-1">
				<SettingSwitch id="output-write-description" label={t(EMBED_OPTION_KEYS.description.labelKey)} description={t(EMBED_OPTION_KEYS.description.descriptionKey)} checked={wizardWriteDescription} onCheckedChange={setWriteDescription} testId="write-description-toggle" />
				<SettingSwitch id="output-write-thumbnail" label={t(EMBED_OPTION_KEYS.thumbnailSidecar.labelKey)} description={t(EMBED_OPTION_KEYS.thumbnailSidecar.descriptionKey)} checked={wizardWriteThumbnail} onCheckedChange={setWriteThumbnail} testId="write-thumbnail-toggle" />
			</div>

			{isPlaylist && (
				<>
					<Separator className="my-1.5" />
					<div className="flex flex-col gap-3 py-1">
						<SettingSwitch id="output-write-m3u" label={t('wizard.output.writeM3u.label')} description={canMatchById ? t('wizard.output.writeM3u.description') : t('filenameTemplate.m3uDisabled')} checked={wizardWriteM3u && canMatchById} disabled={!canMatchById} onCheckedChange={setWriteM3u} testId="write-m3u-toggle" />
					</div>
				</>
			)}
		</div>
	)
}

export function StepOutput(): ReactNode {
	const {advance, back} = useAppStore(useShallow(state => ({advance: state.advance, back: state.back})))
	return (
		<div className="wizard-step wizard-step-column flex flex-col gap-1.5" data-testid="step-output">
			<OutputFields />
			<WizardStepFooterActions onBack={back} onContinue={advance} />
		</div>
	)
}
