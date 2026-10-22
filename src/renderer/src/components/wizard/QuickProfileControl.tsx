import {useId, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, ChevronRight, Download, Folder, PenLine} from 'lucide-react'
import {DEFAULTS} from '@shared/constants.js'
import type {ListKind} from '@shared/schemas.js'
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
import {DOWNLOAD_LIST_KEY, LIST_KIND_ICONS, LIST_TITLE_KEY} from './listKindCopy.js'

// The URL tab and the Bulk dialog; Explore opens the same menu from its own toolbar.
type QuickProfileTestIdPrefix = Extract<ProfilePickerTestIdPrefix, 'profiles' | 'bulk'>

interface QuickProfileControlProps {
	defaultProfileMenuOpen?: boolean
	destination?: string
	destinationDetail?: string
	disabled: boolean
	onDownload: () => void
	// This video, beside the list button, on a link that names a video and a list.
	onDownloadVideo?: () => void
	// The kind of list the link names beside its video; null or absent for a plain link.
	listKind?: ListKind | null
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

export function QuickProfileControl({
	defaultProfileMenuOpen = false,
	destination,
	destinationDetail,
	disabled,
	onDownload,
	onDownloadVideo,
	listKind = null,
	onEditProfile,
	onManageProfiles,
	onNewProfile,
	onPickProfile,
	preparing = false,
	profilesPrefs,
	size = 'default',
	testIdPrefix = 'profiles'
}: QuickProfileControlProps): ReactNode {
	const model = buildDownloadProfileActionModel(profilesPrefs)
	const {activeProfile} = model
	const nameOf = useProfileDisplayName()
	const compact = size === 'compact'
	const hasDestination = !compact && Boolean(destination?.trim())
	const clusterTestId = testIdPrefix === 'profiles' ? 'profiles-quick-preview' : 'bulk-quick-profile-preview'
	// The Bulk dialog takes many links at once: it never splits off This video.
	const splitKind = testIdPrefix === 'profiles' && onDownloadVideo !== undefined ? listKind : null
	return (
		<div
			className={cn(
				'quick-profile-cluster w-full overflow-hidden rounded-xl',
				// Split, by the card's own width (the URL tab's content is the container): three columns from 768 px, compact below the default window width (SPLIT_* sizes); narrower, the two downloads side by side over the profile.
				splitKind ? 'grid grid-cols-1 gap-2 p-2 @xl:grid-cols-2 @3xl:grid-cols-[1fr_1fr_1.5fr] lg:gap-3 lg:p-3' : cn('flex flex-col md:flex-row', clusterMinHeightClass(compact, hasDestination))
			)}
			data-linked-control="quick-profile"
			data-testid={clusterTestId}
		>
			{splitKind && onDownloadVideo ? <ThisVideoAction disabled={disabled} profileName={nameOf(activeProfile)} onDownload={onDownloadVideo} /> : null}
			<QuickDownloadAction compact={compact} disabled={disabled} preparing={preparing} profileName={nameOf(activeProfile)} listKind={splitKind} onDownload={onDownload} testIdPrefix={testIdPrefix} />

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
				split={splitKind !== null}
				testIdPrefix={testIdPrefix}
			/>
		</div>
	)
}

function clusterMinHeightClass(compact: boolean, hasDestination: boolean): string {
	if (compact) return 'md:min-h-[5rem]'
	return hasDestination ? 'md:min-h-[8.5rem]' : 'md:min-h-[6.5rem]'
}

// The split card's three columns fit from 768 px: smaller padding, tiles and type there,
// full size from the default window width up.
const SPLIT_ACTION = 'min-h-[4.5rem] gap-3 px-3 py-3 lg:gap-4 lg:px-4 xl:px-5'
const SPLIT_TILE = 'size-10 [&_svg]:size-5 lg:size-12 lg:[&_svg]:size-6 xl:size-14 xl:[&_svg]:size-7'
const SPLIT_TITLE = 'text-title xl:text-headline'
const SPLIT_CHEVRON = 'size-4 lg:size-5'

// The no-question path on a link that names a video and a list: the video, now,
// with the active profile. The hotkey takes the video on such links, so its
// shortcut sits in this hint. An outlined primary action: no arrow, it starts at once.
function ThisVideoAction({disabled, profileName, onDownload}: {disabled: boolean; profileName: string; onDownload: () => void}): ReactNode {
	const {t} = useTranslation()
	const descriptionId = useId()
	const hint = t('wizard.url.thisVideoTooltip', {profileName})
	return (
		<>
			<Hint
				label={
					<span className="flex flex-col items-start gap-1.5" data-testid="profiles-quick-download-video-hint">
						<span>{hint}</span>
						<GlobalHotkeyHintLine />
					</span>
				}
			>
				<Button
					type="button"
					variant="ghost"
					disabled={disabled}
					focusableWhenDisabled
					aria-describedby={descriptionId}
					onClick={onDownload}
					className={cn(
						// Outlined in the primary colour with a border (not a ring): the card styles own box-shadow in both looks.
						'quick-profile-video group/video relative h-auto min-w-0 flex-1 justify-start overflow-hidden border-primary/40 bg-primary/12 text-start whitespace-normal text-foreground transition-[filter,transform,background-color] duration-200 hover:bg-primary/20 hover:text-foreground dark:hover:bg-primary/20',
						SPLIT_ACTION,
						'hover:brightness-[1.08] aria-disabled:opacity-55 aria-disabled:saturate-[0.65] aria-disabled:hover:bg-primary/12 aria-disabled:hover:brightness-100'
					)}
					data-testid="profiles-quick-download-video"
				>
					<span className={cn('icon-tile quick-icon-tile relative grid shrink-0 place-items-center rounded-xl', SPLIT_TILE)}>
						<Download aria-hidden />
					</span>
					<span className={cn('relative min-w-0', SPLIT_TITLE)}>{t('wizard.url.thisVideo')}</span>
				</Button>
			</Hint>
			{/* Beside the button, not in it: inside, it would join the button's name. */}
			<span id={descriptionId} className="sr-only">
				{hint}
			</span>
		</>
	)
}

function QuickDownloadAction({compact, disabled, preparing, profileName, listKind, onDownload, testIdPrefix}: {compact: boolean; disabled: boolean; preparing: boolean; profileName: string; listKind: ListKind | null; onDownload: () => void; testIdPrefix: QuickProfileTestIdPrefix}): ReactNode {
	const {t} = useTranslation()
	const descriptionId = useId()
	const title = listKind ? t(DOWNLOAD_LIST_KEY[listKind]) : t('wizard.url.quickDownload')
	const listTitle = listKind ? t(LIST_TITLE_KEY[listKind]) : null
	const ActionIcon = listKind ? LIST_KIND_ICONS[listKind] : Download
	const profileLine = t('wizard.url.quickDownloadTooltip', {profileName})
	// The name only on the face; what the list button asks, the profile and (on the URL tab, plain links)
	// the global shortcut wait in the hint. The arrow means "opens something": only the list button has it.
	return (
		<>
			<Hint
				label={
					<span className="flex flex-col items-start gap-1" data-testid={`${testIdPrefix}-quick-download-hint`}>
						{listTitle ? <span>{listTitle}</span> : null}
						<span>{profileLine}</span>
						{testIdPrefix === 'profiles' && !listKind ? <GlobalHotkeyHintLine /> : null}
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
						compact ? 'min-h-[4.75rem] px-4 py-3 md:min-h-[5rem] md:basis-[52%]' : listKind ? SPLIT_ACTION : 'min-h-[6rem] px-5 py-4 md:m-2 md:me-0 md:min-h-0 md:flex-[0_1_42%] md:self-stretch lg:m-3 lg:me-0 lg:flex-[0_1_38%] lg:px-5 xl:flex-[0_1_36%] xl:px-6',
						!disabled && !preparing && 'hover:brightness-[1.08] active:translate-y-px',
						'focus-visible:outline-none',
						disabled && !preparing && 'cursor-default opacity-55 saturate-[0.65]',
						preparing && 'cursor-progress'
					)}
					data-testid={`${testIdPrefix}-quick-download`}
					data-list-kind={listKind ?? undefined}
				>
					<span aria-hidden className="quick-card-overlay pointer-events-none absolute inset-0" />
					<span className={cn('icon-tile quick-icon-tile relative grid shrink-0 place-items-center rounded-xl [&_svg]:size-6', compact ? 'size-11' : listKind ? SPLIT_TILE : 'size-12 md:size-14 md:[&_svg]:size-7')}>
						{preparing ? <Spinner aria-hidden className={compact ? 'size-5' : 'size-6 md:size-7'} /> : <ActionIcon aria-hidden />}
					</span>
					<span className={cn('relative min-w-0', compact ? 'text-title' : listKind ? SPLIT_TITLE : 'text-headline')}>{preparing ? `${t('wizard.url.quickPreparing')}…` : title}</span>
					{listKind ? <ChevronRight className={cn('relative ms-auto shrink-0 text-quick-card-ink opacity-85 transition-transform duration-200 group-hover/quick:translate-x-0.5 rtl:rotate-180', SPLIT_CHEVRON)} aria-hidden /> : null}
				</button>
			</Hint>
			{/* Beside the button, not in it: inside, it would join the button's name. */}
			<span id={descriptionId} className="sr-only">
				{listTitle ? `${listTitle}. ${profileLine}` : profileLine}
			</span>
		</>
	)
}

