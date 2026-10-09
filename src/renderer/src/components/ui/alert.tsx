import type {ReactNode} from 'react'
import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@renderer/lib/utils.js'

const alertVariants = cva(
	"group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				success: 'border-success/30 bg-success/10 text-foreground *:[svg]:text-success',
				info: 'border-info/30 bg-info/10 text-foreground *:[svg]:text-info',
				warning: 'border-warning/30 bg-warning/10 text-foreground *:[svg]:text-warning',
				destructive: 'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current'
			},
			// `sm`: a compact inline notice under a control or inside a dense panel.
			size: {default: '', sm: "px-2.5 py-1.5 text-xs *:[svg:not([class*='size-'])]:size-3.5"}
		},
		defaultVariants: {variant: 'default', size: 'default'}
	}
)

function Alert({className, variant, size = 'default', ...props}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>): ReactNode {
	return <div data-slot="alert" role="alert" data-size={size} className={cn(alertVariants({variant, size}), className)} {...props} />
}

function AlertTitle({className, ...props}: React.ComponentProps<'div'>): ReactNode {
	return <div data-slot="alert-title" className={cn('font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground', className)} {...props} />
}

function AlertDescription({className, ...props}: React.ComponentProps<'div'>): ReactNode {
	return <div data-slot="alert-description" className={cn('text-sm text-balance wrap-anywhere text-muted-foreground group-data-[size=sm]/alert:text-xs md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4', className)} {...props} />
}

function AlertAction({className, ...props}: React.ComponentProps<'div'>): ReactNode {
	return <div data-slot="alert-action" className={cn('absolute top-2 end-2', className)} {...props} />
}

export {Alert, AlertTitle, AlertDescription, AlertAction}
