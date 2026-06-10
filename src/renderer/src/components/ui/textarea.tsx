import type {ReactNode} from 'react'
import * as React from 'react'

import {cn} from '@renderer/lib/utils.js'

function Textarea({className, ...props}: React.ComponentProps<'textarea'>): ReactNode {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'flex field-sizing-content min-h-16 w-full rounded-lg border border-[var(--field-border)] bg-[var(--field-bg)] px-2.5 py-2 text-base shadow-[inset_0_1px_0_var(--field-highlight)] transition-colors outline-none placeholder:text-[var(--field-placeholder)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:border-[var(--field-disabled-border)] disabled:bg-[var(--field-disabled-bg)] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
				className
			)}
			{...props}
		/>
	)
}

export {Textarea}
