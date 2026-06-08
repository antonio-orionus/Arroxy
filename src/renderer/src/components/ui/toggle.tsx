import type {ReactNode} from 'react'
import {Toggle as TogglePrimitive} from '@base-ui/react/toggle'
import type {VariantProps} from 'class-variance-authority'

import {cn} from '@renderer/lib/utils.js'
import {toggleVariants} from './toggle.variants.js'

function Toggle({className, variant = 'default', size = 'default', ...props}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>): ReactNode {
	return <TogglePrimitive data-slot="toggle" className={cn(toggleVariants({variant, size, className}))} {...props} />
}

export {Toggle}
