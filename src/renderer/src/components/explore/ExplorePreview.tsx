import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ArrowLeft, ArrowRight, ChevronDown, House, RotateCw, Search, ShieldCheck, WandSparkles, type LucideIcon} from 'lucide-react'
import {cn} from '@renderer/lib/utils.js'
import {buttonVariants} from '../ui/button.variants.js'
import {Skeleton} from '../ui/skeleton.js'

// Thumbnails in the theme's own colours: abstract artwork, never anyone's video.
const THUMBNAILS = ['from-primary/45 to-info/20', 'from-info/40 to-success/20', 'from-warning/35 to-primary/20', 'from-success/35 to-info/15'] as const
const CHIP_WIDTHS = ['w-10', 'w-14', 'w-12', 'w-16', 'w-11', 'w-9'] as const
const SIDEBAR_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-3/5', 'w-1/3'] as const

function Block({className}: {className: string}): ReactNode {
	return <Skeleton className={cn('animate-none rounded-full', className)} />
}

function MiniIcon({icon: Icon, flip}: {icon: LucideIcon; flip?: boolean}): ReactNode {
	return (
		<span className={cn(buttonVariants({variant: 'outline', size: 'icon-xs'}), 'shrink-0')}>
			<Icon className={flip ? 'rtl:rotate-180' : undefined} />
		</span>
	)
}

// A video card: thumbnail, a round channel avatar, two title lines and a meta line.
function VideoCard({thumbnail}: {thumbnail: (typeof THUMBNAILS)[number]}): ReactNode {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<div className={cn('aspect-video rounded-lg bg-linear-to-br', thumbnail)} />
			<div className="flex min-w-0 gap-2">
				<Block className="size-5 shrink-0" />
				<div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
					<Block className="h-2 w-full" />
					<Block className="h-2 w-3/4" />
					<Skeleton className="h-1.5 w-1/2 animate-none rounded-full bg-foreground/5" />
				</div>
			</div>
		</div>
	)
}

// The first-run notice's picture of Explore (decorative, so hidden from
// assistive technology and out of the tab order): the toolbar in miniature,
// with the real look of the Download split, over an abstract video page — a
// top bar with a search field and an avatar, a side menu, a chip row, and a
// two-column grid of cards.
// Neutral shapes and theme colours only: no site's logo, art or people.
// Shorter in a narrow card (a small window or a large UI zoom), so the notice's
// text and Continue stay in view; the parent is the size container.
export function ExplorePreview({profileName, ProfileIcon}: {profileName: string; ProfileIcon: LucideIcon}): ReactNode {
	const {t} = useTranslation()
	return (
		<div aria-hidden inert className="pointer-events-none relative h-48 overflow-hidden @xl:h-72 rounded-xl border border-border bg-background/40 select-none mask-b-from-75%" data-testid="explore-preview">
			<div className="flex min-w-0 items-center gap-1.5 border-b border-border p-2" data-testid="explore-preview-toolbar">
				<div className="flex shrink-0 gap-0.5">
					<MiniIcon icon={ArrowLeft} flip />
					<MiniIcon icon={ArrowRight} flip />
					<MiniIcon icon={RotateCw} />
					<MiniIcon icon={House} />
				</div>
				<Skeleton className="h-6 min-w-10 flex-1 animate-none rounded-lg" />
				<MiniIcon icon={ShieldCheck} />
				<span className="flex min-w-0 shrink">
					<span className={cn(buttonVariants({size: 'xs'}), 'min-w-0 shrink rounded-e-none')}>
						<ProfileIcon data-icon="inline-start" />
						<span className="min-w-0 truncate">{t('explore.toolbar.downloadWithProfile', {profileName})}</span>
					</span>
					<span className={cn(buttonVariants({size: 'icon-xs'}), 'shrink-0 rounded-s-none border-s border-s-primary-foreground/25')}>
						<ChevronDown />
					</span>
				</span>
				<MiniIcon icon={WandSparkles} />
			</div>
			<div className="flex flex-col gap-3 p-3">
				<div className="flex items-center gap-3">
					<Block className="h-3 w-12 shrink-0" />
					<div className="mx-auto flex h-6 w-full max-w-64 min-w-0 items-center justify-end rounded-full border border-border px-2">
						<Search className="size-3 text-subtle-foreground" />
					</div>
					<Block className="size-6 shrink-0" />
				</div>
				<div className="flex gap-3">
					<div className="flex w-1/5 shrink-0 flex-col gap-2.5 pt-1">
						{SIDEBAR_WIDTHS.map(width => (
							<div key={width} className="flex items-center gap-2">
								<Block className="size-3 shrink-0" />
								<Block className={cn('h-2', width)} />
							</div>
						))}
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-3">
						<div className="flex gap-1.5 overflow-hidden">
							<Skeleton className="h-4 w-8 shrink-0 animate-none rounded-full bg-foreground/30" />
							{CHIP_WIDTHS.map(width => (
								<Block key={width} className={cn('h-4 shrink-0', width)} />
							))}
						</div>
						<div className="grid grid-cols-2 gap-3">
							{THUMBNAILS.map(thumbnail => (
								<VideoCard key={thumbnail} thumbnail={thumbnail} />
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
