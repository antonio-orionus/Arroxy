import type {ReactNode} from 'react'
import {Search} from 'lucide-react'
import {cn} from '@renderer/lib/utils.js'
import {Skeleton} from '../components/ui/skeleton.js'
import {readKnobs} from './browserMockKnobs.js'
import {showcaseArtwork, showcaseTitle} from './showcaseContent.js'

const CARDS = ['explore-card-1', 'explore-card-2', 'explore-card-3', 'explore-card-4', 'explore-card-5', 'explore-card-6'] as const
const SIDEBAR = [
	{id: 'home', width: 'w-3/4'},
	{id: 'shorts', width: 'w-1/2'},
	{id: 'subscriptions', width: 'w-2/3'},
	{id: 'you', width: 'w-3/5'},
	{id: 'history', width: 'w-1/2'},
	{id: 'playlists', width: 'w-2/3'}
] as const
const CHANNEL_TABS = [
	{id: 'home', width: 'w-10'},
	{id: 'videos', width: 'w-12'},
	{id: 'shorts', width: 'w-10'},
	{id: 'playlists', width: 'w-14'}
] as const

// A neutral sample channel name: no real channel is shown.
const SHOWCASE_CHANNEL = 'Slow Travel Films · Sample channel'

function showcaseEnabled(): boolean {
	try {
		return readKnobs(window.location).showcase
	} catch {
		return false
	}
}

function Block({className}: {className: string}): ReactNode {
	return <Skeleton className={cn('animate-none rounded-full', className)} />
}

// A home-feed card: thumbnail, a round channel avatar, the title and a meta line.
function VideoCard({seed, showcase}: {seed: string; showcase: boolean}): ReactNode {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			{showcase ? <img src={showcaseArtwork(seed)} alt="" className="aspect-video w-full rounded-lg object-cover" /> : <Skeleton className="aspect-video w-full animate-none rounded-lg" />}
			<div className="flex min-w-0 gap-2">
				<Block className="size-7 shrink-0" />
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					{showcase ? <p className="line-clamp-2 text-xs font-medium text-foreground">{showcaseTitle(seed)}</p> : <Block className="h-2.5 w-full" />}
					<Block className="h-2 w-1/2" />
				</div>
			</div>
		</div>
	)
}

// browser-mock has no native view, so the viewport shows this page in its
// place: a channel's Videos page in the same picture language as Explore's
// first-run preview — a top bar with a search field, a side menu, the channel
// header and tabs, and a grid of video cards — in neutral shapes
// and theme colours, never real site art or branding. A channel page (not the
// home feed) keeps Download live in the toolbar. With `showcase=1` the cards
// carry generated artwork and sample titles, so a README screenshot reads as a
// real page without showing anyone's video.
export function ExploreMockPage(): ReactNode {
	const showcase = showcaseEnabled()
	return (
		// Pinned inside the placeholder and clipped: like the native view it stands
		// in for, the page never sizes the layout around it.
		<div className="relative min-h-0 flex-1 overflow-hidden" aria-hidden data-testid="explore-mock-page">
			<div className="absolute inset-0 flex flex-col gap-4 p-4">
				<div className="flex items-center gap-4">
					<Block className="h-4 w-20 shrink-0" />
					<div className="mx-auto flex h-8 w-full max-w-md min-w-0 items-center justify-end rounded-full border border-border px-3">
						<Search className="size-4 text-subtle-foreground" />
					</div>
					<Block className="size-8 shrink-0" />
				</div>
				<div className="flex min-h-0 flex-1 gap-4">
					<div className="hidden w-32 shrink-0 flex-col gap-3.5 pt-1 md:flex">
						{SIDEBAR.map(row => (
							<div key={row.id} className="flex items-center gap-3">
								<Block className="size-4 shrink-0" />
								<Block className={cn('h-2.5', row.width)} />
							</div>
						))}
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-4">
						<div className="flex items-center gap-3">
							{showcase ? <img src={showcaseArtwork('explore-channel')} alt="" className="size-12 shrink-0 rounded-full object-cover" /> : <Block className="size-12 shrink-0" />}
							<div className="flex min-w-0 flex-1 flex-col gap-1.5">
								{showcase ? <p className="truncate text-sm font-semibold text-foreground">{SHOWCASE_CHANNEL}</p> : <Block className="h-3 w-40" />}
								<Block className="h-2 w-28" />
							</div>
							<Skeleton className="h-7 w-20 shrink-0 animate-none rounded-full bg-foreground/30" />
						</div>
						<div className="flex gap-5 border-b border-border pb-2">
							{CHANNEL_TABS.map(tab => (
								<Skeleton key={tab.id} className={cn('h-2.5 animate-none rounded-full', tab.width, tab.id === 'videos' && 'bg-foreground/40')} />
							))}
						</div>
						<div className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-3">
							{CARDS.map(seed => (
								<VideoCard key={seed} seed={seed} showcase={showcase} />
							))}
						</div>
					</div>
				</div>
				{showcase ? null : <p className="text-center text-xs text-subtle-foreground">Native browser view placeholder (browser-mock)</p>}
			</div>
		</div>
	)
}
