import {useId, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, Download, Folder, PenLine} from 'lucide-react'
import {DEFAULTS} from '@shared/constants.js'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'
import {cn} from '@renderer/lib/utils.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Kbd, KbdGroup} from '../ui/kbd.js'
import {Popover, PopoverTrigger} from '../ui/popover.js'
import {Spinner} from '../ui/spinner.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {buildDownloadProfileActionModel, type DownloadProfileActionModel} from './downloadProfileActions.js'
import {ProfilePickerMenu, type ProfilePickerTestIdPrefix} from './ProfilePicker.js'
import {Hint} from '../shared/Hint.js'
import {ProfileSummaryContent} from './ProfileSummaryContent.js'

// The URL tab and the Bulk dialog; Explore opens the same menu from its own toolbar.
type QuickProfileTestIdPrefix = Extract<ProfilePickerTestIdPrefix, 'profiles' | 'bulk'>

interface QuickProfileControlProps {
	defaultProfileMenuOpen?: boolean
	destination?: string
	destinationDetail?: string
	disabled: boolean
	onDownload: () => void
	onEditProfile: (profile: DownloadProfile) => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (ref: DownloadProfileRef) => void
	// Bulk URLs prepares its links in one run; a single link prepares in the background.
	preparing?: boolean
	profilesPrefs?: DownloadProfilesPrefs
	size?: 'default' | 'compact'
	testIdPrefix?: QuickProfileTestIdPrefix
}

export function QuickProfileControl({defaultProfileMenuOpen = false, destination, destinationDetail, disabled, onDownload, onEditProfile, onManageProfiles, onNewProfile, onPickProfile, preparing = false, profilesPrefs, size = 'default', testIdPrefix = 'profiles'}: QuickProfileControlProps): ReactNode {
	const model = buildDownloadProfileActionModel(profilesPrefs)
	const {activeProfile} = model
	const nameOf = useProfileDisplayName()
	const compact = size === 'compact'
	const hasDestination = !compact && Boolean(destination?.trim())
	const clusterTestId = testIdPrefix === 'profiles' ? 'profiles-quick-preview' : 'bulk-quick-profile-preview'
	return (
		<div className={cn('quick-profile-cluster flex w-full flex-col overflow-hidden rounded-xl md:flex-row', clusterMinHeightClass(compact, hasDestination))} data-linked-control="quick-profile" data-testid={clusterTestId}>
			<QuickDownloadAction compact={compact} disabled={disabled} preparing={preparing} profileName={nameOf(activeProfile)} onDownload={onDownload} testIdPrefix={testIdPrefix} />

			<ProfileMenu
				activeProfile={activeProfile}
				compact={compact}
				defaultOpen={defaultProfileMenuOpen}
				destination={destination}
				destinationDetail={destinationDetail}
				onEditProfile={onEditProfile}
				onManageProfiles={onManageProfiles}
				onNewProfile={onNewProfile}
				onPickProfile={onPickProfile}
				model={model}
				testIdPrefix={testIdPrefix}
			/>
		</div>
	)
}

function clusterMinHeightClass(compact: boolean, hasDestination: boolean): string {
	if (compact) return 'md:min-h-[5rem]'
	return hasDestination ? 'md:min-h-[8.5rem]' : 'md:min-h-[6.5rem]'
}

