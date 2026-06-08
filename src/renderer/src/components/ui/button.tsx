import type {ReactNode} from 'react'
import {Button as ButtonPrimitive} from '@base-ui/react/button'
import type {VariantProps} from 'class-variance-authority'

import {cn} from '@renderer/lib/utils.js'
import {buttonVariants} from './button.variants.js'

function Button({className, variant = 'default', size = 'default', ...props}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>): ReactNode {
	return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({variant, size, className}))} {...props} />
}

export {Button}
