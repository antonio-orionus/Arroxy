// The one profile picker. Every place that picks a download profile shows the
// same options (profilePickerOptions: saved order, a hidden profile in use
// first) with the same marker (a check on a selected surface), in one of two
// layouts: a grid where the pick changes the app's active profile, a list
// where it picks for one download or for playlist rows. The right-click menu
// on playlist rows renders the same options as menu items.

import {useId, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Check, PenLine, Plus, Users} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {ContextMenuGroup, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem} from '../ui/context-menu.js'
import {PopoverContent} from '../ui/popover.js'
import {Separator} from '../ui/separator.js'
import {Hint} from '../shared/Hint.js'
import type {ProfilePickerOption} from './profilePickerOptions.js'

export type ProfilePickerLayout = 'grid' | 'list'
export type ProfilePickerTestIdPrefix = 'profiles' | 'bulk' | 'explore' | 'wizard' | 'playlist' | 'playlist-row' | 'kit'

// Icon, name, the Hidden tag for a profile kept only because it is in use, and its summary.
function ProfileOptionLabel({option}: {option: ProfilePickerOption}): ReactNode {
	const {t} = useTranslation()
	const {profile, Icon, label, hidden} = option
	return (
		<>
			<Icon className="shrink-0 text-primary" aria-hidden />
			<span className="min-w-0 flex-1">
				<span className="flex min-w-0 items-center gap-1.5">
					<span className="truncate text-sm font-semibold text-foreground">{profile.name}</span>
					{hidden ? (
						<Badge variant="outline" size="sm">
							{t('wizard.url.profile.badgeDisabled')}
						</Badge>
					) : null}
				</span>
				<span className="block truncate text-caption font-normal leading-tight text-subtle-foreground">{label}</span>
			</span>
		</>
	)
}

interface ProfilePickerOptionsProps {
	options: readonly ProfilePickerOption[]
	layout: ProfilePickerLayout
	onPick: (ref: DownloadProfileRef) => void
	testIdPrefix: ProfilePickerTestIdPrefix
}

function ProfilePickerOptions({options, layout, onPick, testIdPrefix}: ProfilePickerOptionsProps): ReactNode {
	return (
		<div className={cn('grid', layout === 'grid' ? 'grid-cols-[repeat(auto-fit,minmax(13.5rem,1fr))] gap-2' : 'grid-cols-1 gap-0.5')} data-layout={layout} data-testid={`${testIdPrefix}-profile-menu-grid`}>
			{options.map(option => (
				<Hint key={option.profile.id} label={`${option.profile.name}: ${option.label}`} reveal>
					<Button
						type="button"
						variant={layout === 'grid' ? 'outline' : 'ghost'}
						onClick={() => onPick(option.ref)}
						aria-pressed={option.current}
						data-selected={option.current || undefined}
						className={cn('h-auto w-full justify-start gap-2.5 rounded-md text-start whitespace-normal', layout === 'grid' ? 'choice-surface min-h-12 px-2.5 py-2' : 'min-h-10 px-2 py-1.5 data-selected:bg-primary/12')}
						data-testid={`${testIdPrefix}-profile-option-${option.profile.id}`}
					>
						<ProfileOptionLabel option={option} />
						{option.current ? <Check className="shrink-0 text-primary" aria-hidden /> : null}
					</Button>
				</Hint>
			))}
		</div>
	)
}

export interface ProfilePickerPanelProps {
	options: readonly ProfilePickerOption[]
	layout: ProfilePickerLayout
	// Defaults to wording about the app's active profile.
	description?: string
	// The profile the Edit action opens; null leaves Edit out, as when the rows a picker acts on use different profiles.
	editProfile: DownloadProfile | null
	editLabel?: string
	onPickProfile: (ref: DownloadProfileRef) => void
	onEditProfile: (profile: DownloadProfile) => void
	onNewProfile: () => void
	// Left out where leaving for the Profiles tab would drop work in progress (the download wizard).
	onManageProfiles?: () => void
	testIdPrefix: ProfilePickerTestIdPrefix
	titleId?: string
	descriptionId?: string
}

