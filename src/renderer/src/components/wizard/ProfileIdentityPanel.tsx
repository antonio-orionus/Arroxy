import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {ParseKeys} from 'i18next'
import {Archive, BookOpen, Captions, ChevronDown, Clapperboard, Download, FileAudio, Headphones, Music, Scissors, SlidersHorizontal, type LucideIcon} from 'lucide-react'
import {DOWNLOAD_PROFILE_ICONS} from '@shared/schemas.js'
import type {DownloadProfileIcon} from '@shared/types.js'
import type {DownloadProfileDraftAction} from '../../store/wizard/downloadProfileDraft.js'
import {Field, FieldLabel} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {Panel} from '../shared/Panel.js'
import {Hint} from '../shared/Hint.js'

const PROFILE_ICON_META = {
	controls: {labelKey: 'wizard.profileEditor.icon.controls', icon: SlidersHorizontal},
	download: {labelKey: 'wizard.profileEditor.icon.download', icon: Download},
	video: {labelKey: 'wizard.profileEditor.icon.video', icon: Clapperboard},
	captions: {labelKey: 'wizard.profileEditor.icon.captions', icon: Captions},
	audio: {labelKey: 'wizard.profileEditor.icon.audio', icon: FileAudio},
	music: {labelKey: 'wizard.profileEditor.icon.music', icon: Music},
	podcast: {labelKey: 'wizard.profileEditor.icon.podcast', icon: Headphones},
	classes: {labelKey: 'wizard.profileEditor.icon.classes', icon: BookOpen},
	clip: {labelKey: 'wizard.profileEditor.icon.clip', icon: Scissors},
	archive: {labelKey: 'wizard.profileEditor.icon.archive', icon: Archive}
} as const satisfies Record<DownloadProfileIcon, {labelKey: ParseKeys; icon: LucideIcon}>

const PROFILE_ICON_OPTIONS = DOWNLOAD_PROFILE_ICONS.map(value => ({value, ...PROFILE_ICON_META[value]}))

interface ProfileIdentityPanelProps {
	profileName: string
	profileIcon: DownloadProfileIcon
	// Owned by the editor, not this panel: the dialog content unmounts while
	// closed, and the picker state lives as long as the draft does.
	iconPickerOpen: boolean
	onIconPickerOpenChange: (open: boolean) => void
	onAction: (action: DownloadProfileDraftAction) => void
}

// The profile editor's Identity panel: the profile name with its icon picker.
export function ProfileIdentityPanel({profileName, profileIcon, iconPickerOpen, onIconPickerOpenChange, onAction}: ProfileIdentityPanelProps): ReactNode {
	const {t} = useTranslation()
	const SelectedProfileIcon = PROFILE_ICON_OPTIONS.find(option => option.value === profileIcon)?.icon ?? Captions

	return (
		<Panel title={t('wizard.profileEditor.panel.identity.title')} description={t('wizard.profileEditor.panel.identity.description')}>
			<Field className="gap-1.5">
				<FieldLabel htmlFor="profile-name">{t('wizard.profileEditor.field.name')}</FieldLabel>
				<InputGroup className="h-10" aria-label={t('wizard.profileEditor.field.nameAndIcon')}>
					<Popover open={iconPickerOpen} onOpenChange={onIconPickerOpenChange}>
						<InputGroupAddon align="inline-start" className="pl-1.5">
							<PopoverTrigger
								render={
									<InputGroupButton type="button" size="sm" className="h-8 w-14 justify-between px-2" aria-label={t('wizard.profileEditor.action.chooseIcon')} data-testid="profiles-editor-icon-trigger">
										<SelectedProfileIcon data-icon="inline-start" aria-hidden />
										<ChevronDown data-icon="inline-end" aria-hidden />
									</InputGroupButton>
								}
							/>
						</InputGroupAddon>
						<PopoverContent align="start" sideOffset={6} className="w-40" data-testid="profiles-editor-icon-menu">
							<ToggleGroup
								variant="outline"
								value={[profileIcon]}
								onValueChange={value => {
									const next = value[0] as DownloadProfileIcon | undefined
									if (!next) return
									onAction({type: 'set-profile-icon', profileIcon: next})
									onIconPickerOpenChange(false)
								}}
								spacing={1}
								className="grid w-full grid-cols-3 gap-1.5"
								aria-label={t('wizard.profileEditor.field.icon')}
							>
								{PROFILE_ICON_OPTIONS.map(option => {
									const Icon = option.icon
									return (
										<Hint key={option.value} label={t(option.labelKey)}>
											<ToggleGroupItem value={option.value} size="lg" data-testid={`profiles-editor-icon-${option.value}`}>
												<Icon aria-hidden />
												<span className="sr-only">{t(option.labelKey)}</span>
											</ToggleGroupItem>
										</Hint>
									)
								})}
							</ToggleGroup>
						</PopoverContent>
					</Popover>
					<InputGroupInput id="profile-name" value={profileName} onChange={event => onAction({type: 'set-profile-name', profileName: event.target.value})} data-testid="profiles-editor-name" />
				</InputGroup>
			</Field>
		</Panel>
	)
}
