import type {ComponentProps, ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {ToggleGroupItem} from '../ui/toggle-group.js'

type ItemProps = Omit<ComponentProps<typeof ToggleGroupItem>, 'children' | 'title'>

// One option in a single-select ToggleGroup laid out as cards (download type,
// quick preset, destination folder, background mode). Shares the choice
// surface with ChoiceRow so every selectable card or row reads the same.
//   vertical:   icon over title over description (tiles in a grid)
//   horizontal: icon, title, then `meta` at the end (list-like cards)
// `hint` is a native tooltip for options whose label needs a longer explanation.
export function OptionCard({icon, title, description, meta, hint, orientation = 'vertical', align = 'start', className, ...item}: ItemProps & {icon?: ReactNode; title: ReactNode; description?: ReactNode; meta?: ReactNode; hint?: string; orientation?: 'vertical' | 'horizontal'; align?: 'start' | 'center'}): ReactNode {
	const vertical = orientation === 'vertical'
	return (
		<ToggleGroupItem className={cn('choice-surface h-auto gap-1 rounded-lg px-3 py-2 whitespace-normal', vertical ? 'flex-col' : 'flex-row gap-3', vertical && align === 'start' ? 'items-start text-start' : 'items-center', vertical && align === 'center' && 'text-center', className)} title={hint} {...item}>
			{icon ? <span className="flex shrink-0 text-subtle-foreground group-data-pressed/toggle:text-primary [&_svg:not([class*='size-'])]:size-4">{icon}</span> : null}
			<span className={cn('min-w-0 text-sm font-medium text-foreground group-data-pressed/toggle:text-primary', !vertical && 'flex-1 truncate text-start')}>{title}</span>
			{description ? <span className="text-xs font-normal text-subtle-foreground">{description}</span> : null}
			{meta ? <span className="max-w-36 shrink-0 truncate font-mono text-xs font-normal text-subtle-foreground">{meta}</span> : null}
		</ToggleGroupItem>
	)
}
