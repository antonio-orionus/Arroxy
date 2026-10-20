import {useRef, type ReactNode, type RefObject} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {DndContext, PointerSensor, closestCenter, useSensor, useSensors, type Announcements, type DragEndEvent, type UniqueIdentifier} from '@dnd-kit/core'
import {SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {Check, GripVertical, PenLine, Plus, X} from 'lucide-react'
import {downloadProfileLabel, downloadProfileOrigin} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {KeyboardSortSensor} from '@renderer/lib/keyboardSortSensor.js'
import {cn} from '@renderer/lib/utils.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card.js'
import {Switch} from '../ui/switch.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip.js'
import {IconTile} from '../shared/IconTile.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'

function profileDetail(profile: DownloadProfile, t: TFunction): string {
	const subs = profile.subtitles.enabled || profile.media.kind === 'subtitles-only' ? `${profile.subtitles.languages.join(', ') || 'selected'} ${t('wizard.confirm.labelSubtitles').toLowerCase()}` : t('wizard.subtitles.noSelected')
	const output = profile.output.kind === 'fixed' ? profile.output.dir : t('wizard.folder.downloads')
	const artifacts = [
		profile.embed.metadata ? t('wizard.output.embedMetadata.label') : null,
		profile.embed.thumbnail ? t('wizard.output.embedThumbnail.label') : null,
		profile.embed.thumbnailSidecar ? t('wizard.output.writeThumbnail.label') : null,
		profile.embed.description ? t('wizard.output.writeDescription.label') : null
	]
		.filter(Boolean)
		.join(' · ')
	return `${subs} · ${output}${artifacts ? ` · ${artifacts}` : ''}`
}

interface ProfilesManageTabProps {
	activeProfile: DownloadProfile
	onEdit: (profile: DownloadProfile | null) => void
	onMove: (id: string, targetId: string) => void
	onPick: (profile: DownloadProfile) => void
	onRemove: (profile: DownloadProfile) => void
	onToggleEnabled: (id: string, enabled: boolean) => void
	profiles: DownloadProfile[]
	profilesPrefs: DownloadProfilesPrefs | undefined
}

// A card drags from anywhere on it with the pointer; the keyboard picks it up
// from its grip only, so Space and Enter on its other controls keep working.
export function ProfilesManageTab({activeProfile, onEdit, onMove, onPick, onRemove, onToggleEnabled, profiles, profilesPrefs}: ProfilesManageTabProps): ReactNode {
	const {t} = useTranslation()
	const enabledCount = profiles.filter(profile => profile.enabled).length
	// A drop that ends over the card it started on would also click what is under the pointer.
	const suppressClickRef = useRef(false)
	const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 6}}), useSensor(KeyboardSortSensor, {coordinateGetter: sortableKeyboardCoordinates}))

	const nameOf = (id: UniqueIdentifier): string => profiles.find(profile => profile.id === id)?.name ?? String(id)
	const placeOf = (id: UniqueIdentifier): {position: number; count: number} => ({position: profiles.findIndex(profile => profile.id === id) + 1, count: profiles.length})
	// A pick-up is also over its own slot at once; announcing that would replace
	// the pick-up message before a screen reader reads it.
	const movedRef = useRef(false)
	const announcements: Announcements = {
		onDragStart: ({active}) => {
			movedRef.current = false
			return t('wizard.url.profile.movePickedUp', {profileName: nameOf(active.id), ...placeOf(active.id)})
		},
		onDragOver: ({active, over}) => {
			if (!over || (over.id === active.id && !movedRef.current)) return undefined
			movedRef.current = true
			return t('wizard.url.profile.moveOver', {profileName: nameOf(active.id), ...placeOf(over.id)})
		},
		onDragEnd: ({active, over}) => t('wizard.url.profile.moveDropped', {profileName: nameOf(active.id), ...placeOf(over?.id ?? active.id)}),
		onDragCancel: ({active}) => t('wizard.url.profile.moveCancelled', {profileName: nameOf(active.id), ...placeOf(active.id)})
	}

	const endDrag = (): void => {
		suppressClickRef.current = true
		window.setTimeout(() => {
			suppressClickRef.current = false
		}, 0)
	}
	const onDragEnd = ({active, over}: DragEndEvent): void => {
		endDrag()
		if (over && active.id !== over.id) onMove(String(active.id), String(over.id))
	}

	return (
		<Card variant="glass" data-testid="profiles-manage-tab">
			<CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
				<div>
					<CardTitle className="text-xl font-semibold leading-tight">{t('wizard.url.profile.panelTitle')}</CardTitle>
					<CardDescription className="mt-1 text-xs text-subtle-foreground">{t('wizard.url.profile.panelDescription')}</CardDescription>
					<p className="mt-1 text-caption text-subtle-foreground">{t('wizard.url.profile.enableHint')}</p>
					<p className="text-caption text-subtle-foreground">{t('wizard.url.profile.reorderHint')}</p>
				</div>
				<Button variant="glow" type="button" onClick={() => onEdit(null)}>
					<Plus data-icon="inline-start" />
					{t('wizard.url.profile.newProfile')}
				</Button>
			</CardHeader>
			<DndContext sensors={sensors} collisionDetection={closestCenter} accessibility={{announcements, screenReaderInstructions: {draggable: t('wizard.url.profile.moveInstructions')}, container: document.body}} onDragEnd={onDragEnd} onDragCancel={endDrag}>
				<SortableContext items={profiles.map(profile => profile.id)} strategy={rectSortingStrategy}>
					<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
						{profiles.map(profile => (
							<ProfileCard key={profile.id} t={t} profile={profile} active={activeProfile.id === profile.id} profilesPrefs={profilesPrefs} canToggleOff={profile.enabled ? enabledCount > 1 : true} suppressClickRef={suppressClickRef} onEdit={onEdit} onPick={onPick} onRemove={onRemove} onToggleEnabled={onToggleEnabled} />
						))}
					</CardContent>
				</SortableContext>
			</DndContext>
		</Card>
	)
}

