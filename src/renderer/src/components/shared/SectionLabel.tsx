import type {ReactNode} from 'react'
import {mergeProps} from '@base-ui/react/merge-props'
import {useRender} from '@base-ui/react/use-render'

import {cn} from '@renderer/lib/utils.js'

// The uppercase eyebrow above a group of controls ("Save as", "Video", "Bitrate").
// One size, one tracking, one colour everywhere. Renders a <p> by default; pass
// `render` to become a span, a FieldLabel, or a table cell.
export function SectionLabel({className, render, ...props}: useRender.ComponentProps<'p'>): ReactNode {
	return useRender({defaultTagName: 'p', props: mergeProps<'p'>({className: cn('text-label text-subtle-foreground uppercase', className)}, props), render, state: {slot: 'section-label'}})
}
