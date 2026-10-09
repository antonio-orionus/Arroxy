import type {ReactNode} from 'react'
import * as React from 'react'

import {cn} from '@renderer/lib/utils.js'

function Skeleton({className, ...props}: React.ComponentProps<'div'>): ReactNode {
	return <div data-slot="skeleton" className={cn('animate-pulse rounded-md bg-foreground/10', className)} {...props} />
}

export {Skeleton}