interface ProfileCardProps {
	t: TFunction
	profile: DownloadProfile
	active: boolean
	profilesPrefs: DownloadProfilesPrefs | undefined
	canToggleOff: boolean
	suppressClickRef: RefObject<boolean>
	onEdit: (profile: DownloadProfile) => void
	onPick: (profile: DownloadProfile) => void
	onRemove: (profile: DownloadProfile) => void
	onToggleEnabled: (id: string, enabled: boolean) => void
}

function ProfileCard({t, profile, active, profilesPrefs, canToggleOff, suppressClickRef, onEdit, onPick, onRemove, onToggleEnabled}: ProfileCardProps): ReactNode {
	const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({id: profile.id, attributes: {roleDescription: t('wizard.url.profile.movableProfile')}})
	const Icon = PROFILE_ICONS[profile.icon]
	const origin = downloadProfileOrigin(profile, profilesPrefs)
	const isCustom = origin.kind === 'custom'
	const canRemove = isCustom || origin.overridden
	return (
		<article
			ref={setNodeRef}
			{...listeners}
			style={{transform: CSS.Translate.toString(transform), transition}}
			onClickCapture={event => {
				if (!suppressClickRef.current) return
				event.preventDefault()
				event.stopPropagation()
			}}
			data-active={active ? 'true' : undefined}
			data-selected={active || undefined}
			data-disabled-profile={!profile.enabled ? 'true' : undefined}
			data-dragging={isDragging || undefined}
			className={cn('choice-surface relative rounded-lg p-3', !profile.enabled && 'opacity-60 saturate-[0.7]', isDragging && 'z-20 cursor-grabbing backdrop-blur-md outline-2 outline-offset-2 outline-primary/70')}
			data-testid={`profiles-manage-card-${profile.id}`}
		>
			<button
				type="button"
				className="flex w-full items-start gap-3 text-left"
				aria-pressed={active}
				aria-disabled={!profile.enabled}
				onClick={() => {
					if (!profile.enabled) return
					onPick(profile)
				}}
				data-testid={`profiles-manage-card-${profile.id}-picker`}
			>
				<IconTile>
					<Icon />
				</IconTile>
				<span className="min-w-0 flex-1" data-testid={`profiles-manage-card-${profile.id}-summary`}>
					<span className="flex items-center gap-2" data-testid={`profiles-manage-card-${profile.id}-title-row`}>
						<span className="truncate text-sm font-semibold" data-testid={`profiles-manage-card-${profile.id}-title`}>
							{profile.name}
						</span>
						<Badge variant={isCustom || origin.overridden ? 'outline' : 'secondary'}>{isCustom ? t('wizard.url.profile.badgeCustom') : origin.overridden ? t('wizard.url.profile.badgeModified') : t('wizard.url.profile.badgeBuiltIn')}</Badge>
						{!profile.enabled ? <Badge variant="outline">{t('wizard.url.profile.badgeDisabled')}</Badge> : null}
						<Check className={cn('ms-auto size-4 shrink-0 text-primary transition-opacity duration-150', active ? 'opacity-100' : 'opacity-0')} aria-hidden data-testid={`profiles-manage-card-${profile.id}-check`} />
					</span>
					<span className="mt-1 block text-xs text-subtle-foreground" data-testid={`profiles-manage-card-${profile.id}-description`}>
						{downloadProfileLabel(profile)}
					</span>
					<span className="block text-xs text-subtle-foreground" data-testid={`profiles-manage-card-${profile.id}-detail`}>
						{profileDetail(profile, t)}
					</span>
				</span>
			</button>
			<div className="mt-3 flex items-center gap-2" data-testid={`profiles-manage-card-${profile.id}-actions`}>
				<Button
					ref={setActivatorNodeRef}
					{...attributes}
					type="button"
					variant="ghost"
					size="icon-sm"
					className={cn('shrink-0 touch-none text-subtle-foreground', isDragging ? 'cursor-grabbing' : 'cursor-grab')}
					aria-label={t('wizard.url.profile.moveHandleAria', {profileName: profile.name})}
					data-testid={`profiles-manage-card-${profile.id}-move`}
				>
					<GripVertical />
				</Button>
				<div className="grid flex-1 grid-cols-2 gap-2">
					<Button type="button" variant="outline" size="sm" onClick={() => onEdit(profile)}>
						<PenLine data-icon="inline-start" />
						{t('wizard.url.profile.edit')}
					</Button>
					<Button type="button" variant="outline" size="sm" disabled={!canRemove} onClick={() => onRemove(profile)}>
						<X data-icon="inline-start" />
						{isCustom ? t('wizard.url.profile.remove') : t('wizard.url.profile.reset')}
					</Button>
				</div>
				<Tooltip>
					<TooltipTrigger
						render={props => (
							<span {...props} className="inline-flex">
								<Switch
									checked={profile.enabled}
									disabled={!canToggleOff}
									onCheckedChange={next => {
										if (!canToggleOff && profile.enabled) return
										onToggleEnabled(profile.id, next)
									}}
									aria-label={t('wizard.url.profile.enableToggleAria', {profileName: profile.name})}
									data-testid={`profiles-manage-card-${profile.id}-enabled-toggle`}
								/>
							</span>
						)}
					/>
					{!canToggleOff ? <TooltipContent>{t('wizard.url.profile.lastEnabledHint')}</TooltipContent> : null}
				</Tooltip>
			</div>
		</article>
	)
}
