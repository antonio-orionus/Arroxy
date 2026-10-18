import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys} from 'i18next'
import {SPONSORBLOCK_CATEGORIES} from '@shared/schemas.js'
import type {CommonSettings, SponsorBlockCategory, SponsorBlockMode} from '@shared/types.js'
import {canDraftEmbedThumbnail, defaultProfileSubfolderName, type DownloadProfileDraft, type DownloadProfileDraftAction, type DownloadProfileDraftValidation, type DownloadProfileMediaMode} from '../../store/wizard/downloadProfileDraft.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Badge} from '../ui/badge.js'
import {Checkbox} from '../ui/checkbox.js'
import {Field, FieldError, FieldGroup, FieldLabel} from '../ui/field.js'
import {InputGroup, InputGroupInput} from '../ui/input-group.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {CheckRow} from '../shared/CheckRow.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'
import {Panel} from '../shared/Panel.js'
import {PanelSection} from '../shared/PanelSection.js'
import {FilenameTemplateField} from '../shared/FilenameTemplateField.js'
import {Hint} from '../shared/Hint.js'
import {optionLabel, type SelectOption} from './profileSelectOptions.js'
import {mediaModeHasVideo} from './profileMediaMode.js'
import {ProfileDestinationPolicy} from './ProfileDestinationPolicy.js'
import type {ProfileDestinationControls} from './useProfileDestinationControls.js'

// Every one of these already exists verbatim under wizard.output.*, so the
// editor reuses them rather than duplicating the copy.
const OUTPUT_OPTION_KEYS = {
	chapters: {labelKey: 'wizard.output.embedChapters.label', descriptionKey: 'wizard.output.embedChapters.description'},
	metadata: {labelKey: 'wizard.output.embedMetadata.label', descriptionKey: 'wizard.output.embedMetadata.description'},
	embedThumbnail: {labelKey: 'wizard.output.embedThumbnail.label', descriptionKey: 'wizard.output.embedThumbnail.description'},
	description: {labelKey: 'wizard.output.writeDescription.label', descriptionKey: 'wizard.output.writeDescription.description'},
	thumbnail: {labelKey: 'wizard.output.writeThumbnail.label', descriptionKey: 'wizard.output.writeThumbnail.description'}
} as const

const SPONSOR_BLOCK_OPTIONS = [
	{value: 'off', labelKey: 'wizard.sponsorblock.mode.off'},
	{value: 'mark', labelKey: 'wizard.sponsorblock.mode.mark'},
	{value: 'remove', labelKey: 'wizard.sponsorblock.mode.remove'}
] as const satisfies readonly SelectOption<SponsorBlockMode>[]

const SPONSOR_BLOCK_HINT_KEYS = {off: 'wizard.profileEditor.sponsorBlockHint.off', mark: 'wizard.profileEditor.sponsorBlockHint.mark', remove: 'wizard.profileEditor.sponsorBlockHint.remove'} as const satisfies Record<SponsorBlockMode, ParseKeys>

interface ProfileAdvancedPanelProps {
	draft: DownloadProfileDraft
	validation: DownloadProfileDraftValidation
	commonPaths?: CommonSettings['commonPaths']
	globalDestination: string
	globalFilenameTemplate: string
	destinationControls: ProfileDestinationControls
	onAction: (action: DownloadProfileDraftAction) => void
}

// The profile editor's Advanced panel: where files go and what they are
// named, the extra output files, and SponsorBlock.
export function ProfileAdvancedPanel({draft, validation, commonPaths, globalDestination, globalFilenameTemplate, destinationControls, onAction}: ProfileAdvancedPanelProps): ReactNode {
	const {t} = useTranslation()

	return (
		<Panel title={t('wizard.profileEditor.panel.advanced.title')} description={t('wizard.profileEditor.panel.advanced.description')} className="lg:self-start">
			<FieldGroup className="gap-3">
				<ProfileDestinationPolicy draft={draft} commonPaths={commonPaths} globalDestination={globalDestination} controls={destinationControls} />

				<ProfileSubfolderFields profileName={draft.profileName} saveInsideSubfolder={draft.saveInsideSubfolder} subfolderName={draft.subfolderName} subfolderInvalid={validation.subfolderInvalid} onAction={onAction} />

				<FilenameTemplateField
					value={draft.filenameTemplate}
					onChange={value => onAction({type: 'set-filename-template', filenameTemplate: value})}
					error={validation.filenameTemplateError}
					label={t('filenameTemplate.profileOverrideLabel')}
					description={t('filenameTemplate.profileOverrideDescription')}
					placeholder={globalFilenameTemplate}
					testId="profiles-editor-filename-template"
				/>

				<ProfileOutputSection draft={draft} onAction={onAction} />

				<ProfileSponsorBlockSection mediaMode={draft.mediaMode} sponsorBlockMode={draft.sponsorBlockMode} sponsorBlockCategories={draft.sponsorBlockCategories} onAction={onAction} />
			</FieldGroup>
		</Panel>
	)
}

