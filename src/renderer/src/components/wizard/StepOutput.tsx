import {type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {canWriteM3u} from '../../store/wizard/outputTemplates.js'
import {Separator} from '../ui/separator.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'

export function StepOutput(): ReactNode {
	const {t} = useTranslation()
	const {wizardMode, wizardEmbedChapters, wizardEmbedMetadata, wizardEmbedThumbnail, wizardWriteDescription, wizardWriteThumbnail, wizardWriteM3u, setEmbedChapters, setEmbedMetadata, setEmbedThumbnail, setWriteDescription, setWriteThumbnail, setWriteM3u, advance, back, settings} = useAppStore()
	// Playlist files are located by matching `[videoId]`; without {id} in the
	// filename template an M3U would list names that never appear on disk.
	// Gated on both reasons M3U can be impossible: no {id} to match files by, and
	// a nesting template that scatters entries across folders.
	const canMatchById = canWriteM3u(undefined, settings?.common?.filenameTemplate)
	const isPlaylist = wizardMode === 'playlist'

	return (
		<div className="wizard-step flex flex-col gap-1.5" data-testid="step-output">
			<div className="flex flex-col gap-3 py-1">
				<SettingSwitch id="output-embed-chapters" label={t('wizard.output.embedChapters.label')} description={t('wizard.output.embedChapters.description')} checked={wizardEmbedChapters} onCheckedChange={setEmbedChapters} testId="embed-chapters-toggle" />
				<SettingSwitch id="output-embed-metadata" label={t('wizard.output.embedMetadata.label')} description={t('wizard.output.embedMetadata.description')} checked={wizardEmbedMetadata} onCheckedChange={setEmbedMetadata} testId="embed-metadata-toggle" />
				<SettingSwitch id="output-embed-thumbnail" label={t('wizard.output.embedThumbnail.label')} description={t('wizard.output.embedThumbnail.description')} checked={wizardEmbedThumbnail} onCheckedChange={setEmbedThumbnail} testId="embed-thumbnail-toggle" />
			</div>

			<Separator className="my-1.5" />

			<div className="flex flex-col gap-3 py-1">
				<SettingSwitch id="output-write-description" label={t('wizard.output.writeDescription.label')} description={t('wizard.output.writeDescription.description')} checked={wizardWriteDescription} onCheckedChange={setWriteDescription} testId="write-description-toggle" />
				<SettingSwitch id="output-write-thumbnail" label={t('wizard.output.writeThumbnail.label')} description={t('wizard.output.writeThumbnail.description')} checked={wizardWriteThumbnail} onCheckedChange={setWriteThumbnail} testId="write-thumbnail-toggle" />
			</div>

			{isPlaylist && (
				<>
					<Separator className="my-1.5" />
					<div className="flex flex-col gap-3 py-1">
						<SettingSwitch id="output-write-m3u" label={t('wizard.output.writeM3u.label')} description={canMatchById ? t('wizard.output.writeM3u.description') : t('filenameTemplate.m3uDisabled')} checked={wizardWriteM3u && canMatchById} disabled={!canMatchById} onCheckedChange={setWriteM3u} testId="write-m3u-toggle" />
					</div>
				</>
			)}

			<WizardStepFooterActions onBack={back} onContinue={advance} />
		</div>
	)
}
