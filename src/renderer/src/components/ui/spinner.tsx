import type {ReactNode} from 'react'
import {Loader2Icon} from 'lucide-react'
import type * as React from 'react'
import {useTranslation} from 'react-i18next'

import {cn} from '@renderer/lib/utils.js'

function Spinner({className, ...props}: React.ComponentProps<'svg'>): ReactNode {
	const {t} = useTranslation()
	return <Loader2Icon role="status" aria-label={t('common.loading')} className={cn('size-4 animate-spin', className)} {...props} />
}

export {Spinner}
