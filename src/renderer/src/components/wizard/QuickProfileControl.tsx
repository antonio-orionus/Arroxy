import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Check, ChevronDown, ChevronRight, Download, Folder, FolderCog, PenLine, Plus, Users} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger} from '../ui/popover.js'
import {Separator} from '../ui/separator.js'
import {Spinner} from '../ui/spinner.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {buildDownloadProfileActionModel, type DownloadProfileActionModel} from './downloadProfileActions.js'

interface QuickProfileControlProps {
	defaultProfileMenuOpen?: boolean
	destination?: string
	destinationDetail?: string
	disabled: boolean
	onChangeGlobalDestination?: () => void
	onDownload: () => void
	onEditProfile: (profile: DownloadProfile) => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (ref: DownloadProfileRef) => void
	preparing: boolean
	profilesPrefs?: DownloadProfilesPrefs
	size?: 'default' | 'compact'
	testIdPrefix?: 'profiles' | 'bulk'
}

export function QuickProfileControl({
	defaultProfileMenuOpen = false,
	destination,
	destinationDetail,
	disabled,
	onChangeGlobalDestination,
	onDownload,
	onEditProfile,
	onManageProfiles,
	onNewProfile,
	onPickProfile,
	preparing,
	profilesPrefs,
	size = 'default',
	testIdPrefix = 'profiles'
}: QuickProfileControlProps): ReactNode {
	const {t} = useTranslation()
	const model = buildDownloadProfileActionModel(profilesPrefs)
	const {activeProfile} = model
	const compact = size === 'compact'
	const hasDestination = !compact && Boolean(destination?.trim())
	const clusterTestId = testIdPrefix === 'profiles' ? 'profiles-quick-preview' : 'bulk-quick-profile-preview'
	return (
		<div className={cn('quick-profile-cluster flex w-full flex-col overflow-hidden rounded-[1.25rem] md:flex-row', compact ? 'md:min-h-[5rem]' : hasDestination ? 'md:min-h-[8.5rem]' : 'md:min-h-[6.5rem]')} data-linked-control="quick-profile" data-testid={clusterTestId}>
			<button
				type="button"
				disabled={disabled}
				aria-busy={preparing}
				onClick={onDownload}
				className={cn(
					'quick-profile-action group/quick relative flex min-w-0 flex-1 items-center gap-4 overflow-hidden text-left transition-[filter,transform] duration-200',
					compact ? 'min-h-[4.75rem] px-4 py-3 md:min-h-[5rem] md:basis-[52%]' : 'min-h-[6rem] px-5 py-4 md:m-2 md:me-0 md:min-h-0 md:flex-[0_1_42%] md:self-stretch lg:m-3 lg:me-0 lg:flex-[0_1_38%] lg:px-5 xl:flex-[0_1_36%] xl:px-6',
					'hover:brightness-[1.08] active:translate-y-px',
					'focus-visible:outline-none',
					disabled && !preparing && 'pointer-events-none opacity-55 saturate-[0.65]',
					preparing && 'pointer-events-none'
				)}
				data-testid={`${testIdPrefix}-quick-download`}
			>
				<span aria-hidden className="quick-card-overlay pointer-events-none absolute inset-0" />
				<span className={cn('icon-tile quick-icon-tile relative grid shrink-0 place-items-center rounded-xl [&_svg]:size-6', compact ? 'size-11' : 'size-12 md:size-14 md:[&_svg]:size-7')}>{preparing ? <Spinner aria-hidden className={compact ? 'size-5' : 'size-6 md:size-7'} /> : <Download aria-hidden />}</span>
				<span className="relative flex min-w-0 flex-col">
					<span className={compact ? 'text-title' : 'text-headline'}>{preparing ? `${t('wizard.url.quickPreparing')}…` : t('wizard.url.quickDownload')}</span>
					<span className={cn('mt-1 block truncate font-medium leading-snug text-[var(--quick-card-muted)]', compact ? 'text-xs' : 'text-sm md:whitespace-nowrap')}>{t('wizard.url.quickDownloadTooltip', {profileName: activeProfile.name})}</span>
				</span>
				<ChevronRight className={cn('relative ms-auto shrink-0 text-[var(--quick-card-ink)] opacity-85 transition-transform duration-200 group-hover/quick:translate-x-0.5', compact ? 'size-5' : 'size-5 md:size-6')} aria-hidden />
			</button>

			<ProfileMenu
				activeProfile={activeProfile}
				compact={compact}
				defaultOpen={defaultProfileMenuOpen}
				destination={destination}
				destinationDetail={destinationDetail}
				onChangeGlobalDestination={onChangeGlobalDestination}
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

function ProfileMenu({
	activeProfile,
	compact,
	defaultOpen,
	destination,
	destinationDetail,
	onChangeGlobalDestination,
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
	onChangeGlobalDestination?: () => void
	onEditProfile: (profile: DownloadProfile) => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (ref: DownloadProfileRef) => void
	model: DownloadProfileActionModel
	testIdPrefix: 'profiles' | 'bulk'
}): ReactNode {
	const {t} = useTranslation()
	const menuTestId = `${testIdPrefix}-profile-menu`
	const [menuOpen, setMenuOpen] = useState(defaultOpen)
	const {ActiveIcon, activeSummary, options} = model
	const destinationLabel = compact ? undefined : destination?.trim()
	const destinationDetailText = destinationDetail?.trim()
	const destinationDetailLabel = destinationDetailText === undefined || destinationDetailText.length === 0 ? t('wizard.url.profile.destinationFallback') : destinationDetailText
	const activeProfileLabel = t('wizard.url.profile.activeLabel')
	const changeGlobalDestinationLabel = t('wizard.url.profile.changeGlobalDestination')
	const editActiveProfileLabel = t('wizard.url.profile.editActive')
	const switchProfileTitle = t('wizard.url.profile.switchTitle')

	function closeAndRun(action: () => void): void {
		setMenuOpen(false)
		action()
	}

	return (
		<Popover open={menuOpen} onOpenChange={setMenuOpen}>
			<div
				className={cn(
					'quick-profile-selector relative flex min-w-0 flex-1 flex-col whitespace-normal rounded-[1rem] text-left',
					compact ? 'm-1.5 min-h-[4.25rem] p-1.5 md:basis-[48%]' : destinationLabel ? 'm-2 min-h-[7.75rem] p-3 md:m-2 md:basis-[50%] md:self-stretch lg:m-3 lg:basis-[54%] lg:p-3.5 xl:basis-[56%]' : 'm-2 min-h-[5.5rem] p-2 md:m-2 md:min-h-0 md:basis-[50%] md:self-stretch lg:m-3 lg:basis-[54%] lg:p-2 xl:basis-[56%]'
				)}
				data-testid={`${testIdPrefix}-active-profile-card`}
			>
				<div className="relative flex min-w-0 items-center gap-2">
					<PopoverTrigger
						render={
							<Button
								type="button"
								variant="ghost"
								aria-label={t('wizard.url.profile.switchAria', {profileName: activeProfile.name})}
								title={switchProfileTitle}
								className={cn('quick-profile-selector-trigger h-auto min-w-0 flex-1 justify-start whitespace-normal rounded-xl bg-transparent text-left hover:bg-transparent', compact ? 'gap-3 px-1.5 py-1.5' : 'gap-2 px-1.5 py-1.5 md:gap-3')}
								data-testid={`${testIdPrefix}-active-profile-trigger`}
							>
								<span className={cn('icon-tile grid shrink-0 place-items-center rounded-xl', compact ? 'size-10 [&_svg]:size-5' : 'size-11 md:size-14 [&_svg]:size-5 md:[&_svg]:size-7')}>
									<ActiveIcon aria-hidden />
								</span>
								<span className="min-w-0 flex-1">
									<span className="quick-profile-selector-kicker mb-1 block truncate text-label uppercase">{activeProfileLabel}</span>
									<span className={cn('quick-profile-selector-title block truncate', compact ? 'text-title' : 'text-title md:text-headline')}>{activeProfile.name}</span>
									<span className={cn('quick-profile-selector-meta mt-0.5 block truncate font-normal leading-snug', compact ? 'text-xs' : 'text-xs md:text-sm')}>{activeSummary}</span>
								</span>
								<span className={cn('quick-profile-chevron grid shrink-0 place-items-center rounded-full', compact ? 'size-9' : 'size-10')}>
									<ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-aria-expanded/button:rotate-180" />
								</span>
							</Button>
						}
					/>
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
									className={cn('quick-profile-inline-action shrink-0 rounded-full text-[var(--quick-selector-muted)] hover:text-[var(--quick-selector-ink)]', compact ? 'size-9' : 'size-10')}
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
					<div className="quick-profile-destination relative mt-2 flex min-w-0 items-center gap-2 rounded-xl px-2 py-2" data-testid={`${testIdPrefix}-profile-destination`}>
						<Folder className="size-4 shrink-0 text-[var(--quick-selector-muted)]" aria-hidden />
						<span className="min-w-0 flex-1">
							<span className="block truncate text-[11px] font-medium leading-snug text-[var(--quick-selector-muted)]" title={destinationDetailLabel}>
								{destinationDetailLabel}
							</span>
							<span className="mt-1 block truncate font-mono text-[12px] leading-tight text-[var(--quick-selector-ink)]" title={destinationLabel}>
								{destinationLabel}
							</span>
						</span>
						{onChangeGlobalDestination ? (
							<Tooltip>
								<TooltipTrigger
									render={props => (
										<Button
											{...props}
											type="button"
											variant="ghost"
											size="icon-sm"
											aria-label={changeGlobalDestinationLabel}
											onClick={() => closeAndRun(onChangeGlobalDestination)}
											className="quick-profile-inline-action shrink-0 text-[var(--quick-selector-muted)] hover:text-[var(--quick-selector-ink)]"
											data-testid={`${testIdPrefix}-change-global-destination`}
										>
											<FolderCog aria-hidden />
										</Button>
									)}
								/>
								<TooltipContent>{changeGlobalDestinationLabel}</TooltipContent>
							</Tooltip>
						) : null}
					</div>
				) : null}
			</div>
			<PopoverContent
				align="end"
				collisionAvoidance={{side: 'shift', align: 'shift', fallbackAxisSide: 'none'}}
				collisionPadding={{top: 76, right: 16, bottom: 24, left: 16}}
				finalFocus={closeType => closeType === 'keyboard'}
				initialFocus={openType => openType === 'keyboard'}
				// Preserve the measured grid while the menu animates closed.
				keepMounted
				sideOffset={10}
				className="relative max-h-[calc(100vh-6rem)] w-[min(50rem,calc(100vw-2rem))] gap-3 overflow-y-auto border-[var(--border-strong)] p-3 before:absolute before:-top-2 before:right-8 before:size-4 before:rotate-45 before:border-s before:border-t before:border-[var(--border-strong)] before:bg-popover"
				data-testid={menuTestId}
			>
				<PopoverHeader>
					<PopoverTitle className="text-base font-semibold">{t('wizard.url.profile.menuTitle')}</PopoverTitle>
					<PopoverDescription className="text-[13px] leading-relaxed">{t('wizard.url.profile.menuDescription')}</PopoverDescription>
				</PopoverHeader>
				<Separator />
				<div className="grid grid-cols-[repeat(auto-fit,minmax(13.5rem,1fr))] gap-2" data-testid={`${testIdPrefix}-profile-menu-grid`}>
					{options.map(({profile, ref, Icon, active, label}) => {
						return (
							<Button
								key={profile.id}
								type="button"
								variant="outline"
								onClick={() => {
									onPickProfile(ref)
									setMenuOpen(false)
								}}
								aria-pressed={active}
								title={`${profile.name}: ${label}`}
								className={cn('h-auto min-h-12 w-full justify-start gap-2.5 whitespace-normal rounded-md px-2.5 py-2 text-left', active ? 'border-[var(--brand)] bg-[var(--brand-dim)] shadow-[0_0_0_1px_var(--brand-dim)]' : 'bg-muted/20 hover:border-[var(--border-strong)]')}
								data-testid={`${testIdPrefix}-profile-option-${profile.id}`}
							>
								<Icon className="shrink-0 text-[var(--brand)]" aria-hidden />
								<span className="min-w-0 flex-1">
									<span className="block truncate text-[13px] font-semibold text-foreground">{profile.name}</span>
									<span className="block truncate text-[11px] font-normal leading-tight text-[var(--text-subtle)]">{label}</span>
								</span>
								{active ? <Check className="shrink-0 text-[var(--brand)]" aria-hidden /> : null}
							</Button>
						)
					})}
				</div>
				<Separator />
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3" data-testid={`${testIdPrefix}-profile-menu-actions`}>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(() => onEditProfile(activeProfile))}>
						<PenLine data-icon="inline-start" />
						{editActiveProfileLabel}
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onNewProfile)}>
						<Plus data-icon="inline-start" />
						{t('wizard.url.profile.newProfile')}
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onManageProfiles)}>
						<Users data-icon="inline-start" />
						{t('wizard.url.profile.manageProfiles')}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}
