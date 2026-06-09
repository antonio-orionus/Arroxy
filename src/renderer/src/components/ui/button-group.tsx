import type {ReactNode} from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import type * as React from 'react'

import {cn} from '@renderer/lib/utils.js'

const buttonGroupVariants = cva("flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-e-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1", {
	variants: {
		orientation: {
			horizontal: '*:data-slot:rounded-e-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-e-lg! [&>[data-slot]~[data-slot]]:rounded-s-none [&>[data-slot]~[data-slot]]:border-s-0',
			vertical: 'flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0'
		}
	},
	defaultVariants: {orientation: 'horizontal'}
})

function ButtonGroup({className, orientation, ...props}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>): ReactNode {
	// react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- grouped button controls need ARIA grouping semantics; no native landmark/tag fits this UI primitive
	return <div role="group" data-slot="button-group" data-orientation={orientation} className={cn(buttonGroupVariants({orientation}), className)} {...props} />
}

export {ButtonGroup}
