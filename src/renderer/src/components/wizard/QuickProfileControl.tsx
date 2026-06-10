import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Check, ChevronDown, ChevronRight, Download, PenLine, Plus, Users} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef, DownloadProfilesPrefs} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger} from '../ui/popover.js'
import {Separator} from '../ui/separator.js'
import {Spinner} from '../ui/spinner.js'
import {buildDownloadProfileActionModel, type DownloadProfileActionModel} from './downloadProfileActions.js'

interface QuickProfileControlProps {
	defaultProfileMenuOpen?: boolean
	disabled: boolean
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

export function QuickProfileControl({defaultProfileMenuOpen = false, disabled, onDownload, onEditProfile, onManageProfiles, onNewProfile, onPickProfile, preparing, profilesPrefs, size = 'default', testIdPrefix = 'profiles'}: QuickProfileControlProps): ReactNode {
	const {t} = useTranslation()
	const model = buildDownloadProfileActionModel(profilesPrefs)
	const {activeProfile} = model
	const compact = size === 'compact'
	const clusterTestId = testIdPrefix === 'profiles' ? 'profiles-quick-preview' : 'bulk-quick-profile-preview'
	return (
		<div className={cn('quick-profile-cluster flex w-full flex-col overflow-hidden rounded-[1.25rem] md:flex-row', compact ? 'md:min-h-[5rem]' : 'md:min-h-[6.5rem]')} data-linked-control="quick-profile" data-testid={clusterTestId}>
			<button
				type="button"
				disabled={disabled}
				aria-busy={preparing}
				onClick={onDownload}
				className={cn(
					'quick-profile-action group/quick relative flex min-w-0 flex-1 items-center gap-4 overflow-hidden text-left transition-[filter,transform] duration-200',
					compact ? 'min-h-[4.75rem] px-4 py-3 md:min-h-[5rem] md:basis-[52%]' : 'min-h-[6rem] px-5 py-4 md:min-h-[6.5rem] md:basis-[52%] lg:px-5 xl:px-6',
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

			<ProfileMenu activeProfile={activeProfile} compact={compact} defaultOpen={defaultProfileMenuOpen} onEditProfile={onEditProfile} onManageProfiles={onManageProfiles} onNewProfile={onNewProfile} onPickProfile={onPickProfile} model={model} testIdPrefix={testIdPrefix} />
		</div>
	)
}

function ProfileMenu({
	activeProfile,
	compact,
	defaultOpen,
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
	onEditProfile: (profile: DownloadProfile) => void
	onManageProfiles: () => void
	onNewProfile: () => void
	onPickProfile: (ref: DownloadProfileRef) => void
	model: DownloadProfileActionModel
	testIdPrefix: 'profiles' | 'bulk'
}): ReactNode {
	const menuTestId = `${testIdPrefix}-profile-menu`
	const [menuOpen, setMenuOpen] = useState(defaultOpen)
	const {ActiveIcon, activeSummary, options} = model

	function closeAndRun(action: () => void): void {
		setMenuOpen(false)
		action()
	}

	return (
		<Popover open={menuOpen} onOpenChange={setMenuOpen}>
			<PopoverTrigger
				render={
					<Button
						type="button"
						variant="ghost"
						aria-label={`Switch download profile: ${activeProfile.name}`}
						title="Switch download profile"
						className={cn(
							'quick-profile-selector h-auto w-auto min-w-0 flex-1 justify-start gap-3 whitespace-normal rounded-[1rem] text-left hover:bg-transparent',
							compact ? 'm-1.5 min-h-[4.25rem] px-3 py-3 md:basis-[48%]' : 'm-2 min-h-[5.5rem] px-4 py-4 md:m-2 md:min-h-0 md:basis-[48%] md:self-stretch md:px-4 lg:m-3 lg:px-5'
						)}
						data-testid={`${testIdPrefix}-active-profile-card`}
					>
						<span className={cn('icon-tile grid shrink-0 place-items-center rounded-xl', compact ? 'size-10 [&_svg]:size-5' : 'size-12 md:size-14 [&_svg]:size-6 md:[&_svg]:size-7')}>
							<ActiveIcon aria-hidden />
						</span>
						<span className="min-w-0 flex-1">
							<span className="quick-profile-selector-kicker mb-1 block truncate text-label uppercase">Active profile</span>
							<span className={cn('quick-profile-selector-title block truncate', compact ? 'text-title' : 'text-headline')}>{activeProfile.name}</span>
							<span className={cn('quick-profile-selector-meta mt-0.5 block truncate font-normal leading-snug', compact ? 'text-xs' : 'text-sm')}>{activeSummary}</span>
						</span>
						<span className={cn('quick-profile-chevron grid shrink-0 place-items-center rounded-full', compact ? 'size-9' : 'size-10')}>
							<ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-aria-expanded/button:rotate-180" />
						</span>
					</Button>
				}
			/>
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
					<PopoverTitle className="text-base font-semibold">Switch profile</PopoverTitle>
					<PopoverDescription className="text-[13px] leading-relaxed">Change the active profile for Quick Download, Bulk URLs, and playlists.</PopoverDescription>
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
						Edit active profile
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onNewProfile)}>
						<Plus data-icon="inline-start" />
						New profile
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onManageProfiles)}>
						<Users data-icon="inline-start" />
						Manage profiles
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}