interface ProfileSubfolderFieldsProps {
	profileName: string
	saveInsideSubfolder: boolean
	subfolderName: string
	subfolderInvalid: boolean
	onAction: (action: DownloadProfileDraftAction) => void
}

function ProfileSubfolderFields({profileName, saveInsideSubfolder, subfolderName, subfolderInvalid, onAction}: ProfileSubfolderFieldsProps): ReactNode {
	const {t} = useTranslation()

	return (
		<>
			<Field orientation="horizontal" className="items-center gap-2 text-xs text-subtle-foreground">
				<Checkbox id="profile-subfolder-enabled" checked={saveInsideSubfolder} onCheckedChange={checked => onAction({type: 'set-save-inside-subfolder', saveInsideSubfolder: checked === true})} />
				<FieldLabel htmlFor="profile-subfolder-enabled" size="sm">
					{t('wizard.folder.subfolder.toggle')}
				</FieldLabel>
			</Field>
			<Field className="gap-1.5 pl-7">
				<FieldLabel htmlFor="profile-subfolder-name">{t('wizard.profileEditor.field.subfolderName')}</FieldLabel>
				<InputGroup aria-label={t('wizard.profileEditor.field.subfolderName')}>
					<InputGroupInput
						id="profile-subfolder-name"
						value={subfolderName}
						onChange={event => onAction({type: 'set-subfolder-name', subfolderName: event.target.value})}
						disabled={!saveInsideSubfolder}
						placeholder={defaultProfileSubfolderName(profileName)}
						maxLength={64}
						aria-invalid={subfolderInvalid}
						data-testid="profiles-editor-subfolder-name"
					/>
				</InputGroup>
				{subfolderInvalid ? <FieldError>{t('wizard.folder.subfolder.invalid')}</FieldError> : null}
			</Field>
		</>
	)
}

interface ProfileOutputSectionProps {
	draft: DownloadProfileDraft
	onAction: (action: DownloadProfileDraftAction) => void
}

function ProfileOutputSection({draft, onAction}: ProfileOutputSectionProps): ReactNode {
	const {t} = useTranslation()
	const {embedMetadata, embedChapters, embedThumbnail, saveDescription, saveThumbnail} = draft
	const showEmbedThumbnail = canDraftEmbedThumbnail(draft)
	const outputEnabledCount = [embedMetadata, embedChapters, showEmbedThumbnail && embedThumbnail, saveDescription, saveThumbnail].filter(Boolean).length

	return (
		<PanelSection title={t('wizard.profileEditor.panel.output.title')} action={<Badge variant="outline">{t('wizard.profileEditor.panel.output.enabledCount', {count: outputEnabledCount})}</Badge>}>
			<div className="grid gap-3">
				<SettingSwitch id="profile-output-metadata" label={t(OUTPUT_OPTION_KEYS.metadata.labelKey)} help={t(OUTPUT_OPTION_KEYS.metadata.descriptionKey)} checked={embedMetadata} onCheckedChange={next => onAction({type: 'set-embed-metadata', embedMetadata: next})} />
				<SettingSwitch id="profile-output-chapters" label={t(OUTPUT_OPTION_KEYS.chapters.labelKey)} help={t(OUTPUT_OPTION_KEYS.chapters.descriptionKey)} checked={embedChapters} onCheckedChange={next => onAction({type: 'set-embed-chapters', embedChapters: next})} />
				{showEmbedThumbnail ? (
					<SettingSwitch
						id="profile-output-embed-thumbnail"
						label={t(OUTPUT_OPTION_KEYS.embedThumbnail.labelKey)}
						help={t(OUTPUT_OPTION_KEYS.embedThumbnail.descriptionKey)}
						checked={embedThumbnail}
						onCheckedChange={next => onAction({type: 'set-embed-thumbnail', embedThumbnail: next})}
						testId="profiles-editor-embed-thumbnail"
					/>
				) : null}
				<SettingSwitch id="profile-output-description" label={t(OUTPUT_OPTION_KEYS.description.labelKey)} help={t(OUTPUT_OPTION_KEYS.description.descriptionKey)} checked={saveDescription} onCheckedChange={next => onAction({type: 'set-save-description', saveDescription: next})} />
				<SettingSwitch id="profile-output-thumbnail" label={t(OUTPUT_OPTION_KEYS.thumbnail.labelKey)} help={t(OUTPUT_OPTION_KEYS.thumbnail.descriptionKey)} checked={saveThumbnail} onCheckedChange={next => onAction({type: 'set-save-thumbnail', saveThumbnail: next})} />
			</div>
		</PanelSection>
	)
}

