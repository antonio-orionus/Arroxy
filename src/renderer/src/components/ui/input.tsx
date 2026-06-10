import type {ReactNode} from 'react'
import * as React from 'react'
import {Input as InputPrimitive} from '@base-ui/react/input'

import {cn} from '@renderer/lib/utils.js'

function Input({className, type, ...props}: React.ComponentProps<'input'>): ReactNode {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				'h-8 w-full min-w-0 rounded-lg border border-[var(--field-border)] bg-[var(--field-bg)] px-2.5 py-1 text-base shadow-[inset_0_1px_0_var(--field-highlight)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--field-placeholder)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--field-disabled-border)] disabled:bg-[var(--field-disabled-bg)] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
				className
			)}
			{...props}
		/>
	)
}

export {Input}
