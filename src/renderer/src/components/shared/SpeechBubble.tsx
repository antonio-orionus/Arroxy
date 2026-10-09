import type {CSSProperties, ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'

type Tail = 'start' | 'end' | 'top' | 'bottom'

// Two stacked CSS triangles draw the tail: the outer one in the border colour,
// the inner one in the fill colour, 1.5px closer, so the bubble's outline runs
// around the tail. Inline-start/end borders keep the tail mirrored in RTL.
const SIDE = '6px solid transparent'
const TAILS: Record<Tail, {position: string; outer: string; inner: string; shape: (color: string) => CSSProperties}> = {
	start: {position: 'top-2.5', outer: '-start-[7px]', inner: '-start-[5.5px]', shape: color => ({borderTop: SIDE, borderBottom: SIDE, borderInlineEnd: `7px solid ${color}`})},
	end: {position: 'top-2.5', outer: '-end-[7px]', inner: '-end-[5.5px]', shape: color => ({borderTop: SIDE, borderBottom: SIDE, borderInlineStart: `7px solid ${color}`})},
	top: {position: 'start-5', outer: '-top-[7px]', inner: '-top-[5.5px]', shape: color => ({borderInlineStart: SIDE, borderInlineEnd: SIDE, borderBottom: `7px solid ${color}`})},
	bottom: {position: 'end-5', outer: '-bottom-[7px]', inner: '-bottom-[5.5px]', shape: color => ({borderInlineStart: SIDE, borderInlineEnd: SIDE, borderTop: `7px solid ${color}`})}
}

// The mascot's voice: every speech bubble in the app (format hint, loading
// state, first-run cue, feedback nudge) is this one shape.
export function SpeechBubble({tail, className, children}: {tail: Tail; className?: string; children: ReactNode}): ReactNode {
	const shape = TAILS[tail]
	return (
		<div className={cn('relative rounded-xl border border-border-strong bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground shadow-md', className)}>
			{children}
			<span aria-hidden className={cn('absolute size-0', shape.position, shape.outer)} style={shape.shape('var(--border-strong)')} />
			<span aria-hidden className={cn('absolute size-0', shape.position, shape.inner)} style={shape.shape('var(--popover)')} />
		</div>
	)
}
