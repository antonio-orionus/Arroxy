// One profile's card, wherever a profile is picked: its icon, its name, the
// badges that say where it comes from (Built-in, Custom, Modified) and that it
// is Hidden, the check on the one in use, the summary hint beside it and its
// format for screen readers. The pick is a Button.
//
// Three sizes: a tile in the picker's grid, a row in the picker's list (and,
// as a label only, in a right-click menu), and a card on the Profiles tab,
// where the tab adds a drag handle, Edit and Remove, and the enable switch.

import type {ComponentProps, ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Check} from 'lucide-react'
import type {DownloadProfileOrigin} from '@shared/downloadProfiles.js'
import type {DownloadProfile} from '@shared/types.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'
import {cn} from '@renderer/lib/utils.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Hint} from '../shared/Hint.js'
import {IconTile} from '../shared/IconTile.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import {ProfileSummaryContent} from './ProfileSummaryContent.js'

export type ProfileCardSize = 'tile' | 'row' | 'card'

export interface ProfileIdentity {
	profile: DownloadProfile
	origin: DownloadProfileOrigin
	// Tagged Hidden: turned off in the Profiles tab, or no longer saved.
	hidden: boolean
}

const SIZES = {
	tile: {gap: 'gap-1.5', badge: 'sm', button: 'outline', pick: 'choice-surface min-h-12 gap-2.5 px-2.5 py-2'},
	// The ghost button's own hover (muted at half strength) is invisible on the
	// dark popover and would replace the selected tint: a row hovers in the
	// selected tint, lighter, and the selected row keeps its tint on hover.
	row: {gap: 'gap-1.5', badge: 'sm', button: 'ghost', pick: 'min-h-10 gap-2.5 px-2 py-1.5 hover:bg-primary/8 data-selected:bg-primary/12 data-selected:hover:bg-primary/12 dark:hover:bg-primary/8 dark:data-selected:hover:bg-primary/12'},
	// The tab's card is the surface; the pick inside it paints nothing of its own,
	// and the card, not the pick, dims a hidden profile.
	card: {gap: 'gap-2', badge: 'default', button: 'ghost', pick: 'gap-3 border-0 p-0 hover:bg-transparent aria-disabled:opacity-100 dark:hover:bg-transparent'}
} as const satisfies Record<ProfileCardSize, {gap: string; badge: 'sm' | 'default'; button: 'outline' | 'ghost'; pick: string}>

function ProfileBadges({origin, hidden, size}: {origin: DownloadProfileOrigin; hidden: boolean; size: ProfileCardSize}): ReactNode {
	const {t} = useTranslation()
	const changed = origin.kind === 'custom' || origin.overridden
	return (
		<>
			<Badge variant={changed ? 'outline' : 'secondary'} size={SIZES[size].badge}>
				{origin.kind === 'custom' ? t('wizard.url.profile.badgeCustom') : origin.overridden ? t('wizard.url.profile.badgeModified') : t('wizard.url.profile.badgeBuiltIn')}
			</Badge>
			{hidden ? (
				<Badge variant="outline" size={SIZES[size].badge}>
					{t('wizard.url.profile.badgeDisabled')}
				</Badge>
			) : null}
		</>
	)
}

// Icon, name and badges: the card's identity without the pick around it, which
// is all a right-click menu's radio item can hold.
export function ProfileCardLabel({profile, origin, hidden, size = 'row', partTestId}: ProfileIdentity & {size?: ProfileCardSize; partTestId?: string}): ReactNode {
	const nameOf = useProfileDisplayName()
	const Icon = PROFILE_ICONS[profile.icon]
	const part = (name: string): string | undefined => (partTestId ? `${partTestId}-${name}` : undefined)
	return (
		<>
			{size === 'card' ? (
				<IconTile>
					<Icon />
				</IconTile>
			) : (
				<Icon className="shrink-0 text-primary" aria-hidden />
			)}
			<span className="min-w-0 flex-1" data-testid={part('summary')}>
				<span className={cn('flex min-w-0 items-center', SIZES[size].gap)} data-testid={part('title-row')}>
					<span className="truncate text-sm font-semibold text-foreground" data-testid={part('title')}>
						{nameOf(profile)}
					</span>
					<ProfileBadges origin={origin} hidden={hidden} size={size} />
				</span>
			</span>
		</>
	)
}

export interface ProfileCardPickProps extends ProfileIdentity {
	size: Exclude<ProfileCardSize, 'card'>
	// The profile in use: checked, on a selected surface.
	current: boolean
	onPick: () => void
	testId: string
}

interface PickProps extends ProfileIdentity {
	size: ProfileCardSize
	current: boolean
	// False keeps the pick in the tab order, with its hint, but does nothing.
	pickable: boolean
	onPick: () => void
	testId: string
	partTestId?: string
}

function ProfilePick({profile, origin, hidden, size, current, pickable, onPick, testId, partTestId}: PickProps): ReactNode {
	const {t, i18n} = useTranslation()
	return (
		<Hint label={<ProfileSummaryContent profile={profile} />} delay={600} side="inline-end">
			<Button
				type="button"
				variant={SIZES[size].button}
				onClick={() => {
					if (pickable) onPick()
				}}
				aria-pressed={current}
				aria-disabled={pickable ? undefined : true}
				aria-description={profileFormatLabel(profile, t, i18n.language)}
				data-selected={current || undefined}
				className={cn('h-auto w-full justify-start rounded-md text-start whitespace-normal', SIZES[size].pick)}
				data-testid={testId}
			>
				<ProfileCardLabel profile={profile} origin={origin} hidden={hidden} size={size} partTestId={partTestId} />
				<Check className={cn('shrink-0 text-primary transition-opacity duration-150', current ? 'opacity-100' : 'opacity-0')} aria-hidden data-testid={partTestId ? `${partTestId}-check` : undefined} />
			</Button>
		</Hint>
	)
}

// A profile as one option of a picker: a tile in the grid, a row in the list.
export function ProfileCardPick(props: ProfileCardPickProps): ReactNode {
	return <ProfilePick {...props} pickable />
}

export interface ProfileCardProps extends ProfileIdentity, Omit<ComponentProps<'article'>, 'children' | 'hidden'> {
	current: boolean
	onPick: () => void
	testId: string
	// The tab's own controls, in the row under the pick.
	handle: ReactNode
	actions: ReactNode
	toggle: ReactNode
}

// A profile on the Profiles tab: the pick, and under it the drag handle, the
// actions and the enable switch. A hidden profile is dimmed and cannot be
// picked as the active one until it is turned back on.
export function ProfileCard({profile, origin, hidden, current, onPick, testId, handle, actions, toggle, className, ...article}: ProfileCardProps): ReactNode {
	return (
		<article {...article} data-active={current ? 'true' : undefined} data-selected={current || undefined} data-disabled-profile={hidden ? 'true' : undefined} className={cn('choice-surface relative rounded-lg p-3', hidden && 'opacity-60 saturate-[0.7]', className)} data-testid={testId}>
			<ProfilePick profile={profile} origin={origin} hidden={hidden} size="card" current={current} pickable={!hidden} onPick={onPick} testId={`${testId}-picker`} partTestId={testId} />
			<div className="mt-3 flex items-center gap-2" data-testid={`${testId}-actions`}>
				{handle}
				<div className="grid flex-1 grid-cols-2 gap-2">{actions}</div>
				{toggle}
			</div>
		</article>
	)
}
