import type {ReactNode, KeyboardEvent} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {Item, ItemActions, ItemContent, ItemMedia, ItemTitle} from './item.js'
import {RadioDot} from './radio-dot.js'

interface Props {
	label: ReactNode
	checked: boolean
	onClick: () => void
	disabled?: boolean
	adornment?: ReactNode
	children?: ReactNode
	className?: string
	labelClassName?: string
}

export function RadioOption({label, checked, onClick, disabled, adornment, children, className, labelClassName}: Props): ReactNode {
	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
		if (disabled) return
		if (e.key === 'Enter' || e.key === ' ') onClick()
	}

	const effectiveChecked = checked && !disabled

	return (
		<Item
			role="radio"
			aria-checked={effectiveChecked}
			aria-disabled={disabled ?? undefined}
			tabIndex={disabled ? -1 : 0}
			onClick={disabled ? undefined : onClick}
			onKeyDown={handleKeyDown}
			size="xs"
			className={cn('wizard-choice-row flex-nowrap rounded-md px-2 py-[5px]', disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer', effectiveChecked && 'wizard-choice-row-selected', className)}
		>
			<ItemMedia className="gap-[7px]">
				<RadioDot checked={effectiveChecked} />
				{adornment}
			</ItemMedia>
			<ItemContent className="min-w-0 flex-none">
				<ItemTitle className={cn('text-[13px]', effectiveChecked ? 'font-semibold text-[var(--brand)]' : 'font-medium text-muted-foreground', labelClassName)}>{label}</ItemTitle>
			</ItemContent>
			{children ? <ItemActions className="ms-auto min-w-0">{children}</ItemActions> : null}
		</Item>
	)
}
