import type {ReactNode} from 'react'
import {cn} from '@renderer/lib/utils.js'

const TONES = {
	// The lit gradient tile of the Aurora Console: primary entry points on the home stage.
	lit: 'icon-tile',
	// Calm tinted tile: section headers, cards, dialogs.
	soft: 'border border-primary/30 bg-primary/12 text-primary'
} as const

const SIZES = {sm: 'size-8 [&_svg:not([class*=size-])]:size-4', md: 'size-10 [&_svg:not([class*=size-])]:size-5'} as const

// A square that carries one icon in front of a title.
export function IconTile({tone = 'soft', size = 'md', className, children}: {tone?: keyof typeof TONES; size?: keyof typeof SIZES; className?: string; children: ReactNode}): ReactNode {
	return (
		<span aria-hidden className={cn('grid shrink-0 place-items-center rounded-lg', TONES[tone], SIZES[size], className)}>
			{children}
		</span>
	)
}