function QuickDownloadAction({compact, disabled, preparing, profileName, onDownload, testIdPrefix}: {compact: boolean; disabled: boolean; preparing: boolean; profileName: string; onDownload: () => void; testIdPrefix: QuickProfileTestIdPrefix}): ReactNode {
	const {t} = useTranslation()
	const descriptionId = useId()
	// The name only on the face; the profile and (on the URL tab) the global shortcut wait in the hint.
	// No arrow: Quick Download starts at once, and an arrow means "opens something".
	return (
		<>
			<Hint
				label={
					<span className="flex flex-col items-start gap-1" data-testid={`${testIdPrefix}-quick-download-hint`}>
						<span>{t('wizard.url.quickDownloadTooltip', {profileName})}</span>
						{testIdPrefix === 'profiles' ? <GlobalHotkeyHintLine /> : null}
					</span>
				}
			>
				{/* aria-disabled, not disabled: the hint carries the profile and the shortcut, so it
			   must open by hover and focus while the button cannot act yet. A click then does nothing. */}
				<button
					type="button"
					aria-disabled={disabled || preparing}
					aria-busy={preparing}
					// A hint is not read out: screen readers hear the profile here. The shortcut stays hint-only.
					aria-describedby={descriptionId}
					onClick={() => {
						if (!disabled && !preparing) onDownload()
					}}
					className={cn(
						'quick-profile-action group/quick relative flex min-w-0 flex-1 items-center gap-4 overflow-hidden text-left transition-[filter,transform] duration-200',
						compact ? 'min-h-[4.75rem] px-4 py-3 md:min-h-[5rem] md:basis-[52%]' : 'min-h-[6rem] px-5 py-4 md:m-2 md:me-0 md:min-h-0 md:flex-[0_1_42%] md:self-stretch lg:m-3 lg:me-0 lg:flex-[0_1_38%] lg:px-5 xl:flex-[0_1_36%] xl:px-6',
						!disabled && !preparing && 'hover:brightness-[1.08] active:translate-y-px',
						'focus-visible:outline-none',
						disabled && !preparing && 'cursor-default opacity-55 saturate-[0.65]',
						preparing && 'cursor-progress'
					)}
					data-testid={`${testIdPrefix}-quick-download`}
				>
					<span aria-hidden className="quick-card-overlay pointer-events-none absolute inset-0" />
					<span className={cn('icon-tile quick-icon-tile relative grid shrink-0 place-items-center rounded-xl [&_svg]:size-6', compact ? 'size-11' : 'size-12 md:size-14 md:[&_svg]:size-7')}>{preparing ? <Spinner aria-hidden className={compact ? 'size-5' : 'size-6 md:size-7'} /> : <Download aria-hidden />}</span>
					<span className={cn('relative min-w-0', compact ? 'text-title' : 'text-headline')}>{preparing ? `${t('wizard.url.quickPreparing')}…` : t('wizard.url.quickDownload')}</span>
				</button>
			</Hint>
			{/* Beside the button, not in it: inside, it would join the button's name. */}
			<span id={descriptionId} className="sr-only">
				{t('wizard.url.quickDownloadTooltip', {profileName})}
			</span>
		</>
	)
}

// The global shortcut, in Quick Download's hint: its name and chord; Settings explains it.
// Shown only while the hotkey is registered, so the chord it names always works.
function GlobalHotkeyHintLine(): ReactNode {
	const {t} = useTranslation()
	const accelerator = useAppStore(state => state.settings?.common?.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator)
	const hotkeyRegistration = useAppStore(state => state.hotkeyRegistration)
	if (hotkeyRegistration !== 'registered') return null
	return (
		<span className="flex flex-wrap items-center gap-1.5" data-testid="quick-download-global-hotkey">
			<span>{t('wizard.url.hotkey.globalLabel')}</span>
			<KbdGroup>
				{formatHotkeyChord(accelerator).map(key => (
					<Kbd key={key}>{key}</Kbd>
				))}
			</KbdGroup>
		</span>
	)
}

