import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {RadioGroupChip} from '../../ui/radio-group.js'
import {Hint} from '../../shared/Hint.js'

// The format picker as chips: each stream is one chip with its own size, sized
// to what it says rather than stretched across the column. One RadioGroup holds
// every chip, so arrow keys move across all of them.

// A window narrower than lg (the 720px minimum up to 1023px) halves the step.
// A grid with two or more chip columns no longer fits there, so its chips stack
// their size under their label (`narrowStack`); a single column still fits and
// stays one line. This keys off the window, not the column: a size-contained
// column could no longer be as wide as its chips.
const NARROW_HIDDEN = 'max-lg:hidden'
const NARROW_ONLY = 'hidden max-lg:inline'
const NARROW_CHIP = 'max-lg:h-auto max-lg:flex-col max-lg:items-start max-lg:gap-0 max-lg:py-1.5'
// A chip's hint repeats every fact about its stream; it waits for a hover that
// means it, so moving across the chips to pick one shows nothing.
const CHIP_HINT_DELAY_MS = 5000
const TAG = 'shrink-0 text-caption text-subtle-foreground group-data-checked/radio-chip:text-selected-foreground'

// What a line or a grid row is: a resolution (with its alias) or a codec.
export function FormatLineName({name, alias, className}: {name: string; alias?: string | null; className?: string}): ReactNode {
	return (
		<span className={cn('min-w-0 truncate pe-2 text-sm font-medium text-foreground', className)}>
			{name}
			{alias ? <span className="ms-1.5 text-caption font-normal text-subtle-foreground">{alias}</span> : null}
		</span>
	)
}

// A name in a fixed column, then its chips, wrapping when the column is narrow.
export function FormatLine({name, alias, children}: {name: string; alias?: string | null; children: ReactNode}): ReactNode {
	return (
		<div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-2 py-0.5">
			<FormatLineName name={name} alias={alias} className="pt-2" />
			<div className="flex min-w-0 flex-wrap gap-1.5">{children}</div>
		</div>
	)
}

// One stream: what tells it apart on the start side, its size on the end side.
// `name` is what the chip says aloud and in its hover hint: every fact about the
// stream, including the ones the chip leaves out (file type).
export function FormatChip({
	value,
	name,
	label,
	tags = [],
	size,
	adornment,
	profilePick = false,
	disabled,
	narrowStack = false,
	className
}: {
	value: string
	name: string
	label: string
	tags?: readonly string[]
	size?: string | null
	adornment?: ReactNode
	profilePick?: boolean
	disabled?: boolean
	narrowStack?: boolean
	className?: string
}): ReactNode {
	return (
		<Hint label={name} reveal delay={CHIP_HINT_DELAY_MS}>
			<RadioGroupChip value={value} aria-label={name} disabled={disabled} data-profile-pick={profilePick || undefined} className={cn('justify-between gap-4', narrowStack && NARROW_CHIP, className)}>
				<span className="flex min-w-0 items-center gap-2 whitespace-nowrap">
					{adornment}
					<span>{label}</span>
					{tags.map(tag => (
						<span key={tag} className={cn(TAG, narrowStack && NARROW_HIDDEN)}>
							{tag}
						</span>
					))}
				</span>
				{size || tags.length > 0 ? (
					<span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs tabular-nums text-muted-foreground group-data-checked/radio-chip:text-selected-foreground">
						{/* A narrow chip gives its label the whole first line and says its tags beside the size. */}
						{tags.map(tag => (
							<span key={tag} className={cn(TAG, narrowStack ? NARROW_ONLY : 'hidden')}>
								{tag}
							</span>
						))}
						{size}
					</span>
				) : null}
				{profilePick ? <ProfileDot className="absolute -end-1 -top-1 ring-2 ring-background" /> : null}
			</RadioGroupChip>
		</Hint>
	)
}

// The download profile's pick. One legend says what it means, on the
// "Pre-selected from" line; each picked chip carries the dot on its corner.
export function ProfileDot({className}: {className?: string}): ReactNode {
	return <span aria-hidden className={cn('pointer-events-none size-2 shrink-0 rounded-full bg-primary', className)} />
}
