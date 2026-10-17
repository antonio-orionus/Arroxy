import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Check, PenLine, Plus, Users} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {Button} from '../ui/button.js'
import {PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle} from '../ui/popover.js'
import {Separator} from '../ui/separator.js'
import type {DownloadProfileActionModel} from './downloadProfileActions.js'
import {Hint} from '../shared/Hint.js'

export type DownloadProfileMenuTestIdPrefix = 'profiles' | 'bulk' | 'explore' | 'wizard'

interface DownloadProfileMenuContentProps {
	model: DownloadProfileActionModel
	onPickProfile: (ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onNewProfile: () => void
	// Left out where leaving for the Profiles tab would drop work in progress (the download wizard).
	onManageProfiles?: () => void
	// What the Edit action and the header say; they default to the app's active profile.
	editLabel?: string
	description?: string
	// Which side of the trigger the menu lines up with; the arrow follows.
	align?: 'start' | 'end'
	// Closes the owning Popover; called before every pick or action.
	onClose: () => void
	testIdPrefix: DownloadProfileMenuTestIdPrefix
}

// The profile switcher's popup: every enabled profile in a grid, then Edit,
// New and Manage. The caller owns the Popover root and its trigger, so the URL
// tab's card and Explore's split button open the same menu.
export function DownloadProfileMenuContent({model, onPickProfile, onEditProfile, onNewProfile, onManageProfiles, editLabel, description, align = 'end', onClose, testIdPrefix}: DownloadProfileMenuContentProps): ReactNode {
	const {t} = useTranslation()
	const {activeProfile, options} = model

	function closeAndRun(action: () => void): void {
		onClose()
		action()
	}

	return (
		<PopoverContent
			align={align}
			collisionAvoidance={{side: 'shift', align: 'shift', fallbackAxisSide: 'none'}}
			collisionPadding={{top: 76, right: 16, bottom: 24, left: 16}}
			finalFocus={closeType => closeType === 'keyboard'}
			initialFocus={openType => openType === 'keyboard'}
			// Preserve the measured grid while the menu animates closed.
			keepMounted
			sideOffset={10}
			className={cn(
				'relative max-h-[calc(100vh-6rem)] w-[min(50rem,calc(100vw-2rem))] gap-3 overflow-y-auto border-border-strong p-3 before:absolute before:-top-2 before:size-4 before:rotate-45 before:border-s before:border-t before:border-border-strong before:bg-popover',
				align === 'end' ? 'before:right-8' : 'before:left-8'
			)}
			data-testid={`${testIdPrefix}-profile-menu`}
		>
			<PopoverHeader>
				<PopoverTitle className="text-base font-semibold">{t('wizard.url.profile.menuTitle')}</PopoverTitle>
				<PopoverDescription className="text-sm leading-relaxed">{description ?? t('wizard.url.profile.menuDescription')}</PopoverDescription>
			</PopoverHeader>
			<Separator />
			<div className="grid grid-cols-[repeat(auto-fit,minmax(13.5rem,1fr))] gap-2" data-testid={`${testIdPrefix}-profile-menu-grid`}>
				{options.map(({profile, ref, Icon, active, label}) => (
					<Hint key={profile.id} label={`${profile.name}: ${label}`} reveal>
						<Button
							type="button"
							variant="outline"
							onClick={() => closeAndRun(() => onPickProfile(ref))}
							aria-pressed={active}
							data-selected={active || undefined}
							className="choice-surface h-auto min-h-12 w-full justify-start gap-2.5 rounded-md px-2.5 py-2 text-start whitespace-normal"
							data-testid={`${testIdPrefix}-profile-option-${profile.id}`}
						>
							<Icon className="shrink-0 text-primary" aria-hidden />
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-semibold text-foreground">{profile.name}</span>
								<span className="block truncate text-caption font-normal leading-tight text-subtle-foreground">{label}</span>
							</span>
							{active ? <Check className="shrink-0 text-primary" aria-hidden /> : null}
						</Button>
					</Hint>
				))}
			</div>
			<Separator />
			<div className={cn('grid grid-cols-1 gap-2', onManageProfiles ? 'sm:grid-cols-3' : 'sm:grid-cols-2')} data-testid={`${testIdPrefix}-profile-menu-actions`}>
				<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(() => onEditProfile(activeProfile))}>
					<PenLine data-icon="inline-start" />
					{editLabel ?? t('wizard.url.profile.editActive')}
				</Button>
				<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onNewProfile)}>
					<Plus data-icon="inline-start" />
					{t('wizard.url.profile.newProfile')}
				</Button>
				{onManageProfiles ? (
					<Button type="button" variant="outline" size="sm" onClick={() => closeAndRun(onManageProfiles)}>
						<Users data-icon="inline-start" />
						{t('wizard.url.profile.manageProfiles')}
					</Button>
				) : null}
			</div>
		</PopoverContent>
	)
}
