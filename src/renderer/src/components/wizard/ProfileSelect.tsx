import {useId, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Field, FieldLabel} from '../ui/field.js'
import {optionLabel, type SelectOption} from './profileSelectOptions.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select.js'

export function ProfileSelect<T extends string>({label, value, options, onValueChange, testId, disabled = false}: {label: string; value: T; options: readonly SelectOption<T>[]; onValueChange: (value: T) => void; testId?: string; disabled?: boolean}): ReactNode {
	const {t} = useTranslation()
	const generatedId = useId()
	const triggerId = testId ? `${testId}-trigger` : generatedId

	return (
		<Field className="gap-1.5">
			<FieldLabel htmlFor={triggerId}>{label}</FieldLabel>
			<Select
				value={value}
				onValueChange={next => {
					if (typeof next === 'string') onValueChange(next)
				}}
			>
				<SelectTrigger id={triggerId} className="w-full" data-testid={testId} disabled={disabled}>
					<SelectValue>{selected => optionLabel(t, options, selected)}</SelectValue>
				</SelectTrigger>
				<SelectContent align="start">
					<SelectGroup>
						{options.map(option => (
							<SelectItem key={option.value} value={option.value} disabled={option.disabled} onClick={() => onValueChange(option.value)} data-testid={testId ? `${testId}-option-${option.value}` : undefined}>
								{t(option.labelKey, option.labelValues)}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</Field>
	)
}
