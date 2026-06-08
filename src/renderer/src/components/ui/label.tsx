/* eslint-disable jsx-a11y/label-has-associated-control */
import type {ReactNode} from 'react'
import * as React from 'react'

import {cn} from '@renderer/lib/utils.js'

function Label({className, ...props}: React.ComponentProps<'label'>): ReactNode {
	return (
		<>
			{/* react-doctor-disable-next-line react-doctor/label-has-associated-control */}
			<label data-slot="label" className={cn('flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className)} {...props} />
		</>
	)
}

export {Label}
