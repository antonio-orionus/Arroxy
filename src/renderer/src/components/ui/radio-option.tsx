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
			className={cn(
				'flex-nowrap rounded-md border-[var(--field-border)] bg-[var(--field-bg)] px-2 py-[5px] shadow-[inset_0_1px_0_var(--field-highlight)]',
				disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-[var(--brand)] hover:bg-[var(--brand-dim)]',
				effectiveChecked && 'border-[var(--brand)] bg-[var(--brand-dim)] shadow-[inset_0_0_0_1px_var(--brand-dim),0_0_0_2px_var(--brand-dim)]',
				className
			)}
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
