'use client'

import type {ReactNode} from 'react'
import {Separator as SeparatorPrimitive} from '@base-ui/react/separator'

import {cn} from '@renderer/lib/utils.js'

function Separator({className, orientation = 'horizontal', ...props}: SeparatorPrimitive.Props): ReactNode {
	return <SeparatorPrimitive data-slot="separator" orientation={orientation} className={cn('shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch', className)} {...props} />
}

export {Separator}