// The global shortcut, in Quick Download's or This video's hint: its name and chord; Settings explains it.
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
	split = false,
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
	// Beside This video and the list button: the third of three columns.
	split?: boolean
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
					compact
						? 'm-1.5 min-h-[4.25rem] p-1.5 md:basis-[48%]'
						: split
							? 'p-2 @xl:col-span-2 @3xl:col-span-1 lg:p-3 xl:p-3.5'
							: destinationLabel
								? 'm-2 min-h-[7.75rem] p-3 md:m-2 md:basis-[50%] md:self-stretch lg:m-3 lg:basis-[54%] lg:p-3.5 xl:basis-[56%]'
								: 'm-2 min-h-[5.5rem] p-2 md:m-2 md:min-h-0 md:basis-[50%] md:self-stretch lg:m-3 lg:basis-[54%] lg:p-2 xl:basis-[56%]'
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
									className={cn('quick-profile-selector-trigger h-auto min-w-0 flex-1 justify-start whitespace-normal rounded-xl bg-transparent text-left hover:bg-transparent', compact ? 'gap-3 px-1.5 py-1.5' : split ? 'gap-2 px-1 py-1 lg:gap-3' : 'gap-2 px-1.5 py-1.5 md:gap-3')}
									data-testid={`${testIdPrefix}-active-profile-trigger`}
								>
									<span className={cn('icon-tile grid shrink-0 place-items-center rounded-xl', compact ? 'size-10 [&_svg]:size-5' : split ? 'size-9 [&_svg]:size-4 lg:size-11 lg:[&_svg]:size-5 xl:size-14 xl:[&_svg]:size-7' : 'size-11 md:size-14 [&_svg]:size-5 md:[&_svg]:size-7')}>
										<ActiveIcon aria-hidden />
									</span>
									<span className={cn('quick-profile-selector-title block min-w-0 flex-1 truncate', compact ? 'text-title' : split ? SPLIT_TITLE : 'text-title md:text-headline')}>{nameOf(activeProfile)}</span>
									<span className={cn('quick-profile-chevron grid shrink-0 place-items-center rounded-full', compact ? 'size-9' : split ? 'size-8 lg:size-9 xl:size-10' : 'size-10')}>
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
									className={cn('quick-profile-inline-action shrink-0 rounded-full text-quick-selector-muted hover:text-quick-selector-ink', compact ? 'size-9' : split ? 'size-8 lg:size-9 xl:size-10' : 'size-10')}
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
