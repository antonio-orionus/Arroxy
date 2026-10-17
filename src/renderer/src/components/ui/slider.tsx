import type {ReactNode} from 'react'
import {Slider as SliderPrimitive} from '@base-ui/react/slider'

import {cn} from '@renderer/lib/utils.js'

interface SliderProps extends SliderPrimitive.Root.Props {
	// Positions (percent of the track) drawn as small ticks, e.g. chapter starts.
	marks?: readonly number[]
	// The accessible name of each thumb, in order.
	thumbLabels?: readonly string[]
}

function Slider({className, defaultValue, value, min = 0, max = 100, marks = [], thumbLabels = [], ...props}: SliderProps): ReactNode {
	const values = Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]
	// A single value or a range: one thumb, or a start and an end.
	const thumbs = values.length === 1 ? ['value'] : ['start', 'end']

	return (
		<SliderPrimitive.Root className={cn('data-horizontal:w-full data-vertical:h-full', className)} data-slot="slider" defaultValue={defaultValue} value={value} min={min} max={max} thumbAlignment="edge" {...props}>
			<SliderPrimitive.Control className="relative flex w-full touch-none items-center py-1.5 select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
				<SliderPrimitive.Track data-slot="slider-track" className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5">
					<SliderPrimitive.Indicator data-slot="slider-range" className="bg-primary select-none data-horizontal:h-full data-vertical:w-full" />
				</SliderPrimitive.Track>
				{marks.map(position => (
					<span key={position} data-slot="slider-mark" aria-hidden className="pointer-events-none absolute top-1/2 h-3 w-px -translate-y-1/2 bg-border-strong" style={{insetInlineStart: `${position}%`}} />
				))}
				{thumbs.map((thumb, index) => (
					<SliderPrimitive.Thumb
						data-slot="slider-thumb"
						key={thumb}
						index={index}
						getAriaLabel={() => thumbLabels[index] ?? ''}
						className="relative block size-3.5 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
					/>
				))}
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	)
}

export {Slider}