function ProfileMenu({
	activeProfile,
	compact,
	defaultOpen,
	destination,
	destinationDetail,
	onEditProfile,
	onManageProfiles,
	onNewProfile,
	onPickProfile,
	model,
	testIdPrefix
}: {
	activeProfile: DownloadProfile
	compact: boolean
	defaultOpen: boolean
	destination?: string
	destinationDetail?: string
	onEditProfile: (profile: DownloadProfile) => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (ref: DownloadProfileRef) => void
	model: DownloadProfileActionModel
	testIdPrefix: QuickProfileTestIdPrefix
}): ReactNode {
	const {t} = useTranslation()
	const nameOf = useProfileDisplayName()
	const [menuOpen, setMenuOpen] = useState(defaultOpen)
	const {ActiveIcon} = model
	const destinationLabel = compact ? undefined : destination?.trim()
	const destinationDetailText = destinationDetail?.trim()
	const destinationDetailLabel = destinationDetailText === undefined || destinationDetailText.length === 0 ? t('wizard.url.profile.destinationFallback') : destinationDetailText
	const activeProfileLabel = t('wizard.url.profile.activeLabel')
	const editActiveProfileLabel = t('wizard.url.profile.editActive')

	function closeAndRun(action: () => void): void {
		setMenuOpen(false)
		action()
	}

	return (
		<Popover open={menuOpen} onOpenChange={setMenuOpen}>
			<div
				className={cn(
					'quick-profile-selector relative flex min-w-0 flex-1 flex-col whitespace-normal rounded-lg text-left',
					compact ? 'm-1.5 min-h-[4.25rem] p-1.5 md:basis-[48%]' : destinationLabel ? 'm-2 min-h-[7.75rem] p-3 md:m-2 md:basis-[50%] md:self-stretch lg:m-3 lg:basis-[54%] lg:p-3.5 xl:basis-[56%]' : 'm-2 min-h-[5.5rem] p-2 md:m-2 md:min-h-0 md:basis-[50%] md:self-stretch lg:m-3 lg:basis-[54%] lg:p-2 xl:basis-[56%]'
				)}
				data-testid={`${testIdPrefix}-active-profile-card`}
			>
				<div className="relative flex min-w-0 items-center gap-2">
					<Hint
						label={
							<span className="flex flex-col gap-1.5" data-testid={`${testIdPrefix}-active-profile-hint`}>
								<span className="text-label uppercase text-muted-foreground">{activeProfileLabel}</span>
								<ProfileSummaryContent profile={activeProfile} />
							</span>
						}
						delay={600}
					>
						<PopoverTrigger
							render={
								<Button
									type="button"
									variant="ghost"
									aria-label={t('wizard.url.profile.switchAria', {profileName: nameOf(activeProfile)})}
									className={cn('quick-profile-selector-trigger h-auto min-w-0 flex-1 justify-start whitespace-normal rounded-xl bg-transparent text-left hover:bg-transparent', compact ? 'gap-3 px-1.5 py-1.5' : 'gap-2 px-1.5 py-1.5 md:gap-3')}
									data-testid={`${testIdPrefix}-active-profile-trigger`}
								>
									<span className={cn('icon-tile grid shrink-0 place-items-center rounded-xl', compact ? 'size-10 [&_svg]:size-5' : 'size-11 md:size-14 [&_svg]:size-5 md:[&_svg]:size-7')}>
										<ActiveIcon aria-hidden />
									</span>
									<span className={cn('quick-profile-selector-title block min-w-0 flex-1 truncate', compact ? 'text-title' : 'text-title md:text-headline')}>{nameOf(activeProfile)}</span>
									<span className={cn('quick-profile-chevron grid shrink-0 place-items-center rounded-full', compact ? 'size-9' : 'size-10')}>
										<ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-aria-expanded/button:rotate-180" />
									</span>
								</Button>
							}
						/>
					</Hint>
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button
									{...props}
									type="button"
									variant="ghost"
									size="icon"
									aria-label={editActiveProfileLabel}
									onClick={() => closeAndRun(() => onEditProfile(activeProfile))}
									className={cn('quick-profile-inline-action shrink-0 rounded-full text-quick-selector-muted hover:text-quick-selector-ink', compact ? 'size-9' : 'size-10')}
									data-testid={`${testIdPrefix}-edit-active-profile`}
								>
									<PenLine aria-hidden />
								</Button>
							)}
						/>
						<TooltipContent>{editActiveProfileLabel}</TooltipContent>
					</Tooltip>
				</div>
				{destinationLabel ? (
					// Read-only: the profile owns where it saves; the hint says which rule applies and where to change it.
					<Hint
						label={
							<span className="flex max-w-xs flex-col gap-1" data-testid={`${testIdPrefix}-profile-destination-hint`}>
								<span className="wrap-anywhere font-mono text-xs">{destinationLabel}</span>
								<span className="text-muted-foreground">{destinationDetailLabel}</span>
								<span>{t('wizard.url.profile.destinationEditHint')}</span>
							</span>
						}
					>
						<div className="quick-profile-destination relative mt-2 flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2" data-testid={`${testIdPrefix}-profile-destination`}>
							<Folder className="size-4 shrink-0 text-quick-selector-muted" aria-hidden />
							<span className="min-w-0 flex-1">
								<span className="block truncate text-caption font-medium leading-snug text-quick-selector-muted">{t('wizard.url.profile.savesTo')}</span>
								<span className="mt-0.5 block truncate font-mono text-xs leading-tight text-quick-selector-ink">{destinationLabel}</span>
							</span>
						</div>
					</Hint>
				) : null}
			</div>
			<ProfilePickerMenu layout="grid" options={model.options} editProfile={model.activeProfile} onPickProfile={onPickProfile} onEditProfile={onEditProfile} onNewProfile={onNewProfile} onManageProfiles={onManageProfiles} onClose={() => setMenuOpen(false)} testIdPrefix={testIdPrefix} />
		</Popover>
	)
}
