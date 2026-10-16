import type {ReactNode} from 'react'
import {Skeleton} from '../components/ui/skeleton.js'
import {readKnobs} from './browserMockKnobs.js'
import {showcaseArtwork, showcaseTitle} from './showcaseContent.js'

const SIDE_ROWS = ['explore-side-1', 'explore-side-2', 'explore-side-3'] as const

function showcaseEnabled(): boolean {
	try {
		return readKnobs(window.location).showcase
	} catch {
		return false
	}
}

// browser-mock has no native view, so the viewport shows this generic page
// wireframe in its place: neutral blocks only, never real site art or branding.
// With `showcase=1` the blocks carry generated artwork and sample titles, so a
// README screenshot reads as a video page without showing anyone's real video.
export function ExploreMockPage(): ReactNode {
	const showcase = showcaseEnabled()
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3 p-3" aria-hidden data-testid="explore-mock-page">
			<div className="flex items-center gap-3">
				<Skeleton className="h-6 w-24 animate-none" />
				<Skeleton className="h-6 flex-1 animate-none" />
				<Skeleton className="size-6 animate-none rounded-full" />
			</div>
			<div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[2fr_1fr]">
				<div className="flex min-h-0 flex-col gap-2">
					{showcase ? <img src={showcaseArtwork('explore-hero')} alt="" className="min-h-24 w-full flex-1 rounded-md object-cover" /> : <Skeleton className="min-h-24 flex-1 animate-none" />}
					{showcase ? <p className="truncate text-sm font-semibold text-foreground">{showcaseTitle('explore-hero')}</p> : <Skeleton className="h-4 w-2/3 animate-none" />}
					<Skeleton className="h-3 w-1/3 animate-none" />
				</div>
				<div className="hidden flex-col gap-2 md:flex">
					{SIDE_ROWS.map(seed => (
						<div key={seed} className="flex gap-2">
							{showcase ? <img src={showcaseArtwork(seed)} alt="" className="h-14 w-24 shrink-0 rounded-md object-cover" /> : <Skeleton className="h-14 w-24 animate-none" />}
							<div className="flex min-w-0 flex-1 flex-col gap-1.5">
								{showcase ? <p className="line-clamp-2 text-xs font-medium text-foreground">{showcaseTitle(seed)}</p> : <Skeleton className="h-3 w-full animate-none" />}
								<Skeleton className="h-3 w-1/2 animate-none" />
							</div>
						</div>
					))}
				</div>
			</div>
			{showcase ? null : <p className="text-center text-xs text-subtle-foreground">Native browser view placeholder (browser-mock)</p>}
		</div>
	)
}