// Title, options and actions, without the popup around them.
function ProfilePickerPanel({options, layout, description, editProfile, editLabel, onPickProfile, onEditProfile, onNewProfile, onManageProfiles, testIdPrefix, titleId, descriptionId}: ProfilePickerPanelProps): ReactNode {
	const {t} = useTranslation()
	const actionCount = (editProfile ? 1 : 0) + 1 + (onManageProfiles ? 1 : 0)
	return (
		<>
			<div className="flex flex-col gap-0.5">
				<h2 id={titleId} className="text-base font-semibold">
					{t('wizard.url.profile.menuTitle')}
				</h2>
				<p id={descriptionId} className="text-sm leading-relaxed text-muted-foreground">
					{description ?? t('wizard.url.profile.menuDescription')}
				</p>
			</div>
			<Separator />
			<ProfilePickerOptions options={options} layout={layout} onPick={onPickProfile} testIdPrefix={testIdPrefix} />
			<Separator />
			<div className={cn('grid grid-cols-1 gap-2', layout === 'grid' && (actionCount === 3 ? 'sm:grid-cols-3' : actionCount === 2 && 'sm:grid-cols-2'))} data-testid={`${testIdPrefix}-profile-menu-actions`}>
				{editProfile ? (
					<Button type="button" variant="outline" size="sm" onClick={() => onEditProfile(editProfile)}>
						<PenLine data-icon="inline-start" />
						{editLabel ?? t('wizard.url.profile.editActive')}
					</Button>
				) : null}
				<Button type="button" variant="outline" size="sm" onClick={onNewProfile}>
					<Plus data-icon="inline-start" />
					{t('wizard.url.profile.newProfile')}
				</Button>
				{onManageProfiles ? (
					<Button type="button" variant="outline" size="sm" onClick={onManageProfiles}>
						<Users data-icon="inline-start" />
						{t('wizard.url.profile.manageProfiles')}
					</Button>
				) : null}
			</div>
		</>
	)
}

const SURFACE = 'relative gap-3 border-border-strong p-3'
const WIDTH: Record<ProfilePickerLayout, string> = {grid: 'w-[min(50rem,calc(100vw-2rem))]', list: 'w-[min(22rem,calc(100vw-2rem))]'}

// The picker's popup laid out in place, so the UI Kit shows every variant at once.
export function ProfilePickerInline(props: ProfilePickerPanelProps): ReactNode {
	return (
		<div className={cn('flex flex-col rounded-lg border bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10', SURFACE, props.layout === 'grid' ? 'w-full max-w-[50rem]' : WIDTH.list)} data-testid={`${props.testIdPrefix}-profile-picker-${props.layout}`}>
			<ProfilePickerPanel {...props} />
		</div>
	)
}

interface ProfilePickerMenuProps extends ProfilePickerPanelProps {
	// Which side of the trigger the menu lines up with; the arrow follows.
	align?: 'start' | 'end'
	// Closes the owning Popover; called before every pick or action.
	onClose: () => void
}

// The picker as a popup. The caller owns the Popover root and its trigger.
export function ProfilePickerMenu({align = 'end', onClose, onPickProfile, onEditProfile, onNewProfile, onManageProfiles, ...panel}: ProfilePickerMenuProps): ReactNode {
	const titleId = useId()
	const descriptionId = useId()
	function closing<A extends unknown[]>(action: (...args: A) => void): (...args: A) => void {
		return (...args) => {
			onClose()
			action(...args)
		}
	}
	return (
		<PopoverContent
			align={align}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			collisionAvoidance={{side: 'shift', align: 'shift', fallbackAxisSide: 'none'}}
			collisionPadding={{top: 76, right: 16, bottom: 24, left: 16}}
			finalFocus={closeType => closeType === 'keyboard'}
			initialFocus={openType => openType === 'keyboard'}
			// Preserve the measured grid while the menu animates closed.
			keepMounted
			sideOffset={10}
			className={cn(SURFACE, WIDTH[panel.layout], 'max-h-[calc(100vh-6rem)] overflow-y-auto before:absolute before:-top-2 before:size-4 before:rotate-45 before:border-s before:border-t before:border-border-strong before:bg-popover', align === 'end' ? 'before:right-8' : 'before:left-8')}
			data-testid={`${panel.testIdPrefix}-profile-menu`}
		>
			<ProfilePickerPanel {...panel} titleId={titleId} descriptionId={descriptionId} onPickProfile={closing(onPickProfile)} onEditProfile={closing(onEditProfile)} onNewProfile={closing(onNewProfile)} onManageProfiles={onManageProfiles ? closing(onManageProfiles) : undefined} />
		</PopoverContent>
	)
}

// The same options inside a right-click menu: radio items, so the menu's own
// check marks the current profile, and the rows' Hidden profile shows first.
// Radio items stay open on a click by default; a pick closes the menu like its other items.
export function ProfilePickerContextItems({options, label, onPick}: {options: readonly ProfilePickerOption[]; label: string; onPick: (ref: DownloadProfileRef) => void}): ReactNode {
	const current = options.find(option => option.current)
	return (
		<ContextMenuGroup>
			<ContextMenuLabel>{label}</ContextMenuLabel>
			<ContextMenuRadioGroup value={current?.profile.id ?? null}>
				{options.map(option => (
					<ContextMenuRadioItem key={option.profile.id} value={option.profile.id} closeOnClick onClick={() => onPick(option.ref)} className="gap-2.5 py-1.5">
						<ProfileOptionLabel option={option} />
					</ContextMenuRadioItem>
				))}
			</ContextMenuRadioGroup>
		</ContextMenuGroup>
	)
}
