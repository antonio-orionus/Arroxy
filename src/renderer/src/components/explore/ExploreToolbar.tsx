import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ArrowLeft, ArrowRight, ChevronDown, House, Maximize2, Minimize2, RotateCw, ShieldAlert, ShieldCheck, ShieldEllipsis, ShieldOff, WandSparkles, type LucideIcon} from 'lucide-react'
import type {ExploreAdBlockStatus, ExploreSearchEngine} from '@shared/schemas.js'
import type {DownloadProfile, DownloadProfileRef, ExploreNavigateCommand, ExploreViewState} from '@shared/types.js'
import type {DownloadProfileActionModel} from '../wizard/downloadProfileActions.js'
import {DownloadProfileMenuContent} from '../wizard/DownloadProfileMenu.js'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {ButtonGroup} from '../ui/button-group.js'
import {Popover, PopoverTrigger} from '../ui/popover.js'
import {Separator} from '../ui/separator.js'
import {Hint} from '../shared/Hint.js'
import {NativeViewPointerEntries} from '../shared/nativeViewPointerEntries.js'
import {Spinner} from '../ui/spinner.js'
import {Toggle} from '../ui/toggle.js'
import {ExploreAddressBar} from './ExploreAddressBar.js'

// What the profile menu's picks and actions do; the home owns the editor and the tabs.
export interface ExploreProfileMenuActions {
	onPickProfile: (ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onNewProfile: () => void
	onManageProfiles: () => void
}

interface ExploreToolbarProps {
	state: ExploreViewState
	// How many times the pointer entered the native view (main reports each entry).
	pointerEntries: number
	grabbable: boolean
	profiles: DownloadProfileActionModel
	profileMenu: ExploreProfileMenuActions
	onNavigate: (command: ExploreNavigateCommand) => void
	// Where plain text typed in the address bar is searched.
	searchEngine: ExploreSearchEngine
	// Enter in the address bar; resolves true when the view navigates.
	onSubmitAddress: (text: string) => Promise<boolean>
	onAddressEdit: () => void
	onDownload: () => void
	onInteractive: () => void
	onToggleAdBlock: (enabled: boolean) => void
	// Compact app chrome: an icon-only tab bar and a slim footer, for more page.
	compact: boolean
	// Shown first in the row (the home's compact tab list).
	leading?: ReactNode
	onToggleCompact: (compact: boolean) => void
}

const AD_BLOCK_ICONS: Record<ExploreAdBlockStatus, LucideIcon> = {off: ShieldOff, starting: ShieldEllipsis, on: ShieldCheck, unavailable: ShieldAlert}
const AD_BLOCK_STATUS_KEY = {off: 'explore.toolbar.adBlock.off', starting: 'explore.toolbar.adBlock.starting', on: 'explore.toolbar.adBlock.on', unavailable: 'explore.toolbar.adBlock.unavailable'} as const satisfies Record<ExploreAdBlockStatus, string>

// P2-R36: pressed while the setting is on, whatever came of it; the icon and
// the tooltip say which.
function AdBlockToggle({status, onToggle}: {status: ExploreAdBlockStatus; onToggle: (enabled: boolean) => void}): ReactNode {
	const {t} = useTranslation()
	const Icon = AD_BLOCK_ICONS[status]
	const enabled = status !== 'off'
	return (
		<Hint
			label={
				<div className="flex flex-col gap-0.5">
					<span>{t(AD_BLOCK_STATUS_KEY[status])}</span>
					<span>{t('explore.toolbar.adBlock.accountNote')}</span>
				</div>
			}
		>
			<Toggle variant="outline" size="icon-sm" pressed={enabled} onPressedChange={onToggle} aria-label={t('explore.toolbar.adBlock.aria')} data-adblock={status} data-testid="explore-adblock">
				<Icon className={status === 'unavailable' ? 'text-warning' : undefined} aria-hidden />
			</Toggle>
		</Hint>
	)
}

// Pressed while the app chrome is compact; the icon shows what a press does.
function CompactToggle({compact, onToggle}: {compact: boolean; onToggle: (compact: boolean) => void}): ReactNode {
	const {t} = useTranslation()
	const label = compact ? t('explore.toolbar.fullLayout') : t('explore.toolbar.compactLayout')
	const Icon = compact ? Maximize2 : Minimize2
	return (
		<Hint label={label}>
			<Toggle variant="outline" size="icon-sm" pressed={compact} onPressedChange={onToggle} aria-label={t('explore.toolbar.compactLayout')} data-testid="explore-compact-toggle">
				<Icon aria-hidden />
			</Toggle>
		</Hint>
	)
}

// The profile menu is a DOM popup, so the view hides while it is open (the
// viewport's overlay rule), like for any dialog. A button that cannot act yet
// stays focusable (`focusableWhenDisabled`, so aria-disabled instead of
// disabled): the browser fires no hover on a disabled button, and that is when
// its tooltip has to say why.
export function ExploreToolbar({state, pointerEntries, grabbable, profiles, profileMenu, onNavigate, searchEngine, onSubmitAddress, onAddressEdit, onDownload, onInteractive, onToggleAdBlock, compact, leading, onToggleCompact}: ExploreToolbarProps): ReactNode {
	const {t} = useTranslation()
	const [menuOpen, setMenuOpen] = useState(false)
	const {activeProfile, ActiveIcon} = profiles
	const blocked = !grabbable
	const grabHint = grabbable ? undefined : t('explore.toolbar.grabUnavailable')
	const downloadLabel = t('explore.toolbar.downloadWithProfile', {profileName: activeProfile.name})
	const interactiveHint = t('explore.toolbar.interactiveHint')
	return (
		<NativeViewPointerEntries value={pointerEntries}>
			{/* Compact keeps one row wherever it fits (the address bar and the Download label shrink first); a very narrow or zoomed card still wraps. */}
			<div role="toolbar" aria-label={t('explore.toolbar.aria')} className={cn('flex min-w-0 flex-wrap items-center gap-2', compact && '@xl:flex-nowrap')} data-testid="explore-toolbar">
				{leading ? (
					<>
						{leading}
						<Separator orientation="vertical" className="my-1.5" />
					</>
				) : null}
				<ButtonGroup>
					<Hint label={t('explore.toolbar.back')}>
						<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.back')} disabled={!state.canGoBack} focusableWhenDisabled onClick={() => onNavigate({kind: 'back'})}>
							<ArrowLeft className="rtl:rotate-180" aria-hidden />
						</Button>
					</Hint>
					<Hint label={t('explore.toolbar.forward')}>
						<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.forward')} disabled={!state.canGoForward} focusableWhenDisabled onClick={() => onNavigate({kind: 'forward'})}>
							<ArrowRight className="rtl:rotate-180" aria-hidden />
						</Button>
					</Hint>
					<Hint label={t('explore.toolbar.reload')}>
						<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.reload')} onClick={() => onNavigate({kind: 'reload'})}>
							{state.loading ? <Spinner aria-hidden /> : <RotateCw aria-hidden />}
						</Button>
					</Hint>
					<Hint label={t('explore.toolbar.home')}>
						<Button type="button" variant="outline" size="icon-sm" aria-label={t('explore.toolbar.home')} onClick={() => onNavigate({kind: 'home'})}>
							<House aria-hidden />
						</Button>
					</Hint>
				</ButtonGroup>
				<ExploreAddressBar url={state.url} searchEngine={searchEngine} onSubmit={onSubmitAddress} onEdit={onAddressEdit} />
				<AdBlockToggle status={state.adBlock} onToggle={onToggleAdBlock} />
				{/* On a row of its own (narrow or zoomed windows) the cluster shrinks and the profile name truncates. */}
				<div className="flex min-w-0 max-w-full items-center gap-2" data-testid="explore-download-cluster">
					<Popover open={menuOpen} onOpenChange={setMenuOpen}>
						<ButtonGroup className="min-w-0">
							<Hint label={grabHint ?? downloadLabel}>
								<Button type="button" size="sm" disabled={blocked} focusableWhenDisabled aria-description={grabHint} onClick={onDownload} className="min-w-8 shrink" data-testid="explore-download">
									<ActiveIcon data-icon="inline-start" aria-hidden />
									<span className="min-w-0 truncate">{downloadLabel}</span>
								</Button>
							</Hint>
							<Hint label={grabHint ?? t('wizard.url.profile.switchTitle')}>
								<PopoverTrigger
									render={
										<Button type="button" size="icon-sm" disabled={blocked} focusableWhenDisabled aria-description={grabHint} aria-label={t('wizard.url.profile.switchAria', {profileName: activeProfile.name})} className="border-s-primary-foreground/25" data-testid="explore-profile-trigger">
											<ChevronDown aria-hidden />
										</Button>
									}
								/>
							</Hint>
						</ButtonGroup>
						<DownloadProfileMenuContent options={profiles.options} editProfile={activeProfile} onClose={() => setMenuOpen(false)} testIdPrefix="explore" {...profileMenu} />
					</Popover>
					<Hint label={grabHint ?? interactiveHint}>
						<Button type="button" size="icon-sm" variant="outline" aria-label={interactiveHint} aria-description={grabHint} disabled={blocked} focusableWhenDisabled onClick={onInteractive} data-testid="explore-interactive">
							<WandSparkles aria-hidden />
						</Button>
					</Hint>
				</div>
				<CompactToggle compact={compact} onToggle={onToggleCompact} />
			</div>
		</NativeViewPointerEntries>
	)
}