interface ProfileSponsorBlockSectionProps {
	mediaMode: DownloadProfileMediaMode
	sponsorBlockMode: SponsorBlockMode
	sponsorBlockCategories: SponsorBlockCategory[]
	onAction: (action: DownloadProfileDraftAction) => void
}

// SponsorBlock only applies to downloads with video; other download types
// show it as skipped.
function ProfileSponsorBlockSection({mediaMode, sponsorBlockMode, sponsorBlockCategories, onAction}: ProfileSponsorBlockSectionProps): ReactNode {
	const {t} = useTranslation()
	const showVideo = mediaModeHasVideo(mediaMode)

	return (
		<PanelSection title={t('wizard.profileEditor.panel.sponsorBlock.title')} action={<Badge variant="outline">{showVideo ? optionLabel(t, SPONSOR_BLOCK_OPTIONS, sponsorBlockMode) : t('wizard.profileEditor.skipped')}</Badge>}>
			{showVideo ? (
				<div className="grid gap-3">
					<ToggleGroup
						size="sm"
						variant="outline"
						value={[sponsorBlockMode]}
						onValueChange={value => {
							if (value[0]) onAction({type: 'set-sponsor-block-mode', sponsorBlockMode: value[0] as SponsorBlockMode})
						}}
						className="grid w-full grid-cols-3"
					>
						{SPONSOR_BLOCK_OPTIONS.map(option => (
							<Hint key={option.value} label={t(SPONSOR_BLOCK_HINT_KEYS[option.value])}>
								<ToggleGroupItem value={option.value}>{t(option.labelKey)}</ToggleGroupItem>
							</Hint>
						))}
					</ToggleGroup>
					{sponsorBlockMode !== 'off' ? <SponsorBlockCategoryList sponsorBlockCategories={sponsorBlockCategories} onAction={onAction} /> : null}
				</div>
			) : (
				<Alert variant="info" size="sm">
					<AlertDescription>{t('wizard.profileEditor.note.skippedForOutputType')}</AlertDescription>
				</Alert>
			)}
		</PanelSection>
	)
}

interface SponsorBlockCategoryListProps {
	sponsorBlockCategories: SponsorBlockCategory[]
	onAction: (action: DownloadProfileDraftAction) => void
}

function SponsorBlockCategoryList({sponsorBlockCategories, onAction}: SponsorBlockCategoryListProps): ReactNode {
	const {t} = useTranslation()

	return (
		<div className="grid gap-1.5" data-testid="profiles-editor-sb-categories">
			<SectionLabel>{t('wizard.sponsorblock.categoriesHeading')}</SectionLabel>
			<div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
				{SPONSORBLOCK_CATEGORIES.map(category => (
					<CheckRow key={category} id={`profile-sb-cat-${category}`} testId={`profiles-editor-sb-cat-${category}`} label={t(`wizard.sponsorblock.cat.${category}`)} checked={sponsorBlockCategories.includes(category)} onCheckedChange={() => onAction({type: 'toggle-sponsor-block-category', category})} />
				))}
			</div>
		</div>
	)
}
